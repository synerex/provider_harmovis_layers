package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"sync"
	"time"

	pflow "github.com/UCLabNU/proto_pflow"
	"github.com/golang/protobuf/proto"
	gosocketio "github.com/mtfelian/golang-socketio"
	"github.com/mtfelian/golang-socketio/transport"
	fleet "github.com/synerex/proto_fleet"
	geo "github.com/synerex/proto_geography"
	pcounter "github.com/synerex/proto_pcounter"
	pagent "github.com/synerex/proto_people_agent"
	api "github.com/synerex/synerex_api"
	pbase "github.com/synerex/synerex_proto"
	sxutil "github.com/synerex/synerex_sxutil"
)

// Harmoware Vis-Synerex wiht Layer extension provider provides map information to Web Service through socket.io.

var (
	nodesrv         = flag.String("nodesrv", "127.0.0.1:9990", "Node ID Server")
	assetDir        = flag.String("assetdir", "", "set Web client dir")
	mapbox          = flag.String("mapbox", "", "Set Mapbox access token")
	areasJson       = flag.String("areasJson", "", "Path to areas.json")
	port            = flag.Int("port", 10080, "HarmoVis Ext Provider Listening Port")
	mu              = new(sync.Mutex)
	assetsDir       http.FileSystem
	ioserv          *gosocketio.Server
	sxServerAddress string
	mapboxToken     string
)

func toJSON(m map[string]interface{}, utime int64) string {
	s := fmt.Sprintf("{\"mtype\":%d,\"id\":%d,\"time\":%d,\"lat\":%f,\"lon\":%f,\"angle\":%f,\"speed\":%d}",
		0, int(m["vehicle_id"].(float64)), utime, m["coord"].([]interface{})[0].(float64), m["coord"].([]interface{})[1].(float64), m["angle"].(float64), int(m["speed"].(float64)))
	return s
}

func handleFleetMessage(sv *gosocketio.Server, param interface{}) {
	var bmap map[string]interface{}
	utime := time.Now().Unix()
	bmap = param.(map[string]interface{})
	for _, v := range bmap["vehicles"].([]interface{}) {
		m, _ := v.(map[string]interface{})
		s := toJSON(m, utime)
		sv.BroadcastToAll("event", s)
	}
}

func getFleetInfo(serv string, sv *gosocketio.Server, ch chan error) {
	fmt.Printf("Dial to [%s]\n", serv)
	sioClient, err := gosocketio.Dial(serv+"socket.io/?EIO=3&transport=websocket", transport.DefaultWebsocketTransport())
	if err != nil {
		log.Printf("SocketIO Dial error: %s", err)
		return
	}

	sioClient.On(gosocketio.OnConnection, func(c *gosocketio.Channel, param interface{}) {
		fmt.Println("Fleet-Provider socket.io connected ", c)
	})

	sioClient.On(gosocketio.OnDisconnection, func(c *gosocketio.Channel, param interface{}) {
		fmt.Println("Fleet-Provider socket.io disconnected ", c)
		ch <- fmt.Errorf("Disconnected!\n")
	})

	sioClient.On("vehicle_status", func(c *gosocketio.Channel, param interface{}) {
		handleFleetMessage(sv, param)
	})

}

func runFleetInfo(serv string, sv *gosocketio.Server) {
	ch := make(chan error)
	for {
		time.Sleep(3 * time.Second)
		getFleetInfo(serv, sv, ch)
		res := <-ch
		if res == nil {
			break
		}
	}
}

// assetsFileHandler for static Data
func assetsFileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		return
	}

	file := r.URL.Path
	//	log.Printf("Open File '%s'",file)
	if file == "/" {
		file = "/index.html"
	}
	f, err := assetsDir.Open(file)
	if err != nil {
		log.Printf("can't open file %s: %v\n", file, err)
		return
	}
	defer f.Close()

	fi, err := f.Stat()
	if err != nil {
		log.Printf("can't open file %s: %v\n", file, err)
		return
	}
	http.ServeContent(w, r, file, fi.ModTime(), f)
}

func run_server() *gosocketio.Server {

	currentRoot, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}

	if *assetDir != "" {
		currentRoot = *assetDir
	}

	d := filepath.Join(currentRoot, "mclient", "build")

	assetsDir = http.Dir(d)
	log.Println("AssetDir:", assetsDir)

	assetsDir = http.Dir(d)
	server := gosocketio.NewServer()

	server.On(gosocketio.OnConnection, func(c *gosocketio.Channel) {
		// wait for a few milli seconds.
		log.Printf("Connected from %s as %s", c.IP(), c.Id())
		// Not emit at connection sending mapbox token from provider to browser.
		/*
			time.Sleep(1000 * time.Millisecond)
			mapboxToken = os.Getenv("MAPBOX_ACCESS_TOKEN")
			if *mapbox != "" {
				mapboxToken = *mapbox
			}

			c.Emit("mapbox_token", mapboxToken)
			log.Printf("mapbox-token transferred %s ", mapboxToken)
		*/
	})

	server.On("get_mapbox_token", func(c *gosocketio.Channel) {
		log.Printf("Requested mapbox access token")
		mapboxToken = os.Getenv("MAPBOX_ACCESS_TOKEN")
		if *mapbox != "" {
			mapboxToken = *mapbox
		}
		c.Emit("mapbox_token", mapboxToken)
		log.Printf("mapbox-token transferred %s ", mapboxToken)
	})

	server.On("get_areas", func(c *gosocketio.Channel) {
		log.Printf("Requested areas")
		bytes, err := ioutil.ReadFile(*areasJson)
		if err != nil {
			panic(err)
		}

		c.Emit("areas", string(bytes))
		log.Printf("areas transferred %s ", string(bytes))
	})

	server.On(gosocketio.OnDisconnection, func(c *gosocketio.Channel) {
		log.Printf("Disconnected from %s as %s", c.IP(), c.Id())
	})

	return server
}

type MapMarker struct {
	mtype int32   `json:"mtype"`
	id    int32   `json:"id"`
	lat   float32 `json:"lat"`
	lon   float32 `json:"lon"`
	angle float32 `json:"angle"`
	speed int32   `json:"speed"`
}

func (m *MapMarker) GetJson() string {
	s := fmt.Sprintf("{\"mtype\":%d,\"id\":%d,\"lat\":%f,\"lon\":%f,\"angle\":%f,\"speed\":%d}",
		m.mtype, m.id, m.lat, m.lon, m.angle, m.speed)
	return s
}

func supplyRideCallback(clt *sxutil.SXServiceClient, sp *api.Supply) {
	flt := &fleet.Fleet{}
	err := proto.Unmarshal(sp.Cdata.Entity, flt)
	if err == nil {
		mm := &MapMarker{
			mtype: int32(0),
			id:    flt.VehicleId,
			lat:   flt.Coord.Lat,
			lon:   flt.Coord.Lon,
			angle: flt.Angle,
			speed: flt.Speed,
		}
		//		jsondata, err := json.Marshal(*mm)
		//		fmt.Println("rcb",mm.GetJson())
		mu.Lock()
		ioserv.BroadcastToAll("event", mm.GetJson())
		mu.Unlock()
	}
}

func reconnectClient(client *sxutil.SXServiceClient) {
	mu.Lock() // first make client into nil
	if client.Client != nil {
		client.Client = nil
		log.Printf("Client reset \n")
	}
	mu.Unlock()
	time.Sleep(5 * time.Second) // wait 5 seconds to reconnect
	mu.Lock()
	if client.Client == nil {
		newClt := sxutil.GrpcConnectServer(sxServerAddress)
		if newClt != nil {
			log.Printf("Reconnect server [%s]\n", sxServerAddress)
			client.Client = newClt
		}
	} else { // someone may connect!
		log.Printf("Use reconnected server\n", sxServerAddress)
	}
	mu.Unlock()
}

func subscribeRideSupply(client *sxutil.SXServiceClient) {
	for {
		ctx := context.Background() //
		err := client.SubscribeSupply(ctx, supplyRideCallback)
		log.Printf("Error:Supply %s\n", err.Error())
		// we need to restart
		reconnectClient(client)
	}
}

func supplyGeoCallback(clt *sxutil.SXServiceClient, sp *api.Supply) {
	switch sp.SupplyName {
	case "GeoJson":
		geo := &geo.Geo{}
		log.Printf("GeoJson: %d bytes", len(sp.Cdata.Entity))
		err := proto.Unmarshal(sp.Cdata.Entity, geo)
		if err == nil {
			strjs := string(geo.Data)
			log.Printf("Obtaining %s, id:%d, %s, len:%d ", geo.Type, geo.Id, geo.Label, len(strjs))
			//			log.Printf("Data '%s'", strjs)
			mu.Lock()
			ioserv.BroadcastToAll("geojson", strjs)
			mu.Unlock()
		}
	case "Lines":
		geo := &geo.Lines{}
		log.Printf("Lines: %d", len(sp.Cdata.Entity))
		err := proto.Unmarshal(sp.Cdata.Entity, geo)
		if err == nil {

			jsonBytes, _ := json.Marshal(geo.Lines)
			log.Printf("LinesParsed: %d", len(jsonBytes))

			mu.Lock()
			ioserv.BroadcastToAll("lines", string(jsonBytes))
			mu.Unlock()
		}
	case "ViewState":
		vs := &geo.ViewState{}
		err := proto.Unmarshal(sp.Cdata.Entity, vs)
		if err == nil {
			jsonBytes, _ := json.Marshal(vs)
			log.Printf("ViewState: %v", string(jsonBytes))

			mu.Lock()
			//ioserv.BroadcastToAll("mapbox_token", mapboxToken)

			ioserv.BroadcastToAll("viewstate", string(jsonBytes))
			mu.Unlock()
		}

	case "BarGraphs":
		bargraphs := &geo.BarGraphs{}
		err := proto.Unmarshal(sp.Cdata.Entity, bargraphs)
		if err == nil {
			jsonBytes, _ := json.Marshal(bargraphs)
			jsonStr := string(jsonBytes)
			//			log.Printf("BarGraphs: %v", jsonStr)
			mu.Lock()
			ioserv.BroadcastToAll("bargraphs", jsonStr)
			mu.Unlock()
		}

	case "ClearMoves":
		cms := &geo.ClearMoves{}
		err := proto.Unmarshal(sp.Cdata.Entity, cms)
		if err == nil {
			jsonBytes, _ := json.Marshal(cms)
			//			log.Printf("ClearMoves: %v", string(jsonBytes))

			mu.Lock()
			ioserv.BroadcastToAll("clearMoves", string(jsonBytes))
			mu.Unlock()
		}
	case "Pitch":
		cms := &geo.Pitch{}
		err := proto.Unmarshal(sp.Cdata.Entity, cms)
		if err == nil {
			jsonBytes, _ := json.Marshal(cms)
			//			log.Printf("Pitch: %v", string(jsonBytes))

			mu.Lock()
			ioserv.BroadcastToAll("pitch", string(jsonBytes))
			mu.Unlock()
		}
	case "Bearing":
		cms := &geo.Bearing{}
		err := proto.Unmarshal(sp.Cdata.Entity, cms)
		if err == nil {
			jsonBytes, _ := json.Marshal(cms)
			//			log.Printf("Bearing: %v", string(jsonBytes))

			mu.Lock()
			ioserv.BroadcastToAll("bearing", string(jsonBytes))
			mu.Unlock()
		}

	case "Arcs":
		cms := &geo.Arcs{}
		err := proto.Unmarshal(sp.Cdata.Entity, cms)
		if err == nil {
			jsonBytes, _ := json.Marshal(cms)
			//			log.Printf("Arcs: %v", string(jsonBytes))
			mu.Lock()
			ioserv.BroadcastToAll("arcs", string(jsonBytes))
			mu.Unlock()
		}

	case "ClearArcs":
		log.Printf("clearArc!")
		mu.Lock()
		ioserv.BroadcastToAll("clearArcs", string(0))
		mu.Unlock()

	case "Scatters":
		cms := &geo.Scatters{}
		err := proto.Unmarshal(sp.Cdata.Entity, cms)
		if err == nil {
			jsonBytes, _ := json.Marshal(cms)
			//			log.Printf("Scatters: %v", string(jsonBytes))
			mu.Lock()
			ioserv.BroadcastToAll("scatters", string(jsonBytes))
			mu.Unlock()
		}

	case "ClearScatters":
		log.Printf("clearScatter!")
		mu.Lock()
		ioserv.BroadcastToAll("clearScatters", string(0))
		mu.Unlock()

	case "TopTextLabel":
		//		log.Printf("labelInfo!")
		cms := &geo.TopTextLabel{}
		err := proto.Unmarshal(sp.Cdata.Entity, cms)
		if err == nil {

			jsonBytes, _ := json.Marshal(cms)
			//			log.Printf("LabelInfo: %v", string(jsonBytes))
			mu.Lock()
			ioserv.BroadcastToAll("topLabelInfo", string(jsonBytes))
			mu.Unlock()

		}

	case "HarmoVIS":
		cms := &geo.HarmoVIS{}
		err := proto.Unmarshal(sp.Cdata.Entity, cms)
		if err == nil {
			jsonBytes, _ := json.Marshal(cms)
			mu.Lock()
			ioserv.BroadcastToAll("harmovis", string(jsonBytes))
			mu.Unlock()

		}
	}

}

func subscribeGeoSupply(client *sxutil.SXServiceClient) {
	for {
		ctx := context.Background() //
		err := client.SubscribeSupply(ctx, supplyGeoCallback)
		log.Printf("Error:Supply %s\n", err.Error())
		// we need to restart
		reconnectClient(client)

	}
}

func supplyPAgentCallback(clt *sxutil.SXServiceClient, sp *api.Supply) {
	//	log.Printf("Agent: %v", *sp)
	switch sp.SupplyName {
	case "Agents":
		agents := &pagent.PAgents{}
		err := proto.Unmarshal(sp.Cdata.Entity, agents)
		//		log.Printf("Agent: %v", *agents)
		if err == nil {
			seconds := sp.Ts.GetSeconds()
			nanos := sp.Ts.GetNanos()

			jsonBytes, err := json.Marshal(agents)
			if err == nil {
				seconds = agents.Ts.GetSeconds()
				nanos = agents.Ts.GetNanos()
				jstr := fmt.Sprintf("{ \"ts\": %d.%03d, \"dt\": %s}", seconds, int(nanos/1000000), string(jsonBytes))
				log.Printf("Lines: %v", jstr)
				mu.Lock()
				ioserv.BroadcastToAll("agents", jstr)
				mu.Unlock()
			} else {
				log.Printf("Invalid Agents! %v count %d", err, len(agents.Agents))
				ags := make([]*pagent.PAgent, 0)
				ct := 0
				for i := 0; i < len(agents.Agents); i++ {
					//					log.Printf("Agent: %d, %f, %f , %v", agents.Agents[i].Id, agents.Agents[i].Point[0], agents.Agents[i].Point[1], agents.Agents[i])
					_, err2 := json.Marshal(agents.Agents[i])
					if err2 == nil {
						ags = append(ags, agents.Agents[i])
						ct++
					}
				}
				ag2 := &pagent.PAgents{
					Agents: ags,
				}
				jsonBytes, err3 := json.Marshal(ag2)
				if err3 == nil {
					jstr := fmt.Sprintf("{ \"ts\": %d.%03d, \"dt\": %s}", seconds, int(nanos/1000000), string(jsonBytes))
					//				log.Printf("Lines: %v", jstr)
					mu.Lock()
					ioserv.BroadcastToAll("agents", jstr)
					mu.Unlock()
				} else {
					log.Printf("Invalid Agents! %v again", err3)

				}

			}
		}
	}

}

func subscribePAgentSupply(client *sxutil.SXServiceClient) {
	for {
		ctx := context.Background() //
		err := client.SubscribeSupply(ctx, supplyPAgentCallback)
		log.Printf("Error:Supply %s\n", err.Error())
		// we need to restart
		reconnectClient(client)
	}
}

func supplyPFlowCallback(clt *sxutil.SXServiceClient, sp *api.Supply) {
	pflow := &pflow.PFlow{}
	err := proto.Unmarshal(sp.Cdata.Entity, pflow)
	if err == nil {
		jsondata, err := json.Marshal(*pflow)
		//		fmt.Println("rcb",mm.GetJson())
		if err == nil {
			mu.Lock()
			ioserv.BroadcastToAll("pflow", string(jsondata))
			log.Printf("Bloadcast supplyPFlowCallback > %v\n", string(jsondata))
			mu.Unlock()
		} else {
			log.Printf("Error in supplyPFlowCallback > json.Marshal\n")
			log.Printf("%+v", err)
		}
	} else {
		log.Printf("Error in supplyPFlowCallback > proto.Unmarshal\n")
		log.Printf("%+v", err)
	}
}

func subscribePFlowSupply(client *sxutil.SXServiceClient) {
	for {
		ctx := context.Background() //
		err := client.SubscribeSupply(ctx, supplyPFlowCallback)
		log.Printf("Error:Supply %s\n", err.Error())
		// we need to restart
		reconnectClient(client)
	}
}

func supplyPAreaCallback(clt *sxutil.SXServiceClient, sp *api.Supply) {
	parea := &pcounter.ACounters{}
	err := proto.Unmarshal(sp.Cdata.Entity, parea)
	if err == nil {
		jsondata, err := json.Marshal(*parea)
		//		fmt.Println("rcb",mm.GetJson())
		if err == nil {
			mu.Lock()
			ioserv.BroadcastToAll("parea", string(jsondata))
			log.Printf("Bloadcast supplyPAreaCallback > %v\n", string(jsondata))
			mu.Unlock()
		} else {
			log.Printf("Error in supplyPAreaCallback > json.Marshal\n")
			log.Printf("%+v", err)
		}
	} else {
		log.Printf("Error in supplyPAreaCallback > proto.Unmarshal\n")
		log.Printf("%+v", err)
	}
}

func subscribePAreaSupply(client *sxutil.SXServiceClient) {
	for {
		ctx := context.Background() //
		err := client.SubscribeSupply(ctx, supplyPAreaCallback)
		log.Printf("Error:Supply %s\n", err.Error())
		// we need to restart
		reconnectClient(client)
	}
}

/*
func supplyPTCallback(clt *sxutil.SXServiceClient, sp *api.Supply) {
//	pt := sp.GetArg_PTService()
	if pt != nil { // get Fleet supplu
		mm := &MapMarker{
			mtype: pt.VehicleType, // depends on type of GTFS: 1 for Subway, 2, for Rail, 3 for bus
			id:    pt.VehicleId,
			lat:   float32(pt.CurrentLocation.GetPoint().Latitude),
			lon:   float32(pt.CurrentLocation.GetPoint().Longitude),
			angle: pt.Angle,
			speed: pt.Speed,
		}
		mu.Lock()
		ioserv.BroadcastToAll("event", mm.GetJson())
		mu.Unlock()
	}
}

func subscribePTSupply(client *sxutil.SXServiceClient) {
	ctx := context.Background() //
	err := client.SubscribeSupply(ctx, supplyPTCallback)
	log.Printf("Error:Supply %s\n",err.Error())
}
*/

func monitorStatus() {
	for {
		sxutil.SetNodeStatus(int32(runtime.NumGoroutine()), "HV")
		time.Sleep(time.Second * 3)
	}
}

func main() {
	log.Printf("HarmovisLayers(%s) built %s sha1 %s", sxutil.GitVer, sxutil.BuildTime, sxutil.Sha1Ver)
	flag.Parse()

	channelTypes := []uint32{pbase.RIDE_SHARE, pbase.PEOPLE_AGENT_SVC, pbase.GEOGRAPHIC_SVC}
	var rerr error
	sxServerAddress, rerr = sxutil.RegisterNode(*nodesrv, "HarmoVisLayers", channelTypes, nil)
	if rerr != nil {
		log.Fatal("Can't register node ", rerr)
	}
	log.Printf("Connecting SynerexServer at [%s]\n", sxServerAddress)

	go sxutil.HandleSigInt()
	sxutil.RegisterDeferFunction(sxutil.UnRegisterNode)

	wg := sync.WaitGroup{} // for syncing other goroutines

	ioserv = run_server()

	if ioserv == nil {
		os.Exit(1)
	}

	client := sxutil.GrpcConnectServer(sxServerAddress) // if there is server address change, we should do it!

	argJSON := fmt.Sprintf("{Client:Map:RIDE}")
	rideClient := sxutil.NewSXServiceClient(client, pbase.RIDE_SHARE, argJSON)

	argJSON2 := fmt.Sprintf("{Client:Map:PAGENT}")
	pa_client := sxutil.NewSXServiceClient(client, pbase.PEOPLE_AGENT_SVC, argJSON2)

	argJSON3 := fmt.Sprintf("{Client:Map:Geo}")
	geo_client := sxutil.NewSXServiceClient(client, pbase.GEOGRAPHIC_SVC, argJSON3)

	argJSON4 := fmt.Sprintf("{Client:Map:Pflow}")
	pflow_client := sxutil.NewSXServiceClient(client, pbase.PEOPLE_FLOW_SVC, argJSON4)

	argJSON5 := fmt.Sprintf("{Client:Map:Parea}")
	parea_client := sxutil.NewSXServiceClient(client, pbase.AREA_COUNTER_SVC, argJSON5)

	wg.Add(1)
	go subscribeRideSupply(rideClient)

	go subscribePAgentSupply(pa_client)

	go subscribeGeoSupply(geo_client)

	go subscribePFlowSupply(pflow_client)

	go subscribePAreaSupply(parea_client)

	go monitorStatus() // keep status

	serveMux := http.NewServeMux()

	serveMux.Handle("/socket.io/", ioserv)
	serveMux.HandleFunc("/", assetsFileHandler)

	log.Printf("Starting Harmoware-VIS Layers Provider %s on port %d", sxutil.GitVer, *port)
	err := http.ListenAndServe(fmt.Sprintf("0.0.0.0:%d", *port), serveMux)
	if err != nil {
		log.Fatal(err)
	}

	wg.Wait()

}

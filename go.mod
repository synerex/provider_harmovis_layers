module harmovis-layers

go 1.13

require (
	github.com/UCLabNU/proto_pflow v0.0.1
	github.com/golang/protobuf v1.4.2
	github.com/googollee/go-socket.io v1.4.4 // indirect
	github.com/gorilla/websocket v1.4.2 // indirect
	github.com/mtfelian/golang-socketio v1.5.2
	github.com/shirou/gopsutil v2.20.7+incompatible // indirect
	github.com/sirupsen/logrus v1.6.0 // indirect
	github.com/synerex/proto_fleet v0.1.0
	github.com/synerex/proto_geography v0.5.2
	github.com/synerex/proto_pcounter v0.0.6
	github.com/synerex/proto_people_agent v0.0.1
	github.com/synerex/synerex_api v0.4.2
	github.com/synerex/synerex_nodeapi v0.5.4 // indirect
	github.com/synerex/synerex_proto v0.1.9
	github.com/synerex/synerex_sxutil v0.4.12
	golang.org/x/net v0.0.0-20200822124328-c89045814202 // indirect
	golang.org/x/text v0.3.3 // indirect
	google.golang.org/protobuf v1.25.0 // indirect
)

replace github.com/synerex/synerex_proto v0.1.9 => github.com/nagata-yoshiteru/synerex_proto v0.1.10

replace github.com/synerex/proto_pcounter v0.0.6 => github.com/nagata-yoshiteru/proto_pcounter v0.0.10

replace github.com/synerex/proto_people_agent v0.0.1 => github.com/nagata-yoshiteru/proto_people_agent v0.0.2

import io from 'socket.io-client';
import xss from 'xss';

import { BarData } from '../constants/bargraph';
import { AgentData } from '../constants/agent';
import { Line } from '../constants/line';
import { SocketMessage } from '../constants/workerMessageTypes';
import { Arc, Scatter, LabelInfo} from '../constants/geoObjects';
const socket = io();

var wcounter = 0
console.log("Worker working!")

socket.on('disconnect', () => { console.log('Socket.IO disconnected!') })
const worker = self as any
self.addEventListener("message", (e: any) => {
    const type = e.data[0];
});
// start socket server

const getToken = () => {
    socket.emit('get_mapbox_token', {})
//    console.log('Get mapbox token')
}


socket.on('connect', () => {
    console.log('Socket.IO connected!')
    worker.postMessage({ type: 'CONNECTED'} as SocketMessage<void>);
    setTimeout(getToken, 500) // 500msec after send get=mapbox-token
})

socket.on('mapbox_token', (payload: string) => {
//    console.log('token Got:' + payload)
    worker.postMessage({
        type: 'RECEIVED_MAPBOX_TOKEN',
        payload
    } as SocketMessage<string> );
    // this
    if (wcounter === 0){
        startRecivedData();
        wcounter ++   // assign only once.
    }
})


//this.getPitch.bind(this))
//socket.on('bearing', this.getBearing.bind(this))
//socket.on('clearMoves', this.getClearMoves.bind(this))


const toArrayColor = (color: number) => {
	return [
		((color & 0xFF0000) >> 16),
		((color & 0x00FF00) >> 8),
		(color & 0x0000FF)
	]
}

const createGradientColorGenerator = (minValue:number|undefined, maxValue:number|undefined) => {
    const min = minValue ?? 0
    const max = maxValue ?? 0
    const basegreen = 0;
    const basered = 255;
    const ratio = 255/(max-min)
    if (ratio < 0) {
        const rt = -ratio;
        return (value: number|undefined) => {
            const v = value ? (value < max ? max : (value > min ? min : value)) : 0
            let green = basegreen + rt*(v - max)
            let red = basered - rt*(v - max)
            return [Math.floor(red),  Math.floor(green), 0]
        }        
    }else{
        return (value: number|undefined) => {
            const v = value ? (value > max ? max : (value < min ? min : value)) : 0
            let green = basegreen + ratio*(v - min)
            let red = basered - ratio*(v - min)
            return [Math.floor(red),  Math.floor(green), 0]
        }
    }
}

const getData = (bar: any) => {
    const time = bar.ts.seconds;
    const colorType = bar.colorType;
    const shapeType = bar.shapeType;
    const isVarColor = colorType === 1;
    const isHexa = shapeType === 1;
    const colorGenerator = createGradientColorGenerator(bar.min, bar.max)
//    console.log('time is ' + time)
    const r =  {
        id: bar.id,
        movesbaseidx: bar.id,
        sourcePosition: [] as number[],
        sourceColor: [] as number[],
        targetPosition: [] as number[],
        targetColor: [] as number[],
        elapsedtime: time,
        position: [bar.lon, bar.lat, 0],
        angle: 0,
        speed: 0,
        shapeType: isHexa ? 6 : 4,
        areaColor: toArrayColor(bar.color),
        data: bar.barData.map((b: any) => {
            return {
                value: b.value,
                color: isVarColor ?   colorGenerator(b.value):toArrayColor(b.color),
                label: b.label,
            }
        }),
        radius: bar.radius,
        width: bar.width,
        min: bar.min,
        max: bar.max,
        text: bar.text,
    } 
//    console.log("BarData:",r)
    return r as BarData
}


function color2array(col:number) : number[] {
    return [(col >>> 16)%256, (col >>> 8)%256, col % 256]
}


function startRecivedData() {

    socket.on('bargraphs', (str: string) => {
        console.log('Bargraphs:' + str.length)
        const rawData = JSON.parse(str);
        const bars = rawData.bars;     
        const payload: BarData[] = bars.map((b: any) => getData(b));
        worker.postMessage({
            type: 'RECEIVED_BAR_GRAPHS',  
            payload
        } as SocketMessage<BarData[]>)
    })
    socket.on('agents', (str: string) => {
        const payload: AgentData = JSON.parse(str);
//        console.log('Agents:' + str.length)
        worker.postMessage({
            type: 'RECEIVED_AGENT',
            payload
        } as SocketMessage<AgentData>)
    })
    socket.on('pitch', (str: string) =>{
//        console.log('Pitch:' + str)
        let payload:any = JSON.parse(str)
        worker.postMessage({
            type: 'RECEIVED_PITCH',
            payload
        } as SocketMessage<any> );
    })
    
    socket.on('bearing', (str: string) =>{
//        console.log('Bearing:' + payload)
//        let payload:number =JSON.parse(str).bearing;
        let payload:any = JSON.parse(str)
        worker.postMessage({
            type: 'RECEIVED_BEARING',
            payload
        } as SocketMessage<any> );
    })
    
    
    socket.on('clearMoves', (payload: string) =>{
        console.log('ClearMoves:' + payload)
        worker.postMessage({
            type: 'RECEIVED_CLEAR_MOVES',
            payload
        } as SocketMessage<string> );
    })
    
    socket.on('lines', (str: string) =>{
        const payload: Line[] = JSON.parse(str);
//        wcounter ++
//        console.log('lines:' + payload.length+","+wcounter)        
        worker.postMessage({
            type: 'RECEIVED_LINES',
            payload
        } as SocketMessage<Line[]> );
    })
    
    socket.on('geojson', (payload: string) =>{
//        wcounter ++
//        console.log('geoJSON:' + payload.length+","+wcounter)
        worker.postMessage({
            type: 'RECEIVED_GEOJSON',
            payload
        } as SocketMessage<string> );
    })
    

    socket.on('viewstate', (payload: string) =>{
//        console.log('viewstate:' + payload)
//        wcounter ++
//        console.log('setViewstate:' + payload +","+wcounter)

        worker.postMessage({
            type: 'RECEIVED_VIEWSTATE',
            payload
        } as SocketMessage<string> );
    })

    socket.on('arcs', (payload: string) =>{
        console.log("Receive Arcs!:"+payload)
        const data = JSON.parse(payload)
        var arcs: Arc[] =[]

        for (var i = 0; i < data.srcs.length; i++){
            arcs.push({
                src: [data.srcs[i].lon, data.srcs[i].lat],
                tgt: [data.tgts[i].lon, data.tgts[i].lat],
                srcCol: color2array(data.srcCols[i]),
                tgtCol: color2array(data.tgtCols[i]),
                tilt: data.tilts[i]
            })
        }

        worker.postMessage({
            type: 'RECEIVED_ARCS',
            payload: arcs
        } as SocketMessage<Arc[]> );
    })

    socket.on('clearArcs', (payload: string) =>{
        worker.postMessage({
            type: 'RECEIVED_CLEAR_ARCS',
            payload
        } as SocketMessage<string> );
    })
        
    socket.on('scatters', (payload: string) =>{
        console.log("Receive Scatters!:"+payload)
        const data = JSON.parse(payload)
        var scatters : Scatter[] = []

        for (var i = 0; i < data.points.length; i++){
            scatters.push({
                pos: [data.points[i].lon, data.points[i].lat],
                radius: data.radiuses[i],
                fillCol: color2array(data.fillColors[i]),
                lineCol: color2array(data.lineColors[i]),
                lineWid: 2
            });
        }

        worker.postMessage({
            type: 'RECEIVED_SCATTERS',
            payload: scatters
        } as SocketMessage<Scatter[]> );
    })

    socket.on('clearScatters', (payload: string) =>{
        worker.postMessage({
            type: 'RECEIVED_CLEAR_SCATTERS',
            payload
        } as SocketMessage<string> );
    })

    socket.on('topLabelInfo', (payload: string) =>{
        console.log("Receive LabelInfo!:"+payload)
        try{
            const data = JSON.parse(payload)
        // we have to check CSS! (using validator) here

            const labelInfo:LabelInfo = { // 
             label: xss(data.label as string, {}) as string,
             style: data.style
         }
         worker.postMessage({
             type: 'RECEIVED_LABEL_INFO',
             payload: labelInfo
         } as SocketMessage<LabelInfo> );
        }catch (error){
            console.log("Json parse error on label:",error)
        }
    })

    
    socket.on('harmovis', (payload: string) =>{
        console.log("Receive HarmoVIS:"+payload)
        try{
            const data = JSON.parse(payload)
            const conf = JSON.parse(data.confJson)
            worker.postMessage({
                type: 'RECEIVED_HARMOVIS_CONF',
                payload: conf
            } as SocketMessage<any> );
        }catch(error){
            console.log("Harmovis Msg Error:",error)
        }
    })
    

}

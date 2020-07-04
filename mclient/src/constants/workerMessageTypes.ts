import { AgentData } from "./agent";
import { BarData } from "./bargraph";
import { Line } from "./line";
import { Arc, Scatter , LabelInfo} from "./geoObjects";

export interface WorkerMessage {
    type: SocketMsgTypes;
}

export interface SocketMessage<T> extends WorkerMessage  {
    payload: T
}

export const isBarGraphMsg = (msg: WorkerMessage): msg is SocketMessage<BarData[]> => {
    return msg.type === 'RECEIVED_BAR_GRAPHS'
}
export const isAgentMsg = (msg: WorkerMessage): msg is SocketMessage<AgentData> => {
    return msg.type === 'RECEIVED_AGENT'
}
export const isLineMsg = (msg: WorkerMessage): msg is SocketMessage<Line[]> => {
    return msg.type === 'RECEIVED_LINES'
}
export const isGeoJsonMsg = (msg: WorkerMessage): msg is SocketMessage<string> => {
    return msg.type === 'RECEIVED_GEOJSON'
}
export const isMapboxToken = (msg: WorkerMessage): msg is SocketMessage<string> => {
    return msg.type === 'RECEIVED_MAPBOX_TOKEN'
}
export const isPitchMsg = (msg: WorkerMessage): msg is SocketMessage<any> => {
    return msg.type === 'RECEIVED_PITCH'
}
export const isBearingMsg = (msg: WorkerMessage): msg is SocketMessage<any> => {
    return msg.type === 'RECEIVED_BEARING'
}
export const isClearMovesMsg = (msg: WorkerMessage): msg is SocketMessage<string> => {
    return msg.type === 'RECEIVED_CLEAR_MOVES'
}
export const isViewStateMsg = (msg: WorkerMessage): msg is SocketMessage<string> => {
//    console.log("ViewStateCheck!")
    return msg.type === 'RECEIVED_VIEWSTATE'
}

export const isArcMsg = (msg: WorkerMessage): msg is SocketMessage<Arc[]> => {
        return msg.type === 'RECEIVED_ARCS'
}
export const isClearArcMsg = (msg: WorkerMessage): msg is SocketMessage<string> => {
    return msg.type === 'RECEIVED_CLEAR_ARCS'
}
export const isScatterMsg = (msg: WorkerMessage): msg is SocketMessage<Scatter[]> => {
    return msg.type === 'RECEIVED_SCATTERS'
}
export const isClearScatterMsg = (msg: WorkerMessage): msg is SocketMessage<string> => {
    return msg.type === 'RECEIVED_CLEAR_SCATTERS'
}

export const isLabelInfoMsg = (msg: WorkerMessage): msg is SocketMessage<LabelInfo> => {
    return msg.type === 'RECEIVED_LABEL_INFO'
}

export const isHarmoVISConfMsg = (msg: WorkerMessage): msg is SocketMessage<any> => {
    return msg.type === 'RECEIVED_HARMOVIS_CONF'
}


export type SocketMsgTypes = 'RECEIVED_AGENT'| 'CONNECTED'| 'RECEIVED_MAPBOX_TOKEN'
     | 'RECEIVED_BAR_GRAPHS'
     | 'RECEIVED_LINES'
     | 'RECEIVED_GEOJSON'
     | 'RECEIVED_PITCH'
     | 'RECEIVED_BEARING'
     | 'RECEIVED_CLEAR_MOVES'
     | 'RECEIVED_VIEWSTATE'
     | 'RECEIVED_ARCS'
     | 'RECEIVED_CLEAR_ARCS'
     | 'RECEIVED_SCATTERS'
     | 'RECEIVED_CLEAR_SCATTERS'
     | 'RECEIVED_LABEL_INFO'
     | 'RECEIVED_HARMOVIS_CONF'
     ;

import { AgentData } from "./agent";
import { BarData } from "./bargraph";
import { Line } from "./line";

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
export const isPitchMsg = (msg: WorkerMessage): msg is SocketMessage<number> => {
    return msg.type === 'RECEIVED_PITCH'
}
export const isBearingMsg = (msg: WorkerMessage): msg is SocketMessage<number> => {
    return msg.type === 'RECEIVED_BEARING'
}
export const isClearMovesMsg = (msg: WorkerMessage): msg is SocketMessage<string> => {
    return msg.type === 'RECEIVED_CLEAR_MOVES'
}
export const isViewStateMsg = (msg: WorkerMessage): msg is SocketMessage<string> => {
//    console.log("ViewStateCheck!")
    return msg.type === 'RECEIVED_VIEWSTATE'
}


export type SocketMsgTypes = 'RECEIVED_AGENT'| 'CONNECTED'| 'RECEIVED_MAPBOX_TOKEN'
     | 'RECEIVED_BAR_GRAPHS'
     | 'RECEIVED_LINES'
     | 'RECEIVED_GEOJSON'
     | 'RECEIVED_PITCH'
     | 'RECEIVED_BEARING'
     | 'RECEIVED_CLEAR_MOVES'
     | 'RECEIVED_VIEWSTATE'
     ;

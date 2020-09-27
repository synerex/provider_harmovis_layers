export interface PFlowData {
    id?: number,
    area?: string,
    type?: string,
    startTime?: Date,
    start_time?: any,
    endTime?: Date,
    end_time?: any,
    operation: Operation[],
    option: any,
}

export interface Operation 
{
    id?: number,
    longitude: number,
    latitude: number,
    z?: number,
    type?: string,
    timestamp?: Date,
    elapsedtime?: number,
    option: any,
}

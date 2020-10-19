export interface PAreaData {
    intervalSec?: number,
    acs: ACounter[],
    ts: Date,
}

export interface ACounter
{
    ts: Date,
    areaName: string,
    areaId: number,
    count: number,
}

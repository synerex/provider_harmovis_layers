export interface PAreaData {
    intervalSec?: number,
    acs: ACounter[],
}

export interface ACounter
{
    ts: Date,
    areaName: string,
    areaId: number,
    count: number,
}

export interface PAreaData {
    intervalSec?: number,
    acs: ACounter[],
    ts: {
        seconds: number,
        nanos: number,
    },
}

export interface ACounter
{
    ts: {
        seconds: number,
        nanos: number,
    },
    areaName: string,
    areaId: number,
    count: number,
}

export interface Area {
    name: string,
    lon: number,
    lat: number,
    counts: Counts[],
}

interface Counts {
    time: number,
    count: number,
}

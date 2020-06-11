
export interface Arc  {
    src: number[],
    tgt: number[],
    srcCol: number[],
    tgtCol: number[],
    tilt?: number
}

export interface Scatter  {
    pos: number[],
    radius: number,
    fillCol: number[],
    lineCol: number[],
    lineWid?: number
}


export interface LabelInfo {
    label: string,
    style: string
}

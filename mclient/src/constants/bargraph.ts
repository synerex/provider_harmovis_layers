import { MovedData } from "harmoware-vis";

export interface DataItem {id: number, color: number[], value: number, label: string}

type ShapeType = 4|6;

export interface BarData extends MovedData {
    id: number|string;
    data: DataItem[];
    elapsedtime: number;
    areaColor: number[];
    radius: number;
    width: number;
    min: number;
    max: number;
    text: string;
    shapeType: ShapeType;
}

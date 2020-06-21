import { MovedData } from "harmoware-vis";

export interface MeshItem {
    pos: number[]; // dont forget ! ( lon, lat)
    col: number[];
    val: number;
};

export interface MeshData extends MovedData {
    elapsedtime: number;
    meshItems: MeshItem[];
}

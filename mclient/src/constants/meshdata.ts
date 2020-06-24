import { MovedData } from "harmoware-vis";

export interface MeshItem {
    id: number; // id for mesh (could be meshID)
    pos: number[]; // dont forget ! ( lon, lat)
    col: number[];
    val: number;
};

export interface MeshData extends MovedData {
    elapsedtime: number;
    meshItems: MeshItem[];
}

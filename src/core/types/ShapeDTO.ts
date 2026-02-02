import type { ShapeType } from "./ShapeTypes";

export interface ShapeDTO {
    id: string;
    type: ShapeType;
    color: string;
    visible: boolean;
}
import type { ShapeDTO } from "./ShapeDTO";
import type { Point2D } from "./ShapeTypes";

export interface CircleDTO extends ShapeDTO {
    center: Point2D;
    radius: number;
}
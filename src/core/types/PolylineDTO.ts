import type { ShapeDTO } from "./ShapeDTO";
import type { Point2D } from "./ShapeTypes";


export interface PolylineDTO extends ShapeDTO {
    points: Point2D[];
}
import type { ShapeDTO } from "./ShapeDTO";
import type { Point2D } from "./ShapeTypes";

export interface LineDTO extends ShapeDTO {
    start: Point2D;
    end: Point2D;
}
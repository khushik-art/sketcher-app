import type { ShapeDTO } from "./ShapeDTO";
import type { Point2D } from '@core/types/ShapeTypes';


export interface EllipseDTO extends ShapeDTO {
    center: Point2D;
    radiusX: number;
    radiusY: number;
}
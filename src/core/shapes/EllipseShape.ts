import { Shape } from "./Shape";
import type { Point2D } from "@core/types/ShapeTypes";
import type { EllipseDTO } from "@core/types/EllipseDTO";



export class EllipseShape extends Shape {
    center: Point2D;
    radiusX: number;
    radiusY: number;

    constructor(center: Point2D, radiusX: number, radiusY: number)
    {
        super('ellipse');
        this.center = center;
        this.radiusX = radiusX;
        this.radiusY = radiusY;
    }

    move(delta: Point2D): void {
        this.center.x += delta.x;
        this.center.y += delta.y;
    }

    toJSON(): EllipseDTO {
        return {
            id: this.id,
            type: this.type,
            color: this.color,
            visible: this.visible,
            center: {...this.center},
            radiusX: this.radiusX,
            radiusY: this.radiusY
        };
    }
}
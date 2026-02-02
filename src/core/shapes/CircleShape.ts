import { Shape } from "./Shape";
import type { Point2D } from "@core/types/ShapeTypes";
import type { CircleDTO } from "@core/types/CircleDTO";


export class CircleShape extends Shape {
    center: Point2D;
    radius: number;

    constructor(center: Point2D, radius: number) {
        super("circle");

        this.center = {...center};
        this.radius = radius;
    }

    move(delta: Point2D): void {
        this.center.x += delta.x;
        this.center.y += delta.y;
    }

    toJSON(): CircleDTO {
        return {
            id: this.id,
            type: this.type,
            color: this.color,
            visible: this.visible,
            center: this.center,
            radius: this.radius
        }
    }

}
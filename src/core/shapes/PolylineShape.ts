import { Shape } from "./Shape";
import type { Point2D } from "@core/types/ShapeTypes";
import type { PolylineDTO } from "@core/types/PolylineDTO";


export class PolylineShape extends Shape {
    points: Point2D[];

    constructor(points: Point2D[] = [])
    {
        super("polyline");

        this.points = points.map(p => ({...p}));
    }

    addPoint(point:Point2D): void {
        this.points.push({...point});
    }

    move(delta: Point2D): void {
        for(const p of this.points){
            p.x += delta.x;
            p.y += delta.y;
        }
    }

    toJSON(): PolylineDTO {
        return {
            id:this.id,
            type: this.type,
            color: this.color,
            visible: this.visible,
            points: this.points.map(p => ({...p}))
        }
    }
}
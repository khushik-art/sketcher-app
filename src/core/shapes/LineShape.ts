import { Shape } from "./Shape";
import type { Point2D } from "@core/types/ShapeTypes";
import type { LineDTO } from "@core/types/LineDTO";



export class LineShape extends Shape {
    start:Point2D;
    end: Point2D;

    constructor(start:Point2D, end:Point2D){
        super("line");

        this.start = {...start};
        this.end = {...end};
    }

    move(delta: Point2D):void{
        this.start.x += delta.x;
        this.start.y += delta.y;

        this.end.x += delta.x;
        this.end.y += delta.y;
    }

    toJSON(): LineDTO {
        return{
            id: this.id,
            type: this.type,
            color: this.color,
            visible: this.visible,
            start: this.start,
            end: this.end
        };
    }
}
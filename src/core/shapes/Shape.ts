import type { ShapeType, Point2D } from "@core/types/ShapeTypes";
import type { ShapeDTO } from "@core/types/ShapeDTO";

export abstract class Shape{
    readonly id: string;
    readonly type: ShapeType;

    color: string;
    visible: boolean;

    protected constructor(type: ShapeType){
        this.id = crypto.randomUUID();
        this.type = type;
        this.color = '#333333';;
        this.visible = true;
    }

    abstract move(delta: Point2D): void;

    abstract toJSON(): ShapeDTO;
}
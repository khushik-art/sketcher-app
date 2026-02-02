import type { ShapeDTO } from '../types/ShapeDTO';
import type { Point2D } from '@core/types/ShapeTypes';
import { LineShape } from './LineShape';
import { Shape } from './Shape';
import { CircleShape } from './CircleShape';
import { PolylineShape } from './PolylineShape';
import { EllipseShape } from './EllipseShape';


export class ShapeFactory {
    static fromDTO(dto: ShapeDTO): Shape {
        switch(dto.type)
        {
            case "line":{
                const lineDTO = dto as any;

                const shape = new LineShape(
                lineDTO.start as Point2D,
                lineDTO.end as Point2D
            );
            ShapeFactory.applyCommonProps(shape, dto);
            return shape;
            }

            case "circle": {
                const circle = dto as any;

                const shape = new CircleShape(
                    circle.center as Point2D,
                    circle.radius as number
                );

                ShapeFactory.applyCommonProps(shape, dto);
                return shape;
            }

            case "polyline": {
                const polyline = dto as any;
                const shape = new PolylineShape(polyline.points);

                ShapeFactory.applyCommonProps(shape, dto);
                return shape;
            }

            case "ellipse": {
                const ellipse = dto as any;

                const shape = new EllipseShape(
                    ellipse.center,
                    ellipse.radiusX,
                    ellipse.radiusY
                )

                ShapeFactory.applyCommonProps(shape, dto);
                return shape;
            }

            default :
            throw new Error (`Unsupported shape type ${dto.type}`);
        }
    }

    private static applyCommonProps(shape: Shape, dto: ShapeDTO) {
        shape.color = dto.color;
        shape.visible = shape.visible;

        //restore id
        (shape as any).id = dto.id;
    }
}
import type { Point2D } from "@core/types/ShapeTypes";
import type { ShapeDTO } from "./types/ShapeDTO";
import { Shape } from "./shapes/Shape";
import { ShapeFactory } from "./shapes/ShapeFactory";

export class SketcherCore {
  private shapes: Shape[] = [];
  private selectedShapeId: string | null = null;

  //shape lifecyle

  addShape(shape: Shape): void {
    this.shapes.push(shape);
  }

  removeShape(id: string): void {
    this.shapes = this.shapes.filter((shape) => shape.id !== id);

    if (this.selectedShapeId === id) {
      this.selectedShapeId = null;
    }
  }

  //selection
  selectShape(id: string | null): void {
    this.selectedShapeId = id;
  }

  getSelectedShape(): Shape | null {
    return this.shapes.find((s) => s.id === this.selectedShapeId) ?? null;
  }

  //queries

  getShapes(): readonly Shape[] {
    return this.shapes;
  }

  getShapeById(id: string): Shape | undefined {
    return this.shapes.find((shape) => shape.id === id);
  }

  getSelectedShapeId(): string | null {
    return this.selectedShapeId;
  }

  //shape operations

  moveSelectedShape(delta: Point2D): void {
    const shape = this.getSelectedShape();
    if (!shape) return;

    shape.move(delta);
  }

  setColor(id: string, color: string): void {
    const shape = this.getShapeById(id);
    if (!shape) return;

    shape.color = color;
  }

  toggleVisibility(id: string): void {
    const shape = this.getShapeById(id);
    if (!shape) return;

    shape.visible = !shape.visible;

    // If hidden and selected → deselect
    if (!shape.visible && this.selectedShapeId === id) {
    this.selectedShapeId = null;
  }
  }

  //serialization

  toJSON(): ShapeDTO[] {
    return this.shapes.map((shape) => shape.toJSON());
  }

  loadFromJSON(data: ShapeDTO[]): void {
    this.clear();

    for (const dto of data) {
      const shape = ShapeFactory.fromDTO(dto);
      this.addShape(shape);
    }
  }

  clear(): void {
    this.shapes = [];
    this.selectedShapeId = null;
  }
}

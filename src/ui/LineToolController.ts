import { SketcherCore } from "@core/SketcherCore";
import { LineShape } from "@core/shapes/LineShape";
import { ThreeRenderer } from "@renderer/ThreeRenderer";
import {BaseDrawTool} from "@ui/BaseDrawTool"

export class LineToolController extends BaseDrawTool {
  private startPoint: { x: number; y: number } | null = null;

  constructor(
    canvas: HTMLCanvasElement,
    sketcher: SketcherCore,
    renderer: ThreeRenderer,
    onFinish: () => void
  ) {
    super(canvas, sketcher, renderer, onFinish);
    this.bind();
  }

  private bind() {
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("mouseup", this.onMouseUp);
  }

  private onMouseDown = (event: MouseEvent) => {
    this.startPoint = this.renderer.getWorldPoint(event);
  };

  private onMouseMove = (event: MouseEvent) => {
    if (!this.startPoint) return;

    const p = this.renderer.getWorldPoint(event);
    this.renderer.updateLinePreview(this.startPoint, p);
  };

  private onMouseUp = (event: MouseEvent) => {
    if (!this.startPoint) return;

    const endPoint = this.renderer.getWorldPoint(event);

    // Ignore zero-length lines
    if (
      this.startPoint.x === endPoint.x &&
      this.startPoint.y === endPoint.y
    ) {
      this.renderer.clearLinePreview();
      this.startPoint = null;
      return;
    }

    const line = new LineShape(this.startPoint, endPoint);
    this.sketcher.addShape(line);

    this.renderer.clearLinePreview();
    this.startPoint = null;
    this.onFinish();
  };

  destroy() {
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("mouseup", this.onMouseUp);

    this.renderer.clearLinePreview();
    this.startPoint = null;
  }
}

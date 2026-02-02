import { SketcherCore } from "@core/SketcherCore";
import { PolylineShape } from "@core/shapes/PolylineShape";
import { ThreeRenderer } from "@renderer/ThreeRenderer";
import { BaseDrawTool } from "@ui/BaseDrawTool";

export class PolylineToolController extends BaseDrawTool {
  private points: { x: number; y: number }[] = [];
   isDrawing = false;

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
    this.canvas.addEventListener("dblclick", this.onDoubleClick);
    window.addEventListener("keydown", this.onKeyDown);
  }

  private onMouseDown = (event: MouseEvent) => {
    event.stopPropagation();

    const p = this.renderer.getWorldPoint(event);

    if (!this.isDrawing) {
      this.isDrawing = true;
      this.points = [p];
      return;
    }

    this.points.push(p);
  };

  private onMouseMove = (event: MouseEvent) => {
    if (!this.isDrawing) return;

    const p = this.renderer.getWorldPoint(event);
    this.renderer.updatePolylinePreview([...this.points, p]);
  };

  private onDoubleClick = (event: MouseEvent) => {
    event.stopPropagation();

    if (this.points.length < 2) return;

    const polyline = new PolylineShape([...this.points]);
    this.sketcher.addShape(polyline);

    this.reset();
    this.onFinish(); // refresh UI only
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.reset();
    }
  };

  private reset() {
    this.isDrawing = false;
    this.points = [];
    this.renderer.clearPolylinePreview();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("dblclick", this.onDoubleClick);
    window.removeEventListener("keydown", this.onKeyDown);

    this.reset();
  }
}

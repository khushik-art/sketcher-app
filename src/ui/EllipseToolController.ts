import { SketcherCore } from "@core/SketcherCore";
import { EllipseShape } from "@core/shapes/EllipseShape";
import { ThreeRenderer } from "@renderer/ThreeRenderer";
import { BaseDrawTool } from "@ui/BaseDrawTool";

export class EllipseToolController extends BaseDrawTool {
  private center: { x: number; y: number } | null = null;
  isDrawing = false;

  constructor(
    canvas: HTMLCanvasElement,
    sketcher: SketcherCore,
    renderer: ThreeRenderer,
    onFinish: () => void,
  ) {
    super(canvas, sketcher, renderer, onFinish);
    this.bind();
  }

  private bind() {
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("keydown", this.onKeyDown);
  }

  private onMouseDown = (event: MouseEvent) => {
    event.stopPropagation();
    this.center = this.renderer.getWorldPoint(event);
    this.isDrawing = true;
  };

  private onMouseMove = (event: MouseEvent) => {
    if (!this.isDrawing || !this.center) return;

    const p = this.renderer.getWorldPoint(event);
    const rx = Math.abs(p.x - this.center.x);
    const ry = Math.abs(p.y - this.center.y);

    this.renderer.updateEllipsePreview(this.center, rx, ry);
  };

  private onMouseUp = (event: MouseEvent) => {
    if (!this.isDrawing || !this.center) return;

    const p = this.renderer.getWorldPoint(event);
    const rx = Math.abs(p.x - this.center.x);
    const ry = Math.abs(p.y - this.center.y);

    if (rx > 0.01 && ry > 0.01) {
      const ellipse = new EllipseShape(this.center, rx, ry);
      this.sketcher.addShape(ellipse);
    }

    this.reset();
    this.onFinish();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      this.reset();
    }
  };

  private reset() {
    this.isDrawing = false;
    this.center = null;
    this.renderer.clearEllipsePreview();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("keydown", this.onKeyDown);

    this.reset();
  }
}

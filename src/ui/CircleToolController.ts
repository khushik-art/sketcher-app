import { SketcherCore } from "@core/SketcherCore";
import { CircleShape } from "@core/shapes/CircleShape";
import { ThreeRenderer } from "@renderer/ThreeRenderer";
import { BaseDrawTool } from "@ui/BaseDrawTool";

export class CircleToolController extends BaseDrawTool {
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
    const radius = Math.hypot(p.x - this.center.x, p.y - this.center.y);

    this.renderer.updateCirclePreview(this.center, radius);
  };

  private onMouseUp = (event: MouseEvent) => {
    if (!this.isDrawing || !this.center) return;

    const p = this.renderer.getWorldPoint(event);
    const radius = Math.hypot(p.x - this.center.x, p.y - this.center.y);

    if (radius > 0.01) {
      const circle = new CircleShape(this.center, radius);
      this.sketcher.addShape(circle);
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
    this.renderer.clearCirclePreview();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("keydown", this.onKeyDown);

    this.reset();
  }
}

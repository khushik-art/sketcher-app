import type { SketcherCore } from "@core/SketcherCore";
import type { ThreeRenderer } from "@renderer/ThreeRenderer";

export abstract class BaseDrawTool {
  protected isDrawing = false;

  constructor(
    protected canvas: HTMLCanvasElement,
    protected sketcher: SketcherCore,
    protected renderer: ThreeRenderer,
    protected onFinish: () => void
  ) {}

  abstract destroy(): void;
}
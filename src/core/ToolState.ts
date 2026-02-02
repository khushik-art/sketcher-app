export type ToolType = "line" | null;

export interface LineDraft {
  start: { x: number; y: number };
  end: { x: number; y: number };
}
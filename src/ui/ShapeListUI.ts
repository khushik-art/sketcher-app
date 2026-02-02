import { SketcherCore } from "@core/SketcherCore";
import { Shape } from "@core/shapes/Shape";

export class ShapeListUI {
  private container: HTMLElement;
  private sketcher: SketcherCore;

  onSelect?: (id: string | null) => void;

  constructor(
    containerId: string,
    sketcher: SketcherCore,
    private onDelete?: (id: string) => void,
    private onVisibilityChange?: (shape: Shape) => void
  ) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);

    this.container = el;
    this.sketcher = sketcher;
  }

  render(): void {
    const shapes = this.sketcher.getShapes();
    const selectedId = this.sketcher.getSelectedShapeId();

    this.container.innerHTML = "";

    /* ---------- Header ---------- */
    const header = document.createElement("div");
    header.className = "panel-header";
    header.innerHTML = `
      <span>List of Created Object</span>
    `;
    this.container.appendChild(header);

    /* ---------- Body ---------- */
    const body = document.createElement("div");
    body.className = "panel-body";

    for (const shape of shapes) {
      body.appendChild(this.createItem(shape, selectedId));
    }

    this.container.appendChild(body);
  }

  private createItem(shape: Shape, selectedId: string | null): HTMLElement {
    const row = document.createElement("div");
    row.className = "shape-item";
    if (shape.id === selectedId) row.classList.add("selected");

    row.onclick = () => {
      this.sketcher.selectShape(shape.id);
      this.onSelect?.(shape.id);
      this.render();
    };

    /* ---------- Left (icon + label) ---------- */
    const left = document.createElement("div");
    left.className = "shape-left";

    const icon = document.createElement("span");
    icon.textContent = this.getIcon(shape.type);

    const label = document.createElement("span");
    label.textContent = this.getDisplayName(shape);

    left.append(icon, label);

    /* ---------- Right (actions) ---------- */
    const actions = document.createElement("div");
    actions.className = "shape-actions";

    const eyeBtn = document.createElement("button");
    eyeBtn.textContent = shape.visible ? "👁" : "🚫";
    eyeBtn.onclick = (e) => {
      e.stopPropagation();
      shape.visible = !shape.visible;
      this.onVisibilityChange?.(shape);
      this.render();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑";
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      this.onDelete?.(shape.id);
    };

    actions.append(eyeBtn, deleteBtn);

    row.append(left, actions);
    return row;
  }

  private getDisplayName(shape: Shape): string {
    return `${shape.type[0].toUpperCase()}${shape.type.slice(1)}`;
  }

  private getIcon(type: string): string {
    switch (type) {
      case "line": return "📐";
      case "circle": return "⭕";
      case "ellipse": return "⬭";
      case "polyline": return "🔗";
      default: return "◼";
    }
  }
}

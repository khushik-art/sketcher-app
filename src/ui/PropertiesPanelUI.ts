import { SketcherCore } from "@core/SketcherCore";
import { CircleShape } from "@core/shapes/CircleShape";
import { Shape } from "@core/shapes/Shape";
import { EllipseShape } from "../core/shapes/EllipseShape";
import { PolylineShape } from "@core/shapes/PolylineShape";

export class propertiesPanelUI {
  private container: HTMLElement;
  private sketcher: SketcherCore;
  private draft: any = null;

  constructor(
    containerId: string,
    sketcher: SketcherCore,
    private onUpdate: (shape: Shape) => void,
    private onVisibilityChange: (shape: Shape) => void,
    private onDelete: (id: string) => void,
    private onTransformUpdate?: (shape: Shape) => void,
  ) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Element #${containerId} not found`);

    this.container = el;
    this.sketcher = sketcher;
  }

  render(): void {
    const shape = this.sketcher.getSelectedShape();

    this.container.innerHTML = "";

    if (!shape) {
      this.renderEmpty();
      return;
    }

    this.draft = structuredClone(shape);
    this.renderHeader(shape);
    this.renderReadOnlyProperties(shape);
    this.renderColorProps();
    this.renderActions(shape);
  }
  private renderEmpty() {
  this.container.innerHTML = `
    <div class="properties-empty">
      <div class="empty-content">
        <div class="empty-title">No selection</div>
        <div class="empty-subtitle">
          Select a shape to see its properties
        </div>
      </div>
    </div>
  `;
}


  private renderHeader(shape: Shape) {
    const header = document.createElement("div");
    header.className = "properties-header";
    header.textContent = `${shape.type}`;

    this.container.appendChild(header);
  }

  private renderActions(shape: Shape) {
    const actions = document.createElement("div");
    actions.className = "properties-actions";

    const updateBtn = document.createElement("button");
    updateBtn.textContent = "Update";

    updateBtn.onclick = () => {
      const original = shape;
      const draft = this.draft;

      const needsRebuild = this.needsGeometryRebuild(original, draft);

      Object.assign(original, {
        ...draft,
        color:
          typeof draft.color === "string"
            ? this.hexToColor(draft.color)
            : draft.color,
      });

      if (needsRebuild) {
        this.onUpdate(original); // → updateObject
      } else {
        this.onTransformUpdate?.(original); // → updateTransform
      }
    };
    const hideBtn = document.createElement("button");
    hideBtn.textContent = shape.visible ? "Hide" : "Show";

    hideBtn.onclick = () => {
      shape.visible = !shape.visible;
      this.onVisibilityChange(shape);
      this.render();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";

    deleteBtn.onclick = () => {
      this.onDelete(shape.id);
    };

    actions.appendChild(updateBtn);
    actions.appendChild(hideBtn);
    actions.appendChild(deleteBtn);

    this.container.appendChild(actions);
  }

  private renderReadOnlyProperties(shape: Shape) {
    if (shape.type === "circle") {
      this.renderCircleProps();
    }

    if (shape.type === "line") {
      this.renderLineProps();
    }

    if (shape.type === "ellipse") {
      this.renderEllipseProps();
    }

    if (shape.type === "polyline") {
      this.renderPolylineProps();
    }
  }

  private renderCircleProps() {
    const section = document.createElement("div");
    section.className = "properties-section";

    section.innerHTML = `
    <h4>Center</h4>
    <input type="number" step="0.1" value="${this.draft.center.x}" data-key="center.x"/>
    <input type="number" step="0.1" value="${this.draft.center.y}" data-key="center.y"/>

    <h4>Radius</h4>
    <input type="number" step="0.1" value="${this.draft.radius}" data-key="radius"/>
  `;

    this.bindInputs(section);
    this.container.appendChild(section);
  }
  private renderLineProps() {
    const section = document.createElement("div");
    section.className = "properties-section";

    section.innerHTML = `
    <h4>Start</h4>
    <input type="number" value="${this.draft.start.x}" data-key="start.x"/>
    <input type="number" value="${this.draft.start.y}" data-key="start.y"/>

    <h4>End</h4>
    <input type="number" value="${this.draft.end.x}" data-key="end.x"/>
    <input type="number" value="${this.draft.end.y}" data-key="end.y"/>
  `;

    this.bindInputs(section);
    this.container.appendChild(section);
  }

  private renderPolylineProps() {
    const section = document.createElement("div");
    section.className = "properties-section";

    section.innerHTML = `<h4>Points</h4>`;

    this.draft.points.forEach((p: any, i: number) => {
      const row = document.createElement("div");
      row.innerHTML = `
      <input type="number" value="${p.x}" data-key="points.${i}.x"/>
      <input type="number" value="${p.y}" data-key="points.${i}.y"/>
    `;
      section.appendChild(row);
    });

    this.bindInputs(section);
    this.container.appendChild(section);
  }

  private renderEllipseProps() {
    const section = document.createElement("div");
    section.className = "properties-section";

    section.innerHTML = `
    <h4>Center</h4>
    <input type="number" step="0.1" value="${this.draft.center.x}" data-key="center.x"/>
    <input type="number" step="0.1" value="${this.draft.center.y}" data-key="center.y"/>

    <h4>Radius</h4>
    <input type="number" step="0.1" value="${this.draft.radiusX}" data-key="radiusX"/>
    <input type="number" step="0.1" value="${this.draft.radiusY}" data-key="radiusY"/>
  `;

    this.bindInputs(section);
    this.container.appendChild(section);
  }

  private bindInputs(container: HTMLElement) {
    container.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        const key = input.getAttribute("data-key");
        if (!key) return;

        const path = key.split(".");
        let target = this.draft;

        for (let i = 0; i < path.length - 1; i++) {
          target = target[path[i]];
        }

        target[path[path.length - 1]] = parseFloat(input.value);
      });
    });
  }

  private needsGeometryRebuild(original: Shape, draft: any): boolean {
    // ---- Circle ----
    if (original instanceof CircleShape) {
      return original.radius !== draft.radius;
    }

    // ---- Ellipse ----
    if (original instanceof EllipseShape) {
      return (
        original.radiusX !== draft.radiusX || original.radiusY !== draft.radiusY
      );
    }

    // ---- Polyline ----
    if (original instanceof PolylineShape) {
      return original.points.length !== draft.points.length;
    }

    // ---- Line ----
    // Lines never need geometry rebuild (just transform)
    return false;
  }

  private renderColorProps() {
    const section = document.createElement("div");
    section.className = "properties-section";

    section.innerHTML = `
    <h4>Color</h4>
    <input type="color" value="${this.colorToHex(this.draft.color)}" />
  `;

    const input = section.querySelector("input")!;
    input.addEventListener("input", () => {
      this.draft.color = this.hexToColor(input.value);
    });

    this.container.appendChild(section);
  }

  colorToHex(color: number | string): string {
    if (typeof color === "string") {
      return color.startsWith("#") ? color : `#${color}`;
    }

    return "#" + color.toString(16).padStart(6, "0");
  }

  hexToColor(hex: string): number {
    return parseInt(hex.replace("#", ""), 16);
  }
}

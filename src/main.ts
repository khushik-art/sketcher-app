import { SketcherCore } from "@core/SketcherCore";
import { ThreeRenderer } from "@renderer/ThreeRenderer";
import { ShapeListUI } from "@ui/ShapeListUI";
import { propertiesPanelUI } from "@ui/PropertiesPanelUI";
import "./style.css";
import { LineToolController } from "@ui/LineToolController";
import { PolylineToolController } from "@ui/PolylineToolController";
import { CircleToolController } from "@ui/CircleToolController";
import { EllipseToolController } from "@ui/EllipseToolController"

const canvas = document.querySelector("canvas")!;
const sketcher = new SketcherCore();
const renderer = new ThreeRenderer(canvas);
interface ToolController {
  destroy(): void;
}
let activeTool: ToolController | null = null;

function activateTool(tool: ToolController | null, buttonId: string | null = null) {
  activeTool?.destroy();
  activeTool = tool;
  setActiveToolButton(buttonId);
}

const handleDelete = (id: string) => {
  sketcher.removeShape(id);
  renderer.removeShape(id);

  sketcher.selectShape(null);
  renderer.updateSelection(null);

  shapeListUI.render();
};

const shapeListUI = new ShapeListUI(
  "shape-list",
  sketcher,
  handleDelete,
  (shape) => {
    renderer.updateVisibility(shape);
  },
);

shapeListUI.onSelect = (id) => {
  activateTool(null, null);
  renderer.updateSelection(id);
  propertiesUI.render();
};

const propertiesUI = new propertiesPanelUI(
  "properties",
  sketcher,
  (shape) => {
    renderer.updateObject(shape);
    renderer.updateSelection(shape.id);
  },
  (shape) => {
    renderer.updateVisibility(shape);
  },
  (id) => {
    sketcher.removeShape(id);
    renderer.removeShape(id);
    renderer.updateSelection(null);
    shapeListUI.render();
    propertiesUI.render();
  },
  (shape) => {
    renderer.updateTransform(shape);
    renderer.updateMaterial(shape);
    renderer.updateSelection(shape.id);
  },
);

propertiesUI.render();


renderer.render(sketcher.getShapes());
shapeListUI.render();

canvas.addEventListener("click", (event) => {
  if (activeTool) return;

  const shapeId = renderer.pick(event);
  sketcher.selectShape(shapeId);

  renderer.updateSelection(shapeId);
  shapeListUI.render();
  propertiesUI.render();
});

canvas.addEventListener("mousemove", (event) => {
  if (activeTool) {
    renderer.updateHover(null);
    canvas.style.cursor =
      "url('/cursors/crosshair1.svg') 12 12, crosshair";
    return;
  }
  const hoverId = renderer.hover(event);
  renderer.updateHover(hoverId);

  canvas.style.cursor = hoverId ? "pointer" : "default";
});

//tool button functions
document.getElementById("tool-line")!.onclick = () => {
  activateTool(
    new LineToolController(canvas, sketcher, renderer, onToolFinish),
    "tool-line"
  );
};

document.getElementById("tool-polyline")!.onclick = () => {
  activateTool(
    new PolylineToolController(canvas, sketcher, renderer, onToolFinish),
    "tool-polyline"
  );
};

document.getElementById("tool-circle")!.onclick = () => {
    activateTool(
    new CircleToolController(canvas, sketcher, renderer, onToolFinish),
    "tool-circle"
  );
}

document.getElementById("tool-ellipse")!.onclick = () => {
    activateTool(
    new EllipseToolController(canvas, sketcher, renderer, onToolFinish),
    "tool-ellipse"
  );
}

function onToolFinish() {
  renderer.render(sketcher.getShapes());
  shapeListUI.render();
  propertiesUI.render();
}

document.getElementById("tool-select")!.onclick = () => {
  activateTool(null, "tool-select");
};

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && activeTool) {
    activeTool.destroy();
    activateTool(null, "tool-select");
    renderer.render(sketcher.getShapes());
  }
});

document.getElementById("tool-save")!.onclick = () => {
  const data = sketcher.toJSON();

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "sketch.json";
  a.click();

  URL.revokeObjectURL(url);
};


const fileInput = document.getElementById("file-input") as HTMLInputElement;

document.getElementById("tool-load")!.onclick = () => {
  fileInput.value = "";
  fileInput.click();
};

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  const text = await file.text();
  const data = JSON.parse(text);

  sketcher.loadFromJSON(data);

  // full re-sync
  renderer.clear();
  renderer.render(sketcher.getShapes());
  renderer.updateSelection(null);
  shapeListUI.render();
  propertiesUI.render();
});


function setActiveToolButton(buttonId: string | null) {
  document
    .querySelectorAll("#toolbar button")
    .forEach((btn) => btn.classList.remove("active"));

  if (buttonId) {
    document.getElementById(buttonId)?.classList.add("active");
  }
}

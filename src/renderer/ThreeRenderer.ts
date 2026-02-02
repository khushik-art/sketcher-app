import * as THREE from "three";
import { Shape } from "@core/shapes/Shape";
import { LineShape } from "@core/shapes/LineShape";
import { CircleShape } from "@core/shapes/CircleShape";
import { EllipseShape } from "@core/shapes/EllipseShape";
import { PolylineShape } from "@core/shapes/PolylineShape";

export class ThreeRenderer {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private selectionOutline: THREE.Object3D | null = null;
  private hoverOutline: THREE.Object3D | null = null;
  private linePreview: THREE.Line | null = null;
  private polylinePreview: THREE.Line | null = null;
  private circlePreview: THREE.Mesh | null = null;
  private ellipsePreview: THREE.Mesh | null = null;

  private shapeMap = new Map<string, THREE.Object3D>();

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
    this.camera.position.z = 10;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0); // transparent

    this.resize();
    window.addEventListener("resize", this.resize);

    this.animate();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  render(shapes: readonly Shape[]): void {
    for (const shape of shapes) {
      if (!this.shapeMap.has(shape.id)) {
        const obj = this.createObject(shape);
        this.shapeMap.set(shape.id, obj);
        this.scene.add(obj);
      } else {
        this.updateObject(shape);
      }
    }
    console.log("Rendering shapes:", shapes.length);
  }

  private createObject(shape: Shape): THREE.Object3D {
    if (shape instanceof LineShape) return this.createLine(shape);
    if (shape instanceof CircleShape) return this.createCircle(shape);
    if (shape instanceof EllipseShape) return this.createEllipse(shape);
    if (shape instanceof PolylineShape) return this.createPolyline(shape);

    throw new Error("Unsupported shape");
  }

  private createLine(shape: LineShape): THREE.Line {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(shape.start.x, shape.start.y, 0),
      new THREE.Vector3(shape.end.x, shape.end.y, 0),
    ]);

    const material = new THREE.LineBasicMaterial({
      color: shape.color,
    });

    const line = new THREE.Line(geometry, material);
    line.userData.shapeId = shape.id;
    line.visible = shape.visible;
    console.log("Creating line", shape.id);
    return line;
  }

  private createCircle(shape: CircleShape): THREE.Mesh {
    const geometry = new THREE.CircleGeometry(shape.radius, 64);
    const material = new THREE.MeshBasicMaterial({
      color: shape.color,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.shapeId = shape.id;
    mesh.position.set(shape.center.x, shape.center.y, 0);
    mesh.visible = shape.visible;

    console.log("Creating circle", shape.id);
    return mesh;
  }

  private createEllipse(shape: EllipseShape): THREE.Mesh {
    const ellipseShape = new THREE.Shape();

    ellipseShape.absellipse(
      0,
      0,
      shape.radiusX,
      shape.radiusY,
      0,
      Math.PI * 2,
      false,
      0,
    );

    const geometry = new THREE.ShapeGeometry(ellipseShape);

    const material = new THREE.MeshBasicMaterial({
      color: shape.color,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.shapeId = shape.id;
    mesh.position.set(shape.center.x, shape.center.y, 0);
    mesh.visible = shape.visible;

    return mesh;
  }

  private createPolyline(shape: PolylineShape): THREE.Line {
    const geometry = new THREE.BufferGeometry().setFromPoints(
      shape.points.map((p) => new THREE.Vector3(p.x, p.y, 0)),
    );

    const material = new THREE.LineBasicMaterial({
      color: shape.color,
    });

    const line = new THREE.Line(geometry, material);
    line.userData.shapeId = shape.id;
    return line;
  }

  updateTransform(shape: Shape): void {
    const obj = this.shapeMap.get(shape.id);
    if (!obj) return;

    // ---- Circle & Ellipse: move via position ----
    if (shape instanceof CircleShape || shape instanceof EllipseShape) {
      obj.position.set(shape.center.x, shape.center.y, 0);
      return;
    }

    // ---- Line: update start/end vertices ----
    if (shape instanceof LineShape && obj instanceof THREE.Line) {
      const geom = obj.geometry as THREE.BufferGeometry;
      const positions = geom.attributes.position.array as Float32Array;

      positions[0] = shape.start.x;
      positions[1] = shape.start.y;
      positions[3] = shape.end.x;
      positions[4] = shape.end.y;

      geom.attributes.position.needsUpdate = true;
      return;
    }

    // ---- Polyline: update all points ----
    if (shape instanceof PolylineShape && obj instanceof THREE.Line) {
      const geom = obj.geometry as THREE.BufferGeometry;
      const positions = geom.attributes.position.array as Float32Array;

      shape.points.forEach((p, i) => {
        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
      });

      geom.attributes.position.needsUpdate = true;
      return;
    }
  }
  updateObject(shape: Shape): void {
    this.removeShape(shape.id);
    const obj = this.createObject(shape);
    this.shapeMap.set(shape.id, obj);
    this.scene.add(obj);
  }

  updateMaterial(shape: Shape): void {
    const obj = this.shapeMap.get(shape.id);
    if (!obj) return;

    if ("material" in obj) {
      const material = obj.material as THREE.Material | THREE.Material[];

      if (Array.isArray(material)) {
        material.forEach((m: any) => m.color?.set(shape.color));
      } else {
        (material as any).color?.set(shape.color);
      }
    }
  }

  //tool functions

  updateLinePreview(
    start: { x: number; y: number },
    end: { x: number; y: number },
  ) {
    if (!this.linePreview) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(start.x, start.y, 0),
        new THREE.Vector3(end.x, end.y, 0),
      ]);

      const material = new THREE.LineDashedMaterial({
        color: '#444444',
        dashSize: 0.2,
        gapSize: 0.1,
      });

      this.linePreview = new THREE.Line(geometry, material);
      this.linePreview.computeLineDistances();
      this.scene.add(this.linePreview);
      return;
    }

    const geom = this.linePreview.geometry as THREE.BufferGeometry;
    const pos = geom.attributes.position.array as Float32Array;

    pos[0] = start.x;
    pos[1] = start.y;
    pos[3] = end.x;
    pos[4] = end.y;

    geom.attributes.position.needsUpdate = true;
  }

  clearLinePreview() {
    if (!this.linePreview) return;
    this.scene.remove(this.linePreview);
    this.linePreview = null;
  }

  updatePolylinePreview(points: { x: number; y: number }[]) {
    const geometry = new THREE.BufferGeometry().setFromPoints(
      points.map((p) => new THREE.Vector3(p.x, p.y, 0)),
    );

    if (!this.polylinePreview) {
      const material = new THREE.LineBasicMaterial({
        color: '#444444',
        transparent: true,
        opacity: 0.6,
      });

      this.polylinePreview = new THREE.Line(geometry, material);
      this.scene.add(this.polylinePreview);
    } else {
      this.polylinePreview.geometry.dispose();
      this.polylinePreview.geometry = geometry;
    }
  }

  clearPolylinePreview() {
    if (!this.polylinePreview) return;

    this.scene.remove(this.polylinePreview);
    this.polylinePreview.geometry.dispose();
    this.polylinePreview = null;
  }

  updateCirclePreview(center: { x: number; y: number }, radius: number) {
    if (radius <= 0) return;

    if (!this.circlePreview) {
      const geometry = new THREE.CircleGeometry(radius, 64);
      const material = new THREE.MeshBasicMaterial({
        color: '#444444',
        transparent: true,
        opacity: 0.6,
      });

      this.circlePreview = new THREE.Mesh(geometry, material);
      this.scene.add(this.circlePreview);
    } else {
      this.circlePreview.geometry.dispose();
      this.circlePreview.geometry = new THREE.CircleGeometry(radius, 64);
    }

    this.circlePreview.position.set(center.x, center.y, 0);
  }

  clearCirclePreview() {
  if (!this.circlePreview) return;

  this.scene.remove(this.circlePreview);
  this.circlePreview.geometry.dispose();
  this.circlePreview = null;
}

updateEllipsePreview(
  center: { x: number; y: number },
  rx: number,
  ry: number
) {
  if (rx <= 0 || ry <= 0) return;

  const shape = new THREE.Shape();
  shape.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);

  const geometry = new THREE.ShapeGeometry(shape);

  if (!this.ellipsePreview) {
    const material = new THREE.MeshBasicMaterial({
      color: '#444444',
      transparent: true,
      opacity: 0.6,
    });

    this.ellipsePreview = new THREE.Mesh(geometry, material);
    this.scene.add(this.ellipsePreview);
  } else {
    this.ellipsePreview.geometry.dispose();
    this.ellipsePreview.geometry = geometry;
  }

  this.ellipsePreview.position.set(center.x, center.y, 0);
}

clearEllipsePreview() {
  if (!this.ellipsePreview) return;

  this.scene.remove(this.ellipsePreview);
  this.ellipsePreview.geometry.dispose();
  this.ellipsePreview = null;
}

clear(): void {
  for (const obj of this.shapeMap.values()) {
    this.scene.remove(obj);
  }

  this.shapeMap.clear();

  this.updateSelection(null);
  this.updateHover(null);
}

  getWorldPoint(event: MouseEvent): { x: number; y: number } {
    this.updateMouse(event);

    const vec = new THREE.Vector3(this.mouse.x, this.mouse.y, 0);
    vec.unproject(this.camera);

    return { x: vec.x, y: vec.y };
  }

  private updateMouse(event: MouseEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  pick(event: MouseEvent): string | null {
    this.updateMouse(event);
    this.raycaster.params.Line.threshold = 0.05;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const objects = Array.from(this.shapeMap.values());
    const hits = this.raycaster.intersectObjects(objects, true);

    if (hits.length === 0) return null;

    const hitObject = hits[0].object;
    return hitObject.userData.shapeId ?? null;
  }

  private resize = () => {
    const container = this.renderer.domElement.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const aspect = width / height;

    const frustumHeight = 20;
    const frustumWidth = frustumHeight * aspect;

    this.camera.left = -frustumWidth / 2;
    this.camera.right = frustumWidth / 2;
    this.camera.top = frustumHeight / 2;
    this.camera.bottom = -frustumHeight / 2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
  };

  updateSelection(shapeId: string | null): void {
    //removes old outline
    if (this.selectionOutline) {
      this.scene.remove(this.selectionOutline);
      this.selectionOutline = null;
    }

    if (!shapeId) return;

    const obj = this.shapeMap.get(shapeId);
    if (!obj) return;

    const outline = this.createOutline(obj);

    this.selectionOutline = outline;
    this.scene.add(outline);
  }

  updateVisibility(shape: Shape) {
    const obj = this.shapeMap.get(shape.id);
    if (!obj) return;
    obj.visible = shape.visible;
  }

  private createOutline(obj: THREE.Object3D): THREE.Object3D {
    if (obj instanceof THREE.Mesh) {
      const edges = new THREE.EdgesGeometry(obj.geometry);
      const material = new THREE.LineBasicMaterial({
        color: '#261dd8',
        linewidth: 1, // (note: width is mostly ignored in WebGL)
      });
      const outline = new THREE.LineLoop(edges, material);
      outline.position.copy(obj.position);
      outline.scale.multiplyScalar(1.05);

      return outline;
    }

    if (obj instanceof THREE.Line) {
      const geometry = obj.geometry.clone();
      const material = new THREE.LineDashedMaterial({
        color: '#261dd8',
        dashSize: 0.3,
        gapSize: 0.2,
      });

      const outline = new THREE.Line(geometry, material);
      outline.computeLineDistances();

      return outline;
    }

    throw new Error("Unsupported outline object");
  }

  hover(event: MouseEvent): string | null {
    this.updateMouse(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.raycaster.params.Line.threshold = 0.05;

    const objects = Array.from(this.shapeMap.values());
    const hits = this.raycaster.intersectObjects(objects, true);

    if (hits.length === 0) return null;
    return hits[0].object.userData.shapeId ?? null;
  }

  updateHover(shapeId: string | null): void {
    // remove old hover outline
    if (this.hoverOutline) {
      this.scene.remove(this.hoverOutline);
      this.hoverOutline = null;
    }

    if (!shapeId) return;

    // ❗️Do not hover-outline selected shape
    if (
      this.selectionOutline &&
      this.selectionOutline.userData?.shapeId === shapeId
    ) {
      return;
    }

    const obj = this.shapeMap.get(shapeId);
    if (!obj) return;

    const outline = this.createHoverOutline(obj);
    this.hoverOutline = outline;
    this.scene.add(outline);
  }

  private createHoverOutline(obj: THREE.Object3D): THREE.Object3D {
    if (obj instanceof THREE.Mesh) {
      const edges = new THREE.EdgesGeometry(obj.geometry);
      const material = new THREE.LineBasicMaterial({
        color: '#1a2765', // lighter blue
      });

      const outline = new THREE.LineSegments(edges, material);
      outline.position.copy(obj.position);
      outline.scale.multiplyScalar(1.05);

      return outline;
    }

    if (obj instanceof THREE.Line) {
      const geometry = obj.geometry.clone();
      const material = new THREE.LineBasicMaterial({
        color: '#98a4de',
      });

      return new THREE.Line(geometry, material);
    }

    throw new Error("Unsupported hover outline");
  }

  removeShape(shapeId: string): void {
    const obj = this.shapeMap.get(shapeId);
    if (!obj) return;

    this.scene.remove(obj);
    this.shapeMap.delete(shapeId);

    if (
      this.selectionOutline &&
      this.selectionOutline.userData?.shapeId === shapeId
    ) {
      this.scene.remove(this.selectionOutline);
      this.selectionOutline = null;
    }
  }
}



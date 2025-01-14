import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial, Vector3 } from "three";
import { ThreejsMapEnvironmentData } from "../../../../shared/data/threejs/threejs-map-environment-data";
import { MapElement } from "../base-classes/map-element";


export class CustomLine extends MapElement {

  private line!: Line;
  private material!: LineBasicMaterial;
  private showLine: boolean = true;
  private color: number = 0xffff00;
  private opacity: number = 0;
  private maxOpacity: number = 0;
  private opacityAnimationStep: number = 0.02;
  private lineWidth: number = 3;

  constructor(private threeMapEnvironmentData: ThreejsMapEnvironmentData, color: number, maxOpacity: number, lineWidth: number = 3) {
    super(threeMapEnvironmentData);
    this.color = color;
    this.maxOpacity = maxOpacity;
    this.createLine([]);
  }

  private createLine(points: Vector3[]) {
    const geometry = new BufferGeometry().setFromPoints(points);
    this.material = new LineBasicMaterial({ color: this.color });
    this.material.transparent = true;
    this.material.linewidth = this.lineWidth;
    this.line = new Line(geometry, this.material);
    this.scene?.add(this.line);
  }


  public updateLine(points: Vector3[]) {
    if (this.line) {
      const position = this.line.geometry.attributes['position'];

      if (points.length * 3 !== position.array.length) {
        // Resize the array if the number of points changes
        const vertices = new Float32Array(points.length * 3);
        points.forEach((point, index) => {
          vertices[index * 3] = point.x;
          vertices[index * 3 + 1] = point.y;
          vertices[index * 3 + 2] = point.z;
        });
        this.line.geometry.setAttribute('position', new BufferAttribute(vertices, 3));
      } else {
        // Update the existing array with new point values
        points.forEach((point, index) => {
          position.array[index * 3] = point.x;
          position.array[index * 3 + 1] = point.y;
          position.array[index * 3 + 2] = point.z;
        });
        position.needsUpdate = true; // Notify Three.js of the update
      }

      // Update the material properties if necessary
      this.calcOpacity();
      this.material.opacity = this.opacity;
    }
  }

  calcOpacity(): void {
    if (this.showLine) {
      if (this.opacity < this.maxOpacity) {
        this.opacity += this.opacityAnimationStep;
      } else {
        this.opacity = this.maxOpacity;
      }
    } else {
      if (this.opacity > 0) {
        this.opacity -= this.opacityAnimationStep;
      } else {
        this.opacity = 0;
      }
    }
  }

  override init(): void {
    throw new Error("Method not implemented.");
  }
  override render(): void {
    throw new Error("Method not implemented.");
  }
  override resize(): void {
    throw new Error("Method not implemented.");
  }

  //getters------------------
  getOpacity(): number {
    return this.opacity;
  }

  //setters------------------

  public setShowLine(state: boolean): void {
    this.showLine = state;
  }


}
import { BufferGeometry, Line, LineBasicMaterial, Vector3 } from "three";
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

  constructor(private threeMapEnvironmentData: ThreejsMapEnvironmentData, color: number, maxOpacity: number) {
    super(threeMapEnvironmentData);
    this.color = color;
    this.maxOpacity = maxOpacity;
    this.createLine([]);
  }

  private createLine(points: Vector3[]) {
    const geometry = new BufferGeometry().setFromPoints(points);
    this.material = new LineBasicMaterial({ color: this.color });
    this.material.transparent = true;
    this.line = new Line(geometry, this.material);
    this.scene?.add(this.line);
  }

  public updateLine(points: Vector3[]) {
    if (this.line) {
      const geometry = new BufferGeometry().setFromPoints(points);
      this.line.geometry.dispose();
      this.line.geometry = geometry;

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
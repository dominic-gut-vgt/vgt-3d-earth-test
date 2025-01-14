import { Vector2, Vector3 } from "three";

export interface ObjectWithPosMappedToScreen<T> {
  objectName: string,
  pos3D: Vector3,
  mappedPos: Vector2,
  data: T,
}
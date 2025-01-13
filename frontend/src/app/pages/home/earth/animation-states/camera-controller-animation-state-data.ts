import { Vector3 } from "three";
import { AnimationStateData } from "../../../../shared/interfaces/threejs/animation-state";

const ROTATION_START: number = -Math.PI / 4;
const ROTATION_END: number = Math.PI / 3;
const ROTATION_DIST: number = ROTATION_END - ROTATION_START;

export function getCameraControllerAnimationStateData(cameraControllsMaxDistance: number): AnimationStateData {
  return new AnimationStateData([
    {
      position: new Vector3(0, 0, cameraControllsMaxDistance),
      rotation: new Vector3(0, 0, ROTATION_START),
      percentage: 0,
    },
    {
      position: new Vector3(0, 0, cameraControllsMaxDistance / 1.5),
      rotation: new Vector3(0, 0, ROTATION_START + ROTATION_DIST * 0.4),
      percentage: 0.2
    },
    {
      position: new Vector3(0, 0, cameraControllsMaxDistance / 1.8),
      rotation: new Vector3(0, 0, ROTATION_START + ROTATION_DIST * 0.9),
      percentage: 0.7
    },
    {
      position: new Vector3(0, 0, 1),
      rotation: new Vector3(0, 0, ROTATION_END),
      percentage: 1
    }
  ],
    {
      delay: 0,
      speedFac: 1,
    });
}
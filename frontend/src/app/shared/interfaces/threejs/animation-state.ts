import { Vector3 } from "three"

export interface AnimationState {
  position: Vector3,
  rotation: Vector3,
  percentage: number | null, //percentage when this state is reached
}

export interface AnimationInfo {
  delay: number,
  speedFac: number,
}

export class AnimationStateData {
  states: AnimationState[] = [];
  animationInfo: AnimationInfo;
  private currentState: AnimationState = {
    position: new Vector3(),
    rotation: new Vector3(),
    percentage: null,
  }
  private previousState: AnimationState = {
    position: new Vector3(),
    rotation: new Vector3(),
    percentage: null,
  };

  constructor(states: AnimationState[], animationInfo: AnimationInfo) {
    this.states = states
    this.animationInfo = animationInfo;

    //init states
    this.setCurrentState({
      position: states[0].position,
      rotation: states[0].rotation,
      percentage: 0
    });
  }

  getCurrentStateUpdated(): boolean {
    return (
      !this.areVectorsEqual(this.currentState.position, this.previousState.position) ||
      !this.areVectorsEqual(this.currentState.rotation, this.previousState.rotation)
    );
  }

  private areVectorsEqual(v1: Vector3, v2: Vector3): boolean {
    return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z
  }

  setCurrentState(currentState: AnimationState): void {
    this.previousState.position.copy(this.currentState.position);
    this.previousState.rotation.copy(this.currentState.rotation);
    this.previousState.percentage = this.currentState.percentage;

    this.currentState = currentState;
  }

  //getters-------------------

  getCurrentState(): AnimationState {
    return this.currentState;
  }
}

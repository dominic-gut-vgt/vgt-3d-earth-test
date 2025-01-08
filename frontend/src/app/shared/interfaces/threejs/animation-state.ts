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
  currentState: AnimationState = {
    position: new Vector3(),
    rotation: new Vector3(),
    percentage: null,
  }
  constructor(states: AnimationState[], animationInfo: AnimationInfo) {
    this.states = states
    this.animationInfo = animationInfo;
    
    //init current state
    this.currentState.position.copy(states[0].position);
    this.currentState.rotation.copy(states[0].rotation);

  }
}

import { Vector3 } from "three"

export interface AnimationState {
  position: Vector3,
  rotation: Vector3,
}

export class AnimationStateData {
  startState: AnimationState = {
    position: new Vector3(),
    rotation: new Vector3(),
  }
  endState: AnimationState = {
    position: new Vector3(),
    rotation: new Vector3(),
  }
  currentState: AnimationState = {
    position: new Vector3(),
    rotation: new Vector3(),
  }
  constructor(startState: AnimationState, endState: AnimationState) {
    this.startState = startState;
    this.endState = endState;
    
    //init current state
    this.currentState.position.copy(startState.position);
    this.currentState.rotation.copy(startState.rotation);

  }
}

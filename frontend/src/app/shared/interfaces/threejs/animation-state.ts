import { Vector3 } from "three"

export interface AnimationState {
  position: Vector3,
  rotation: Vector3,
  percentage: number | null, //percentage when this state is reached
}

export class AnimationStateData {
  states: AnimationState[] = [];
  currentState: AnimationState = {
    position: new Vector3(),
    rotation: new Vector3(),
    percentage: null,
  }
  constructor(states: AnimationState[]) {
   this.states=states

    //init current state
    this.currentState.position.copy(states[0].position);
    this.currentState.rotation.copy(states[0].rotation);

  }
}

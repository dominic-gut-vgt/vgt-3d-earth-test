import { Vector3 } from "three"

export interface AnimationState {
    endState: {
        position: Vector3,
        rotation: Vector3,
    }
    currentState: {
        position: Vector3,
        rotation: Vector3,
    }
}

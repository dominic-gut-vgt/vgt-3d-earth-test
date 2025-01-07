import { Vector3 } from "three";
import { AnimationState } from "../../../../../../shared/interfaces/threejs/animation-state";

export const EARTH_ANIMATION_STATES: AnimationState[] = [
        {
            endState: {
                position: new Vector3(0, -1.4, 0),
                rotation: new Vector3(0, 0, 0),
            },
            currentState: {
                position: new Vector3(),
                rotation: new Vector3(),
            }
        },
        {
            endState: {
                position: new Vector3(0, -0.8, 0),
                rotation: new Vector3(0, 0, 0),
            },
            currentState: {
                position: new Vector3(),
                rotation: new Vector3(),
            }
        },
        {
            endState: {
                position: new Vector3(0, -0.4, 0),
                rotation: new Vector3(0, 0, 0),
            },
            currentState: {
                position: new Vector3(),
                rotation: new Vector3(),
            }
        },
        {
            endState: {
                position: new Vector3(0, 0, 0),
                rotation: new Vector3(0, 0, 0),
            },
            currentState: {
                position: new Vector3(),
                rotation: new Vector3(),
            }
        },
        {
            endState: {
                position: new Vector3(0, 0.5, 0),
                rotation: new Vector3(0, 0, 0),
            },
            currentState: {
                position: new Vector3(),
                rotation: new Vector3(),
            }
        },
    ];

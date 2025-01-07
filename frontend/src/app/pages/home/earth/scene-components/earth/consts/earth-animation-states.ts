import { Vector3 } from "three";
import { AnimationState, AnimationStateData } from "../../../../../../shared/interfaces/threejs/animation-state";

const EARTH_ROTATION: number = 1*Math.PI;

export const EARTH_ANIMATION_STATES: AnimationStateData[] = [
  new AnimationStateData({ //layer-1
    position: new Vector3(),
    rotation: new Vector3(),
  },
    {
      position: new Vector3(0, -1.4, 0),
      rotation: new Vector3(0, EARTH_ROTATION, 0),
    }),
  new AnimationStateData( //layer-2
    {
      position: new Vector3(),
      rotation: new Vector3(),
    },
    {
      position: new Vector3(0, -0.8, 0),
      rotation: new Vector3(0, EARTH_ROTATION, 0),
    }),
  new AnimationStateData({ //layer-3
    position: new Vector3(),
    rotation: new Vector3(),
  },
    {
      position: new Vector3(0, -0.4, 0),
      rotation:new Vector3(0, EARTH_ROTATION, 0),
    }),
  new AnimationStateData({ //layer-4
    position: new Vector3(),
    rotation: new Vector3(),
  },
    {
      position: new Vector3(0, 0, 0),
      rotation:new Vector3(0, EARTH_ROTATION, 0),
    }),
  new AnimationStateData({ //layer-1-top
    position: new Vector3(0, 0, 0),
    rotation: new Vector3(),
  }, {
    position: new Vector3(0, 0.5, 0),
    rotation: new Vector3(0, EARTH_ROTATION, 0),
  }),
];

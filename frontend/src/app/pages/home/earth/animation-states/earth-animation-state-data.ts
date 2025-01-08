import { Vector3 } from "three";
import { AnimationStateData } from "../../../../shared/interfaces/threejs/animation-state";

const EARTH_ROTATION: number = 1 * Math.PI;
const EARTH_ANIMATION_DELAY: number = 3000;
const SPEED_FAC:number=1;

export function getEarthAnimationStateData(): AnimationStateData[] {
  return [
    new AnimationStateData(//layer-1
      [
        { //state 1
          position: new Vector3(),
          rotation: new Vector3(),
          percentage: 0,
        },
        {//state 2
          position: new Vector3(0, -1.4, 0),
          rotation: new Vector3(0, EARTH_ROTATION, 0),
          percentage: 1,
        },
        //... more states possible. adjust percentage values for timing
      ],
      { //animation info
        delay: EARTH_ANIMATION_DELAY,
        speedFac: SPEED_FAC,
      }
    ),
    new AnimationStateData( //layer-2
      [
        {
          position: new Vector3(),
          rotation: new Vector3(),
          percentage: 0
        },
        {
          position: new Vector3(0, -0.8, 0),
          rotation: new Vector3(0, EARTH_ROTATION, 0),
          percentage: 1,
        }
      ],
      {
        delay: EARTH_ANIMATION_DELAY,
        speedFac: SPEED_FAC,
      }),
    new AnimationStateData([//layer-3
      {
        position: new Vector3(),
        rotation: new Vector3(),
        percentage: 0
      },
      {
        position: new Vector3(0, -0.4, 0),
        rotation: new Vector3(0, EARTH_ROTATION, 0),
        percentage: 1
      }
    ],
      {
        delay: EARTH_ANIMATION_DELAY,
        speedFac: SPEED_FAC,
      }),
    new AnimationStateData([//layer-4
      {
        position: new Vector3(),
        rotation: new Vector3(),
        percentage: 0
      },
      {
        position: new Vector3(0, 0, 0),
        rotation: new Vector3(0, EARTH_ROTATION, 0),
        percentage: 1
      }
    ],
      {
        delay: EARTH_ANIMATION_DELAY,
        speedFac: SPEED_FAC,
      }),
    new AnimationStateData([ //layer-1-top
      {
        position: new Vector3(0, 0, 0),
        rotation: new Vector3(),
        percentage: 0,
      }, {
        position: new Vector3(0, 0.5, 0),
        rotation: new Vector3(0, EARTH_ROTATION, 0),
        percentage: 1
      }
    ],
      {
        delay: EARTH_ANIMATION_DELAY,
        speedFac: SPEED_FAC,
      }),
  ];
}

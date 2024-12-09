import { DoubleSide, Mesh, MeshStandardMaterial, RawShaderMaterial, Scene, ShaderMaterial, SphereGeometry, TextureLoader, Vector2, Vector3, Vector4 } from "three";
import { ThreejsMapEnvironmentData } from "../../../../../shared/data/threejs/threejs-map-environment-data";
import { MapElement } from "../../base-classes/map-element";
import { SplineImporter } from "../../importers/spline-importer";
import { color, vec4 } from "three/webgpu";
import { GLTFLoader, UnrealBloomPass } from "three/examples/jsm/Addons.js";
import { GLTFAsSeparatedMeshesImporter } from "../../importers/gltf-as-separated-meshes-importer";
import { getTexturedFresnelMaterial } from "./shader-materials/fresnel-material";
import { RecombinedMesh } from "../../primitives/recombined-mesh";

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

export class Earth extends MapElement {

    private meshes: RecombinedMesh[] = [];

    animationStates: AnimationState[] = [
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
    totalAnimationFrameCount: number = 100;
    currentAnimationTimeFrameCount: number = 0;

    constructor(threeMapEnvData: ThreejsMapEnvironmentData) {
        super(threeMapEnvData);
        this.init(); //todo uncomment
    }

    deInit(): void { }

    override init(): void {

        this.meshes.push(
            new RecombinedMesh(
                this.threeMapEnvData,
                'earth/layer-1.glb',
                [
                    {
                        texture: 'textures/earth/earth-night.png',
                        fresnelPower: 0.4,
                        fresnelColor: new Vector4(0.0, 0.0, 1.0, 1.0),
                    },
                    {
                        texture: 'textures/earth/layer-1-inner.png',
                        fresnelPower: 0.5,
                        fresnelColor: new Vector4(1.0, 0.0, 0.0, 1.0),
                    }
                ],
                [],
                0
            ),
            new RecombinedMesh(
                this.threeMapEnvData,
                'earth/layer-2.glb',
                [
                    {
                        texture: 'textures/earth/layer-2.png',
                        fresnelPower: 0.4,
                        fresnelColor: new Vector4(1.0, 0.0, 0.0, 1.0),
                    }
                ],
                [],
                this.bloomLayer,
            ),
            new RecombinedMesh(
                this.threeMapEnvData,
                'earth/layer-3.glb',
                [
                    {
                        texture: 'textures/earth/layer-3.png',
                        fresnelPower: 0.4,
                        fresnelColor: new Vector4(1.0, 1.0, 0.0, 1.0),
                    }
                ],
                [],
                this.bloomLayer,
            ),
            new RecombinedMesh(
                this.threeMapEnvData,
                'earth/layer-4.glb',
                [],
                [
                    new MeshStandardMaterial({
                        color: 0xfff3b8,
                        emissive: 0xfff3b8,
                        emissiveIntensity: 1,
                    })
                ],
                this.bloomLayer,
            ),
            new RecombinedMesh(
                this.threeMapEnvData,
                'earth/layer-1-top.glb',
                [
                    {
                        texture: 'textures/earth/earth-night.png',
                        fresnelPower: 0.4,
                        fresnelColor: new Vector4(0.0, 0.0, 1.0, 1.0),
                    },
                    {
                        texture: 'textures/earth/layer-1-top-inner.png',
                        fresnelPower: 0.4,
                        fresnelColor: new Vector4(1.0, 0.0, 0.0, 1.0),
                    }
                ],
                [],
                0
            )
        );
    }

    /**
     * @param t number [0,1]
     * @returns eased number t
     */
    getEasedNumber(t: number): number {
        return t < 0.5 ? 4 * Math.pow(t, 3) : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    render(): void {
        const animationDonePercentage: number = this.currentAnimationTimeFrameCount / this.totalAnimationFrameCount;
        if (animationDonePercentage <= 1) {
            this.meshes.forEach((mesh, ind) => {
                this.animationStates[ind].currentState.position.copy(this.animationStates[ind].endState.position.clone().multiplyScalar(this.getEasedNumber(animationDonePercentage)))
                mesh.setPosition(this.animationStates[ind].currentState.position);
                console.log(this.animationStates[ind].endState.position);

            });
            this.currentAnimationTimeFrameCount++;
        }
    }


    onClick(): void {

    }

    resize(): void {
    }

}
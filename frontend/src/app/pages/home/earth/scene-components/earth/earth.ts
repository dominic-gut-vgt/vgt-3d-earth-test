import { MeshStandardMaterial, Vector4 } from "three";
import { ThreejsMapEnvironmentData } from "../../../../../shared/data/threejs/threejs-map-environment-data";
import { MapElement } from "../../base-classes/map-element";
import { EventEmitter } from "@angular/core";
import { LoadedMesh } from "../../primitives/loaded-mesh";
import { EARTH_ANIMATION_STATES } from "./consts/earth-animation-states";

export class Earth extends MapElement {
    readonly loadedEvent = new EventEmitter<number>(); //emits percentage of loaded meshes
    private loadedMeshesCount: number = 0;

    private meshes: LoadedMesh[] = [];

    private earthAnimationStates = EARTH_ANIMATION_STATES;

    constructor(threeMapEnvData: ThreejsMapEnvironmentData) {
        super(threeMapEnvData);
        this.init(); //todo uncomment
    }

    public render(): void {
        const animationPercentageDelayedAndSpeedUp: number = this.calculateAnimationPercentage(1000, 4);
        const animationPercentage: number = this.calculateAnimationPercentage();

        this.meshes.forEach((mesh, ind) => {
            //lerp between start and end position
            this.earthAnimationStates[ind].currentState.position.lerpVectors(this.earthAnimationStates[ind].startState.position, this.earthAnimationStates[ind].endState.position, this.getEasedNumber(animationPercentageDelayedAndSpeedUp));
            //lerp between start and end rotation
            this.earthAnimationStates[ind].currentState.rotation.lerpVectors(this.earthAnimationStates[ind].startState.rotation, this.earthAnimationStates[ind].endState.rotation, this.getEasedNumber(animationPercentage));

            mesh.setPosition(this.earthAnimationStates[ind].currentState.position);
            mesh.setRotation(this.earthAnimationStates[ind].currentState.rotation);
        });


    }

    public onClick(): void { }

    resize(): void { }

    //init-------------------------------
    public deInit(): void { }

    override init(): void {

        this.meshes.push(
            new LoadedMesh(
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
                0,
                this.loadedCallback.bind(this),
            ),
            new LoadedMesh(
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
                this.loadedCallback.bind(this),
            ),
            new LoadedMesh(
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
                this.loadedCallback.bind(this),
            ),
            new LoadedMesh(
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
                this.loadedCallback.bind(this),
            ),
            new LoadedMesh(
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
                0,
                this.loadedCallback.bind(this),
            )
        );
    }

    loadedCallback(): void {
        this.loadedMeshesCount++;
        this.loadedEvent.emit((this.loadedMeshesCount / this.meshes.length) * 100);
    }

}
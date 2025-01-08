import { MeshStandardMaterial, Vector4 } from "three";
import { ThreejsMapEnvironmentData } from "../../../../../shared/data/threejs/threejs-map-environment-data";
import { MapElement } from "../../base-classes/map-element";
import { EventEmitter } from "@angular/core";
import { LoadedMesh } from "../../primitives/loaded-mesh";
import { AnimationStateData } from "../../../../../shared/interfaces/threejs/animation-state";
import { getEarthAnimationStateData } from "../../animation-states/earth-animation-state-data";
import { Satellite } from "../satellite/satellite";

export class Earth extends MapElement {
    readonly loadedEvent = new EventEmitter<number>(); //emits percentage of loaded meshes
    private loadedMeshesCount: number = 0;
    private meshes: LoadedMesh[] = [];
    private satellites: Satellite[] = [];

    private earthAnimationStates: AnimationStateData[] = getEarthAnimationStateData();

    constructor(threeMapEnvData: ThreejsMapEnvironmentData) {
        super(threeMapEnvData);
        this.init();
    }

    public render(): void {
        //render earth itself
        this.meshes.forEach((mesh, i) => {
            this.animateBetweenAnimationStates(this.earthAnimationStates[i])
            mesh.setPosition(this.earthAnimationStates[i].currentState.position);
            mesh.setRotation(this.earthAnimationStates[i].currentState.rotation);
        });

        //render satellites
        this.satellites.forEach((satellite) => {
            satellite.render();
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

        for (let i = 0; i < 10; i++) {
            this.satellites.push(
                new Satellite(this.threeMapEnvData, this.meshes[0], this.loadedCallback.bind(this))
            );
        }
    }

    loadedCallback(): void {
        this.loadedMeshesCount++;
        this.loadedEvent.emit((this.loadedMeshesCount / (this.meshes.length + this.satellites.length)) * 100);
    }

}
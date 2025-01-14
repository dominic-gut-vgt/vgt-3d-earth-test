import { MeshStandardMaterial, Vector2, Vector3, Vector4 } from "three";
import { ThreejsMapEnvironmentData } from "../../../../../shared/data/threejs/threejs-map-environment-data";
import { MapElement } from "../../base-classes/map-element";
import { EventEmitter } from "@angular/core";
import { LoadedMesh } from "../../primitives/loaded-mesh";
import { AnimationState, AnimationStateData } from "../../../../../shared/interfaces/threejs/animation-state";
import { getEarthAnimationStateData } from "../../animation-states/earth-animation-state-data";
import { Satellite } from "../satellite/satellite";
import { ObjectWithPosMappedToScreen } from "../../../../../shared/interfaces/threejs/object-with-pos-mapped-to-screen";
import { MODULE_NAME } from "../../../../../shared/enums/threejs/module-name";

export class Earth extends MapElement {
    readonly loadedEvent = new EventEmitter<number>(); //emits percentage of loaded meshes
    readonly objectPosUpdated = new EventEmitter<ObjectWithPosMappedToScreen<null>[]>();

    //consts
    private readonly satelliteFlightHeight = 0.1;

    //meshes and objects
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
            mesh.setPosition(this.earthAnimationStates[i].getCurrentState().position);
            mesh.setRotation(this.earthAnimationStates[i].getCurrentState().rotation);

            if (this.earthAnimationStates[i].getCurrentStateUpdated()) {
                this.objectPosUpdated.emit(this.earthAnimationStates.map((state, i) => {

                    //map object positions to 2D screen space
                    const vector: Vector3 = state.getCurrentState().position.clone();

                    //add shift for correct module box info position visualisation
                    switch (this.meshes.at(i)?.getName()) {
                        case MODULE_NAME.CUSTOMER_PLATFORM:
                            vector.y -= 1;
                            break;
                        case MODULE_NAME.REALTIME_CONTROLLER:
                            vector.y -= 0.5;
                            break;
                        case MODULE_NAME.BILLING:
                            vector.y -= 0.2;
                            break;
                        case MODULE_NAME.GENIA:
                            vector.y += 1 + this.satelliteFlightHeight;
                            break;

                    }
                    vector.project(this.threeMapEnvData.camera);

                    // Convert the normalized device coordinates (NDC) to screen space
                    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
                    const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

                    return {
                        objectName: this.meshes.at(i)?.getName() ?? '',
                        pos3D: state.getCurrentState().position,
                        mappedPos: new Vector2(x, y),
                        data: null,
                    }
                }));
            }
        });

        //render satellites
        this.satellites.forEach((satellite) => {
            satellite.render();
            if (this.frameCount % 60 === 0) {
                satellite.setShowAndCalcNearNeighbours(this.currentAnimationFrame > 8000, this.satellites);
            }
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
                MODULE_NAME.CUSTOMER_PLATFORM,
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
                MODULE_NAME.REALTIME_CONTROLLER,
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
                MODULE_NAME.BILLING,
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
                MODULE_NAME.ERP,
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
                MODULE_NAME.GENIA,
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
            ),
        );

        for (let i = 0; i < 200; i++) {
            this.satellites.push(
                new Satellite(this.threeMapEnvData, i,this.satelliteFlightHeight, [this.meshes[0], this.meshes[this.meshes.length - 1]], this.loadedCallback.bind(this))
            );
        }
    }

    loadedCallback(): void {
        this.loadedMeshesCount++;
        this.loadedEvent.emit((this.loadedMeshesCount / (this.meshes.length + this.satellites.length)) * 100);
    }

}
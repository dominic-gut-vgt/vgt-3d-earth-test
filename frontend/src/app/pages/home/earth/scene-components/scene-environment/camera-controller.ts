import { MathUtils, PerspectiveCamera, Vector2, Vector3 } from "three";
import { MapElement } from "../../base-classes/map-element";
import { EventEmitter } from "@angular/core";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { ThreejsMapEnvironmentData } from "../../../../../shared/data/threejs/threejs-map-environment-data";


export class CameraController extends MapElement {

    cam!: PerspectiveCamera;
    controls!: OrbitControls;

    //init
    camPositionInited: boolean = false;
    camInitTime: number = 150;
    currentCamInitTime: number = 0;

    prevDistance: number = 0;
    distance: number = 0;

    //rotate to target
    targetReached: boolean = true;
    targetPhi: number = 0;
    targetTheta: number = 0;
    startPhi: number = 0;
    startTheta: number = 0;
    rotationDivisions: number = 50;
    rotationStepCount: number = 0;

    cameraDistanceUpdatedEvent: EventEmitter<number> = new EventEmitter<number>();

    constructor(threeMapEnvData: ThreejsMapEnvironmentData) {
        super(threeMapEnvData);
        this.init();

    }
    deInit(): void {
        this.controls.dispose();
    }
    override init(): void {
        this.cam = new PerspectiveCamera(
            5,
            this.width / this.height,
            0.1,
            this.cameraControllsMaxDistance * 2
        );
        this.camera = this.cam;

        if (this.renderer != null) {
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.maxDistance = this.cameraControllsMaxDistance;
            this.controls.minDistance = 6;
            this.controls.zoomSpeed = 2;
            this.controls.enablePan = false;
            this.controls.enableDamping = true;
        }
        this.camera.position.z = 25;
        this.scene?.add(this.cam);
    }

    override render(): void {
        this.controls.update();
    }

    override resize(): void {
    }
}
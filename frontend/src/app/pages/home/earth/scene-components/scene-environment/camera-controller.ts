import { PerspectiveCamera, Vector3 } from "three";
import { MapElement } from "../../base-classes/map-element";
import { EventEmitter } from "@angular/core";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { ThreejsMapEnvironmentData } from "../../../../../shared/data/threejs/threejs-map-environment-data";
import { AnimationState, AnimationStateData } from "../../../../../shared/interfaces/threejs/animation-state";
import { getCameraControllerAnimationStateData } from "../../animation-states/camera-controller-animation-state-data";

export class CameraController extends MapElement {

    private cam!: PerspectiveCamera;
    private controls!: OrbitControls;

    private animationStateData: AnimationStateData = getCameraControllerAnimationStateData(this.cameraControllsMaxDistance);

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
            // this.controls.minDistance = 40;
            this.controls.enableZoom = false;
            this.controls.enablePan = false;
            this.controls.enableDamping = true;
            this.controls.enabled = false;
            this.updateCamera();
        }
        this.scene?.add(this.cam);
    }


    override render(): void {
        this.animateBetweenAnimationStates(this.animationStateData);
        this.updateCamera();
    }

    private updateCamera(): void {
        this.camera?.position.copy(this.animationStateData.getCurrentState().position);
        this.camera?.rotation.set(this.animationStateData.getCurrentState().rotation.x, this.animationStateData.getCurrentState().rotation.y, this.animationStateData.getCurrentState().rotation.z);
        // this.controls.update();
    }

    override resize(): void {
    }
}
import { Euler, MathUtils, PerspectiveCamera, Vector2, Vector3 } from "three";
import { MapElement } from "../../base-classes/map-element";
import { EventEmitter } from "@angular/core";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { ThreejsMapEnvironmentData } from "../../../../../shared/data/threejs/threejs-map-environment-data";
import { AnimationState, AnimationStateData } from "../../../../../shared/interfaces/threejs/animation-state";


export class CameraController extends MapElement {

    private cam!: PerspectiveCamera;
    private controls!: OrbitControls;


    private animationState: AnimationStateData = new AnimationStateData(
        {
            position: new Vector3(0, 0, this.cameraControllsMaxDistance),
            rotation: new Vector3(0, 0, -Math.PI / 4),
        },
        {
            position: new Vector3(0, 0, this.cameraControllsMaxDistance / 10),
            rotation: new Vector3(0, 0, Math.PI / 3),
        });

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
            this.controls.minDistance = 6;
            this.controls.enableZoom = false;
            this.controls.enablePan = false;
            this.controls.enableDamping = true;
            this.controls.enabled = false;
            this.updateCamera();
        }
        this.scene?.add(this.cam);
    }


    override render(): void {
        const animationPercentage = this.calculateAnimationPercentage(0);

        this.animationState.currentState.position.lerpVectors(this.animationState.startState.position, this.animationState.endState.position, this.getEasedNumber(animationPercentage));
        this.animationState.currentState.rotation.lerpVectors(this.animationState.startState.rotation, this.animationState.endState.rotation, this.getEasedNumber(animationPercentage));
        this.updateCamera();
    }

    private updateCamera(): void {
        this.camera?.position.copy(this.animationState.currentState.position);
        this.camera?.rotation.set(this.animationState.currentState.rotation.x, this.animationState.currentState.rotation.y, this.animationState.currentState.rotation.z);
        // this.controls.update();
    }

    override resize(): void {
    }
}
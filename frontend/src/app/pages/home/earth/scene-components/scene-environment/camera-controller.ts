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
        if (this.camPositionInited) {
            this.controls.update();
            this.distance = this.controls.getDistance();
            this.controls.rotateSpeed = this.distance / this.cameraControllsMaxDistance;
            if (this.prevDistance != this.distance) {
                this.cameraDistanceUpdatedEvent.emit(this.distance);
            }
            this.prevDistance = this.distance;

            if (!this.targetReached) {
                this.rotateToPositionStepByStep();
            }
        } else {
            this.initCameraPosition();
        }

    }

    initCameraPosition(): void {
        if (this.camera) {
            let easedTime: number = this.getEasedInAndOutTime(this.currentCamInitTime / this.camInitTime);
            if (easedTime !== 1) {
                this.camera.position.x = (1 - easedTime) * -10;
                this.camera.position.y = (1 - easedTime) * 10;
                this.camera.position.z = 10 + easedTime * 15;
                this.controls.update();
                this.currentCamInitTime++;
            } else {
                this.camPositionInited = true
            }
        }

    }

    private rotateToPositionStepByStep(): void {
        if (this.camera != null) {
            let lerpTime = this.getEasedInAndOutTime(this.rotationStepCount / this.rotationDivisions);
            let currentTheta: number = MathUtils.lerp(this.startTheta, this.targetTheta, lerpTime);
            let currentPhi: number = MathUtils.lerp(this.startPhi, this.targetPhi, lerpTime);

            const radius = this.camera.position.length();

            this.camera.position.x = radius * Math.sin(currentTheta) * Math.cos(currentPhi);
            this.camera.position.y = radius * Math.cos(currentTheta);
            this.camera.position.z = radius * Math.sin(currentTheta) * Math.sin(currentPhi);

            this.controls.update();

            if (this.rotationStepCount == this.rotationDivisions) {
                this.rotationStepCount = 0;
                this.targetReached = true;
            }
            this.rotationStepCount++;
        }
    }

    startRotatingToPosition(targetPos: Vector3): void {
        if (this.camera != null) {

            const radius = targetPos.length(); // equivalent to Math.sqrt(x*x + y*y + z*z)

            this.targetTheta = Math.acos(targetPos.y / radius); // polar angle = up/down
            this.targetPhi = Math.atan2(targetPos.z, targetPos.x); // azimuthal angle= left/right
            this.startTheta = Math.acos(this.camera.position.y / this.camera.position.length());
            this.startPhi = Math.atan2(this.camera.position.z, this.camera.position.x);

            this.targetReached = false;
        }
    }

    override resize(): void {
    }

    getEasedInAndOutTime(t: number): number {
        return t < 0.5 ? 4 * Math.pow(t, 3) : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

}
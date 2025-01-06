import { EventEmitter } from "@angular/core";
import { Renderer, Scene, Camera, PerspectiveCamera, Clock, Vector2 } from "three";
import { Font } from "three/examples/jsm/Addons.js";
import { ThreejsMapEnvironmentData } from "../../../../shared/data/threejs/threejs-map-environment-data";
import { Colors } from "../../../../shared/interfaces/threejs/colors";
import { Materials } from "../../../../shared/interfaces/threejs/materials";

export abstract class MapElement {
    tmed!: ThreejsMapEnvironmentData;

    constructor(threeMapEnvData: ThreejsMapEnvironmentData) {
        this.tmed = threeMapEnvData;
    }

    abstract init(): void;
    abstract render(animationDonePercentage:number): void;
    abstract resize(): void;

    get threeMapEnvData(): ThreejsMapEnvironmentData {
        return this.tmed
    }

    get renderer(): Renderer | null {
        return this.threeMapEnvData.renderer;
    }

    get scene(): Scene | null {
        return this.threeMapEnvData.scene;
    }
    get camera(): Camera | null {
        return this.threeMapEnvData.camera;
    }
    get cameraControllsMaxDistance(): number {
        return this.threeMapEnvData.cameraControllsMaxDistance;
    }
    set camera(cam: PerspectiveCamera) {
        this.threeMapEnvData.camera = cam;
    }
    get clock(): Clock | null {
        return this.threeMapEnvData.clock;
    }

    get width(): number {
        return this.threeMapEnvData.width;
    }
    set width(width: number) {
        this.threeMapEnvData.width = width;
    }
    get height(): number {
        return this.threeMapEnvData.height;
    }
    set height(height: number) {
        this.threeMapEnvData.height = height;
    }
    get boundingClientRect(): DOMRect {
        return this.threeMapEnvData.boundingClientRect;
    }
    get prevMousePos(): Vector2 {
        return this.threeMapEnvData.prevMousePos;
    }
    get mousePos(): Vector2 {
        return this.threeMapEnvData.mousePos;
    }
    get mouseIsDown(): boolean {
        return this.threeMapEnvData.mouseIsDown;
    }
    get bloomLayer(): number {
        return this.threeMapEnvData.bloomLayer;
    }
    get colors(): Colors {
        return this.threeMapEnvData.colors;
    }
    get materials(): Materials {
        return this.threeMapEnvData.materials;
    }
}
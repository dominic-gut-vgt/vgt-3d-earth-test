import { EventEmitter } from "@angular/core";
import { WebGLRenderer, PerspectiveCamera, Scene, Clock, Vector2, MeshPhongMaterial, MeshBasicMaterial, LineBasicMaterial } from "three";
import { FontLoader, Font } from "three/examples/jsm/Addons.js";
import { CameraController } from "../../../pages/home/earth/scene-components/scene-environment/camera-controller";
import { Colors } from "../../interfaces/threejs/colors";
import { Materials } from "../../interfaces/threejs/materials";
import { Lighting } from "../../../pages/home/earth/scene-components/scene-environment/lighting";
import { Earth } from "../../../pages/home/earth/scene-components/earth/earth";


export class ThreejsMapEnvironmentData {

    fontStdLoadedEvent: EventEmitter<void> = new EventEmitter<void>();

    constructor() {
        this.preloadData();
    }

    preloadData(): void {
       
    }


    renderer!: WebGLRenderer;
    camera!: PerspectiveCamera;
    cameraControllsMaxDistance: number = 40;
    scene!: Scene;
    clock!: Clock;
    width: number = 0;// width of map (not screen)
    height: number = 0;// height of map (not screen)
    boundingClientRect!: DOMRect;
    prevMousePos: Vector2 = new Vector2();
    mousePos: Vector2 = new Vector2();
    mouseIsDown: boolean = false;

    //custom classes----------------------
    camController!: CameraController | null;
    lighting!: Lighting | null;
    earth!: Earth | null;

    //fonts-------------------------------
    fontStd!: Font;
    //materials---------------------------


    colors: Colors = {
        colorDark: 0x333333,
        colorBright: 0xffffff,
        colorAcent1Light: 0xfa7f9d,
        colorAccent1: 0xff1f55,
        colorAccent2: 0xfea25b,
    }

    materials: Materials = {
        darkMaterial: new MeshPhongMaterial({
            color: this.colors.colorDark,
            dithering: true,
        }),
        brightMaterial: new MeshBasicMaterial({
            color: this.colors.colorBright,
            dithering: true,
        }),
        accent1Material: new MeshPhongMaterial({
            color: this.colors.colorAccent1,
            dithering: true,
        }),
        accent2Material: new MeshPhongMaterial({
            color: this.colors.colorAccent2,
            dithering: true,
        }),
        //line materials-------

        darkLineMaterial: new LineBasicMaterial({
            color: 0x0000ff
        }),
    }
}
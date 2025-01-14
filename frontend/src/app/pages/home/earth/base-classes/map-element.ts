import { EventEmitter } from "@angular/core";
import { Renderer, Scene, Camera, PerspectiveCamera, Clock, Vector2, Vector3 } from "three";
import { Font } from "three/examples/jsm/Addons.js";
import { ThreejsMapEnvironmentData } from "../../../../shared/data/threejs/threejs-map-environment-data";
import { Colors } from "../../../../shared/interfaces/threejs/colors";
import { Materials } from "../../../../shared/interfaces/threejs/materials";
import { AnimationState, AnimationStateData } from "../../../../shared/interfaces/threejs/animation-state";

export abstract class MapElement {
    tmed!: ThreejsMapEnvironmentData;

    constructor(threeMapEnvData: ThreejsMapEnvironmentData) {
        this.tmed = threeMapEnvData;
    }

    abstract init(): void;
    abstract render(): void;
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

    //animation--------------------------------------
    get currentAnimationFrame(): number {
        return this.threeMapEnvData.currentAnimationFrame;
    }
    set currentAnimationFrame(currentAnimationFrame: number) {
        this.threeMapEnvData.currentAnimationFrame = currentAnimationFrame;
    }
    get animationFrameCount(): number {
        return this.threeMapEnvData.animationFrameCount;
    }
    set animationFrameCount(animationFrameCount: number) {
        this.threeMapEnvData.animationFrameCount = animationFrameCount;
    }
    get frameCount(): number {
        return this.threeMapEnvData.frameCount;
    }

    /**
     * @description animates between states of animationStateData and updates currentState of animationStateData
     * @param animationStateData state data
     */
    public animateBetweenAnimationStates(animationStateData: AnimationStateData): void {
        for (let i = animationStateData.states.length - 1; i >= 0; i--) {
            const state = animationStateData.states[i];
            let p = this.calculateAnimationPercentage(animationStateData.animationInfo.delay, animationStateData.animationInfo.speedFac, true);
            if (state.percentage !== null && p > state.percentage) {
                const startState: AnimationState = state;
                const endState: AnimationState = animationStateData.states[i + 1];
                if (startState.percentage !== null && endState.percentage !== null) {
                    p = this.mapNumber(p - startState.percentage, 0, endState.percentage - startState.percentage, 0, 1); // to easy every animation segment from 0 to 1
                    animationStateData.setCurrentState({
                        position: new Vector3().lerpVectors(startState.position, endState.position, p),
                        rotation: new Vector3().lerpVectors(startState.rotation, endState.rotation, p),
                        percentage: animationStateData.getCurrentState().percentage
                    });
                    break;
                }
            }
        }
    }

    /**
     * @description maps value from range [inMin,inMax] to range [outMin,outMax]
     */
    mapNumber(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }

    /**
     * @returns delayed, speeded up and eased ration between currentAnimationFrame and animationFrameCount [0,1];
     */
    private calculateAnimationPercentage(frameDelay: number = 0, speedFac: number = 1, ease: boolean): number {
        const p: number = Math.max(0, Math.min(((this.threeMapEnvData.currentAnimationFrame - frameDelay) / this.animationFrameCount) * speedFac, 1));
        if (ease) {
            return this.getEasedNumber(p);
        }
        return p
    }

    /**
   * @param t number [0,1]
   * @returns eased number t [0,1]
   */
    private getEasedNumber(t: number): number {
        return t < 0.5 ? 4 * Math.pow(t, 3) : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}
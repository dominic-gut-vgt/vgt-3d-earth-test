import { Vector4 } from "three";

export interface ShaderMaterialSettings {
    texture: string;
    fresnelPower: number,
    fresnelColor: Vector4;
}
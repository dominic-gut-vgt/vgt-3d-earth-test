import { LineBasicMaterial, Material, MeshBasicMaterial, MeshPhongMaterial } from "three";


export interface Materials {
    darkMaterial: MeshPhongMaterial,
    brightMaterial: MeshBasicMaterial,
    accent1Material: MeshPhongMaterial,
    accent2Material: MeshPhongMaterial,
    //line materials
    darkLineMaterial: LineBasicMaterial
}
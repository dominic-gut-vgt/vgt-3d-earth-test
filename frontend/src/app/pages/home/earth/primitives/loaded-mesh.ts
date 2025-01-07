import { Color, FrontSide, Material, Mesh, NormalBlending, Object3D, Vector3 } from "three";
import { ThreejsMapEnvironmentData } from "../../../../shared/data/threejs/threejs-map-environment-data";
import { ShaderMaterialSettings } from "../../../../shared/interfaces/threejs/shader-material-settings";
import { MapElement } from "../base-classes/map-element";
import { GLTFAsSeparatedMeshesImporter } from "../importers/gltf-as-separated-meshes-importer";
import FakeGlowMaterial, { getTexturedFresnelMaterial } from "../shader-materials/fresnel-material";

export class LoadedMesh extends MapElement {

    relativeModelPath: string;
    shaderMaterialSettings: ShaderMaterialSettings[];
    emptyObject!: Object3D;
    layer: number = 0;
    standardMaterials: Material[] = [];
    loadedCallback: Function = () => { };

    constructor(
        threeMapEnvData: ThreejsMapEnvironmentData,
        relativeModelPath: string,
        shaderMaterialSettings: ShaderMaterialSettings[],
        standardMaterials: Material[],
        layer: number,
        loadedCallback: Function = () => { }
    ) {
        super(threeMapEnvData);
        this.relativeModelPath = relativeModelPath;
        this.shaderMaterialSettings = shaderMaterialSettings;
        this.standardMaterials = standardMaterials;
        this.layer = layer;
        this.loadedCallback = loadedCallback;
        this.init();
    }


    override init(): void {

        this.emptyObject = new Object3D();

        const gltfImporter = new GLTFAsSeparatedMeshesImporter();

        gltfImporter.loadModel(this.relativeModelPath, (meshes: any) => {
            let loadedMaterials: number = 0;
            meshes.forEach((mesh: Mesh, index: number) => {
                const convertedMesh: Mesh = mesh.clone();
                if (this.shaderMaterialSettings.length) {
                    convertedMesh.material = getTexturedFresnelMaterial(
                        this.shaderMaterialSettings[index].texture,
                        this.shaderMaterialSettings[index].fresnelPower,
                        this.shaderMaterialSettings[index].fresnelColor,
                        () => {
                            loadedMaterials++;
                            if (loadedMaterials === meshes.length) {
                                this.loadedCallback();
                            }
                        }
                    )
                } else {
                    convertedMesh.material = this.standardMaterials[index];
                    this.loadedCallback();
                }

                convertedMesh.layers.enable(this.layer);
                this.emptyObject.add(convertedMesh);
            });
            this.scene?.add(this.emptyObject);
        });
    }

    setPosition(pos: Vector3): void {
        this.emptyObject.position.copy(pos)
    }
    setRotation(rotation: Vector3): void {
        this.emptyObject.rotation.set(rotation.x,rotation.y,rotation.z)
    }

    override render(): void {
    }
    override resize(): void {
    }
}
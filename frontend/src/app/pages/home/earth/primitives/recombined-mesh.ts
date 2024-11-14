import { Color, FrontSide, Mesh, NormalBlending, Object3D, Vector3 } from "three";
import { ThreejsMapEnvironmentData } from "../../../../shared/data/threejs/threejs-map-environment-data";
import { ShaderMaterialSettings } from "../../../../shared/interfaces/threejs/shader-material-settings";
import { MapElement } from "../base-classes/map-element";
import { GLTFAsSeparatedMeshesImporter } from "../importers/gltf-as-separated-meshes-importer";
import FakeGlowMaterial, { getTexturedFresnelMaterial } from "../scene-components/earth/shader-materials/fresnel-material";

export class RecombinedMesh extends MapElement {

    relativeModelPath: string;
    shaderMaterialSettings: ShaderMaterialSettings[];

    emptyObject!: Object3D;

    constructor(threeMapEnvData: ThreejsMapEnvironmentData, relativeModelPath: string, shaderMaterialSettings: ShaderMaterialSettings[]) {
        super(threeMapEnvData);
        this.relativeModelPath = relativeModelPath;
        this.shaderMaterialSettings = shaderMaterialSettings;
        this.init();
    }


    override init(): void {

        this.emptyObject = new Object3D();

        const gltfImporter = new GLTFAsSeparatedMeshesImporter();

        gltfImporter.loadModel(this.relativeModelPath, (meshes: any) => {
            meshes.forEach((mesh: Mesh, index: number) => {
                const convertedMesh: Mesh = mesh.clone();
                convertedMesh.material = getTexturedFresnelMaterial(
                    this.shaderMaterialSettings[index].texture,
                    this.shaderMaterialSettings[index].fresnelPower,
                    this.shaderMaterialSettings[index].fresnelColor
                )

                this.emptyObject.add(convertedMesh);

            });
            this.scene?.add(this.emptyObject);

        });
    }

    setPosition(pos: Vector3): void {
        this.emptyObject.position.copy(pos)
    }

    override render(): void {
    }
    override resize(): void {
    }
}
import { Color, FrontSide, Material, Mesh, NormalBlending, Object3D, Vector3 } from "three";
import { ThreejsMapEnvironmentData } from "../../../../shared/data/threejs/threejs-map-environment-data";
import { ShaderMaterialSettings } from "../../../../shared/interfaces/threejs/shader-material-settings";
import { MapElement } from "../base-classes/map-element";
import { GLTFAsSeparatedMeshesImporter } from "../importers/gltf-as-separated-meshes-importer";
import { getTexturedFresnelMaterial } from "../shader-materials/fresnel-material";

export class LoadedMesh extends MapElement {

    private relativeModelPath: string;
    private name: string = '';
    private shaderMaterialSettings: ShaderMaterialSettings[];
    private emptyObject!: Object3D;
    private layer: number = 0;
    private standardMaterials: Material[] = [];
    private loadedCallback: Function = () => { };

    constructor(
        threeMapEnvData: ThreejsMapEnvironmentData,
        relativeModelPath: string,
        name: string,
        shaderMaterialSettings: ShaderMaterialSettings[],
        standardMaterials: Material[],
        layer: number,
        loadedCallback: Function = () => { }
    ) {
        super(threeMapEnvData);
        this.relativeModelPath = relativeModelPath;
        this.name = name;
        this.shaderMaterialSettings = shaderMaterialSettings;
        this.standardMaterials = standardMaterials;
        this.layer = layer;
        this.loadedCallback = loadedCallback;
        this.init();
    }
    override render(): void {
    }
    override resize(): void {
    }

    public addPinnedMesh(objectToPin: Mesh): void {
        this.emptyObject.add(objectToPin)
    }

    public setPosition(pos: Vector3): void {
        this.emptyObject.position.copy(pos)
    }
    public setRotation(rotation: Vector3): void {
        this.emptyObject.rotation.set(rotation.x, rotation.y, rotation.z)
    }
    public setScale(scale: Vector3): void {
        this.emptyObject.scale.copy(scale);
    }
    public scaleUniform(scaleFac: number): void {
        this.emptyObject.scale.set(scaleFac, scaleFac, scaleFac);
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


    //getters
    public getPos(): Vector3 {
        return new Vector3().copy(this.emptyObject.position)
    }
    public getRotation(): Vector3 {
        return new Vector3().copy(this.emptyObject.rotation)
    }
    public getName(): string {
        return this.name;
    }
}
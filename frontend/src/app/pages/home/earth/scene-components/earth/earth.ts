import { DoubleSide, Mesh, RawShaderMaterial, Scene, ShaderMaterial, SphereGeometry, TextureLoader, Vector2, Vector3, Vector4 } from "three";
import { ThreejsMapEnvironmentData } from "../../../../../shared/data/threejs/threejs-map-environment-data";
import { MapElement } from "../../base-classes/map-element";
import { SplineImporter } from "../../importers/spline-importer";
import { vec4 } from "three/webgpu";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { GLTFAsSeparatedMeshesImporter } from "../../importers/gltf-as-separated-meshes-importer";
import { getTexturedFresnelMaterial } from "./shader-materials/fresnel-material";

export class Earth extends MapElement {
    private earthSphere!: Mesh;
    private splineImporter: SplineImporter;

    constructor(threeMapEnvData: ThreejsMapEnvironmentData) {
        super(threeMapEnvData);
        this.splineImporter = new SplineImporter(threeMapEnvData);
        setTimeout(() => {
            this.init();
        }, 500); //faster loading because routing completes

    }
    deInit(): void {

    }
    override init(): void {



        const geometry = new SphereGeometry(0.49, 64, 64);
        // const fresnelMaterial: ShaderMaterial = getTexturedFresnelMaterial('textures/test.png', 0.5, new Vector4(0.0, 0.0, 1.0, 1.0));
        // this.earthSphere = new Mesh(geometry, fresnelMaterial);
        //this.scene?.add(this.earthSphere);

         
        const materialSettings = [
            {
                texture: 'textures/earth-night.png',
                fresnelPower: 0.4,
                fresnelColor: new Vector4(0.0, 0.0, 1.0, 1.0),
            },
            {
                texture: 'textures/layer-1-inner.png',
                fresnelPower: 0.5,
                fresnelColor: new Vector4(1.0, 0.0, 0.0, 1.0),
            }
        ]
        

        const gltfImporter = new GLTFAsSeparatedMeshesImporter();


        gltfImporter.loadModel('earth/layer-1.glb', (meshes: any) => {
            meshes.forEach((mesh: Mesh, index: number) => {
                const convertedMesh: Mesh = mesh.clone();
                convertedMesh.material = getTexturedFresnelMaterial(
                    materialSettings[index].texture,
                    materialSettings[index].fresnelPower,
                    materialSettings[index].fresnelColor
                )
                //convertedMesh.material = getBasicShaderMaterial(texturesOfLayers[index],new Vector2(1.0, 1.0));

                this.scene?.add(convertedMesh);

            });
        });

    }

    render(): void {

    }


    onClick(): void {

    }

    resize(): void {
    }

}
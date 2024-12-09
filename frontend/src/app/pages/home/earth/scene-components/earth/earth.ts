import { DoubleSide, Mesh, RawShaderMaterial, Scene, ShaderMaterial, SphereGeometry, TextureLoader, Vector2, Vector3, Vector4 } from "three";
import { ThreejsMapEnvironmentData } from "../../../../../shared/data/threejs/threejs-map-environment-data";
import { MapElement } from "../../base-classes/map-element";
import { SplineImporter } from "../../importers/spline-importer";
import { vec4 } from "three/webgpu";
import { GLTFLoader, UnrealBloomPass } from "three/examples/jsm/Addons.js";
import { GLTFAsSeparatedMeshesImporter } from "../../importers/gltf-as-separated-meshes-importer";
import { getTexturedFresnelMaterial } from "./shader-materials/fresnel-material";
import { RecombinedMesh } from "../../primitives/recombined-mesh";

export class Earth extends MapElement {

    private meshes: RecombinedMesh[] = [];

    constructor(threeMapEnvData: ThreejsMapEnvironmentData) {
        super(threeMapEnvData);
        this.init(); //todo uncomment
    }

    deInit(): void {

    }
    override init(): void {

        this.meshes.push(
            new RecombinedMesh(
                this.threeMapEnvData,
                'earth/layer-1.glb',
                [
                    {
                        texture: 'textures/earth/earth-night.png',
                        fresnelPower: 0.4,
                        fresnelColor: new Vector4(0.0, 0.0, 1.0, 1.0),
                    },
                    {
                        texture: 'textures/earth/layer-1-inner.png',
                        fresnelPower: 0.5,
                        fresnelColor: new Vector4(1.0, 0.0, 0.0, 1.0),
                    }
                ],
                0
            ),
            new RecombinedMesh(
                this.threeMapEnvData,
                'earth/layer-2.glb',
                [
                    {
                        texture: 'textures/earth/layer-2.png',
                        fresnelPower: 0.4,
                        fresnelColor: new Vector4(1.0, 0.0, 0.0, 1.0),
                    }
                ],
                this.bloomLayer,
            ),
            new RecombinedMesh(
                this.threeMapEnvData,
                'earth/layer-3.glb',
                [
                    {
                        texture: 'textures/earth/layer-3.png',
                        fresnelPower: 0.4,
                        fresnelColor: new Vector4(1.0, 1.0, 0.0, 1.0),
                    }
                ],
                this.bloomLayer,
            ),
            new RecombinedMesh(
                this.threeMapEnvData,
                'earth/layer-1-top.glb',
                [
                    {
                        texture: 'textures/earth/earth-night.png',
                        fresnelPower: 0.4,
                        fresnelColor: new Vector4(0.0, 0.0, 1.0, 1.0),
                    },
                    {
                        texture: 'textures/earth/layer-1-top-inner.png',
                        fresnelPower: 0.4,
                        fresnelColor: new Vector4(1.0, 0.0, 0.0, 1.0),
                    }
                ],
                0
            )
        );
        this.meshes[0].setPosition(new Vector3(0, -1.5, 0));
        this.meshes[1].setPosition(new Vector3(0, -1, 0));
        this.meshes[1].setPosition(new Vector3(0, -0.5, 0));

    }

    render(): void {

    }


    onClick(): void {

    }

    resize(): void {
    }

}
import { DoubleSide, Mesh, RawShaderMaterial, Scene, ShaderMaterial, SphereGeometry, TextureLoader, Vector3, Vector4 } from "three";
import { ThreejsMapEnvironmentData } from "../../../../../shared/data/threejs/threejs-map-environment-data";
import { MapElement } from "../../base-classes/map-element";
import { SplineImporter } from "../../importers/spline-importer";
import { vec4 } from "three/webgpu";

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

        const textureLoader = new TextureLoader();
        let texture = textureLoader.load('textures/test.png');

        const fresnelMaterial = new ShaderMaterial({
            uniforms: {
                uTexture: { value: texture },
                uFresnelPower: { value: 0.5 },
                uFresnelColor: { value: new Vector4(0.0, 0.0, 1.0, 1.0) }
            },
            vertexShader: `
                varying vec3 vPositionW;
                varying vec3 vNormalW;
                varying vec2 vUv;

                void main() {
                    vUv=uv;
                    vPositionW = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);
                    vNormalW = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                uniform sampler2D uTexture;
                uniform float uFresnelPower;
                uniform vec4 uFresnelColor;
                
                varying vec3 vPositionW;
                varying vec3 vNormalW;
                varying vec2 vUv;
                
                void main() {
                    // Fresnel effect (view direction and normal angle)
                    float fresnelTerm = ( uFresnelPower - -min(dot(vPositionW, normalize(vNormalW) ), 0.0) );    
                    
                    // Sample the texture using the old function for WebGL1
                    vec4 texColor = texture2D(uTexture, vUv);  // Use texture2D here for WebGL1
                    
                    // Mix the texture color with the Fresnel effect based on the fresnelTerm
                    vec4 finalColor = mix(texColor, uFresnelColor, fresnelTerm);
                    
                    gl_FragColor = finalColor;
                }
            `,
        });

        const fresnelMaterial2 = new ShaderMaterial({
            vertexShader: ` 
            varying vec3 vPositionW;
            varying vec3 vNormalW;
            void main() {
                vPositionW = normalize(vec3(modelViewMatrix * vec4(position, 1.0)).xyz);
                vNormalW = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
            `,
            fragmentShader: `
            varying vec3 vPositionW;
            varying vec3 vNormalW;
            void main() {   
                float fresnelTerm = ( 1.0 - -min(dot(vPositionW, normalize(vNormalW) ), 0.0) );    
                gl_FragColor = vec4(1.0,0.0,0.0,1.0) * vec4(fresnelTerm);
            }
            `,
        });

        const geometry = new SphereGeometry(0.49, 64, 64);
        this.earthSphere = new Mesh(geometry, fresnelMaterial);
        this.scene?.add(this.earthSphere);


    }

    render(): void {

    }


    onClick(): void {

    }

    resize(): void {
    }

}
import { NormalBlending, ShaderMaterial, TextureLoader, Vector2, Vector4 } from "three"

export function getTexturedFresnelMaterial(texturePath: string, fresnelPower: number, fresnelColor: Vector4,textureLoadedCallback:Function): ShaderMaterial {

    const textureLoader = new TextureLoader();
    let texture = textureLoader.load(texturePath,()=>{textureLoadedCallback()});

    return new ShaderMaterial({
        uniforms: {
            uTexture: { value: texture },
            uFresnelPower: { value: fresnelPower },
            uFresnelColor: { value: fresnelColor }
        },
        vertexShader: `
            varying vec3 vPositionW;
            varying vec3 vNormalW;
            varying vec2 vUv;

            void main() {
                vUv=vec2(uv.x, 1.0 - uv.y);
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
                            vec3 viewDir = normalize(-vPositionW);
            float fresnelTerm = pow(1.0 - max(dot(viewDir, vNormalW), 0.0), 1.0/uFresnelPower);
                
                // Sample the texture using the old function for WebGL1
                vec4 texColor = texture2D(uTexture, vUv);  // Use texture2D here for WebGL1
                
                // Mix the texture color with the Fresnel effect based on the fresnelTerm
                vec4 finalColor = mix(texColor, uFresnelColor, fresnelTerm);
                
                gl_FragColor = finalColor;
            }
        `,
    });

}


export function getBasicTexturedShaderMaterial(texturePath: string, flip: Vector2,textureLoadedCallback:Function): ShaderMaterial {
    const textureLoader = new TextureLoader();
    const texture = textureLoader.load(texturePath,()=>{textureLoadedCallback()});

    return new ShaderMaterial({
        uniforms: {
            uTexture: { value: texture },
            uFlip: { value: flip }, // Default: no flip
        },
        vertexShader: `
            uniform vec2 uFlip;
            varying vec2 vUv;
            void main() {
                vUv = vec2(uv.x, 1.0 - uv.y);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D uTexture;
            varying vec2 vUv;
            void main() {
                gl_FragColor = texture2D(uTexture, vUv);
            }
        `,
    });
}










/**
 * FakeGlow material by Anderson Mancini - Fec 2024.
 */
import { Uniform, Color, AdditiveBlending, FrontSide, BackSide, DoubleSide } from 'three';

class FakeGlowMaterial extends ShaderMaterial {

    /**
     * Create a FakeGlowMaterial.
     *
     * @param {Object} parameters - The parameters to configure the material.
     * @param {number} [parameters.falloff=0.1] - The falloff factor for the glow effect.
     * @param {number} [parameters.glowInternalRadius=6.0] - The internal radius for the glow effect.
     * @param {Color} [parameters.glowColor=new Color('#00d5ff')] - The color of the glow effect.
     * @param {number} [parameters.glowSharpness=0.5] - The sharpness of the glow effect.
     * @param {number} [parameters.opacity=1.0] - The opacity of the hologram.
     * @param {number} [parameters.side=THREE.FrontSide] - The rendering side. Use `THREE.FrontSide`, `THREE.BackSide`, or `THREE.DoubleSide`.
     * @param {boolean} [parameters.depthTest=false] - Enable or disable depth testing.
     */

    constructor(parameters = {
        falloff: 0.2,
        glowInternalRadius: 6.0,
        glowColor: new Color("#ff0000"),
        glowSharpness: 0.7,
        opacity: 2.3,
        side: FrontSide,
        depthTest: true,
        blendMode: NormalBlending,
    }) {
        super();

        this.vertexShader = /*GLSL */
            `
      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewMatrix * modelPosition;
        vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
        vPosition = modelPosition.xyz;
        vNormal = modelNormal.xyz;

      }
    `

        this.fragmentShader = /*GLSL */
            `
      uniform vec3 glowColor;
      uniform float falloff;
      uniform float glowSharpness;
      uniform float glowInternalRadius;
      uniform float opacity;

      varying vec3 vPosition;
      varying vec3 vNormal;

      void main()
      {
        // Normal
        vec3 normal = normalize(vNormal);
        if(!gl_FrontFacing)
            normal *= - 1.0;
        vec3 viewDirection = normalize(cameraPosition - vPosition);
        float fresnel = dot(viewDirection, normal);
        fresnel = pow(fresnel, glowInternalRadius + 0.1);
        float falloff = smoothstep(0., falloff, fresnel);
        float fakeGlow = fresnel;
        fakeGlow += fresnel * glowSharpness;
        fakeGlow *= falloff;
        gl_FragColor = vec4(clamp(glowColor * fresnel, 0., 1.0), clamp(fakeGlow, 0., opacity));

        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      } 
      `

        // Set default values or modify existing properties if needed
        this.uniforms = {

            /**
             * The opacity for the glow effect.
             * @type {Uniform<number>}
             * @default 1.0
             */
            opacity: new Uniform(parameters.opacity !== undefined ? parameters.opacity : 1.0),

            /**
             * The strength of the glowInternalRadius.
             * @type {Uniform<number>}
             * @default 6.0
             */
            glowInternalRadius: new Uniform(parameters.glowInternalRadius !== undefined ? parameters.glowInternalRadius : 6.0),

            /**
             * The glowSharpness.
             * @type {Uniform<number>}
             * @default 0.5
             */
            glowSharpness: new Uniform(parameters.glowSharpness !== undefined ? parameters.glowSharpness : 0.5),

            /**
             * The falloff.
             * @type {Uniform<number>}
             * @default 0.1
             */
            falloff: new Uniform(parameters.falloff !== undefined ? parameters.falloff : 0.1),

            /**
             * The color of the glow.
             * @type {Uniform<Color>}
             * @default new Color(#00d5ff)
             */
            glowColor: new Uniform(parameters.glowColor !== undefined ? new Color(parameters.glowColor) : new Color("#00d5ff")),

        };

        //this.setValues(parameters);
        this.depthTest = parameters.depthTest !== undefined ? parameters.depthTest : false;
        this.blending = parameters.blendMode !== undefined ? parameters.blendMode : AdditiveBlending;
        this.transparent = true;
        this.side = parameters.side !== undefined ? parameters.side : DoubleSide;
    }

}

export default FakeGlowMaterial;
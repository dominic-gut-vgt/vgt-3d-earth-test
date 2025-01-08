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
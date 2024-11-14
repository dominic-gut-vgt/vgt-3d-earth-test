import { Component, ElementRef, OnInit, AfterViewInit, HostListener } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [],
  templateUrl: './test.component.html',
  styleUrl: './test.component.less'
})
export class TestComponent {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private bloomComposer!: EffectComposer;
  private finalComposer!: EffectComposer;
  private bloomPass!: UnrealBloomPass;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
  private materials: Record<string, THREE.Material> = {};
  private params = {
    threshold: 0,
    strength: 1,
    radius: 0.5,
    exposure: 1
  };
  private readonly BLOOM_SCENE = 1;
  private bloomLayer = new THREE.Layers();

  constructor(private elRef: ElementRef) {
    this.bloomLayer.set(this.BLOOM_SCENE);
  }

  ngAfterViewInit(): void {
    this.initThree();
    this.setupScene();
    this.addGUIControls();
    this.render();
  }

  private initThree() {
    const container = this.elRef.nativeElement.querySelector('#container');

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 200);
    this.camera.position.set(0, 0, 20);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.maxPolarAngle = Math.PI * 0.5;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 100;
    this.controls.addEventListener('change', this.render.bind(this));

    const renderScene = new RenderPass(this.scene, this.camera);

    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    this.bloomComposer = new EffectComposer(this.renderer);
    this.bloomComposer.renderToScreen = false;
    this.bloomComposer.addPass(renderScene);
    this.bloomComposer.addPass(this.bloomPass);

    const mixPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
        },
        vertexShader: ` 
        varying vec2 vUv;
			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}
        `,
        fragmentShader: `
        uniform sampler2D baseTexture;
			uniform sampler2D bloomTexture;
			varying vec2 vUv;
			void main() {
				gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
			}
        `,
        defines: {}
      }),
      'baseTexture'
    );
    mixPass.needsSwap = true;

    const outputPass = new OutputPass();
    this.finalComposer = new EffectComposer(this.renderer);
    this.finalComposer.addPass(renderScene);
    this.finalComposer.addPass(mixPass);
    this.finalComposer.addPass(outputPass);
  }

  private setupScene() {
    const geometry = new THREE.IcosahedronGeometry(1, 15);

    for (let i = 0; i < 50; i++) {
      const color = new THREE.Color();
      color.setHSL(Math.random(), 0.7, Math.random() * 0.2 + 0.05);

      const material = new THREE.MeshBasicMaterial({ color });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(
        (Math.random() * 10 - 5) * Math.random(),
        (Math.random() * 10 - 5) * Math.random(),
        (Math.random() * 10 - 5) * Math.random()
      );
      sphere.position.normalize().multiplyScalar(Math.random() * 4.0 + 2.0);
      sphere.scale.setScalar(Math.random() * Math.random() + 0.5);
      this.scene.add(sphere);

      if (Math.random() < 0.25) sphere.layers.enable(this.BLOOM_SCENE);
    }
  }

  private addGUIControls() {
    const gui = new GUI();
    const bloomFolder = gui.addFolder('bloom');
    bloomFolder.add(this.params, 'threshold', 0.0, 1.0).onChange(value => {
      this.bloomPass.threshold = Number(value);
      this.render();
    });
    bloomFolder.add(this.params, 'strength', 0.0, 3).onChange(value => {
      this.bloomPass.strength = Number(value);
      this.render();
    });
    bloomFolder.add(this.params, 'radius', 0.0, 1.0).step(0.01).onChange(value => {
      this.bloomPass.radius = Number(value);
      this.render();
    });
  }

  private render() {
    this.scene.traverse(this.darkenNonBloomed.bind(this));
    this.bloomComposer.render();
    this.scene.traverse(this.restoreMaterial.bind(this));
    this.finalComposer.render();
  }

  private darkenNonBloomed(obj: THREE.Object3D) {

    if (this.bloomLayer.test(obj.layers) === false) {
      this.materials[obj.uuid] = (obj as THREE.Mesh).material as THREE.Material;
      (obj as THREE.Mesh).material = this.darkMaterial;
    }
  }

  private restoreMaterial(obj: THREE.Object3D) {
    if (this.materials[obj.uuid]) {
      (obj as THREE.Mesh).material = this.materials[obj.uuid];
      delete this.materials[obj.uuid];
    }
  }


  @HostListener('window:pointerdown', ['$event'])
  onPointerDown(event: any) {

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, false);
    if (intersects.length > 0) {

      const object = intersects[0].object;
      object.layers.toggle(this.BLOOM_SCENE);
      this.render();
    }
  }



  @HostListener('window:resize', ['$event'])
  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.bloomComposer.setSize(window.innerWidth, window.innerHeight);
    this.finalComposer.setSize(window.innerWidth, window.innerHeight);
    this.render();
  }
}

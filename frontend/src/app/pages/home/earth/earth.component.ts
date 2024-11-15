import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Clock, EquirectangularReflectionMapping, Mesh, MeshBasicMaterial, Scene, ShaderMaterial, SphereGeometry, SRGBColorSpace, Vector2, WebGLRenderer } from 'three';
import { ThreejsMapEnvironmentData } from '../../../shared/data/threejs/threejs-map-environment-data';
import { CameraController } from './scene-components/scene-environment/camera-controller';
import { TouchEventHelper } from '../../../shared/classes/touch-event-helper';
import { Lighting } from './scene-components/scene-environment/lighting';
import { Earth } from './scene-components/earth/earth';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RGBELoader, ShaderPass, UnrealBloomPass } from 'three/examples/jsm/Addons.js';

@Component({
  selector: 'app-earth',
  standalone: true,
  imports: [],
  templateUrl: './earth.component.html',
  styleUrl: './earth.component.less'
})
export class EarthComponent extends TouchEventHelper implements OnInit, OnDestroy {
  @ViewChild("canvas") canvasElem!: ElementRef;
  @ViewChild("splineCanvas") splineCanvasElem!: ElementRef;

  private runLoop: boolean = true;
  private isLoopRunning: boolean = false;
  loadedPercentageEarth: number = 0;
  markersSet: boolean = false;

  threeMapEnvData: ThreejsMapEnvironmentData;

  bloomComposer!: EffectComposer;
  finalComposer!: EffectComposer;

  constructor() {
    super();
    this.threeMapEnvData = new ThreejsMapEnvironmentData();
  }

  ngOnInit() {
  }
  ngOnDestroy(): void {
    this.deInitScene();
  }

  ngAfterViewInit(): void {
    this.initScene();
  }

  //ThreeJS-------------------------------------------------------------------
  loop() {
    if (!this.isLoopRunning) {
      this.isLoopRunning = true;

      this.threeMapEnvData.camController?.render();
      this.bloomComposer?.render();
      //console.log(this.composer);

      this.threeMapEnvData.renderer.render(this.threeMapEnvData.scene, this.threeMapEnvData.camera);
      window.requestAnimationFrame(() => {
        this.isLoopRunning = false;
        if (this.runLoop) {
          this.loop();
        }
      });
    }
  }
  deInitScene(): void {
    this.runLoop = false;
    while (this.threeMapEnvData.scene.children.length > 0) {
      const child = this.threeMapEnvData.scene.children[0];
      this.threeMapEnvData.scene.remove(child);
    }
    this.threeMapEnvData.renderer.dispose();
    this.threeMapEnvData.renderer.forceContextLoss();
    this.threeMapEnvData.camController?.deInit();
    this.threeMapEnvData.lighting?.deInit();
    this.threeMapEnvData.earth?.deInit();
  }


  initScene(): void {
    if (!this.canvasElem) {
      return;
    }

    if (this.threeMapEnvData.renderer == null) {

      //init renderer-------------------------
      this.threeMapEnvData.canvas = this.splineCanvasElem.nativeElement;
      this.threeMapEnvData.renderer = new WebGLRenderer({
        antialias: true,
        canvas: this.canvasElem.nativeElement,
      });

      this.threeMapEnvData.renderer.setClearColor(0x000000, 0);
      this.threeMapEnvData.renderer.setSize(this.threeMapEnvData.width, this.threeMapEnvData.height);
      this.threeMapEnvData.renderer.setPixelRatio(2);
      this.threeMapEnvData.renderer.autoClear = false;
      this.threeMapEnvData.renderer.outputColorSpace = SRGBColorSpace;

      this.threeMapEnvData.scene = new Scene();
      this.threeMapEnvData.clock = new Clock();

      /*
            new RGBELoader().load('textures/hdr/environment.hdr', (map) => {
              map.mapping = EquirectangularReflectionMapping;
              this.threeMapEnvData.scene.background = map;
            })
            */

      const geometry = new SphereGeometry(0.5, 32, 16);
      const material = new MeshBasicMaterial({ color: 0xffff00 });
      const sphere = new Mesh(geometry, material);
      this.threeMapEnvData.scene.add(sphere);

      //class inits----------------------------
      this.threeMapEnvData.camController = new CameraController(this.threeMapEnvData);
      this.threeMapEnvData.lighting = new Lighting(this.threeMapEnvData);
      this.threeMapEnvData.earth = new Earth(this.threeMapEnvData);

      //events---------------------------------
      this.subscribeToClassEvents();
      this.subscribeToTouchEvents();
      this.setMapSize(new Vector2(window.innerWidth, window.innerHeight));

      //post processing-----------------------
      //bloom renderer
      const renderScene = new RenderPass(this.threeMapEnvData.scene, this.threeMapEnvData.camera);
      const bloomPass = new UnrealBloomPass(
        new Vector2(window.innerWidth, window.innerHeight),
        0, 0, 0
      );
      bloomPass.threshold = 0.8;
      bloomPass.strength = 0.4;
      bloomPass.radius = 0.05;
      this.bloomComposer = new EffectComposer(this.threeMapEnvData.renderer);
      this.bloomComposer.setSize(window.innerWidth, window.innerHeight);

      this.bloomComposer.addPass(renderScene);
      this.bloomComposer.addPass(bloomPass);
      this.bloomComposer.renderToScreen = false;


      const mixPass = new ShaderPass(
        new ShaderMaterial({
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
        }), 'baseTexture'
      );
      mixPass.needsSwap = true;

      const outputPass = new OutputPass();

      this.finalComposer = new EffectComposer(this.threeMapEnvData.renderer);
      this.finalComposer.addPass(renderScene);
      this.finalComposer.addPass(mixPass);
      this.finalComposer.addPass(outputPass);


    }

    //start loop-----------------------------
    this.updateAfterResize();
    this.loop();
  }

  subscribeToClassEvents(): void { }

  subscribeToTouchEvents(): void {
    this.touchStartEvent.subscribe((point: Vector2) => {
      this.threeMapEnvData.prevMousePos = this.threeMapEnvData.mousePos;
      this.threeMapEnvData.mousePos = point;
      this.threeMapEnvData.mouseIsDown = true;
    });
    this.touchDragEvent.subscribe((point: Vector2) => {
      this.threeMapEnvData.prevMousePos = this.threeMapEnvData.mousePos;
      this.threeMapEnvData.mousePos = point;
    });
    this.touchEndEvent.subscribe((point: Vector2) => {
      this.threeMapEnvData.prevMousePos = this.threeMapEnvData.mousePos;
      this.threeMapEnvData.mousePos = point;
      this.threeMapEnvData.mouseIsDown = false;
    });
    this.touchClickEvent.subscribe(() => {
      this.onClick();
    });
  }


  onClick(): void {
    this.threeMapEnvData.boundingClientRect = this.canvasElem.nativeElement.getBoundingClientRect();
  }


  //resize-----------------------------------
  setMapSize(mapSize: Vector2): void {
    this.threeMapEnvData.width = mapSize.x;
    this.threeMapEnvData.height = mapSize.y;
    this.updateAfterResize();
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.threeMapEnvData.width = document.body.clientWidth;
    this.threeMapEnvData.height = window.innerHeight;
    this.updateAfterResize();
  }
  updateAfterResize(): void {
    this.threeMapEnvData.boundingClientRect = this.canvasElem.nativeElement.getBoundingClientRect();

    this.threeMapEnvData.camController?.resize();

    if (this.threeMapEnvData.camera != undefined) {
      this.threeMapEnvData.camera.aspect = this.threeMapEnvData.width / this.threeMapEnvData.height;
      this.threeMapEnvData.camera.updateProjectionMatrix();
    }

    if (this.threeMapEnvData.renderer != undefined) {
      this.threeMapEnvData.renderer.setSize(this.threeMapEnvData.width, this.threeMapEnvData.height);
      this.threeMapEnvData.renderer.render(this.threeMapEnvData.scene, this.threeMapEnvData.camera);
    }
  }
}

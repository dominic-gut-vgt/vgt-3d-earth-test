import { Component, computed, ElementRef, HostListener, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Clock, Scene, Vector2, WebGLRenderer } from 'three';
import { ThreejsMapEnvironmentData } from '../../../shared/data/threejs/threejs-map-environment-data';
import { CameraController } from './scene-components/scene-environment/camera-controller';
import { TouchEventHelper } from '../../../shared/classes/touch-event-helper';
import { Lighting } from './scene-components/scene-environment/lighting';
import { Earth } from './scene-components/earth/earth';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { FXAAShader, ShaderPass, UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { Subscription } from 'rxjs';
import { SCENE_ENVIRONMENT_ELEMENT_TYPE } from '../../../shared/enums/threejs/scene-environment-element-type';
import { CommonModule } from '@angular/common';

type Dictionary<T> = {
  [key in SCENE_ENVIRONMENT_ELEMENT_TYPE]: T
}

@Component({
  selector: 'app-earth',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './earth.component.html',
  styleUrl: './earth.component.less'
})
export class EarthComponent extends TouchEventHelper implements OnInit, OnDestroy {

  //Viewchildren
  @ViewChild('canvas') private canvasElem!: ElementRef;

  //data
  private loadedPercentages: Dictionary<number> = {
    [SCENE_ENVIRONMENT_ELEMENT_TYPE.EARTH]: 0,
  };

  protected totalLoadedPercentage = signal<number>(0);
  protected threeMapEnvData: ThreejsMapEnvironmentData = new ThreejsMapEnvironmentData({ animationFrameCount: 20000 });
  private subscriptions: Subscription[] = [];
  protected logoOverlayScale = signal<number>(1);
  protected logoOverlayOpacity = signal<number>(1);

  //flags
  private runLoop: boolean = true;
  private isLoopRunning: boolean = false;
  protected allSceneComponentsLoaded = computed<boolean>(() => {
    return Math.round(this.totalLoadedPercentage()) === 100;
  });


  constructor() {
    super();
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

      //handling of layers----------------------------------
      this.threeMapEnvData.camController?.render();
      this.threeMapEnvData.renderer.clear();

      this.threeMapEnvData.camera.layers.set(this.threeMapEnvData.bloomLayer);
      this.threeMapEnvData.finalComposer.render();

      this.threeMapEnvData.renderer.clearDepth();
      this.threeMapEnvData.camera.layers.set(0);
      this.threeMapEnvData.renderer.render(this.threeMapEnvData.scene, this.threeMapEnvData.camera);

      //render scene components-----------------------------
      if (this.allSceneComponentsLoaded()) {
        this.threeMapEnvData.earth?.render();
      }

      this.threeMapEnvData.frameCount++;

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

    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }


  initScene(): void {
    if (!this.canvasElem) {
      return;
    }

    if (this.threeMapEnvData.renderer == null) {

      //init renderer-------------------------
      this.threeMapEnvData.canvas = this.canvasElem.nativeElement;
      this.threeMapEnvData.renderer = new WebGLRenderer({
        antialias: true,
        canvas: this.canvasElem.nativeElement,
      });

      this.threeMapEnvData.renderer.setClearColor(0x000000, 0);
      this.threeMapEnvData.renderer.setSize(this.threeMapEnvData.width, this.threeMapEnvData.height);
      this.threeMapEnvData.renderer.setPixelRatio(2);
      // this.threeMapEnvData.renderer.toneMapping = ReinhardToneMapping;

      this.threeMapEnvData.renderer.autoClear = false;

      this.threeMapEnvData.scene = new Scene();
      this.threeMapEnvData.clock = new Clock();

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
      const renderScene = new RenderPass(this.threeMapEnvData.scene, this.threeMapEnvData.camera)

      const effectFXAA = new ShaderPass(FXAAShader)
      effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight)

      const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
      //bloomSettings
      bloomPass.threshold = 0.21
      bloomPass.strength = 1.2
      bloomPass.radius = 0.55
      bloomPass.renderToScreen = true

      this.threeMapEnvData.finalComposer = new EffectComposer(this.threeMapEnvData.renderer)
      this.threeMapEnvData.finalComposer.setSize(window.innerWidth, window.innerHeight)

      this.threeMapEnvData.finalComposer.addPass(renderScene)
      this.threeMapEnvData.finalComposer.addPass(effectFXAA)
      this.threeMapEnvData.finalComposer.addPass(bloomPass)

      //this.threeMapEnvData.renderer.gammaInput = true
      //this.threeMapEnvData.renderer.gammaOutput = true
      this.threeMapEnvData.renderer.toneMappingExposure = Math.pow(0.9, 4.0)

      //start loop-----------------------------
      this.updateAfterResize();
      this.loop();
    }
  }


  //subscriptions-----------------------------
  subscribeToClassEvents(): void {
    if (this.threeMapEnvData.earth) {
      this.subscriptions.push(
        this.threeMapEnvData.earth.loadedEvent.subscribe((percentage) => {
          this.loadedPercentages[SCENE_ENVIRONMENT_ELEMENT_TYPE.EARTH] = percentage;
          this.calculateTotalLoadedPercentage();
        }),
      );
    }
  }

  subscribeToTouchEvents(): void {
    this.subscriptions.push(
      this.touchStartEvent.subscribe((point: Vector2) => {
        this.threeMapEnvData.prevMousePos = this.threeMapEnvData.mousePos;
        this.threeMapEnvData.mousePos = point;
        this.threeMapEnvData.mouseIsDown = true;
      }),
      this.touchDragEvent.subscribe((point: Vector2) => {
        this.threeMapEnvData.prevMousePos = this.threeMapEnvData.mousePos;
        this.threeMapEnvData.mousePos = point;
      }),
      this.touchEndEvent.subscribe((point: Vector2) => {
        this.threeMapEnvData.prevMousePos = this.threeMapEnvData.mousePos;
        this.threeMapEnvData.mousePos = point;
        this.threeMapEnvData.mouseIsDown = false;
      }),
      this.touchClickEvent.subscribe(() => {
        this.onClick();
      }),
    );
  }

  calculateTotalLoadedPercentage(): void {
    this.totalLoadedPercentage.set(Math.round(Object.values(this.loadedPercentages).reduce((sum, value) => sum + value) / Object.keys(this.loadedPercentages).length));
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


  //hostlisteners----------------------------
  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    this.threeMapEnvData.currentAnimationFrame = window.scrollY;

    const p: number = this.threeMapEnvData.currentAnimationFrame / (this.threeMapEnvData.animationFrameCount / 6);
    this.logoOverlayOpacity.set(1 - p - (this.allSceneComponentsLoaded() ? 0 : 1));
    this.logoOverlayScale.set(1 + p * 10);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.threeMapEnvData.width = document.body.clientWidth;
    this.threeMapEnvData.height = window.innerHeight;
    this.updateAfterResize();
  }

}

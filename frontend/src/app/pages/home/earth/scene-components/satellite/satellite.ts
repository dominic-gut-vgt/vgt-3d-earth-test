import { ThreejsMapEnvironmentData } from "../../../../../shared/data/threejs/threejs-map-environment-data";
import { MapElement } from "../../base-classes/map-element";
import { EventEmitter } from "@angular/core";
import { LoadedMesh } from "../../primitives/loaded-mesh";
import { CircleGeometry, Mesh, MeshBasicMaterial, Quaternion, SphereGeometry, Vector3 } from "three";


export class Satellite extends MapElement {
  //private mesh!: LoadedMesh;
  private mesh!: Mesh;
  private target: LoadedMesh;
  private loadedCallback: Function;

  private normal = new Vector3()
  private p = new Vector3();

  constructor(threeMapEnvData: ThreejsMapEnvironmentData, target: LoadedMesh, loadedCallback: Function) {
    super(threeMapEnvData);
    this.target = target;
    this.loadedCallback = loadedCallback
    this.init();
  }

  public render(): void {



    //render
    this.p.applyAxisAngle(this.normal, 0.001);
    this.mesh.position.copy(this.p);
  }

  public onClick(): void { }

  resize(): void { }

  //init-------------------------------
  public deInit(): void { }

  override init(): void {
    const geometry = new SphereGeometry(0.2, 32, 16);
    const material = this.materials.brightMaterial
    this.mesh = new Mesh(geometry, material);
    this.scene?.add(this.mesh);

    //init position


    /*
        const circleGeometry = new CircleGeometry(radius, 32);
        const circleMat = new MeshBasicMaterial({ color: 0xffff00 });
        const circle = new Mesh(circleGeometry, circleMat);
        this.scene?.add(circle);
    */


    const q = new Quaternion();
    const randAngle = Math.random() * Math.PI * 2;
    const randRadius = 0//Math.random();
    this.p = new Vector3(
      Math.cos(randAngle) * (1 + randRadius),
      Math.sin(randAngle) * (1 + randRadius),
      0
    );

    this.normal = new Vector3().randomDirection();
    const front = new Vector3(0, 0, 1);
    q.setFromUnitVectors(front, this.normal);
    this.p.applyQuaternion(q);


    this.loadedCallback();
  }


}
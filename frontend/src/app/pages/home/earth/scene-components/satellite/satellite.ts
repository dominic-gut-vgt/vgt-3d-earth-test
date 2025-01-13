import { ThreejsMapEnvironmentData } from "../../../../../shared/data/threejs/threejs-map-environment-data";
import { MapElement } from "../../base-classes/map-element";
import { LoadedMesh } from "../../primitives/loaded-mesh";
import { Mesh, Quaternion, SphereGeometry, Vector3 } from "three";


export class Satellite extends MapElement {
  private mesh!: Mesh;
  private targetInd: number = 0;
  private possibleTargets: LoadedMesh[] = [];
  private loadedCallback: () => void;
  //position calculation
  private normal = new Vector3()
  private p = new Vector3();
  private flightHeight: number = 0.2;
  private flightSpeed: number = 0.002;


  constructor(threeMapEnvData: ThreejsMapEnvironmentData, possibleTargets: LoadedMesh[], loadedCallback: () => void) {
    super(threeMapEnvData);
    this.possibleTargets = possibleTargets;
    this.loadedCallback = loadedCallback;
    this.init();
  }

  public render(): void {
    this.p.applyAxisAngle(this.normal, this.flightSpeed);

    //mirror on target zero
    const targetY: number = this.possibleTargets[this.targetInd].getPos().y;
    const targetRelativePos: Vector3 = new Vector3().copy(this.p) //.add(this.target.getPos());
    if (this.targetInd === 0) {
      if (this.p.y > 0) {
        targetRelativePos.y = -targetRelativePos.y
      }
    }
    else {
      if (this.p.y < 0) {
        targetRelativePos.y = -targetRelativePos.y
      }
    }

    this.mesh.position.copy(targetRelativePos);
  }

  

  public onClick(): void { }

  resize(): void { }

  //init-------------------------------
  public deInit(): void { }

  override init(): void {

    //init position
    const q = new Quaternion();
    const randAngle = Math.random() * Math.PI * 2;
    this.p = new Vector3(
      Math.cos(randAngle) * (1 + this.flightHeight),
      Math.sin(randAngle) * (1 + this.flightHeight),
      0
    );

    this.normal = new Vector3().randomDirection();
    const front = new Vector3(0, 0, 1);
    q.setFromUnitVectors(front, this.normal);
    this.p.applyQuaternion(q);
    this.p.applyAxisAngle(this.normal, 0.001);

    if (this.p.y > 0) {
      this.targetInd = 1;
      console.log(this.p.y);
    }

    const geometry = new SphereGeometry(0.01, 32, 16);
    const material = this.materials.brightMaterial
    this.mesh = new Mesh(geometry, material);
    //this.scene?.add(this.mesh);
    this.possibleTargets[this.targetInd].addPinnedMesh(this.mesh)
    this.loadedCallback();
  }


}
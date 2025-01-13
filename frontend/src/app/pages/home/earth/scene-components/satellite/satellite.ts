import { ThreejsMapEnvironmentData } from "../../../../../shared/data/threejs/threejs-map-environment-data";
import { MapElement } from "../../base-classes/map-element";
import { LoadedMesh } from "../../primitives/loaded-mesh";
import { Material, Mesh, Quaternion, SphereGeometry, Vector3 } from "three";
import { CustomLine } from "../../primitives/custom-line";

interface NearSatellite {
  satellite: Satellite;
  connection: CustomLine;
  show: boolean;
}

export class Satellite extends MapElement {
  private ind: number = 0;
  private mesh!: Mesh;
  private material!: Material;
  private targetInd: number = 0;
  private possibleTargets: LoadedMesh[] = [];
  private loadedCallback: () => void;
  private show: boolean = false;
  private opacity: number = 0;
  private opacityAnimationStep: number = 0.05;

  //position calculation
  private normal = new Vector3()
  private p = new Vector3();
  private flightHeight: number = 0.1;
  private flightSpeed: number = 0.002;

  //inter satellite connections
  private nearSatellites: NearSatellite[] = [];
  private nearDist: number = 0.4;
  private connectedInds: number[] = [];



  constructor(threeMapEnvData: ThreejsMapEnvironmentData, ind: number, possibleTargets: LoadedMesh[], loadedCallback: () => void) {
    super(threeMapEnvData);
    this.possibleTargets = possibleTargets;
    this.loadedCallback = loadedCallback;
    this.ind = ind;
    this.init();
  }

  public render(): void {
    //set position of satellite
    this.p.applyAxisAngle(this.normal, this.flightSpeed);
    //mirror on target zero
    const targetRelativePos: Vector3 = new Vector3().copy(this.p)
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

    //update color of satellite
    this.calcOpacity();
    this.material.opacity = this.opacity;

    //render connections
    this.nearSatellites.forEach((ns) => {
      ns.connection.updateLine([this.getWorldPos(), ns.satellite.getWorldPos()]);
      ns.show = this.show && this.getWorldPos().distanceTo(ns.satellite.getWorldPos()) < this.nearDist;
      ns.connection.setShowLine(ns.show);
    });


  }

  calcOpacity(): void {
    if (this.show) {
      if (this.opacity < 1) {
        this.opacity += this.opacityAnimationStep;
      } else {
        this.opacity = 1;
      }
    } else {
      if (this.opacity > 0) {
        this.opacity -= this.opacityAnimationStep;
      } else {
        this.opacity = 0;
      }
    }
  }

  public calcNearNeighbours(allSatellites: Satellite[]): void {
    //find near satellites
    if (this.show) {
      for (let i = 0; i < allSatellites.length; i++) {
        if (i !== this.ind && this.getWorldPos().distanceTo(allSatellites[i].getWorldPos()) < this.nearDist) { //is near
          if (!allSatellites[i].getConnectedInds().includes(this.ind)) { //not already connected
            if (!this.nearSatellites.find((ns) => ns.satellite.getInd() === allSatellites[i].getInd())) { //not already in list
              this.nearSatellites.push({
                satellite: allSatellites[i],
                connection: new CustomLine(this.threeMapEnvData, this.colors.colorAccent1, 0.3),
                show: true
              });
            }
          }
        }
      }
    }

    //remove too far satellites
    this.nearSatellites = this.nearSatellites.filter((ns) => (ns.connection.getOpacity() !== 0 || ns.show));

    this.connectedInds = this.nearSatellites.map((ns) => ns.satellite.getInd());
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
    }

    const geometry = new SphereGeometry(0.005, 32, 16);
    this.material = this.materials.accent1Material;
    this.material.transparent = true;
    this.mesh = new Mesh(geometry, this.material);
    this.possibleTargets[this.targetInd].addPinnedMesh(this.mesh)
    this.loadedCallback();

  }

  //getters--------------------------

  /**
   * @description returns position relative to pinned target
   * @returns Vector3
   */
  public getPos(): Vector3 {
    return new Vector3().copy(this.p);
  }

  /**
   * @description returns position in absolute world coordinates
   * @returns Vector3
   */
  public getWorldPos(): Vector3 {
    const worldPosition = new Vector3();
    this.mesh.getWorldPosition(worldPosition);
    return worldPosition;
  }

  public getInd(): number {
    return this.ind;
  }

  public getConnectedInds(): number[] {
    return this.connectedInds;
  }

  //setters---------------------------
  public setShow(state: boolean): void {
    this.show = state;
  }

}
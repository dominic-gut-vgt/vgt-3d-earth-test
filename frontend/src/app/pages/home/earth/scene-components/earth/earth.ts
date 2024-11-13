import { Mesh, SphereGeometry } from "three";
import { ThreejsMapEnvironmentData } from "../../../../../shared/data/threejs/threejs-map-environment-data";
import { MapElement } from "../../base-classes/map-element";

export class Earth extends MapElement {
    private earthSphere!: Mesh;

    constructor(threeMapEnvData: ThreejsMapEnvironmentData) {
        super(threeMapEnvData);
        setTimeout(()=>{
            this.init();
        },500); //faster loading because routing completes
       
    }
    deInit(): void {

    }
    override init(): void {
            const geometry = new SphereGeometry(0.49, 64, 64);
                this.earthSphere = new Mesh(geometry, this.materials.accent1Material);
                this.scene?.add(this.earthSphere);
    }

    render(): void {
  
    }

   
    onClick(): void {
        
    }

    resize(): void {
    }
   
}
import { AmbientLight, PointLight, Vector3 } from "three";
import { MapElement } from "../../base-classes/map-element";
import { ThreejsMapEnvironmentData } from "../../../../../shared/data/threejs/threejs-map-environment-data";
import { PointLightConfig } from "../../../../../shared/interfaces/threejs/point-light-config";

export class Lighting extends MapElement {

    lights: PointLight[] = [];
    pointLightConfigs: PointLightConfig[] = [
        {
            color: this.colors.colorAccent1,
            strength: 1500,
            pos: new Vector3(20, 20, 20),
        },
        {
            color: this.colors.colorAccent2,
            strength: 1500,
            pos: new Vector3(-20, -20, 20),
        },
    ]

    constructor(threeMapEnvData: ThreejsMapEnvironmentData) {
        super(threeMapEnvData);
        this.init();
    }

    
    override init(): void {
        const ambientLight = new AmbientLight(0xffffff, 2);
        this.scene?.add(ambientLight);

        for (let i = 0; i < this.pointLightConfigs.length; i++) {
            this.lights[i] = new PointLight(this.pointLightConfigs[i].color, this.pointLightConfigs[i].strength);
            this.lights[i].position.copy(this.pointLightConfigs[i].pos);
            this.scene?.add(this.lights[i]);
        }
    }
    override render(): void { }
    override resize(): void { }

    deInit():void{ }

}
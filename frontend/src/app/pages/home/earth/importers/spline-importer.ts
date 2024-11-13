import { Loader, Scene } from 'three';
import * as Spline from '@splinetool/runtime';
import { Application } from '@splinetool/runtime';
import { ThreejsMapEnvironmentData } from '../../../../shared/data/threejs/threejs-map-environment-data';

export class SplineImporter extends Loader {
    threeMapEnvData: ThreejsMapEnvironmentData;
    constructor(threeMapEnvData: ThreejsMapEnvironmentData) {
        super();
        this.threeMapEnvData = threeMapEnvData;
    }

    loadScene(splineCodePath: string, loadedCallback: Function, loadingProgressCallback: Function): void {

        const spline = new Application(this.threeMapEnvData.canvas as HTMLCanvasElement);
        spline.load(splineCodePath).then(() => {
          
        }).catch(() => {
            loadedCallback(undefined);
        });

        /*
         const loader = new SplineLoader();
         loader.load(
             splineCodePath,
             (splineScene:Scene) => {
                 loadedCallback(splineScene);
             },
             (xhr) => {
                 loadedCallback((xhr.loaded / xhr.total) * 100);
             },
             (error) => {
                 console.log('An error happened');
                 loadedCallback(null)
             }
         );
         */
    }
}
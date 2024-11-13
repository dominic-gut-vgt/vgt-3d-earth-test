import { Mesh } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export class GLTFAsSeparatedMeshesImporter {

  separatedMeshes: Mesh[] = [];

  constructor() {
  }

  render(): void { }
  init(): void { }

  loadModel(relativeModelPath: string, finishedCallback: Function): void {

    const assetLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
    assetLoader.setDRACOLoader(dracoLoader);
    assetLoader.load('/3d-models/' + relativeModelPath, (object:any) => {
      object.scene.traverse((child:any) => {
        let mesh = (child as Mesh);
        if (mesh.isMesh) {
          this.separatedMeshes.push(mesh);
        }
      });

      finishedCallback(this.separatedMeshes)
    }, (xhr: any) => { },
      (error: any) => {
        console.log(error)
      });
  }

  resize(): void { }

}
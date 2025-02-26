import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import Stats from "three/examples/jsm/libs/stats.module";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { Sky } from "three/examples/jsm/objects/Sky";
export default class Viewer {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    //this.grid = new THREE.GridHelper(1000, 1000);

    this.renderer.setSize(this.width, this.height);
    //this.renderer.setClearColor(0.5, 0.8, 1.0, 1); // RGB + 透明度

    this.camera.position.set(1, 10, 4);
    //this.scene.add(this.grid);

    var objLoader = new OBJLoader();
    var mtlLoader = new MTLLoader();
    let fontLoader = new FontLoader(); // 创建字体加载器

    const light = new THREE.PointLight(0xbbffff, 1, 100);
    light.position.set(5, 5, 5);

    const ambientLight = new THREE.AmbientLight(0xffffff, 8);

    // const directionalLight = new THREE.DirectionalLight(0xffffff, 10); // 白色光源，强度为1
    // directionalLight.position.set(0, 10, 0); // 设置光源位置
    // this.scene.add(directionalLight);

    this.scene.add(ambientLight);
    this.scene.add(light);
    // 添加坐标轴辅助对象
    // const axesHelper = new THREE.AxesHelper(100); // 参数5表示轴的长度
    // this.scene.add(axesHelper);
    var that = this;
    // this.addText(fontLoader, this.scene);
    // 原生方式
    // mtlLoader.load(
    //   "./static/models1/xpj1/A-XPJ.mtl",
    //   function (materials) {
    //     materials.preload();
    //     objLoader
    //       .setMaterials(materials)
    //       .load("./static/models1/xpj1/A-XPJ.obj", function (object) {
    //         object.children[0].geometry.computeBoundingBox(); //
    //         object.children[0].geometry.center(); //定位到模型中心
    //         console.log(object.children[0].geometry.center());
    //         object.rotateZ(Math.PI / 2); //模型倒置
    //         object.rotateY(Math.PI / 2); //模型倒置
    //         object.position.y = 10; //模型抬升
    //         that.scene.add(object);
    //       }),
    //       (xhr) => {
    //         console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    //       },
    //       // called when loading has errors
    //       (error) => {
    //         console.log("An error happened " + error);
    //       };
    //   }
    // );
    // }
    // 主逻辑
    const mtlUrl = "./static/models1/xpj/A-XPJ.mtl";
    const objUrl = "./static/models1/xpj/A-XPJ.obj";
    const fontUrl = "./static/font/FangSong_GB2312_Regular.json";
    this.loadText(fontLoader, fontUrl, function (font) {
      const geometry = new TextGeometry("溪畔居", {
        font: font,
        size: 3,
        depth: 0.05,
        height: 1,
        curveSegments: 1,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 1,
      });
      const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
      const textMesh = new THREE.Mesh(geometry, material);
      textMesh.position.set(0, 15, 0);

      that.scene.add(textMesh);
    });
    this.loadMTL(mtlLoader, mtlUrl, function (materials) {
      that.loadOBJ(objLoader, objUrl, materials, function (object) {
        console.log("Model loaded");

        // object.children.forEach((child) => {
        //   if (child.isMesh) {
        //     child.geometry.computeBoundingBox();
        //     child.geometry.center();
        //   }
        // });
        // 对单个模型进行操作
        // const model = object.children[0];
        // model.geometry.computeBoundingBox();
        // model.geometry.center();
        // console.log(model.geometry.center());
        //object.rotateZ(Math.PI);
        object.rotateX(Math.PI/2);
  
        object.scale.setScalar(0.3);
        //添加到场景that.filterEmptyMeshes()
        that.scene.add(object);
        console.log("Model added to scene");
      });
    });
    this.animate();
    this.initSky();
    window.addEventListener("resize", () => {
      this.onWindowResize();
    });
  }

  // 加载 .mtl 文件
  loadMTL(mtlLoader, mtlUrl, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", mtlUrl, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        //mtlLoader.setPath("./static/models1/Tile/"); // 设置材质路径
        const materials = mtlLoader.parse(xhr.responseText); // 解析 .mtl 文件
        materials.preload(); // 预加载材质
        callback(materials);
      } else {
        console.error("Failed to load MTL file:", xhr.statusText);
      }
    };
    xhr.onerror = function (error) {
      console.error("Error loading MTL file:", error);
    };
    xhr.send();
  }

  // 加载 .obj 文件
  loadOBJ(objLoader, objUrl, materials, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", objUrl, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        objLoader.setMaterials(materials); // 设置材质
        const object = objLoader.parse(xhr.responseText); // 解析 .obj 文件
        callback(object);
      } else {
        console.error("Failed to load OBJ file:", xhr.statusText);
      }
    };
    xhr.onerror = function (error) {
      console.error("Error loading OBJ file:", error);
    };
    xhr.send();
  }
  loadText(textLoader, fontUrl, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", fontUrl, true);
    xhr.responseType = "json";
    xhr.onload = function () {
      if (xhr.status === 200) {
        const font = textLoader.parse(xhr.response);
        callback(font);
      } else {
        console.error("Failed to load OBJ file:", xhr.statusText);
      }
    };
    xhr.onerror = function (error) {
      console.error("Error loading OBJ file:", error);
    };
    xhr.send();
  }
  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    const render = () => {
      requestAnimationFrame(render);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    render();
  }

  initSky() {
    let sky = new Sky();
    sky.scale.setScalar(45000); //太阳盒子的大小，要把整个场景包含进去
    this.scene.add(sky);
    const effectController = {
      turbidity: 10, //浑浊度
      rayleigh: 3, //阳光散射，黄昏效果的程度
      mieCoefficient: 0.005, //太阳对比度，清晰度
      mieDirectionalG: 0.7,
      elevation: 1, //太阳高度
      azimuth: 190, //太阳水平方向位置
      exposure: this.renderer.toneMappingExposure, //光线昏暗程度
    };

    let sun = new THREE.Vector3();
    const uniforms = sky.material.uniforms;
    uniforms["turbidity"].value = effectController.turbidity;
    uniforms["rayleigh"].value = effectController.rayleigh;
    uniforms["mieCoefficient"].value = effectController.mieCoefficient;
    uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;
    const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
    const theta = THREE.MathUtils.degToRad(effectController.azimuth);
    sun.setFromSphericalCoords(1, phi, theta);
    uniforms["sunPosition"].value.copy(sun);
    this.renderer.toneMappingExposure = effectController.exposure;
    this.renderer.render(this.scene, this.camera);
  }
  addText(loader, scene) {
    loader.load("./static/font/FangSong_GB2312_Regular.json", function (font) {
      const geometry = new TextGeometry("XX村庄", {
        font: font,
        size: 1,
        depth: 0.05,
        height: 1,
        curveSegments: 1,
        bevelEnabled: true,
        bevelThickness: 0.02,
        bevelSize: 0.01,
        bevelOffset: 0,
        bevelSegments: 1,
      });
      const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
      const textMesh = new THREE.Mesh(geometry, material);
      textMesh.position.set(0, 10, 0);

      scene.add(textMesh);
      // 可选：在渲染循环中保持文字面向摄像机
      // function animate(textMesh,camera) {
      //   requestAnimationFrame(animate);
      //   textMesh.lookAttaht(camera.position);
      // }
      // animate(textMesh,camera);
    });
  }
  filterEmptyMeshes(group) {
    const validChildren = [];
    group.children.forEach((child) => {
      if (child.isMesh && child.geometry.attributes.position.count > 0) {
        validChildren.push(child);
      } else if (child.isGroup) {
        validChildren.push(this.filterEmptyMeshes(child));
      }
    });
    group.children = validChildren;
    return group;
  }
}

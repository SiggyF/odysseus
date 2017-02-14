import vert from 'shaders/sphere-vert.glsl';
import frag from 'shaders/sphere-frag.glsl';
import $ from 'jquery';
import _ from 'lodash';
import * as THREE from 'three';
import Orbit from 'three-orbit-controls';
var OrbitControls = Orbit(THREE);

console.log('THREE', THREE);
//

export default {
  name: 'v-sphere',
  data () {
    return {
    };
  },
  mounted(a) {
    this.setup();
  },
  computed: {
    canvas: {
      get() {
        return $(this.$el).find('#sphere-canvas')[0];
      },
      cache: false
    }
  },
  methods: {
    setup() {
      //SCENE setup
      let scene = new THREE.Scene();
      scene.background = new THREE.Color(0x424242);
      var renderer = new THREE.WebGLRenderer({
        canvas: this.canvas
      });
      var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
      camera.target = new THREE.Vector3(0, 0, -1);
      camera.position.set(-1000, 0, 0);
      camera.lookAt(camera.target);
      renderer.render(scene, camera);
    },
    init() {
      var container;
      var geometry, mesh, material;
      var scene, outsideCamera, insideCamera, renderer;
      var outsideCameraControls, insideCamerControls;
      var insideCameraHelper;
      var currentCamera;
      var clock = new THREE.Clock();
      var stats;
      //For InsideCamera
      var userIsDragging = false;
      var longitude = 0;
      var latitude = 0;
      var savedX;
      var savedY;
      var savedLongitude = 0;
      var savedLatitude = 0;
      var insideCameraTargetRadius = 20;
      var CameraSelection = {
        INSIDE: 1,
        OUTSIDE: 2,
      };
      if (Detector.webgl) {
        init();
        animate();
      } else {
        document.body.appendChild(Detector.getWebGLErrorMessage());
      }
      function init() {
        //CONTAINER setup
        container = document.createElement('div');
        document.body.appendChild(container);
        //INFO setup
        var info = document.createElement('div');
        info.id = 'info';
        info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> - kinect';
        document.body.appendChild(info);
        //CAMERA setup
        outsideCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
        outsideCamera.target = new THREE.Vector3(0, 0, -1);
        outsideCamera.position.set(-1000, 0, 0);
        outsideCamera.lookAt(outsideCamera.target);
        insideCamera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 1500);
        insideCamera.target = new THREE.Vector3(insideCameraTargetRadius, 0, insideCameraTargetRadius);
        insideCamera.position.set(0, 0, 0);
        insideCamera.lookAt(insideCamera.target);
        currentCamera = CameraSelection.OUTSIDE;
        insideCameraHelper = new THREE.CameraHelper(insideCamera);
        scene.add(insideCameraHelper);
        //VALUES setup
        var width = 2560, height = 860;
        var nearClipping = 50, farClipping = 1500;
        //Get video tags
        var colorVideo = document.getElementById("colorVideo");
        var displacementVideo = document.getElementById("displacementVideo");
        colorVideo.addEventListener('loadedmetadata', function (event) {
          console.log("Metadata loaded")
          //TEXTURES setup
          var colorTexture = new THREE.VideoTexture(colorVideo);
          colorTexture.minFilter = THREE.LinearFilter;
          colorTexture.format = THREE.RGBFormat;
          colorTexture.repeat.y = 0.5;
          var displacementTexture = new THREE.VideoTexture(displacementVideo);
          displacementTexture.minFilter = THREE.LinearFilter;
          displacementTexture.format = THREE.RGBFormat;
          displacementTexture.repeat.y = 0.5;
          //GEOMETRY setup
          geometry = new THREE.BufferGeometry();
          var vertices = new Float32Array(width * height * 3);
          for (var i = 0, j = 0, l = vertices.length; i < l; i += 3, j++) {
            vertices[i] = j % width;
            vertices[i + 1] = Math.floor(j / width);
          }
          geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
          //MATERIAL setup
          material = new THREE.ShaderMaterial({
            uniforms: {
              "colorMap": {value: colorTexture},
              "displacementMap": {value: displacementTexture},
              "width": {value: width},
              "height": {value: height},
              "nearClipping": {value: nearClipping},
              "farClipping": {value: farClipping},
              "pointSize": {value: 3},
              "zOffset": {value: 1000}
            },
            vertexShader: document.getElementById('vs').textContent,
            fragmentShader: document.getElementById('fs').textContent,
            //blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false,
            transparent: true
          });
          //MESH setup
          mesh = new THREE.Points(geometry, material);
          scene.add(mesh);
          //AXIS HELPER setup (R:x G:y B:z)
          //            var axisHelper = new THREE.AxisHelper(100);
          //            scene.add(axisHelper);
          //dat.GUI setup
          var videoFunctions = function () {
            this.sync = function () {
              displacementVideo.currentTime = colorVideo.currentTime;
              colorVideo.currentTime = displacementVideo.currentTime;
            };
            this.toggleCameraInside = function () {
              currentCamera = CameraSelection.INSIDE;
              outsideCameraControls.enabled = false;
              scene.remove(insideCameraHelper);
            };
            this.toggleCameraOutside = function () {
              currentCamera = CameraSelection.OUTSIDE;
              outsideCameraControls.enabled = true;
              scene.add(insideCameraHelper);
            };
          };
          var gui = new dat.GUI();
          var guiFunctions = new videoFunctions();
          gui.add(material.uniforms.nearClipping, 'value', 1, 2000, 1.0).name('nearClipping');
          gui.add(material.uniforms.farClipping, 'value', 1, 2000, 1.0).name('farClipping');
          gui.add(material.uniforms.pointSize, 'value', 1, 25, 1.0).name('pointSize');
          //            gui.add(material.uniforms.zOffset, 'value', 0, 4000, 1.0).name('zOffset');
          gui.add(guiFunctions, "sync").name("Reset media");
          gui.add(guiFunctions, "toggleCameraInside").name("Inside camera");
          gui.add(guiFunctions, "toggleCameraOutside").name("Outside camera");
          gui.close();
        }, false);
        //RENDERER setup
        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
        //MOUSECONTROL setup
        outsideCameraControls = new OrbitControls(outsideCamera, renderer.domElement);
        //PERFORMANCE MONITOR setup
        stats = new Stats();
        stats.id = "stats";
        stats.dom.style.position = 'absolute';
        stats.dom.style.top = '';
        stats.dom.style.left = '0px';
        stats.dom.style.bottom = '0px';
        container.appendChild(stats.dom);
        //LISTENER setup
        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener("mousedown", onDocumentMouseDown, false);
        document.addEventListener("mousemove", onDocumentMouseMove, false);
        document.addEventListener("mouseup", onDocumentMouseUp, false);
      }
      function onWindowResize() {
        insideCamera.aspect = window.innerWidth / window.innerHeight;
        insideCamera.updateProjectionMatrix();
        outsideCamera.aspect = window.innerWidth / window.innerHeight;
        outsideCamera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      function animate() {
        requestAnimationFrame(animate);
        render();
        update();
      }
      function render() {
        var cameraToRender = outsideCamera;
        switch (currentCamera) {
        case CameraSelection.INSIDE:
          cameraToRender = insideCamera;
          break;
        case CameraSelection.OUTSIDE:
          cameraToRender = outsideCamera;
          break;
        }
        renderer.render(scene, cameraToRender);
      }
      function update() {
        var deltaTime = clock.getDelta();
        outsideCameraControls.update(deltaTime);
        stats.update();
        if (currentCamera == CameraSelection.INSIDE) {
          // limiting latitude from -85 to 85 (cannot point to the sky or under your feet)
          latitude = Math.max(-85, Math.min(85, latitude));
          // moving the camera according to current latitude (vertical movement) and longitude (horizontal movement)
          insideCamera.target.x = insideCameraTargetRadius * Math.sin(THREE.Math.degToRad(90 - latitude)) * Math.cos(THREE.Math.degToRad(longitude));
          insideCamera.target.y = insideCameraTargetRadius * Math.cos(THREE.Math.degToRad(90 - latitude));
          insideCamera.target.z = insideCameraTargetRadius * Math.sin(THREE.Math.degToRad(90 - latitude)) * Math.sin(THREE.Math.degToRad(longitude));
          insideCamera.lookAt(insideCamera.target);
        }
      }
      function onDocumentMouseDown(event) {
        userIsDragging = true;
        if (currentCamera == CameraSelection.INSIDE) {
          event.preventDefault();
          savedX = event.clientX;
          savedY = event.clientY;
          savedLongitude = longitude;
          savedLatitude = latitude;
        }
      }
      function onDocumentMouseMove(event) {
        if (currentCamera == CameraSelection.INSIDE) {
          if (userIsDragging) {
            longitude = (savedX - event.clientX) * 0.1 + savedLongitude;
            latitude = (event.clientY - savedY) * 0.1 + savedLatitude;
          }
        }
      }
      function onDocumentMouseUp(event) {
        userIsDragging = false;
      }
    }
  }

};

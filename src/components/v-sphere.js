import vert from 'shaders/sphere-vert.glsl';
import frag from 'shaders/sphere-frag.glsl';
import $ from 'jquery';
import _ from 'lodash';
import * as THREE from 'three';
import Orbit from 'three-orbit-controls';
var OrbitControls = Orbit(THREE);

export default {
  name: 'v-sphere',
  props: {
    src: {
      required: true,
      type: String
    }
  },
  data() {
    return {
      renderer: null,
      cameras: null,
      scene: null,
      geometry: null,
      isDragging: false,
      x: null,
      y: null,
      lat: 0,
      lon: 0,
      selectedCamera: 'outside',
      width: 600,
      height: 500,
      pointSize: 25,
      nearClipping: 70,
      farClipping: 800
    };
  },
  mounted() {
    this.scene = this.createScene();
    this.cameras = this.createCameras();
    // this.scene.add(this.cameras.inside.helper);
    this.renderer = this.createRenderer();
    // create controls and add to camera
    this.createControls();
    this.geometry = this.createGeometry();
    this.subscribe();
    this.animate();
  },
  computed: {
    canvas: {
      get() {
        return $(this.$el).find('.sphere')[0];
      },
      cache: false
    },
    video: {
      get() {
        return $(this.$el).find('.depth')[0];
      },
      cache: false
    }
  },
  methods: {
    subscribe() {
      this.video.addEventListener('loadedmetadata', (event) => {
        let texture = this.createTexture();
        let material = this.createMaterial(texture);
        this.mesh = this.createMesh(this.geometry, material);
        this.scene.add(this.mesh);
      });
      window.addEventListener('resize', (event) => {
        this.onResize(event);
      });
      window.addEventListener('mousedown', (event) => {
        this.onMouseDown(event);
      });
      window.addEventListener('mouseup', (event) => {
        this.onMouseUp(event);
      });
      window.addEventListener('mousemove', (event) => {
        this.onMouseMove(event);
      });
    },
    createControls() {
      this.cameras.outside.controls = new OrbitControls(this.cameras.outside, this.renderer.domElement);
    },
    createTexture() {
      let texture = new THREE.VideoTexture(this.video);
      texture.minFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;
      return texture;
    },
    createGeometry() {
      let geometry = new THREE.BufferGeometry();
      let vertices = new Float32Array(this.width * this.height * 3);
      for (var i = 0, j = 0, l = vertices.length; i < l; i += 3, j++) {
        vertices[i] = j % this.width;
        vertices[i + 1] = Math.floor(j / this.width);
      }
      geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
      return geometry;
    },
    createMaterial(texture) {
      let material = new THREE.ShaderMaterial({
        uniforms: {
          videoMap: {value: texture},
          width: {value: this.width},
          height: {value: this.height},
          nearClipping: {value: this.nearClipping},
          farClipping: {value: this.farClipping},
          pointSize: {value: this.pointSize},
          opacity: {value: 0.3},
          zOffset: {value: 1000}
        },
        vertexShader: vert,
        fragmentShader: frag,
        depthTest: true,
        depthWrite: false,
        transparent: true
      });
      return material;
    },
    createMesh(geometry, material) {
      // MESH setup
      let mesh = new THREE.Points(geometry, material);
      return mesh;
    },
    createScene() {
      let scene = new THREE.Scene();
      scene.background = new THREE.Color(0x424242);
      return scene;
    },
    createCameras() {
      // SCENE setup
      let cameras = {
        outside: new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, this.farClipping * 10.0),
        inside: new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, this.farClipping * 10.0)
      };

      cameras.outside.target = new THREE.Vector3(0, 0, 10);
      cameras.outside.position.set(0, 0, 10);
      cameras.outside.lookAt(cameras.outside.target);
      cameras.inside.target = new THREE.Vector3(20, 0, 20);
      cameras.inside.position.set(0, 0, 0);
      cameras.inside.lookAt(cameras.inside.target);
      cameras.inside.helper = new THREE.CameraHelper(cameras.inside);
      return cameras;
    },
    createRenderer() {
      var renderer = new THREE.WebGLRenderer({
        canvas: this.canvas
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      return renderer;
    },
    animate() {
      requestAnimationFrame(this.animate.bind(this));
      if (_.isNil(this.mesh)) {
        return;
      }
      this.render();
      this.update();
    },
    render() {
      this.renderer.render(this.scene, this.cameras[this.selectedCamera]);
    },
    update() {
      let radius = 20;
      // clip
      this.lat = Math.max(-85, Math.min(85, this.lat));
      // moving the camera according to current latitude (vertical movement) and longitude (horizontal movement)
      this.cameras.inside.target.x = (
        radius * Math.sin(THREE.Math.degToRad(90 - this.lat)) * Math.cos(THREE.Math.degToRad(this.lon))
      );
      this.cameras.inside.target.y = (
        radius * Math.cos(THREE.Math.degToRad(90 - this.lat))
      );
      this.cameras.inside.target.z = (
        radius * Math.sin(THREE.Math.degToRad(90 - this.lat)) * Math.sin(THREE.Math.degToRad(this.lon))
      );
      this.cameras.inside.lookAt(this.cameras.inside.target);
    },
    onResize() {
      this.cameras.inside.aspect = window.innerWidth / window.innerHeight;
      this.cameras.inside.updateProjectionMatrix();
      this.cameras.outside.aspect = window.innerWidth / window.innerHeight;
      this.cameras.outside.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    onMouseDown(event) {
      this.isDragging = true;
      if (this.selectedCamera === 'inside') {
        event.preventDefault();
        this.x = event.clientX;
        this.y = event.clientY;
        this.lon = 0;
        this.lat = 0;
      }
    },
    onMouseMove(event) {
      if (this.selectedCamera === 'inside') {
        if (this.isDragging) {
          this.lon = (this.x - event.clientX) * 0.01 + this.lon;
          this.lat = (event.clientY - this.y) * 0.01 + this.lat;
        }
      }
    },
    onMouseUp(event) {
      this.isDragging = false;
    }
  }

};

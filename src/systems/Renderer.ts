import * as THREE from 'three';
// @ts-ignore
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
// @ts-ignore
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
// @ts-ignore
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// @ts-ignore
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
// @ts-ignore
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';

export class Renderer {
    public scene: THREE.Scene;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;
    public composer: EffectComposer;
    private clock: THREE.Clock;

    constructor(canvas: HTMLCanvasElement) {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x020205, 0.015);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.clock = new THREE.Clock();

        // Post-processing
        const renderScene = new RenderPass(this.scene, this.camera);
        
        // Bloom
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, 0.4, 0.85
        );
        bloomPass.threshold = 0.4; // Higher threshold to avoid blooming everything
        bloomPass.strength = 0.8;  // Lower strength for tasteful glow
        bloomPass.radius = 0.4;

        // Film Grain
        const filmPass = new FilmPass(0.2, 0.02, 648, false);

        // Chromatic Aberration
        const chromaticAberrationShader = {
            uniforms: {
                "tDiffuse": { value: null },
                "uOffset": { value: 0.0008 } // Minimal offset for subtle quality
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader: `
                uniform sampler2D tDiffuse;
                uniform float uOffset;
                varying vec2 vUv;
                void main() {
                    vec4 cr = texture2D(tDiffuse, vUv + vec2(uOffset, 0.0));
                    vec4 cg = texture2D(tDiffuse, vUv);
                    vec4 cb = texture2D(tDiffuse, vUv - vec2(uOffset, 0.0));
                    gl_FragColor = vec4(cr.r, cg.g, cb.b, cg.a);
                }
            `
        };
        const chromaticPass = new ShaderPass(chromaticAberrationShader);

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);
        this.composer.addPass(chromaticPass);
        this.composer.addPass(filmPass);

        this.setupLights();
        window.addEventListener('resize', () => this.onResize());
    }

    private setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0x00f2ff, 50);
        spotLight.position.set(5, 10, 5);
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 1024;
        spotLight.shadow.mapSize.height = 1024;
        this.scene.add(spotLight);

        const pointLight = new THREE.PointLight(0x7000ff, 30);
        pointLight.position.set(-5, 5, -5);
        this.scene.add(pointLight);
    }

    private onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    public render(callback?: (delta: number) => void) {
        const delta = this.clock.getDelta();
        if (callback) callback(delta);
        this.composer.render();
        requestAnimationFrame(() => this.render(callback));
    }
}
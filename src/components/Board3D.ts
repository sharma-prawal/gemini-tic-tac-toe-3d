import * as THREE from 'three';
import gsap from 'gsap';

export class Board3D {
    public mesh: THREE.Group;
    public hitboxes: THREE.Mesh[] = [];
    private cells: THREE.Mesh[] = [];
    private gridLines: THREE.LineSegments;
    private scanLayer: THREE.Mesh;

    constructor() {
        this.mesh = new THREE.Group();

        // Create the base grid
        const size = 6;
        const divisions = 3;
        const gridHelper = new THREE.GridHelper(size, divisions, 0x00f2ff, 0x00f2ff);
        this.gridLines = gridHelper as any;
        this.mesh.add(this.gridLines);

        // Holographic Scan Layer
        const scanGeom = new THREE.PlaneGeometry(size, size);
        const scanMat = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(0x00f2ff) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uColor;
                varying vec2 vUv;
                void main() {
                    float scanLine = sin(vUv.y * 20.0 - uTime * 5.0) * 0.5 + 0.5;
                    scanLine = pow(scanLine, 10.0) * 0.5;
                    float border = 1.0 - smoothstep(0.48, 0.5, abs(vUv.x - 0.5)) * smoothstep(0.48, 0.5, abs(vUv.y - 0.5));
                    gl_FragColor = vec4(uColor, scanLine * 0.3);
                }
            `
        });
        this.scanLayer = new THREE.Mesh(scanGeom, scanMat);
        this.scanLayer.rotation.x = -Math.PI / 2;
        this.scanLayer.position.y = 0.05;
        this.mesh.add(this.scanLayer);

        // Create visual cells and hitboxes
        const cellSize = size / divisions;
        const visualGeom = new THREE.BoxGeometry(cellSize * 0.95, 0.05, cellSize * 0.95);
        const hitboxGeom = new THREE.BoxGeometry(cellSize, 0.5, cellSize);
        
        const visualMat = new THREE.MeshPhysicalMaterial({
            color: 0x00f2ff,
            transparent: true,
            opacity: 0,
            metalness: 0.9,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            emissive: 0x00f2ff,
            emissiveIntensity: 0.2
        });

        const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });

        for (let z = 0; z < 3; z++) {
            for (let x = 0; x < 3; x++) {
                const posX = (x - 1) * cellSize;
                const posZ = (z - 1) * cellSize;

                // Visual Highlight
                const visual = new THREE.Mesh(visualGeom, visualMat.clone());
                visual.position.set(posX, 0.02, posZ);
                this.cells.push(visual);
                this.mesh.add(visual);

                // Invisible Hitbox
                const hitbox = new THREE.Mesh(hitboxGeom, hitboxMat);
                hitbox.position.set(posX, 0.25, posZ);
                hitbox.userData = { index: z * 3 + x };
                this.hitboxes.push(hitbox);
                this.mesh.add(hitbox);
            }
        }

        // Add a floating base
        const baseGeom = new THREE.BoxGeometry(size + 0.5, 0.2, size + 0.5);
        const baseMat = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0,
            roughness: 0,
            transmission: 0.95,
            thickness: 1.0,
            ior: 1.5,
            transparent: true,
            opacity: 0.8,
            envMapIntensity: 1.0,
            clearcoat: 1.0
        });
        const base = new THREE.Mesh(baseGeom, baseMat);
        base.position.y = -0.2;
        base.receiveShadow = true;
        this.mesh.add(base);

        this.startIdleAnimation();
    }

    private startIdleAnimation() {
        gsap.to(this.mesh.position, {
            y: 0.2,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
        gsap.to(this.mesh.rotation, {
            x: 0.05,
            z: 0.05,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }

    public update(time: number) {
        if (this.scanLayer.material instanceof THREE.ShaderMaterial) {
            this.scanLayer.material.uniforms.uTime.value = time;
        }
    }

    public onHover(index: number | null) {
        this.cells.forEach((cell, i) => {
            const mat = cell.material as THREE.MeshStandardMaterial;
            if (i === index) {
                gsap.to(mat, { opacity: 0.4, duration: 0.2 });
            } else {
                gsap.to(mat, { opacity: 0, duration: 0.2 });
            }
        });
    }

    public getCellPosition(index: number): THREE.Vector3 {
        return this.cells[index].position.clone().add(this.mesh.position);
    }
}
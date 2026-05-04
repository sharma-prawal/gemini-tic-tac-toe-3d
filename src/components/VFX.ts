import * as THREE from 'three';

export class VFX {
    public particles: THREE.Points;
    public dust: THREE.Points;
    private scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.particles = this.createStarfield();
        this.dust = this.createAmbientDust();
        
        this.scene.add(this.particles);
        this.scene.add(this.dust);
    }

    private createStarfield(): THREE.Points {
        const geometry = new THREE.BufferGeometry();
        const vertices: number[] = [];
        const colors: number[] = [];
        const count = 3000;

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            vertices.push(x, y, z);
            
            const brightness = 0.5 + Math.random() * 0.5;
            colors.push(brightness, brightness, brightness);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 1.0,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        return new THREE.Points(geometry, material);
    }

    private createAmbientDust(): THREE.Points {
        const geometry = new THREE.BufferGeometry();
        const vertices: number[] = [];
        const count = 300;

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 60;
            const y = (Math.random() - 0.5) * 60;
            const z = (Math.random() - 0.5) * 60;
            vertices.push(x, y, z);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const material = new THREE.PointsMaterial({
            color: 0x00f2ff,
            size: 0.02,
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: true
        });

        return new THREE.Points(geometry, material);
    }

    public update(time: number) {
        // Slow rotation for starfield
        this.particles.rotation.y = time * 0.05;
        this.particles.rotation.z = time * 0.03;

        // Subtle movement for dust
        this.dust.rotation.y = -time * 0.02;
        const positions = this.dust.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + positions[i]) * 0.005;
        }
        this.dust.geometry.attributes.position.needsUpdate = true;
    }
}
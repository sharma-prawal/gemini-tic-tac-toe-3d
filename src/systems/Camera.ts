import * as THREE from 'three';
import gsap from 'gsap';

export class CameraController {
    private camera: THREE.PerspectiveCamera;
    private targetPosition = new THREE.Vector3(0, 0, 0);

    constructor(camera: THREE.PerspectiveCamera) {
        this.camera = camera;
        this.camera.position.set(0, 5, 12);
        this.camera.lookAt(0, 0, 0);
    }

    public setMenuState() {
        gsap.to(this.camera.position, {
            x: 8, y: 5, z: 12,
            duration: 2,
            ease: 'power2.inOut'
        });
        gsap.to(this.targetPosition, {
            x: 0, y: 0, z: 0,
            duration: 2,
            onUpdate: () => this.camera.lookAt(this.targetPosition)
        });
    }

    public setGameState() {
        gsap.to(this.camera.position, {
            x: 0, y: 10, z: 8,
            duration: 1.5,
            ease: 'expo.out'
        });
        gsap.to(this.targetPosition, {
            x: 0, y: 0, z: 0,
            duration: 1.5,
            onUpdate: () => this.camera.lookAt(this.targetPosition)
        });
    }

    public setWinState() {
        gsap.to(this.camera.position, {
            x: 6, y: 6, z: 6,
            duration: 2,
            ease: 'power3.inOut'
        });
    }

    public updateIdle(time: number) {
        this.camera.position.x += Math.sin(time * 0.5) * 0.002;
        this.camera.position.y += Math.cos(time * 0.3) * 0.002;
        this.camera.lookAt(this.targetPosition);
    }
}
import * as THREE from 'three';
import gsap from 'gsap';

export class Piece3D {
    public static createX(): THREE.Group {
        const group = new THREE.Group();
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x00f2ff,
            metalness: 1.0,
            roughness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            emissive: 0x00f2ff,
            emissiveIntensity: 0.5
        });

        const geometry = new THREE.BoxGeometry(0.25, 1.8, 0.2);
        
        const beam1 = new THREE.Mesh(geometry, material);
        beam1.rotation.z = Math.PI / 4;
        beam1.position.z = 0.05; // Slightly forward
        beam1.castShadow = true;
        
        const beam2 = new THREE.Mesh(geometry, material);
        beam2.rotation.z = -Math.PI / 4;
        beam2.position.z = -0.05; // Slightly backward to avoid Z-fighting
        beam2.castShadow = true;

        group.add(beam1, beam2);
        group.scale.set(0.8, 0.8, 0.8);
        return group;
    }

    public static createO(): THREE.Group {
        const group = new THREE.Group();
        const geometry = new THREE.TorusGeometry(0.7, 0.1, 16, 100);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x7000ff,
            emissive: 0x7000ff,
            emissiveIntensity: 1.0,
            metalness: 0.9,
            roughness: 0.2,
            clearcoat: 1.0,
            transmission: 0.2,
            thickness: 0.5
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = Math.PI / 2;
        mesh.castShadow = true;
        
        // Inner core glow - slightly smaller to avoid intersection
        const innerGeom = new THREE.TorusGeometry(0.7, 0.03, 8, 50);
        const innerMat = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const innerMesh = new THREE.Mesh(innerGeom, innerMat);
        innerMesh.rotation.x = Math.PI / 2;
        innerMesh.position.y = 0.01; // Slightly lift to avoid Z-fighting
        
        group.add(mesh, innerMesh);
        return group;
    }

    public static animateIn(piece: THREE.Object3D, position: THREE.Vector3, onComplete?: () => void) {
        piece.position.copy(position);
        piece.position.y += 10;
        piece.scale.set(0, 0, 0);

        gsap.to(piece.position, {
            y: position.y + 0.5,
            duration: 0.6,
            ease: 'bounce.out',
            onComplete
        });

        gsap.to(piece.scale, {
            x: 1, y: 1, z: 1,
            duration: 0.4,
            ease: 'back.out(1.7)'
        });
    }

    public static animateWin(piece: THREE.Object3D) {
        gsap.to(piece.scale, {
            x: 1.2, y: 1.2, z: 1.2,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });

        piece.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial) {
                gsap.to(child.material, {
                    emissiveIntensity: 2.0,
                    duration: 0.5,
                    repeat: -1,
                    yoyo: true
                });
            }
        });
    }
}
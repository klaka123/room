import * as THREE from 'three';

export class WallBuilder {
    constructor(scene) {
        this.scene = scene;
        this.walls = [];
        this.tempWall = null;
        this.startPoint = null;
        this.isBuilding = false;
    }

    startBuild(position) {
        this.isBuilding = true;
        this.startPoint = position.clone();
        this.startPoint.y = 0; // Фиксируем на полу
        
        // Создаем временную стену для предпросмотра
        const geometry = new THREE.BoxGeometry(0.1, 2.5, 0.1);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0xaaccff, 
            transparent: true, 
            opacity: 0.5,
            emissive: new THREE.Color(0x224466)
        });
        this.tempWall = new THREE.Mesh(geometry, material);
        this.tempWall.castShadow = true;
        this.tempWall.receiveShadow = true;
        this.scene.add(this.tempWall);
    }

    updateBuild(position) {
        if (!this.isBuilding || !this.tempWall) return;

        const endPoint = position.clone();
        endPoint.y = 0;

        // Вычисляем расстояние и угол
        const delta = new THREE.Vector3().subVectors(endPoint, this.startPoint);
        const length = Math.sqrt(delta.x * delta.x + delta.z * delta.z);
        const angle = Math.atan2(delta.x, delta.z);

        // Обновляем временную стену
        this.tempWall.scale.set(1, 1, 1);
        this.tempWall.position.x = this.startPoint.x + delta.x / 2;
        this.tempWall.position.z = this.startPoint.z + delta.z / 2;
        this.tempWall.position.y = 1.25; // Половина высоты
        this.tempWall.scale.set(0.2, 2.5, length);
        this.tempWall.rotation.y = angle;
    }

    finishBuild(options = {}) {
        if (!this.isBuilding || !this.tempWall) return;

        const height = options.height || 2.5;
        const color = options.color || 0xaaccff;

        // Создаем финальную стену
        const geometry = new THREE.BoxGeometry(0.2, height, this.tempWall.scale.z);
        const material = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.6,
            metalness: 0.1
        });
        const wall = new THREE.Mesh(geometry, material);
        wall.position.copy(this.tempWall.position);
        wall.position.y = height / 2;
        wall.rotation.copy(this.tempWall.rotation);
        wall.castShadow = true;
        wall.receiveShadow = true;
        
        this.scene.add(wall);
        this.walls.push(wall);

        // Удаляем временную стену
        this.scene.remove(this.tempWall);
        this.tempWall = null;
        this.isBuilding = false;

        return wall;
    }

    cancelBuild() {
        if (this.tempWall) {
            this.scene.remove(this.tempWall);
            this.tempWall = null;
        }
        this.isBuilding = false;
    }
}

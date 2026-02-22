import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { WallBuilder } from './builder.js';
import { catalog, getAllItems } from './catalog.js';

// --- Инициализация сцены ---
const canvas = document.getElementById('canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x080814);
scene.fog = new THREE.Fog(0x080814, 20, 50);

// --- Камера с физическими параметрами ---
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(15, 8, 20);
camera.lookAt(0, 2, 0);

// --- Рендерер с максимальным качеством ---
const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    antialias: true,
    powerPreference: "high-performance",
    stencil: false,
    depth: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.outputEncoding = THREE.sRGBEncoding;

// --- Пост-обработка (Bloom эффект) ---
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.1;
bloomPass.strength = 0.6;
bloomPass.radius = 0.5;

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// --- Управление ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2.2;
controls.minDistance = 5;
controls.maxDistance = 30;
controls.target.set(0, 2, 0);

// --- Освещение мирового класса ---

// Основной направленный свет (солнце)
const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
sunLight.position.set(10, 20, 5);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 4096;
sunLight.shadow.mapSize.height = 4096;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 50;
sunLight.shadow.camera.left = -15;
sunLight.shadow.camera.right = 15;
sunLight.shadow.camera.top = 15;
sunLight.shadow.camera.bottom = -15;
sunLight.shadow.bias = -0.0001;
scene.add(sunLight);

// Заполняющий свет (окружение)
const fillLight1 = new THREE.PointLight(0x4466aa, 0.8);
fillLight1.position.set(-5, 5, 10);
scene.add(fillLight1);

const fillLight2 = new THREE.PointLight(0xaa6644, 0.5);
fillLight2.position.set(8, 3, -5);
scene.add(fillLight2);

// Ambient с текстурой окружения
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);

// Добавляем звезды/окружение для красоты
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 2000;
const starsPositions = new Float32Array(starsCount * 3);
for (let i = 0; i < starsCount * 3; i += 3) {
    starsPositions[i] = (Math.random() - 0.5) * 200;
    starsPositions[i+1] = (Math.random() - 0.5) * 200;
    starsPositions[i+2] = (Math.random() - 0.5) * 200 - 50;
}
starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
const starsMaterial = new THREE.PointsMaterial({color: 0x88aaff, size: 0.1});
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// --- Пол (большая площадь) ---
const groundGeometry = new THREE.CircleGeometry(50, 64);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2a2a3a,
    roughness: 0.7,
    metalness: 0.1,
    emissive: new THREE.Color(0x111122)
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// Сетка для ориентации
const gridHelper = new THREE.GridHelper(100, 40, 0xffaa88, 0x334466);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// --- Система строительства ---
const builder = new WallBuilder(scene);

// --- Состояние приложения ---
let selectedItem = null;
let placedItems = [];
let currentMode = 'place'; // 'place' или 'build'
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
let intersectionPoint = new THREE.Vector3();

// --- Загрузка каталога в UI ---
function loadCatalog() {
    const grid = document.getElementById('items-grid');
    const allItems = getAllItems();
    
    allItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.id = item.id;
        card.dataset.category = item.category;
        card.innerHTML = `
            <div class="item-icon">${item.icon}</div>
            <div class="item-name">${item.name}</div>
        `;
        card.addEventListener('click', () => {
            document.querySelectorAll('.item-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedItem = item;
        });
        grid.appendChild(card);
    });
    
    document.getElementById('total-items').textContent = allItems.length;
}

// --- Фильтрация каталога ---
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const category = btn.dataset.category;
        const items = document.querySelectorAll('.item-card');
        
        items.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// --- Поиск ---
document.getElementById('search-input').addEventListener('input', (e) => {
    const search = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.item-card');
    
    items.forEach(item => {
        const name = item.querySelector('.item-name').textContent.toLowerCase();
        if (name.includes(search)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
});

// --- Переключение режимов ---
document.getElementById('mode-place').addEventListener('click', () => {
    currentMode = 'place';
    document.getElementById('mode-place').classList.add('active');
    document.getElementById('mode-build').classList.remove('active');
    document.getElementById('build-controls').style.display = 'none';
    document.getElementById('place-controls').style.display = 'block';
    builder.cancelBuild();
});

document.getElementById('mode-build').addEventListener('click', () => {
    currentMode = 'build';
    document.getElementById('mode-build').classList.add('active');
    document.getElementById('mode-place').classList.remove('active');
    document.getElementById('build-controls').style.display = 'block';
    document.getElementById('place-controls').style.display = 'none';
});

// --- Построить стену (кнопка) ---
document.getElementById('build-wall').addEventListener('click', () => {
    // Создаем стену в центре камеры
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();
    
    const position = camera.position.clone().add(direction.multiplyScalar(5));
    position.y = 0;
    
    const length = parseFloat(document.getElementById('wall-length').value);
    const height = parseFloat(document.getElementById('wall-height').value);
    const color = document.getElementById('wall-color').value;
    
    const wallGeo = new THREE.BoxGeometry(0.2, height, length);
    const wallMat = new THREE.MeshStandardMaterial({ color: color });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.copy(position);
    wall.position.y = height / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    
    scene.add(wall);
    placedItems.push(wall);
    updateStats();
});

// --- Применить свойства к выбранному предмету ---
document.getElementById('apply-props').addEventListener('click', () => {
    // Здесь можно реализовать изменение свойств последнего размещенного предмета
});

// --- Обработка кликов для размещения ---
renderer.domElement.addEventListener('click', (event) => {
    if (currentMode === 'place' && selectedItem) {
        // Получаем позицию под курсором
        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
            // Создаем предмет (для демо используем простую геометрию)
            const color = document.getElementById('item-color').value;
            const scale = parseFloat(document.getElementById('item-scale').value);
            
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: color });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(intersectionPoint);
            mesh.position.y = 0.5;
            mesh.scale.set(scale, scale, scale);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            scene.add(mesh);
            placedItems.push(mesh);
            updateStats();
        }
    }
});

// --- Обработка движения мыши для строительства ---
renderer.domElement.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
        if (currentMode === 'build') {
            if (builder.isBuilding) {
                builder.updateBuild(intersectionPoint);
            }
        }
    }
});

// --- Начало строительства (зажатие мыши) ---
renderer.domElement.addEventListener('mousedown', (event) => {
    if (currentMode === 'build' && event.button === 0) {
        mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
            builder.startBuild(intersectionPoint);
        }
    }
});

// --- Завершение строительства ---
renderer.domElement.addEventListener('mouseup', (event) => {
    if (currentMode === 'build' && builder.isBuilding) {
        const options = {
            height: parseFloat(document.getElementById('wall-height').value),
            color: document.getElementById('wall-color').value
        };
        const wall = builder.finishBuild(options);
        if (wall) {
            placedItems.push(wall);
            updateStats();
        }
    }
});

// --- Обновление статистики ---
function updateStats() {
    document.getElementById('total-items').textContent = placedItems.length;
    // Здесь можно добавить подсчет полигонов
}

// --- FPS счетчик ---
let lastTime = performance.now();
let frames = 0;

function updateFPS() {
    frames++;
    const now = performance.now();
    const delta = now - lastTime;
    
    if (delta >= 1000) {
        const fps = Math.round((frames * 1000) / delta);
        document.getElementById('fps-counter').textContent = fps;
        frames = 0;
        lastTime = now;
    }
}

// --- Анимация ---
function animate() {
    requestAnimationFrame(animate);
    
    // Вращаем звезды
    stars.rotation.y += 0.0001;
    
    controls.update();
    composer.render();
    updateFPS();
}

// --- Resize handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// --- Telegram Integration ---
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// --- Инициализация ---
loadCatalog();
animate();
updateStats();

console.log('3D Architect Dream запущен!');

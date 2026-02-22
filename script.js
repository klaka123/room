import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// --- Инициализация ---
const canvas = document.getElementById('canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111122); // Глубокий синеватый цвет фона

// --- Камера (вид от первого лица, но с возможностью вращения) ---
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(8, 5, 12);
camera.lookAt(0, 2, 0);

// --- Рендерер (для 3D) ---
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Ограничим для производительности, но можно убрать min для ультра-качества
renderer.shadowMap.enabled = true; // ВКЛЮЧАЕМ ТЕНИ (must have для реализма)
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Мягкие тени
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Киношная цветокоррекция
renderer.toneMappingExposure = 1.2;

// --- Рендерер для 2D текста (CSS2DRenderer) ---
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.left = '0px';
labelRenderer.domElement.style.pointerEvents = 'none'; // Текст не мешает нажатиям
document.body.appendChild(labelRenderer.domElement);

// --- ОрбитКонтрол (управление мышью) ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Плавность
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2; // Не даем уйти под пол
controls.enableZoom = true;
controls.autoRotate = false;
controls.target.set(0, 2, 0);
controls.maxDistance = 20;

// --- Свет (основа качественной картинки) ---

// 1. Основной направленный свет (имитация солнца/окна)
const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.5);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
dirLight.receiveShadow = true;
dirLight.shadow.mapSize.width = 2048; // Качество теней
dirLight.shadow.mapSize.height = 2048;
const d = 10;
dirLight.shadow.camera.left = -d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = -d;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 15;
dirLight.shadow.bias = -0.0005;
scene.add(dirLight);

// 2. Заполняющий свет (снизу и сзади, чтобы убрать черноту)
const fillLight = new THREE.PointLight(0x4466aa, 0.5);
fillLight.position.set(-3, 1, 5);
scene.add(fillLight);

// 3. Мягкий свет сверху (ambient)
const ambientLight = new THREE.AmbientLight(0x404060); // Цветной ambient для настроения
scene.add(ambientLight);

// Визуализация источника света (для красоты - невидимая сфера не нужна, просто лампочка)
// Но можно добавить вспомогательные объекты позже.

// --- Пол и стены (основа комнаты) ---

// Пол
const floorGeometry = new THREE.CircleGeometry(10, 32);
const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a3f5a,
    roughness: 0.4,
    metalness: 0.1,
    emissive: new THREE.Color(0x000022)
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;
floor.castShadow = false;
scene.add(floor);

// Разметка на полу (плитка/паркет) для красоты
const gridHelper = new THREE.GridHelper(20, 20, 0xffaa88, 0x444466);
gridHelper.position.y = 0.01; // Чуть выше пола, чтобы не мерцало
scene.add(gridHelper);

// Небольшая стена или колонна для фона
const wallMat = new THREE.MeshStandardMaterial({ color: 0x5a5f7a, roughness: 0.6, emissive: new THREE.Color(0x111122) });
const pillar = new THREE.Mesh(new THREE.BoxGeometry(1, 4, 1), wallMat);
pillar.position.set(-4, 2, -3);
pillar.castShadow = true;
pillar.receiveShadow = true;
scene.add(pillar);

// --- Мебель (предметы интерьера) ---
// Создадим фабрику объектов, чтобы легко добавлять новые

function createChair(x, z, color = 0xc47e5a) {
    const group = new THREE.Group();

    // Сиденье
    const seatMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.3 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.2), seatMat);
    seat.position.y = 0.5;
    seat.castShadow = true;
    seat.receiveShadow = true;
    group.add(seat);

    // Спинка
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.2), seatMat);
    back.position.set(0, 1.1, -0.6);
    back.castShadow = true;
    back.receiveShadow = true;
    group.add(back);

    // Ножки (металлик)
    const legMat = new THREE.MeshStandardMaterial({ color: 0xccccdd, roughness: 0.2, metalness: 0.8 });
    for (let i = -0.4; i <= 0.4; i+=0.8) {
        for (let j = -0.4; j <= 0.4; j+=0.8) {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5), legMat);
            leg.position.set(i, 0.25, j);
            leg.castShadow = true;
            leg.receiveShadow = true;
            group.add(leg);
        }
    }

    group.position.set(x, 0, z);
    return group;
}

function createLamp(x, z) {
    const group = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xeeddcc, roughness: 0.3, metalness: 0.7 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xffeedd, roughness: 0.1, metalness: 0.0, emissive: new THREE.Color(0x442200) });

    // Столб
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 2.5), metalMat);
    pole.position.y = 1.25;
    pole.castShadow = true;
    pole.receiveShadow = true;
    group.add(pole);

    // Абажур (низ)
    const shadeBase = new THREE.Mesh(new THREE.ConeGeometry(0.8, 0.4, 16), glassMat);
    shadeBase.position.y = 2.5;
    shadeBase.castShadow = true;
    shadeBase.receiveShadow = true;
    group.add(shadeBase);

    // Лампочка (светящаяся)
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xffaa55, emissive: new THREE.Color(0xff8800) });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16), bulbMat);
    bulb.position.y = 2.5;
    bulb.castShadow = true;
    bulb.receiveShadow = true;
    group.add(bulb);

    // Добавим точечный свет от лампы (чтобы светила реально)
    const pointLight = new THREE.PointLight(0xffaa66, 1, 5);
    pointLight.position.set(0, 2.5, 0);
    group.add(pointLight);

    group.position.set(x, 0, z);
    return group;
}

// Добавляем стартовые предметы
const chair1 = createChair(1, 1, 0xb86f56);
scene.add(chair1);
const chair2 = createChair(-1, 2, 0x6f8b56);
scene.add(chair2);
const lamp1 = createLamp(2, -1);
scene.add(lamp1);

// Счетчик предметов
const itemCountSpan = document.getElementById('item-count');
let itemCount = 3;

// --- Обработчики кнопок (добавление новых предметов) ---
document.getElementById('add-chair').addEventListener('click', () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3 + Math.random() * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const newChair = createChair(x, z, Math.random() * 0xffffff);
    scene.add(newChair);
    itemCount++;
    itemCountSpan.textContent = itemCount;
});

document.getElementById('add-lamp').addEventListener('click', () => {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2 + Math.random() * 3;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const newLamp = createLamp(x, z);
    scene.add(newLamp);
    itemCount++;
    itemCountSpan.textContent = itemCount;
});

// --- Вспомогательные элементы (CSS лейблы для предметов - не обязательно, но красиво) ---
// Создадим лейбл "Новинка" для новых предметов? Пока пропустим.

// --- Анимация ---
function animate() {
    requestAnimationFrame(animate);

    // Плавное управление
    controls.update();

    // Рендерим основную сцену
    renderer.render(scene, camera);

    // Рендерим CSS лейблы (если будут)
    labelRenderer.render(scene, camera);
}

animate();

// --- Адаптация под размер окна ---
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Интеграция с Telegram ---
const tg = window.Telegram.WebApp;
tg.expand(); // Разворачиваем на весь экран
tg.enableClosingConfirmation(); // Спрашиваем при закрытии
tg.ready(); // Говорим, что приложение готово

console.log('Telegram Web App initialized', tg.initDataUnsafe);

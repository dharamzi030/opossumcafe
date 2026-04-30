import * as THREE from 'three';

// ===== Constants & Config =====
const COLORS = {
    bg: 0x7B9EA6,
    counter: 0x8B6B4A,
    opossum: 0x888888,
    opossumLight: 0xCCCCCC,
    nose: 0xFFB6C1,
    coffee: 0x4B3621,
    water: 0x99DDFF,
    syrup: 0xFFD700,
    milk: 0xFFFFFF,
    trash: 0x222222
};

const ITEMS = [
    { name: 'Coffee Machine', id: 'coffee', x: -5, color: COLORS.coffee, description: '에스프레소' },
    { name: 'Coffee Cup', id: 'cup', x: -2.5, color: 0xFFFFFF, description: '컵' },
    { name: 'Water', id: 'water', x: 0.5, color: COLORS.water, description: '물' },
    { name: 'Syrup', id: 'syrup', x: 2.5, color: COLORS.syrup, description: '시럽' },
    { name: 'Milk', id: 'milk', x: 4.5, color: COLORS.milk, description: '우유' },
];

// ===== Scene Setup =====
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.bg);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 4, 10);
camera.lookAt(0, 2, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

// ===== Lights =====
const ambientLight = new THREE.AmbientLight(0xfff8f0, 1.4);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff, 2.5);
spotLight.position.set(5, 10, 5);
spotLight.castShadow = true;
scene.add(spotLight);

const fillLight = new THREE.DirectionalLight(0xffeedd, 1.0);
fillLight.position.set(-8, 6, 4);
scene.add(fillLight);

// ===== Counter =====
const counterGeo = new THREE.BoxGeometry(30, 1, 5);
const counterMat = new THREE.MeshStandardMaterial({ color: COLORS.counter });
const counter = new THREE.Mesh(counterGeo, counterMat);
counter.position.y = 0.5;
counter.receiveShadow = true;

// ===== Bench (behind counter, where opossum stands) =====
const benchGeo = new THREE.BoxGeometry(26, 0.3, 1.5);
const benchMat = new THREE.MeshStandardMaterial({ color: 0xA0784A });
const bench = new THREE.Mesh(benchGeo, benchMat);
bench.position.set(1, 1.65, -2.5);
bench.receiveShadow = true;

// cafeGroup — all cafe objects toggled together
const cafeGroup = new THREE.Group();
scene.add(cafeGroup);
cafeGroup.add(counter);
cafeGroup.add(bench);

// Bench legs
[-11, 11].forEach(x => {
    const legGeo = new THREE.BoxGeometry(0.3, 0.6, 0.3);
    const leg = new THREE.Mesh(legGeo, benchMat);
    leg.position.set(x, 1.35, -2.5);
    cafeGroup.add(leg);
});

// ===== Interactive Objects =====
const interactiveObjects = [];

function createCoffeeMachine(x) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 1.5), new THREE.MeshStandardMaterial({ color: 0xAAAAAA }));
    body.position.y = 1.25 + 1; // On counter
    group.add(body);
    
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 8), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    handle.rotation.z = Math.PI/2;
    handle.position.set(0.8, 1.8 + 1, 0.5);
    group.add(handle);

    group.position.x = x;
    group.userData = { id: 'coffee' };
    return group;
}

function createCup(x) {
    const group = new THREE.Group();
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.8, 32), new THREE.MeshStandardMaterial({ color: 0xEEEEEE }));
    cup.position.y = 0.4 + 1;
    group.add(cup);
    
    // Liquid inside the cup
    const liquidGeo = new THREE.CylinderGeometry(0.35, 0.28, 0.1, 32);
    const liquidMat = new THREE.MeshStandardMaterial({ color: COLORS.coffee, transparent: true, opacity: 0 });
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = 0.1 + 1;
    liquid.name = 'liquid';
    group.add(liquid);

    group.position.x = x;
    group.userData = { id: 'cup' };
    return group;
}

function createBottle(x, color, id) {
    const group = new THREE.Group();
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.2, 16), new THREE.MeshStandardMaterial({ color: color, transparent: true, opacity: 0.8 }));
    bottle.position.y = 0.6 + 1;
    group.add(bottle);
    
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0xFFFFFF }));
    cap.position.y = 1.3 + 1;
    group.add(cap);

    group.position.x = x;
    group.userData = { id: id };
    return group;
}

function createTrash(x) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.5, 1.5, 32), new THREE.MeshStandardMaterial({ color: COLORS.trash }));
    body.position.y = 0.75 + 1;
    group.add(body);
    
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.1, 32), new THREE.MeshStandardMaterial({ color: COLORS.trash }));
    lid.position.y = 1.55 + 1;
    group.add(lid);

    group.position.x = x;
    group.userData = { id: 'trash' };
    return group;
}

// Add objects to scene
const coffeeMachine = createCoffeeMachine(ITEMS[0].x);
const mainCup = createCup(ITEMS[1].x);
const waterBottle = createBottle(ITEMS[2].x, COLORS.water, 'water');
const syrupBottle = createBottle(ITEMS[3].x, COLORS.syrup, 'syrup');
const milkCarton = new THREE.Group();
const milkMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.6), new THREE.MeshStandardMaterial({ color: COLORS.milk }));
milkMesh.position.y = 0.6 + 1;
milkCarton.add(milkMesh);
milkCarton.position.x = ITEMS[4].x;
milkCarton.userData = { id: 'milk' };

const trashCan = null; // removed

[coffeeMachine, mainCup, waterBottle, syrupBottle, milkCarton].forEach(obj => {
    cafeGroup.add(obj);
    interactiveObjects.push(obj);
});

// ===== Opossum Character =====
function createOpossum() {
    const group = new THREE.Group();

    // Body — faces +Z (toward camera)
    const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 32, 32),
        new THREE.MeshStandardMaterial({ color: COLORS.opossum })
    );
    body.scale.set(1.0, 1.0, 1.2);
    body.position.y = 1.6 + 1;
    group.add(body);

    // Belly (bright patch on front)
    const belly = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xC8C0B0 })
    );
    belly.scale.set(0.85, 0.85, 0.4);
    belly.position.set(0, 1.52 + 1, 0.6);
    group.add(belly);

    // Head — pushed forward toward camera (+Z)
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshStandardMaterial({ color: COLORS.opossum })
    );
    head.position.set(0, 1.9 + 1, 0.6);
    group.add(head);

    // Snout
    const snout = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xC8C0B0 })
    );
    snout.scale.set(0.9, 0.75, 1.0);
    snout.position.set(0, 1.78 + 1, 1.08);
    group.add(snout);

    // Nose (pink)
    const nose = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 8, 8),
        new THREE.MeshStandardMaterial({ color: COLORS.nose })
    );
    nose.position.set(0, 1.8 + 1, 1.24);
    group.add(nose);

    // Eyes — pushed forward to surface of head, small black
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x111111, emissiveIntensity: 0.8 });
    [-0.22, 0.22].forEach(xOff => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), eyeMat);
        eye.position.set(xOff, 2.0 + 1, 1.08);  // z=1.08 = 머리 표면 바깥쪽
        group.add(eye);
    });

    // Ears — on top of head, separated left/right
    const earMat = new THREE.MeshStandardMaterial({ color: 0x4A3535 });
    const earInnerMat = new THREE.MeshStandardMaterial({ color: COLORS.nose });
    [-0.28, 0.28].forEach(xOff => {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), earMat);
        ear.position.set(xOff, 2.35 + 1, 0.45);
        group.add(ear);
        const earInner = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), earInnerMat);
        earInner.position.set(xOff, 2.35 + 1, 0.54);
        group.add(earInner);
    });

    // Stubby legs
    const legMat = new THREE.MeshStandardMaterial({ color: COLORS.opossum });
    const pawMat = new THREE.MeshStandardMaterial({ color: 0xC8B8A8 });
    [
        { x: 0.35, z: 0.3 }, { x: 0.35, z: -0.3 },
        { x: -0.35, z: 0.3 }, { x: -0.35, z: -0.3 }
    ].forEach(pos => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.3, 12), legMat);
        leg.position.set(pos.x, 1.05 + 1, pos.z);
        group.add(leg);
        const paw = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), pawMat);
        paw.scale.set(1.1, 0.7, 1.2);
        paw.position.set(pos.x, 0.9 + 1, pos.z);
        group.add(paw);
    });

    // Tail — behind the body (-Z)
    const tailMat = new THREE.MeshStandardMaterial({ color: 0xC8C0B0 });
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.9, 8), tailMat);
    tail.rotation.x = Math.PI / 3.5;
    tail.position.set(0, 1.5 + 1, -0.7);
    group.add(tail);

    // ===== Phone group (hidden, shown on game over) =====
    const phoneGroup = new THREE.Group();
    phoneGroup.visible = false;
    phoneGroup.name = 'phoneGroup';

    // Phone body (horizontal/landscape)
    const phoneBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.07, 0.78),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    phoneBody.position.set(0, 1.72 + 1, 0.95);
    phoneGroup.add(phoneBody);

    // Screen
    const screenMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.38, 0.66),
        new THREE.MeshStandardMaterial({ color: 0x55AAFF, emissive: 0x2255CC, emissiveIntensity: 0.6 })
    );
    screenMesh.rotation.x = -Math.PI / 2;
    screenMesh.position.set(0, 1.76 + 1, 0.95);
    phoneGroup.add(screenMesh);

    // Arms holding phone
    const armMat = new THREE.MeshStandardMaterial({ color: COLORS.opossum });
    const pawHoldMat = new THREE.MeshStandardMaterial({ color: 0xC8B8A8 });
    [-1, 1].forEach(side => {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.65, 8), armMat);
        arm.rotation.z = side * Math.PI / 2.2;
        arm.rotation.x = 0.5;
        arm.position.set(side * 0.52, 1.6 + 1, 0.72);
        phoneGroup.add(arm);
        const paw = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), pawHoldMat);
        paw.position.set(side * 0.78, 1.73 + 1, 0.92);
        phoneGroup.add(paw);
    });

    group.add(phoneGroup);

    group.position.set(0, 0, 0);
    return group;
}

const opossum = createOpossum();
const OPOSSUM_BASE_Y = -0.1;
const OPOSSUM_Z = -2.5;
opossum.position.set(0, OPOSSUM_BASE_Y, OPOSSUM_Z);
scene.add(opossum);

// ===== Clock (canvas texture) =====
const GAME_DURATION = 30;
let gameStartTime = null;
let gameOver = false;

const clockCanvas = document.createElement('canvas');
clockCanvas.width = 256; clockCanvas.height = 256;
const clockCtx = clockCanvas.getContext('2d');
const clockTexture = new THREE.CanvasTexture(clockCanvas);

function drawClock(progress) {
    const ctx = clockCtx;
    const cx = 128, cy = 128, r = 108;
    ctx.clearRect(0, 0, 256, 256);

    // White circle bg only (no square fill)
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Red sector: 9 o'clock (π) → clockwise 270° → 6 o'clock
    const startAngle = Math.PI;
    const totalAngle = 3 * Math.PI / 2;
    const remaining = startAngle + totalAngle * (1 - progress);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r - 4, startAngle, remaining, false);
    ctx.closePath();
    ctx.fillStyle = '#DD2020';
    ctx.fill();

    // Black border
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 14;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#111111';
    ctx.fill();

    clockTexture.needsUpdate = true;
}
drawClock(0);

const clockMesh = new THREE.Mesh(
    new THREE.CircleGeometry(1.1, 64),
    new THREE.MeshBasicMaterial({ map: clockTexture, transparent: true, alphaTest: 0.1 })
);
clockMesh.position.set(0, 3.8, -3.8);
cafeGroup.add(clockMesh);

// ===== Logic State =====
let currentIngredients = [];
let targetX = 0;
let isMoving = false;
let currentOrder = null;
let money = 0;
let happiness = 100;
let coffeeCount = 0;

const recipes = [
    { name: '아메리카노', ingredients: ['coffee', 'water'], emoji: '☕', price: 1000 },
    { name: '카페라떼', ingredients: ['coffee', 'milk'], emoji: '🥛', price: 1200 },
    { name: '바닐라 라떼', ingredients: ['coffee', 'milk', 'syrup'], emoji: '🍯', price: 1500 },
    { name: '에스프레소', ingredients: ['coffee'], emoji: '🔥', price: 500 }
];

// ===== UI Elements =====
const orderText = document.getElementById('order-text');
const ingredientList = document.getElementById('ingredient-list');
const serveBtn = document.getElementById('serve-btn');
const resetBtn = document.getElementById('reset-btn');
const feedback = document.getElementById('feedback-message');
const loader = document.getElementById('loading-screen');
const moneyDisplay = document.getElementById('money-display');
const happinessBar = document.getElementById('happiness-bar');
const happinessValue = document.getElementById('happiness-value');
const recipeBtn = document.getElementById('recipe-btn');
const recipeModal = document.getElementById('recipe-modal');
const recipeCloseBtn = document.getElementById('recipe-close-btn');
const recipeListEl = document.getElementById('recipe-list');

// Populate recipe list
const ingredientNames = { coffee: '에스프레소', water: '물', milk: '우유', syrup: '시럽' };
recipes.forEach(r => {
    const li = document.createElement('li');
    li.innerHTML = `
        <span class="recipe-emoji">${r.emoji}</span>
        <div class="recipe-info">
            <span class="recipe-name">${r.name}</span>
            <span class="recipe-ingredients">${r.ingredients.map(i => ingredientNames[i] || i).join(' + ')}</span>
        </div>`;
    recipeListEl.appendChild(li);
});

recipeBtn.addEventListener('click', () => recipeModal.classList.remove('hidden'));
recipeCloseBtn.addEventListener('click', () => recipeModal.classList.add('hidden'));
recipeModal.addEventListener('click', (e) => { if (e.target === recipeModal) recipeModal.classList.add('hidden'); });

// ===== Functions =====
function updateMoney(delta) {
    money += delta;
    moneyDisplay.textContent = `₩ ${money.toLocaleString()}`;
    moneyDisplay.classList.add('money-pop');
    setTimeout(() => moneyDisplay.classList.remove('money-pop'), 400);
}

function updateHappiness(delta) {
    happiness = Math.max(0, Math.min(100, happiness + delta));
    happinessBar.style.width = happiness + '%';
    happinessValue.textContent = happiness + '%';

    // 색상: 높으면 초록, 낮으면 빨강
    if (happiness > 60) {
        happinessValue.style.color = '#6BCB77';
    } else if (happiness > 30) {
        happinessValue.style.color = '#FFD93D';
    } else {
        happinessValue.style.color = '#FF6B6B';
    }

    if (happiness <= 0 && !gameOver) {
        gameOver = true;
        triggerGameOver();
    }
}

function generateOrder() {
    currentOrder = recipes[Math.floor(Math.random() * recipes.length)];
    orderText.textContent = `"${currentOrder.name} 한 잔 주세요!" ${currentOrder.emoji}`;
    serveBtn.classList.add('hidden');
}

function updateIngredientUI() {
    ingredientList.innerHTML = '';
    if (currentIngredients.length === 0) {
        ingredientList.innerHTML = '<li class="empty">비어 있음</li>';
    } else {
        currentIngredients.forEach(ing => {
            const item = ITEMS.find(i => i.id === ing);
            const li = document.createElement('li');
            li.textContent = item.description;
            ingredientList.appendChild(li);
        });
    }
    
    // Show/hide serve button
    if (currentIngredients.length > 0) {
        serveBtn.classList.remove('hidden');
    } else {
        serveBtn.classList.add('hidden');
    }
    
    // Update liquid in 3D cup
    const liquid = mainCup.getObjectByName('liquid');
    if (liquid) {
        const fill = currentIngredients.length / 4;
        liquid.scale.set(1, Math.max(0.1, fill * 8), 1);
        liquid.position.y = (fill * 0.4) + 1.1;
        liquid.material.opacity = fill > 0 ? 0.9 : 0;
        
        // Color liquid based on last ingredient
        if (currentIngredients.length > 0) {
            const lastIng = currentIngredients[currentIngredients.length - 1];
            liquid.material.color.set(ITEMS.find(i => i.id === lastIng).color);
        }
    }
}

function showFeedback(text) {
    feedback.textContent = text;
    feedback.classList.remove('hidden');
    feedback.classList.add('animate-pop');
    setTimeout(() => {
        feedback.classList.add('hidden');
        feedback.classList.remove('animate-pop');
    }, 800);
}

function resetCup() {
    currentIngredients = [];
    updateIngredientUI();
    showFeedback('🗑️ 버림');
}

function serveOrder() {
    const isCorrect = JSON.stringify(currentIngredients.sort()) === JSON.stringify(currentOrder.ingredients.sort());

    coffeeCount++;
    updateHappiness(-5);

    if (isCorrect) {
        showFeedback(`✨ +₩${currentOrder.price.toLocaleString()}`);
        updateMoney(currentOrder.price);
        orderText.textContent = '"감사합니다! 정말 맛있어요!" 😊';
        setTimeout(generateOrder, 1500);
    } else {
        showFeedback('❌ -₩100');
        updateMoney(-100);
        orderText.textContent = '"어... 제가 주문한 게 아닌데요?" 🤨';
        setTimeout(generateOrder, 1500);
    }

    currentIngredients = [];
    updateIngredientUI();
}

// ===== Interaction =====
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    if (gameOver) return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects, true);

    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.id) {
            obj = obj.parent;
        }
        
        const id = obj.userData.id;
        if (id) {
            // Move Opossum
            targetX = obj.position.x;
            isMoving = true;
            
            // Interaction logic
            if (id === 'trash') {
                resetCup();
            } else if (id === 'cup') {
                // Clicking cup might do nothing or show info
            } else {
                if (currentIngredients.length < 4) {
                    currentIngredients.push(id);
                    updateIngredientUI();
                    showFeedback(`+ ${ITEMS.find(i => i.id === id).description}`);
                } else {
                    showFeedback('⚠️ 컵이 꽉 찼어요!');
                }
            }
        }
    }
});

function triggerGameOver() {
    // 행복도 0% → 게임 오버 화면
    isMoving = false;
    opossum.rotation.y = 0;
    document.getElementById('go-day').textContent = `${dayCount}일차`;
    document.getElementById('go-money').textContent = `₩ ${money.toLocaleString()}`;
    document.getElementById('go-count').textContent = `${coffeeCount}잔`;
    document.getElementById('gameover-screen').classList.remove('hidden');
}

function triggerClosing() {
    // 타이머 종료 → 영업 종료 화면 (gameOver는 건드리지 않음)
    isMoving = false;
    opossum.rotation.y = 0;
    document.getElementById('gameover-overlay').classList.remove('hidden');
    document.getElementById('final-money').textContent = `₩ ${money.toLocaleString()}`;
}

function createHomePhone() {
    const group = new THREE.Group();
    group.name = 'homePhone';

    // Phone body — landscape, thin in Z, screen faces +Z (camera)
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.55, 0.82, 0.07),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    body.position.set(0, 1.92 + 1, 1.15);
    group.add(body);

    // Screen facing camera (+Z)
    const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(1.42, 0.70),
        new THREE.MeshStandardMaterial({
            color: 0xAADDFF,
            emissive: 0x55AAFF,
            emissiveIntensity: 1.2
        })
    );
    screen.position.set(0, 1.92 + 1, 1.188);
    group.add(screen);

    // Arms
    const armMat = new THREE.MeshStandardMaterial({ color: COLORS.opossum });
    const pawMat = new THREE.MeshStandardMaterial({ color: 0xC8B8A8 });
    [-1, 1].forEach(side => {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.7, 8), armMat);
        arm.rotation.z = side * Math.PI / 2.3;
        arm.rotation.x = 0.35;
        arm.position.set(side * 0.55, 1.68 + 1, 0.82);
        group.add(arm);
        const paw = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), pawMat);
        paw.position.set(side * 0.82, 1.87 + 1, 1.1);
        group.add(paw);
    });

    return group;
}

let inHomeScene = false;
let dayCount = 1;
const homeSceneObjects = [];

function transitionToHomeScene() {
    document.getElementById('gameover-overlay').classList.add('hidden');
    document.getElementById('order-bubble').classList.add('hidden');
    document.getElementById('status-panel').classList.add('hidden');
    document.getElementById('recipe-btn').classList.add('hidden');
    document.getElementById('bed-btn').classList.remove('hidden');

    cafeGroup.visible = false;
    opossum.visible = false; // 머리 숨기기

    // 카메라: 완전 탑다운
    camera.up.set(0, 0, -1);
    camera.position.set(0, 9, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    scene.background = new THREE.Color(0x050505);

    const addToHome = obj => { scene.add(obj); homeSceneObjects.push(obj); return obj; };

    // 바닥
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40),
        new THREE.MeshStandardMaterial({ color: 0x0A0A0A }));
    floor.rotation.x = -Math.PI / 2;
    addToHome(floor);

    // 폰 (3D)
    const PHONE_W = 5.0, PHONE_D = 2.5, PHONE_Z = -1.25;
    const phoneBody = new THREE.Mesh(
        new THREE.BoxGeometry(PHONE_W + 0.3, 0.1, PHONE_D + 0.3),
        new THREE.MeshStandardMaterial({ color: 0x111111 }));
    phoneBody.position.set(0, 0.05, PHONE_Z);
    addToHome(phoneBody);

    const screenPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(PHONE_W, PHONE_D),
        new THREE.MeshBasicMaterial({ color: 0x0A1628 }));
    screenPlane.rotation.x = -Math.PI / 2;
    screenPlane.position.set(0, 0.11, PHONE_Z);
    addToHome(screenPlane);

    const phoneGlow = new THREE.PointLight(0x4499FF, 6, 10);
    phoneGlow.position.set(0, 3, PHONE_Z);
    addToHome(phoneGlow);

    // 조명
    ambientLight.intensity = 0.5;
    ambientLight.color.set(0x334466);
    spotLight.visible = false;
    fillLight.visible = false;

    // ===== 팔: 아래쪽이 바깥쪽, 위쪽이 안쪽(폰) =====
    // addArm(start=아래쪽/바깥쪽, end=위쪽/폰쪽) — palm은 end에
    const armMat  = new THREE.MeshStandardMaterial({ color: COLORS.opossum });
    const palmMat = new THREE.MeshStandardMaterial({ color: COLORS.nose });

    function addArm(sx, sy, sz, ex, ey, ez) {
        const start = new THREE.Vector3(sx, sy, sz);
        const end   = new THREE.Vector3(ex, ey, ez);
        const mid   = start.clone().add(end).multiplyScalar(0.5);
        const len   = start.distanceTo(end);
        const dir   = end.clone().sub(start).normalize();

        const arm = new THREE.Mesh(
            new THREE.CylinderGeometry(0.55, 0.50, len, 20), armMat);
        arm.position.copy(mid);
        arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        addToHome(arm);

        // 손바닥
        const palm = new THREE.Mesh(
            new THREE.SphereGeometry(0.68, 16, 12), palmMat);
        palm.scale.set(1.1, 0.35, 1.1);
        palm.position.copy(end);
        addToHome(palm);

        // 손가락 3개 — 폰 안쪽 방향으로
        const angleXZ = Math.atan2(ex - sx, ez - sz);
        [-0.5, 0, 0.5].forEach(offset => {
            const finger = new THREE.Mesh(
                new THREE.SphereGeometry(0.25, 10, 10), palmMat);
            finger.position.set(
                ex + Math.sin(angleXZ + offset) * 0.58,
                0.18,
                ez + Math.cos(angleXZ + offset) * 0.58 - 0.1);
            addToHome(finger);
        });
    }

    // 왼팔: 아래 바깥쪽(-4.5, z=3.5) → 폰 왼쪽(-2.55, z=PHONE_Z)
    addArm(-4.5, 2.2, 3.5,  -2.55, 0.15, PHONE_Z);
    // 오른팔: 아래 바깥쪽(+4.5, z=3.5) → 폰 오른쪽(+2.55, z=PHONE_Z)
    addArm( 4.5, 2.2, 3.5,   2.55, 0.15, PHONE_Z);

    // 폰 HTML 패널 위치
    const sw = window.innerWidth, sh = window.innerHeight;
    const toScreen = (wx, wy, wz) => {
        const v = new THREE.Vector3(wx, wy, wz).project(camera);
        return { x: (v.x + 1) / 2 * sw, y: (-v.y + 1) / 2 * sh };
    };
    const tl = toScreen(-PHONE_W / 2, 0.11, PHONE_Z - PHONE_D / 2);
    const br = toScreen( PHONE_W / 2, 0.11, PHONE_Z + PHONE_D / 2);

    const phoneUI = document.getElementById('phone-ui');
    phoneUI.style.position  = 'fixed';
    phoneUI.style.left      = Math.round(tl.x) + 'px';
    phoneUI.style.top       = Math.round(tl.y) + 'px';
    phoneUI.style.width     = Math.round(br.x - tl.x) + 'px';
    phoneUI.style.height    = Math.round(br.y - tl.y) + 'px';
    phoneUI.style.bottom    = 'auto';
    phoneUI.style.transform = 'none';
    phoneUI.classList.remove('hidden');

    // 패널 상단 좌/우
    const moneyPanel = document.getElementById('money-panel');
    moneyPanel.style.top = '40px'; moneyPanel.style.left = '40px'; moneyPanel.style.bottom = 'auto';
    const happyPanel = document.getElementById('happiness-panel');
    happyPanel.style.top = '40px'; happyPanel.style.left = 'auto';
    happyPanel.style.right = '40px'; happyPanel.style.bottom = 'auto';

    inHomeScene = true;
}

function returnToCafe() {
    inHomeScene = false;
    dayCount++;
    document.getElementById('day-display').textContent = `${dayCount}일차`;

    // 홈 씬 오브젝트 제거
    homeSceneObjects.forEach(obj => scene.remove(obj));
    homeSceneObjects.length = 0;

    // UI 복원
    document.getElementById('phone-ui').classList.add('hidden');
    document.getElementById('bed-btn').classList.add('hidden');
    document.getElementById('order-bubble').classList.remove('hidden');
    document.getElementById('status-panel').classList.remove('hidden');
    document.getElementById('recipe-btn').classList.remove('hidden');

    // 패널 원래 위치로
    const moneyPanel = document.getElementById('money-panel');
    moneyPanel.style.top = '40px'; moneyPanel.style.left = '40px';
    moneyPanel.style.right = 'auto'; moneyPanel.style.bottom = 'auto';
    const happyPanel = document.getElementById('happiness-panel');
    happyPanel.style.top = '160px'; happyPanel.style.left = '40px';
    happyPanel.style.right = 'auto'; happyPanel.style.bottom = 'auto';

    // 카페 복원
    cafeGroup.visible = true;
    opossum.visible = true;
    opossum.position.set(0, OPOSSUM_BASE_Y, OPOSSUM_Z);
    opossum.rotation.y = 0;

    scene.background = new THREE.Color(COLORS.bg);
    ambientLight.intensity = 1.4;
    ambientLight.color.set(0xfff8f0);
    spotLight.visible = true;
    fillLight.visible = true;

    camera.up.set(0, 1, 0);
    camera.position.set(0, 4, 10);
    camera.lookAt(0, 2, 0);
    camera.updateProjectionMatrix();

    // 타이머·주문 리셋
    gameOver = false;
    gameStartTime = Date.now();
    currentIngredients = [];
    updateIngredientUI();
    generateOrder();
    drawClock(0);
}

serveBtn.addEventListener('click', serveOrder);
resetBtn.addEventListener('click', resetCup);
document.getElementById('confirm-btn').addEventListener('click', transitionToHomeScene);
document.getElementById('restart-btn').addEventListener('click', () => location.reload());
document.getElementById('bed-btn').addEventListener('click', () => {
    document.getElementById('sleep-modal').classList.remove('hidden');
});
document.getElementById('open-cafe-btn').addEventListener('click', () => {
    document.getElementById('sleep-modal').classList.add('hidden');
    returnToCafe();
});

// ===== 가챠 로직 =====
const homeBubbleText = document.getElementById('home-bubble-text');
const homeBubble = document.getElementById('home-bubble');

function showHomeBubble(text) {
    homeBubbleText.textContent = text;
    homeBubble.classList.remove('hidden');
    homeBubble.classList.remove('bubble-pop');
    void homeBubble.offsetWidth; // 강제 reflow → 애니메이션 재시작
    homeBubble.classList.add('bubble-pop');
    clearTimeout(homeBubble._hideTimer);
    homeBubble._hideTimer = setTimeout(() => {
        homeBubble.classList.add('hidden');
        homeBubble.classList.remove('bubble-pop');
    }, 2000);
}

document.getElementById('gacha-btn').addEventListener('click', () => {
    if (!inHomeScene) return;
    if (money < 1000) {
        showHomeBubble('돈이 부족해...');
        return;
    }
    updateMoney(-1000);
    if (Math.random() < 0.03) {
        showHomeBubble('최애캐를 뽑았어! 🎉');
        updateHappiness(50);
    } else {
        showHomeBubble('한번만 더...');
        updateHappiness(-1);
    }
});

// ===== Animation Loop =====
function animate() {
    requestAnimationFrame(animate);
    
    // Clock & Timer
    if (!gameOver && gameStartTime) {
        const elapsed = (Date.now() - gameStartTime) / 1000;
        const progress = Math.min(elapsed / GAME_DURATION, 1);
        drawClock(progress);
        if (progress >= 1) {
            gameOver = true;
            triggerClosing();
        }
    }

    // Opossum Movement
    if (isMoving) {
        const dx = targetX - opossum.position.x;
        if (Math.abs(dx) > 0.1) {
            const speed = 0.2;
            opossum.position.x += Math.sign(dx) * speed;
            opossum.position.z = OPOSSUM_Z;
            opossum.rotation.y = Math.sign(dx) * -0.3;
            // Bobbing animation
            opossum.position.y = OPOSSUM_BASE_Y + Math.sin(Date.now() * 0.01) * 0.12;
        } else {
            isMoving = false;
            opossum.rotation.y = 0;
        }
    } else {
        // Idle bobbing
        opossum.position.y = OPOSSUM_BASE_Y + Math.sin(Date.now() * 0.002) * 0.07;
        opossum.position.z = OPOSSUM_Z;
    }

    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start
document.getElementById('welcome-btn').addEventListener('click', () => {
    document.getElementById('welcome-modal').classList.add('hidden');
    setTimeout(() => {
        loader.classList.add('hidden');
        generateOrder();
        gameStartTime = Date.now();
        animate();
    }, 1500);
    // 로딩 스피너 보여주기
    loader.style.display = 'flex';
});

// 초기엔 로딩화면 숨김 (welcome modal이 먼저)
loader.classList.add('hidden');

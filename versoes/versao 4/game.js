const gridElement = document.getElementById("grid");
const turnIndicator = document.getElementById("turnIndicator");

const selectionScreen = document.getElementById("selection-screen");
const gameScreen = document.getElementById("game-screen");

const team1Select = document.getElementById("team1-select");
const team2Select = document.getElementById("team2-select");

const SIZE = 8;
const MOVE_RANGE = 3;

let currentTurn = 1;
let selectedUnit = null;
let units = [];

const BASE_PATH = "./assets/";

const CLASSES = {
    knight: { name: "Knight", attackRange: 1 },
    archer: { name: "Archer", attackRange: MOVE_RANGE }
};

const ATTRIBUTES = [
    "forca",
    "inteligencia",
    "destreza",
    "vitalidade",
    "sorte",
    "agilidade"
];

let team1Data = [];
let team2Data = [];

/* ========================= */
/* TELA DE CRIAÇÃO */
/* ========================= */

function createSelectionUI() {
    for (let i = 0; i < 4; i++) {
        createCharacter(1, i);
        createCharacter(2, i);
    }
}

function createCharacter(team, index) {

    const container = team === 1 ? team1Select : team2Select;

    const characterData = {
        class: "knight",
        points: 100,
        attributes: {
            forca: 0,
            inteligencia: 0,
            destreza: 0,
            vitalidade: 0,
            sorte: 0,
            agilidade: 0
        }
    };

    if (team === 1) team1Data.push(characterData);
    else team2Data.push(characterData);

    const card = document.createElement("div");
    card.classList.add("char-card");

    card.innerHTML = `
        <h3>Personagem ${index + 1}</h3>
        Classe:
        <select onchange="setClass(${team}, ${index}, this.value)">
            <option value="knight">Knight</option>
            <option value="archer">Archer</option>
        </select>
        <div id="points-${team}-${index}"></div>
        <div id="attributes-${team}-${index}"></div>
        <div id="atk-${team}-${index}"></div>
        <div id="hp-${team}-${index}"></div>
    `;

    container.appendChild(card);
    renderAttributes(team, index);
}

function setClass(team, index, value) {
    if (team === 1) team1Data[index].class = value;
    else team2Data[index].class = value;
}

function renderAttributes(team, index) {

    const data = team === 1 ? team1Data[index] : team2Data[index];
    const container = document.getElementById(`attributes-${team}-${index}`);
    const pointsDisplay = document.getElementById(`points-${team}-${index}`);
    const atkDisplay = document.getElementById(`atk-${team}-${index}`);
    const hpDisplay = document.getElementById(`hp-${team}-${index}`);

    container.innerHTML = "";

    ATTRIBUTES.forEach(attr => {

        const row = document.createElement("div");

        row.innerHTML = `
            ${attr.toUpperCase()}:
            <button onclick="changeAttr(${team}, ${index}, '${attr}', -1)">-</button>
            <span>${data.attributes[attr]}</span>
            <button onclick="changeAttr(${team}, ${index}, '${attr}', 1)">+</button>
        `;

        container.appendChild(row);
    });

    pointsDisplay.innerText = "Pontos restantes: " + data.points;

    const atk = calculateAttack(data.attributes.forca);
    const hp = 100 + (data.attributes.vitalidade * 5);

    atkDisplay.innerText = "ATK: " + atk;
    hpDisplay.innerText = "HP Base: " + hp;
}

function changeAttr(team, index, attr, value) {

    const data = team === 1 ? team1Data[index] : team2Data[index];

    if (value > 0 && data.points <= 0) return;
    if (value < 0 && data.attributes[attr] <= 0) return;

    data.attributes[attr] += value;
    data.points -= value;

    renderAttributes(team, index);
}

function calculateAttack(forca) {
    return forca + Math.floor(forca / 10) * 2;
}

/* ========================= */
/* INICIAR BATALHA */
/* ========================= */

function startGame() {
    selectionScreen.style.display = "none";
    gameScreen.style.display = "block";
    createUnits();
    createGrid();
}

/* ========================= */
/* CRIAR UNIDADES */
/* ========================= */

function createUnits() {

    units = [];

    const blueSprites = ["blue1.png","blue2.png","blue3.png","blue4.png"];
    const redSprites = ["red1.png","red2.png","red3.png","red4.png"];

    for (let i = 0; i < 4; i++) {

        const data = team1Data[i];

        units.push({
            id: units.length,
            team: 1,
            x: i,
            y: 0,
            sprite: BASE_PATH + blueSprites[i],
            attributes: data.attributes,
            class: CLASSES[data.class],
            hp: 100 + (data.attributes.vitalidade * 5),
            maxHp: 100 + (data.attributes.vitalidade * 5),
            hasMoved: false,
            hasAttacked: false
        });
    }

    for (let i = 0; i < 4; i++) {

        const data = team2Data[i];

        units.push({
            id: units.length,
            team: 2,
            x: SIZE - 1 - i,
            y: SIZE - 1,
            sprite: BASE_PATH + redSprites[i],
            attributes: data.attributes,
            class: CLASSES[data.class],
            hp: 100 + (data.attributes.vitalidade * 5),
            maxHp: 100 + (data.attributes.vitalidade * 5),
            hasMoved: false,
            hasAttacked: false
        });
    }
}

/* ========================= */
/* GRID & BATALHA */
/* ========================= */

function createGrid() {

    gridElement.innerHTML = "";

    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {

            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener("click", () => handleClick(x, y));
            gridElement.appendChild(cell);
        }
    }

    render();
}

function render() {

    document.querySelectorAll(".cell").forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove("move-option","attack-option");
    });

    units.forEach(unit => {

        const index = unit.y * SIZE + unit.x;
        const cell = gridElement.children[index];

        const img = document.createElement("img");
        img.src = unit.sprite;
        img.classList.add("unit");

       const hpText = document.createElement("div");
hpText.classList.add("hp-text");
hpText.innerText = `${unit.hp}/${unit.maxHp}`;

// BARRA
const hpBar = document.createElement("div");
hpBar.classList.add("hp-bar");

const hpFill = document.createElement("div");
hpFill.classList.add("hp-fill");
hpFill.style.width = (unit.hp / unit.maxHp) * 100 + "%";

hpBar.appendChild(hpFill);

// ORDEM IMPORTANTE
cell.appendChild(hpText);
cell.appendChild(hpBar);
cell.appendChild(img);
    });

    turnIndicator.innerText = `Turno do Time ${currentTurn}`;

    if (selectedUnit) highlightRanges();
}

function highlightRanges() {

    document.querySelectorAll(".cell").forEach(cell => {

        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);

        const distance =
            Math.abs(selectedUnit.x - x) +
            Math.abs(selectedUnit.y - y);

        const occupied = units.some(u => u.x === x && u.y === y);

        if (!selectedUnit.hasMoved &&
            distance > 0 &&
            distance <= MOVE_RANGE &&
            !occupied) {
            cell.classList.add("move-option");
        }

        if (!selectedUnit.hasAttacked &&
            distance > 0 &&
            distance <= selectedUnit.class.attackRange) {
            cell.classList.add("attack-option");
        }
    });
}

function handleClick(x, y) {

    const clickedUnit = units.find(u => u.x === x && u.y === y);

    if (clickedUnit && clickedUnit.team === currentTurn) {
        selectedUnit = clickedUnit;
        render();
        return;
    }

    if (!selectedUnit) return;

    const distance =
        Math.abs(selectedUnit.x - x) +
        Math.abs(selectedUnit.y - y);

    const target = units.find(u => u.x === x && u.y === y);

    if (
        target &&
        target.team !== currentTurn &&
        !selectedUnit.hasAttacked &&
        distance <= selectedUnit.class.attackRange
    ) {

        if (confirm("Confirmar ataque?")) {

            const atk = calculateAttack(selectedUnit.attributes.forca);
            target.hp -= atk;

            selectedUnit.hasAttacked = true;

            if (target.hp <= 0) {

                const deathX = target.x;
                const deathY = target.y;

                createExplosion(deathX, deathY);

                setTimeout(() => {

                    units = units.filter(u => u.id !== target.id);

                    render();
                    checkVictory();

                }, 400);

            } else {
                render();
            }
        }

        return;
    }

    if (
        !target &&
        !selectedUnit.hasMoved &&
        distance <= MOVE_RANGE
    ) {
        selectedUnit.x = x;
        selectedUnit.y = y;
        selectedUnit.hasMoved = true;
        render();
        return;
    }
}
function endTurn() {

    currentTurn = currentTurn === 1 ? 2 : 1;

    units.forEach(u => {
        if (u.team === currentTurn) {
            u.hasMoved = false;
            u.hasAttacked = false;
        }
    });

    selectedUnit = null;
    render();
}

createSelectionUI();


/* ========================= */
/* EXPLOSÃO */
/* ========================= */

function createExplosion(x, y) {

    const index = y * SIZE + x;
    const cell = gridElement.children[index];

    if (!cell) return;

    const explosion = document.createElement("div");
    explosion.classList.add("explosion");

    explosion.style.position = "absolute";
    explosion.style.top = "0";
    explosion.style.left = "0";

    cell.appendChild(explosion);

    setTimeout(() => {
        if (explosion.parentNode) {
            explosion.parentNode.removeChild(explosion);
        }
    }, 400);
}
/* ========================= */
/* VERIFICAR VITÓRIA */
/* ========================= */

function checkVictory() {

    const team1Alive = units.some(u => u.team === 1);
    const team2Alive = units.some(u => u.team === 2);

    if (!team1Alive || !team2Alive) {

        const winner = team1Alive ? 1 : 2;

        document.getElementById("winner-text").innerText =
            `🏆 Time ${winner} Venceu!`;

        document.getElementById("winner-screen").style.display = "flex";
    }
}

/* ========================= */
/* REINICIAR */
/* ========================= */

function restartGame() {
    location.reload();
}
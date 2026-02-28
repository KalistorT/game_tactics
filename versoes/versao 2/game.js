const gridElement = document.getElementById("grid");
const turnIndicator = document.getElementById("turnIndicator");

const SIZE = 8;
const MOVE_RANGE = 3;
const DAMAGE = 10;

let currentTurn = 1;
let selectedUnit = null;
let selectedTarget = null;
let units = [];

const BASE_PATH = "./assets/";

const CLASSES = {
    knight: {
        name: "Knight",
        type: "melee",
        attackRange: 1
    },
    archer: {
        name: "Archer",
        type: "ranged",
        attackRange: MOVE_RANGE
    }
};

function chooseClass(team, index) {
    const choice = prompt(
        `Time ${team} - Personagem ${index + 1}\nDigite: knight ou archer`
    );

    if (!choice) return CLASSES.knight;

    const lower = choice.toLowerCase();
    return CLASSES[lower] || CLASSES.knight;
}

function createUnits() {
    units = [];

    const blueSprites = [
        BASE_PATH + "blue1.png",
        BASE_PATH + "blue2.png",
        BASE_PATH + "blue3.png",
        BASE_PATH + "blue4.png"
    ];

    const redSprites = [
        BASE_PATH + "red1.png",
        BASE_PATH + "red2.png",
        BASE_PATH + "red3.png",
        BASE_PATH + "red4.png"
    ];

    for (let i = 0; i < 4; i++) {
        units.push({
            id: units.length,
            team: 1,
            x: i,
            y: 0,
            hp: 100,
            sprite: blueSprites[i],
            class: chooseClass(1, i),
            hasMoved: false,
            hasAttacked: false
        });
    }

    for (let i = 0; i < 4; i++) {
        units.push({
            id: units.length,
            team: 2,
            x: SIZE - 1 - i,
            y: SIZE - 1,
            hp: 100,
            sprite: redSprites[i],
            class: chooseClass(2, i),
            hasMoved: false,
            hasAttacked: false
        });
    }
}

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
        cell.classList.remove("move-option", "attack-option", "target-selected");
    });

    units.forEach(unit => {
        const index = unit.y * SIZE + unit.x;
        const cell = gridElement.children[index];

        const img = document.createElement("img");
        img.src = unit.sprite;
        img.classList.add("unit");

        if (selectedUnit && unit.id === selectedUnit.id) {
            img.classList.add("selected");
        }

        if (selectedTarget && unit.id === selectedTarget.id) {
            cell.classList.add("target-selected");
        }

        const hpBar = document.createElement("div");
        hpBar.classList.add("hp-bar");

        const hpFill = document.createElement("div");
        hpFill.classList.add("hp-fill");
        hpFill.style.width = unit.hp + "%";

        hpBar.appendChild(hpFill);

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
        selectedTarget = null;
        render();
        return;
    }

    if (!selectedUnit) return;

    const distance =
        Math.abs(selectedUnit.x - x) +
        Math.abs(selectedUnit.y - y);

    const target = units.find(u => u.x === x && u.y === y);

    // SELECIONAR ALVO
    if (
        target &&
        target.team !== currentTurn &&
        !selectedUnit.hasAttacked &&
        distance <= selectedUnit.class.attackRange
    ) {
        selectedTarget = target;
        render();

        const confirmAttack = confirm("Confirmar ataque?");

        if (confirmAttack) {
            selectedUnit.hasAttacked = true;
            animateAttack(selectedUnit, selectedTarget);
            selectedTarget = null;
        } else {
            selectedTarget = null;
            render();
        }

        return;
    }

    // MOVIMENTO
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

function animateAttack(attacker, defender) {
    const attackerCell = gridElement.children[attacker.y * SIZE + attacker.x];
    const defenderCell = gridElement.children[defender.y * SIZE + defender.x];

    const attackerImg = attackerCell.querySelector("img");
    const defenderImg = defenderCell.querySelector("img");

    attackerImg.classList.add("attack");

    setTimeout(() => {
        attackerImg.classList.remove("attack");

        defenderImg.classList.add("damage");
        defender.hp -= DAMAGE;
        if (defender.hp < 0) defender.hp = 0;

        setTimeout(() => {
            defenderImg.classList.remove("damage");

            if (defender.hp <= 0) {
                units = units.filter(u => u.id !== defender.id);
            }

            render();
        }, 300);

        render();
    }, 200);
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
    selectedTarget = null;
    render();
}

createUnits();
createGrid();
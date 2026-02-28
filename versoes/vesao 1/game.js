const gridElement = document.getElementById("grid");
const turnIndicator = document.getElementById("turnIndicator");

const SIZE = 8;

let currentTurn = 1;
let selectedUnit = null;
let units = [];

// Caminho dinâmico seguro (funciona abrindo direto)
const BASE_PATH = "./assets/";

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

    // Time Azul (em cima)
    for (let i = 0; i < 4; i++) {
        units.push({
            id: units.length,
            team: 1,
            x: i,
            y: 0,
            hp: 10,
            sprite: blueSprites[i]
        });
    }

    // Time Vermelho (embaixo)
    for (let i = 0; i < 4; i++) {
        units.push({
            id: units.length,
            team: 2,
            x: SIZE - 1 - i,
            y: SIZE - 1,
            hp: 10,
            sprite: redSprites[i]
        });
    }
}

function createGrid() {
    gridElement.innerHTML = "";

    for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            cell.addEventListener("click", () => handleClick(x, y));

            gridElement.appendChild(cell);
        }
    }

    render();
}

function render() {
    document.querySelectorAll(".cell").forEach(cell => {
        cell.innerHTML = "";
    });

    units.forEach(unit => {
        const index = unit.y * SIZE + unit.x;
        const cell = gridElement.children[index];

        const img = document.createElement("img");

        img.src = unit.sprite;

        // Tratamento de erro visual
        img.onerror = function () {
            console.error("Imagem não encontrada:", unit.sprite);
            this.style.display = "none";
        };

        img.classList.add("unit");

        cell.appendChild(img);
    });

    turnIndicator.innerText = `Turno do Time ${currentTurn}`;
}

function handleClick(x, y) {
    const clickedUnit = units.find(u => u.x === x && u.y === y);

    // Selecionar unidade
    if (clickedUnit && clickedUnit.team === currentTurn) {
        selectedUnit = clickedUnit;
        return;
    }

    if (selectedUnit) {
        const distance =
            Math.abs(selectedUnit.x - x) +
            Math.abs(selectedUnit.y - y);

        const target = units.find(u => u.x === x && u.y === y);

        // Ataque
        if (target && target.team !== currentTurn && distance === 1) {
            target.hp -= 3;

            if (target.hp <= 0) {
                units = units.filter(u => u.id !== target.id);
            }

            endTurn();
        }

        // Movimento
        else if (!target && distance <= 3) {
            selectedUnit.x = x;
            selectedUnit.y = y;
            endTurn();
        }

        selectedUnit = null;
    }

    render();
}

function endTurn() {
    currentTurn = currentTurn === 1 ? 2 : 1;
}

createUnits();
createGrid();
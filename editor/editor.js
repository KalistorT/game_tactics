const TILE_SIZE = 64;

let map = {
    width: 16,
    height: 16,
    ground: [],
    objects: []
};

const GROUND_TILES = {
    0: "grass",
    1: "water",
    2: "stone"
};

const OBJECT_TILES = {
    0: null,
    1: "tree"
};

let selectedGround = 0;
let selectedObject = 0;
let editLayer = "ground";
let mouseDown = false;

const gridElement = document.getElementById("grid");

function generateEmptyMap() {
    for (let y = 0; y < map.height; y++) {

        let g = [];
        let o = [];

        for (let x = 0; x < map.width; x++) {
            g.push(0);
            o.push(0);
        }

        map.ground.push(g);
        map.objects.push(o);
    }
}

function createGrid() {

    gridElement.innerHTML = "";

    gridElement.style.gridTemplateColumns =
        `repeat(${map.width}, ${TILE_SIZE}px)`;

    gridElement.style.gridTemplateRows =
        `repeat(${map.height}, ${TILE_SIZE}px)`;

    for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {

            const cell = document.createElement("div");
            cell.classList.add("cell");

            paintTile(cell, x, y);

            cell.addEventListener("mousedown", () => {
                mouseDown = true;
                applyPaint(x, y);
            });

            cell.addEventListener("mouseover", () => {
                if (mouseDown) applyPaint(x, y);
            });

            gridElement.appendChild(cell);
        }
    }
}

function paintTile(cell, x, y) {

    const groundType = GROUND_TILES[map.ground[y][x]];
    const objectType = OBJECT_TILES[map.objects[y][x]];

    cell.style.backgroundImage =
        `url('../tiles/ground/${groundType}.png')`;

    cell.style.backgroundSize = "cover";

    if (objectType) {
        const obj = document.createElement("div");
        obj.style.backgroundImage =
            `url('../tiles/objects/${objectType}.png')`;
        obj.style.backgroundSize = "contain";
        obj.style.backgroundRepeat = "no-repeat";
        obj.style.position = "absolute";
        obj.style.width = "100%";
        obj.style.height = "100%";
        obj.style.pointerEvents = "none";
        cell.appendChild(obj);
    }
}

function applyPaint(x, y) {

    if (editLayer === "ground") {
        map.ground[y][x] = selectedGround;
    }

    if (editLayer === "objects") {
        map.objects[y][x] = selectedObject;
    }

    createGrid();
}

document.addEventListener("mouseup", () => {
    mouseDown = false;
});

function exportMap() {

    const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(map));

    const dl = document.createElement("a");
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", "mapa1.json");
    dl.click();
}

function importMap(event) {

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        map = JSON.parse(e.target.result);
        createGrid();
    };

    reader.readAsText(file);
}

generateEmptyMap();
createGrid();
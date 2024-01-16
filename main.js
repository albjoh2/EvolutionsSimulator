import "./style.css";
import Food from "./src/food.js";
import Cell from "./src/cell.js";
import Table from "./src/table.js";
import { config } from "./src/config.js";
import FamilyTree from "./src/familyTree.js";

const {
  SIZE_OF_CANVAS,
  AMOUNT_OF_FOOD,
  SIZE_OF_STARTING_FOOD,
  SECTION_SIZE,
  FOOD_GROWTH_RATE,
} = config;

const {
  c,
  c2,
  aliveStats,
  deadStats,

  cellStatistik,
  generationSlider,
  generationSliderValue,
} = init();

const STARTING_CELL_OPTIONS = {
  id: [1],
  x: SIZE_OF_CANVAS / 2,
  y: SIZE_OF_CANVAS / 2,
  maxSpeed: 0.2,
  speed: 0.01,
  orientation: Math.random() * 2 * Math.PI,
  radius: 6,
  innerColor: { r: 127, g: 127, b: 127, o: 0.5 },
  color: { r: 127, g: 127, b: 127, o: 0.5 },
  jumpLength: 0.2,
  energyEfficiency: 1,
  splitEfficiency: 1,
  maxEnergy: 300,
  mutationRate: 0.15,
  mutationAmount: 0.5,
  targetOrientation: Math.random() * 2 * Math.PI,
  orientationChangeSpeed: 0.1,
  orientationChangeChance: 0.001,
};

function init() {
  const canvas = document.getElementById("canvas");
  const canvas2 = document.getElementById("canvas2");
  const aliveStats = document.getElementById("alive-stats");
  const deadStats = document.getElementById("dead-stats");
  const cellStatistik = document.getElementById("cell-statistik");
  const generationSlider = document.getElementById("specisGeneration");
  const generationSliderValue = document.getElementById("generationToShow");
  const prevGeneration = document.getElementById("prev");
  const nextGeneration = document.getElementById("next");
  generationSlider.addEventListener("change", (e) => {
    getArrayOfRelatives(cells, deadCells);
  });
  prevGeneration.addEventListener("click", (e) => {
    generationSlider.value = parseInt(generationSlider.value) - 1;
    getArrayOfRelatives(cells, deadCells);
  });
  nextGeneration.addEventListener("click", (e) => {
    generationSlider.value = parseInt(generationSlider.value) + 1;
    getArrayOfRelatives(cells, deadCells);
  });

  const [c, c2] = [canvas.getContext("2d"), canvas2.getContext("2d")];

  drawCanvas(canvas, SIZE_OF_CANVAS, SIZE_OF_CANVAS);
  drawCanvas(canvas2, SIZE_OF_CANVAS, SIZE_OF_CANVAS);

  return {
    c,
    c2,
    aliveStats,
    deadStats,
    cellStatistik,
    generationSlider,
    generationSliderValue,
  };
}

const table = new Table();

let cells = [];
const cell = new Cell(STARTING_CELL_OPTIONS);
cells.push(cell);

let deadCells = [];

getArrayOfRelatives(cells, deadCells);

const foodSections = drawFoodSections(
  SIZE_OF_CANVAS,
  AMOUNT_OF_FOOD,
  SECTION_SIZE
);

let cellLength = 0;

updateSimulation();

function updateSimulation() {
  const animationID = requestAnimationFrame(updateSimulation);
  c.clearRect(0, 0, SIZE_OF_CANVAS, SIZE_OF_CANVAS);

  Object.keys(foodSections).forEach((section) => {
    foodSections[section].forEach((food) => {
      food.draw(c);
      food.radius += food.growthRate / (food.radius * FOOD_GROWTH_RATE);
    });
  });

  cells.forEach((cell) => {
    cell.update(
      cells,
      c,
      foodSections,
      deadCells,
      SIZE_OF_CANVAS,
      SECTION_SIZE,
      animationID
    );
  });

  if (cellLength !== cells.length) {
    document.getElementById("cells").textContent = cells.length;
    if (cellLength > cells.length) {
      getArrayOfRelatives(cells, deadCells);
    }

    cellLength = cells.length;

    aliveStats.innerHTML = getStatsFromCellsArray(cells, "Alive stats");
    deadStats.innerHTML = getStatsFromCellsArray(deadCells, "Dead stats");
    table.update(cells);

    if (cells.length === 0) {
      canvas2.style.display = "none";
      aliveStats.style.display = "none";
      deadStats.style.display = "none";
      cellStatistik.style.display = "none";
      generationSlider.style.display = "none";
      generationSliderValue.style.display = "none";
      new FamilyTree(deadCells, c);
      cancelAnimationFrame(animationID);
    }
  }
}

function getArrayOfRelatives(cells, deadCells) {
  const relatives = new Set();
  const allCells = cells.concat(deadCells);
  const generationToDraw = generationSlider.value;
  const parentIDs = cells.map((cell) => cell.id.slice(0, generationToDraw));
  for (const cell of allCells) {
    const cellID = JSON.stringify(cell.id);
    for (const parentID of parentIDs) {
      if (cellID === JSON.stringify(parentID)) {
        relatives.add(cell);
        break;
      }
    }
  }
  drawDifferentSpecies([...relatives]);
}

function drawDifferentSpecies(relatives) {
  generationSliderValue.innerHTML = generationSlider.value;
  c2.clearRect(0, 0, SIZE_OF_CANVAS, SIZE_OF_CANVAS);
  let x = 100;
  let y = 100;
  for (let cell in relatives) {
    relatives[cell].draw(c2, x, y, 0, false);
    x += 100;
    if (x > 800) {
      x = 100;
      y += 100;
    }
  }
}

function getStatsFromCellsArray(arrayOfCells, heading) {
  let radius = 0,
    jump = 0,
    energyEff = 0,
    celldelningsEff = 0,
    speed = 0;

  for (let cell in arrayOfCells) {
    radius += arrayOfCells[cell].radius / arrayOfCells.length;
    jump += arrayOfCells[cell].jumpLength / arrayOfCells.length;
    energyEff += arrayOfCells[cell].energyEfficiency / arrayOfCells.length;
    celldelningsEff += arrayOfCells[cell].splitEfficiency / arrayOfCells.length;
    if (arrayOfCells[cell].speed > 0.01) {
      speed += arrayOfCells[cell].speed / arrayOfCells.length;
    }
  }

  let stats = `<h2>${heading}</h2>
  <p>Size: ${radius.toFixed(2)} </p>
  <p>Wiggle: ${jump.toFixed(2)} </p>
  <p>Energy efficiency: ${energyEff.toFixed(2)} </p>
  <p>Breeding efficiency: ${celldelningsEff.toFixed(2)} </p>
  <p>Speed: ${speed.toFixed(2)}</p>
  `;

  return stats;
}

function drawCanvas(canvas, width, height) {
  canvas.width = width;
  canvas.height = height;
}

function drawFoodSections(SIZE_OF_CANVAS, AMOUNT_OF_FOOD, SECTION_SIZE) {
  const foodSections = {};

  for (let i = 0; i < (SIZE_OF_CANVAS * SIZE_OF_CANVAS) / AMOUNT_OF_FOOD; i++) {
    let x = Math.random() * SIZE_OF_CANVAS;
    let y = Math.random() * SIZE_OF_CANVAS;
    let radius = Math.min(
      (Math.random() * (SIZE_OF_STARTING_FOOD - 0) + 0) /
        (Math.abs(Math.abs(x) - Math.abs(y)) / 150) +
        0.01,
      SIZE_OF_STARTING_FOOD
    );

    const sectionX = Math.floor(x / SECTION_SIZE);
    const sectionY = Math.floor(y / SECTION_SIZE);

    if (!foodSections[sectionX + "," + sectionY]) {
      foodSections[sectionX + "," + sectionY] = [];
    }

    foodSections[sectionX + "," + sectionY].push(
      new Food(x, y, radius, "#aaFFaa")
    );
  }

  return foodSections;
}

document.querySelector("table").addEventListener("mouseleave", (e) => {
  removeHighlightFromCellOnCanvas(cells);
});

document.querySelector("table").addEventListener("mouseover", (e) => {
  if (e.target.tagName === "TD") {
    highlightCellOnCanvas(cells, e.target.id);
  }
});

//When holding mouse over cell in table, highlight cell on the canvas
function highlightCellOnCanvas(cells, id) {
  for (let cell in cells) {
    if (cells[cell].id.toString() === id) {
      cells[cell].highlighted = true;
    } else {
      cells[cell].highlighted = false;
    }
  }
}

//When mouse leaves cell in table, remove highlight from cell on the canvas
function removeHighlightFromCellOnCanvas(cells) {
  for (let cell in cells) {
    cells[cell].highlighted = false;
  }
}

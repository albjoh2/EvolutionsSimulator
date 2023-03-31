import "./style.css";
import Food from "./src/food.js";
import Cell from "./src/cell.js";
import { config } from "./src/config.js";

const {
  SIZE_OF_CANVAS,
  AMOUNT_OF_FOOD,
  SIZE_OF_STARTING_FOOD,
  SECTION_SIZE,
  FOOD_GROWTH_RATE,
} = config;

const { c, c2, aliveStats, deadStats, cellStatistik, generationSlider } =
  init();

const STARTING_CELL_OPTIONS = {
  id: [1],
  x: SIZE_OF_CANVAS / 2,
  y: SIZE_OF_CANVAS / 2,
  maxSpeed: 0.2,
  speed: 0.01,
  orientation: Math.random() * 2 * Math.PI,
  radius: 6,
  innerColor: { r: 100, g: 100, b: 100, o: 0.5 },
  color: { r: 100, g: 100, b: 100, o: 0.5 },
  jumpLength: 0.2,
  energiUpptagning: 1,
  delningsEffektivitet: 1,
  maxEnergi: 400,
  mutationRate: 0.1,
  mutationAmount: 0.5,
};

function init() {
  const canvas = document.getElementById("canvas");
  const canvas2 = document.getElementById("canvas2");
  const aliveStats = document.getElementById("alive-stats");
  const deadStats = document.getElementById("dead-stats");
  const cellStatistik = document.getElementById("cell-statistik");
  const generationSlider = document.getElementById("specisGeneration");
  generationSlider.addEventListener("change", (e) => {
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
  };
}

let cells = [];
const cell = new Cell(STARTING_CELL_OPTIONS);
cells.push(cell);

let activeSections = {};

let deadCells = [];

const foodSections = drawFoodSections(
  SIZE_OF_CANVAS,
  AMOUNT_OF_FOOD,
  SECTION_SIZE
);

let cellLength = 0;

updateSimulation();

function updateSimulation() {
  const animationID = requestAnimationFrame(updateSimulation);
  updateActiveSections(activeSections, foodSections);
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
      activeSections,
      animationID
    );
  });

  if (cellLength !== cells.length) {
    if (cells.length < cellLength) {
      getArrayOfRelatives(cells, deadCells);
    }

    cellLength = cells.length;

    aliveStats.innerHTML = getStatsFromCellsArray(cells);
    deadStats.innerHTML = getStatsFromCellsArray(deadCells);
    cellStatistik.innerHTML = getStatsForIndividualCellsInArray(cells);

    if (cells.length === 0) {
      drawFamilyTree(deadCells);
      cancelAnimationFrame(animationID);
    }
  }
}

function getArrayOfRelatives(cells, deadCells) {
  let relatives = [];
  let allCells = cells.concat(deadCells);
  let generationToPush = generationSlider.value;
  for (let cell in cells) {
    let parentID = cells[cell].id.slice(0, generationToPush);
    for (let cell in allCells) {
      if (
        JSON.stringify(allCells[cell].id) === JSON.stringify(parentID) &&
        relatives.indexOf(allCells[cell]) === -1
      ) {
        relatives.push(allCells[cell]);
      }
    }
  }
  drawDifferentSpecis(relatives);
}

function drawDifferentSpecis(relatives) {
  c2.clearRect(0, 0, SIZE_OF_CANVAS, SIZE_OF_CANVAS);
  let x = 100;
  let y = 100;
  for (let cell in relatives) {
    relatives[cell].drawSpecis(c2, x, y);
    x += 100;
    if (x > 800) {
      x = 100;
      y += 100;
    }
  }
}

function getStatsForIndividualCellsInArray(arrayOfCells) {
  let statsRow = "";
  let statsRubriker =
    "<thead><th>Radius</th> <th>Wiggle</th> <th>Energy effectivity</th> <th>Breeding effectivity</th> <th>Speed</th> <th>Generation</th><th>Energy</th><th>Mutation Rate</th><th>Mutation Amount</th></thead>";

  for (let cell in arrayOfCells) {
    statsRow += `<tr>
    <td>${cells[cell].radius.toFixed(2)}</td> 
    <td>${cells[cell].jumpLength.toFixed(2)}</td>
    <td>${cells[cell].energiUpptagning.toFixed(2)}</td>
    <td>${cells[cell].delningsEffektivitet.toFixed(2)}</td>
    <td>${cells[cell].speed.toFixed(3)}</td>
    <td>${cells[cell].id.length}</td>
    <td>${cells[cell].maxEnergi.toFixed(0)} </td>
    <td>${cells[cell].mutationRate.toFixed(2)}</td>
    <td>${cells[cell].mutationAmount.toFixed(2)}</td>
    </tr>`;
  }

  return statsRubriker + "<tbody>" + statsRow + "</tbody>";
}

function getStatsFromCellsArray(arrayOfCells) {
  let radius = 0;
  let jump = 0;
  let energiEff = 0;
  let celldelningsEff = 0;
  let speed = 0;

  for (let cell in arrayOfCells) {
    radius += arrayOfCells[cell].radius / arrayOfCells.length;
    jump += arrayOfCells[cell].jumpLength / arrayOfCells.length;
    energiEff += arrayOfCells[cell].energiUpptagning / arrayOfCells.length;
    celldelningsEff +=
      arrayOfCells[cell].delningsEffektivitet / arrayOfCells.length;
    if (arrayOfCells[cell].speed > 0.01) {
      speed += arrayOfCells[cell].speed / arrayOfCells.length;
    }
  }

  let stats = `
  <p>Size: ${radius.toFixed(2)} </p>
  <p>Wiggle: ${jump.toFixed(2)} </p>
  <p>Energy efficiency: ${energiEff.toFixed(2)} </p>
  <p>Breeding efficiency: ${celldelningsEff.toFixed(2)} </p>
  <p>Speed: ${speed.toFixed(2)}</p>
  `;

  return stats;
}

function drawFamilyTree(cells) {
  drawCanvas(canvas, window.innerWidth, 20000);

  cells.sort((a, b) => {
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
  });
  cells.sort((a, b) => {
    if (a.id.length < b.id.length) {
      return -1;
    }
    if (a.id.length > b.id.length) {
      return +1;
    }
  });

  let y = 30;
  let x = 0;
  let lastCellsGeneration = 0;
  let pappasGenerationsBarn = 1;
  let lastCellsPapi = 1;
  for (let cell in cells) {
    let generation = cells[cell].id.length;
    y = 25 * generation;
    x += 20;

    if (
      JSON.stringify(cells[cell].id.slice(0, -1)) !==
      JSON.stringify(lastCellsPapi)
    ) {
      x += 15;
    }

    if (lastCellsGeneration !== generation) {
      x = canvas.width / 2 - 20 * (pappasGenerationsBarn / 2) + 12.5;
      pappasGenerationsBarn = 0;
    }

    lastCellsPapi = cells[cell].id.slice(0, -1);
    pappasGenerationsBarn += cells[cell].children;
    lastCellsGeneration = generation;
    cells[cell].x = x;
    cells[cell].y = y;
    cells[cell].energi = 0;
    cells[cell].celldelningsProgress = 0;
    cells[cell].draw(cells, c);
  }
  for (let i = 0; i < cells[cells.length - 1].id.length + 1; i++) {
    for (let cell in cells) {
      if (cells[cell].id.length === i) {
        let cellToGetParent = cell;
        let parentCell = cells[cell].id.slice(0, -1);

        for (let cell in cells) {
          if (JSON.stringify(cells[cell].id) === JSON.stringify(parentCell)) {
            c.beginPath();
            c.lineWidth = 0.5;
            c.strokeStyle = "black";
            c.moveTo(cells[cell].x, cells[cell].y + cells[cell].radius);
            c.lineTo(
              cells[cellToGetParent].x,
              cells[cellToGetParent].y - cells[cellToGetParent].radius
            );
            c.stroke();
          }
        }
      }
    }
  }
  for (let cell in cells) {
    cells[cell].draw(cells, c);
  }
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
        (Math.abs(Math.abs(x) - Math.abs(y)) / 100) +
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

function updateActiveSections(activeSections, foodSections) {
  const newActiveSections = {};

  for (let section in activeSections) {
    const [sectionX, sectionY] = section.split(",");

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        const key = parseInt(sectionX) + x + "," + (parseInt(sectionY) + y);

        if (foodSections[key]) {
          newActiveSections[key] = foodSections[key];
        }
      }
    }
  }

  return newActiveSections;
}

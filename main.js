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
  energiUpptagning: 1,
  delningsEffektivitet: 1,
  maxEnergi: 300,
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
    cellStatistik.innerHTML = getStatsForIndividualCellsInArray(cells);

    if (cells.length === 0) {
      drawFamilyTree(deadCells);
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

function getStatsForIndividualCellsInArray(arrayOfCells) {
  let statsRow = "";
  let statsRubriker =
    "<thead><th>Radius</th> <th>Wiggle</th> <th>Energy effectivity</th> <th>Breeding effectivity</th> <th>Speed</th> <th>Generation</th><th>Energy</th><th>Mutation Rate</th><th>Mutation Amount</th></thead>";

  for (let cell in arrayOfCells) {
    statsRow += `<tr>
    <td id="${cells[cell].id}">${cells[cell].radius.toFixed(2)}</td> 
    <td id="${cells[cell].id}">${cells[cell].jumpLength.toFixed(2)}</td>
    <td id="${cells[cell].id}">${cells[cell].energiUpptagning.toFixed(2)}</td>
    <td id="${cells[cell].id}">${cells[cell].delningsEffektivitet.toFixed(
      2
    )}</td>
    <td id="${cells[cell].id}">${cells[cell].speed.toFixed(3)}</td>
    <td id="${cells[cell].id}">${cells[cell].id.length}</td>
    <td id="${cells[cell].id}">${cells[cell].maxEnergi.toFixed(0)} </td>
    <td id="${cells[cell].id}">${cells[cell].mutationRate.toFixed(2)}</td>
    <td id="${cells[cell].id}">${cells[cell].mutationAmount.toFixed(2)}</td>
    </tr>`;
  }

  return statsRubriker + "<tbody>" + statsRow + "</tbody>";
}

function getStatsFromCellsArray(arrayOfCells, heading) {
  let radius = 0,
    jump = 0,
    energiEff = 0,
    celldelningsEff = 0,
    speed = 0;

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

  let stats = `<h2>${heading}</h2>
  <p>Size: ${radius.toFixed(2)} </p>
  <p>Wiggle: ${jump.toFixed(2)} </p>
  <p>Energy efficiency: ${energiEff.toFixed(2)} </p>
  <p>Breeding efficiency: ${celldelningsEff.toFixed(2)} </p>
  <p>Speed: ${speed.toFixed(2)}</p>
  `;

  return stats;
}

function drawFamilyTree(cells) {
  canvas2.style.display = "none";
  aliveStats.style.display = "none";
  deadStats.style.display = "none";
  cellStatistik.style.display = "none";
  generationSlider.style.display = "none";
  generationSliderValue.style.display = "none";

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
    cells[cell].draw(c, x, y, 0, false);
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

//when clicking on a th in the table, sort the table by that column
document.querySelector("table").addEventListener("click", (e) => {
  if (e.target.tagName === "TH") {
    sortTable(e.target.cellIndex);
  }
});

//sort the table by the column
function sortTable(n) {
  var table,
    rows,
    switching,
    i,
    x,
    y,
    shouldSwitch,
    dir,
    switchcount = 0;
  table = document.getElementById("cell-statistik");
  switching = true;
  //Set the sorting direction to ascending:
  dir = "asc";
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < rows.length - 1; i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      /*check if the two rows should switch place,
      based on the direction, asc or desc:*/
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          //if so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      //Each time a switch is done, increase this count by 1:
      switchcount++;
    } else {
      /*If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again.*/
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}

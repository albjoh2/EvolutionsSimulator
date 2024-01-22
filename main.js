import "./style.css";
import Food from "./src/food.js";
import Cell from "./src/cell.js";
import Table from "./src/table.js";
import Canvas from "./src/canvas.js";
import FamilyTree from "./src/familyTree.js";
import GenerationInspector from "./src/generationInspecter.js";
import GlobalStats from "./src/globalStats.js";

class Main {
  constructor() {
    this.cells = [];
    this.deadCells = [];
    this.SIZE_OF_CANVAS = 900;
    this.AMOUNT_OF_FOOD = 80; //lower = more food
    this.SIZE_OF_STARTING_FOOD = 3;
    this.SECTION_SIZE = 20;
    this.FOOD_GROWTH_RATE = 910; //lower = faster growth

    this.STARTING_CELL_OPTIONS = {
      id: [1],
      x: this.SIZE_OF_CANVAS / 2,
      y: this.SIZE_OF_CANVAS / 2,
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

    this.canvas = new Canvas(
      this.SIZE_OF_CANVAS,
      this.SIZE_OF_CANVAS,
      "canvas"
    );
    this.canvas2 = new Canvas(
      this.SIZE_OF_CANVAS,
      this.SIZE_OF_CANVAS,
      "canvas2"
    );
    this.c = this.canvas.draw(this.SIZE_OF_CANVAS, this.SIZE_OF_CANVAS);
    this.c2 = this.canvas2.draw(this.SIZE_OF_CANVAS, this.SIZE_OF_CANVAS);

    this.aliveStats = document.getElementById("alive-stats");
    this.deadStats = document.getElementById("dead-stats");
    this.cellStatistik = document.getElementById("cell-statistik");

    this.table = new Table();
    this.aliveStatistics = new GlobalStats(this.aliveStats, "Alive stats");
    this.deadStatistics = new GlobalStats(this.deadStats, "Dead stats");

    this.updateSimulation = this.updateSimulation.bind(this);

    this.foodSections = this.drawFoodSections(
      this.AMOUNT_OF_FOOD,
      this.SECTION_SIZE
    );

    this.generationInspector = new GenerationInspector(
      this.c2,
      this.SIZE_OF_CANVAS
    );
    this.cellLength = 0;
    this.init();
  }

  init() {
    const cell = new Cell(this.STARTING_CELL_OPTIONS);
    this.cells.push(cell);

    this.updateSimulation();

    document.querySelector("table").addEventListener("mouseleave", (e) => {
      this.table.removeHighlightFromCellOnCanvas(this.cells);
    });

    document.querySelector("table").addEventListener("mouseover", (e) => {
      if (e.target.tagName === "TD") {
        this.table.highlightCellOnCanvas(this.cells, e.target.id);
      }
    });

    document
      .getElementById("specisGeneration")
      .addEventListener("change", (e) => {
        this.generationInspector.getArrayOfRelatives(
          this.cells,
          this.deadCells
        );
      });

    document.getElementById("prev").addEventListener("click", (e) => {
      document.getElementById("specisGeneration").value = parseInt(
        this.generationInspector.setGenerationSliderValue(-1)
      );
      this.generationInspector.getArrayOfRelatives(this.cells, this.deadCells);
    });

    document.getElementById("next").addEventListener("click", (e) => {
      document.getElementById("specisGeneration").value = parseInt(
        this.generationInspector.setGenerationSliderValue(1)
      );
      this.generationInspector.getArrayOfRelatives(this.cells, this.deadCells);
    });
  }

  updateSimulation() {
    const animationID = requestAnimationFrame(this.updateSimulation);
    this.c.clearRect(0, 0, this.SIZE_OF_CANVAS, this.SIZE_OF_CANVAS);

    Object.keys(this.foodSections).forEach((section) => {
      this.foodSections[section].forEach((food) => {
        food.draw(this.c);
        food.radius += food.growthRate / (food.radius * this.FOOD_GROWTH_RATE);
      });
    });

    this.cells.forEach((cell) => {
      cell.update(
        this.cells,
        this.c,
        this.foodSections,
        this.deadCells,
        this.SIZE_OF_CANVAS,
        this.SECTION_SIZE,
        this.animationID
      );
    });

    if (this.cellLength !== this.cells.length) {
      document.getElementById("cells").textContent = this.cells.length;
      if (this.cellLength > this.cells.length) {
        this.generationInspector.getArrayOfRelatives(
          this.cells,
          this.deadCells
        );
      }

      this.cellLength = this.cells.length;

      this.deadStatistics.update(this.cells, "Alive stats");
      this.aliveStatistics.update(this.deadCells, "Dead stats");
      this.table.update(this.cells);

      if (cells.length === 0) {
        canvas2.hide();
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

  drawFoodSections(AMOUNT_OF_FOOD, SECTION_SIZE) {
    const foodSections = {};

    for (
      let i = 0;
      i < (this.SIZE_OF_CANVAS * this.SIZE_OF_CANVAS) / AMOUNT_OF_FOOD;
      i++
    ) {
      let x = Math.random() * this.SIZE_OF_CANVAS;
      let y = Math.random() * this.SIZE_OF_CANVAS;
      let radius = Math.min(
        (Math.random() * (this.SIZE_OF_STARTING_FOOD - 0) + 0) /
          (Math.abs(Math.abs(x) - Math.abs(y)) / 150) +
          0.01,
        this.SIZE_OF_STARTING_FOOD
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
}

new Main();

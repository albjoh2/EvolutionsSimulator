import "./style.css";
import Cell from "./src/cell.js";
import Table from "./src/table.js";
import Canvas from "./src/canvas.js";
import FamilyTree from "./src/familyTree.js";
import GenerationInspector from "./src/generationInspecter.js";
import GlobalStats from "./src/globalStats.js";
import FoodSections from "./src/foodSections.js";

class Main {
  constructor() {
    this.cells = [];
    this.deadCells = [];
    this.SIZE_OF_CANVAS = 900;

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

    this.table = new Table();
    this.aliveStatistics = new GlobalStats(
      document.getElementById("alive-stats"),
      "Alive stats"
    );
    this.deadStatistics = new GlobalStats(
      document.getElementById("dead-stats"),
      "Dead stats"
    );

    this.updateSimulation = this.updateSimulation.bind(this);

    this.generationInspector = new GenerationInspector(
      this.c2,
      this.SIZE_OF_CANVAS
    );

    this.foodSections = new FoodSections(this.SIZE_OF_CANVAS);
    this.drawnFoodSections = this.foodSections.drawFoodSections();

    this.cellLength = 0;
    this.init();
  }

  init() {
    this.cells.push(new Cell(this.STARTING_CELL_OPTIONS));
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
    this.generationInspector.getArrayOfRelatives(this.cells, this.deadCells);

    document.getElementById("prev").addEventListener("click", (e) => {
      this.generationInspector.setSpecisGenerationValue(
        parseInt(this.generationInspector.setGenerationSliderValue(-1))
      );
      this.generationInspector.getArrayOfRelatives(this.cells, this.deadCells);
    });

    document.getElementById("next").addEventListener("click", (e) => {
      this.generationInspector.setSpecisGenerationValue(
        parseInt(this.generationInspector.setGenerationSliderValue(1))
      );
      this.generationInspector.getArrayOfRelatives(this.cells, this.deadCells);
    });
  }

  updateSimulation() {
    const animationID = requestAnimationFrame(this.updateSimulation);
    this.c.clearRect(0, 0, this.SIZE_OF_CANVAS, this.SIZE_OF_CANVAS);
    this.drawnFoodSections = this.foodSections.update(this.c);
    this.cells.forEach((cell) => {
      cell.update(
        this.cells,
        this.c,
        this.drawnFoodSections,
        this.deadCells,
        this.SIZE_OF_CANVAS,
        this.foodSections.getSectionSize(),
        this.animationID
      );
    });
    if (this.cellLength !== this.cells.length) {
      document.getElementById("cells").textContent = this.cells.length;
      this.generationInspector.getArrayOfRelatives(this.cells, this.deadCells);
      this.cellLength = this.cells.length;
      this.deadStatistics.update(this.cells, "Alive stats");
      this.aliveStatistics.update(this.deadCells, "Dead stats");
      this.table.update(this.cells);
      if (this.cells.length === 0) {
        this.canvas2.hide();
        this.aliveStatistics.hide();
        this.deadStatistics.hide();
        this.table.hide();
        this.generationInspector.hide();
        new FamilyTree(this.deadCells, this.c);
        cancelAnimationFrame(animationID);
      }
    }
  }
}

new Main();

export default class GenerationInspector {
  constructor(ctx, SIZE_OF_CANVAS) {
    this.generationSliderTextElement =
      document.getElementById("generationToShow");
    this.generationSliderValue =
      document.getElementById("specisGeneration").value;
    this.ctx = ctx;
    this.SIZE_OF_CANVAS = SIZE_OF_CANVAS;
  }

  getGenerationSliderValue() {
    return this.generationSliderValue;
  }

  setGenerationSliderValue(value) {
    this.generationSliderValue = parseInt(this.generationSliderValue) + value;
    if (this.generationSliderValue < 1) {
      this.generationSliderValue = 1;
    }
    return this.generationSliderValue;
  }

  getArrayOfRelatives(cells, deadCells) {
    const relatives = new Set();
    const allCells = cells.concat(deadCells);
    const generationToDraw = this.generationSliderValue;
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
    this.drawDifferentSpecies([...relatives]);
  }

  drawDifferentSpecies(relatives) {
    this.generationSliderTextElement.innerHTML = this.generationSliderValue;
    this.ctx.clearRect(0, 0, this.SIZE_OF_CANVAS, this.SIZE_OF_CANVAS);
    let x = 100;
    let y = 100;
    for (let cell in relatives) {
      relatives[cell].draw(this.ctx, x, y, 0, false);
      x += 100;
      if (x > 800) {
        x = 100;
        y += 100;
      }
    }
  }
}

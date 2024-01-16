export default class FamilyTree {
  constructor(cells, ctx) {
    this.draw(cells, ctx);
  }

  draw(cells, ctx) {
    this.drawCanvas(canvas, window.innerWidth, 20000);

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
      cells[cell].energy = 0;
      cells[cell].celldelningsProgress = 0;
      cells[cell].draw(ctx, x, y, 0, false);
    }
    for (let i = 0; i < cells[cells.length - 1].id.length + 1; i++) {
      for (let cell in cells) {
        if (cells[cell].id.length === i) {
          let cellToGetParent = cell;
          let parentCell = cells[cell].id.slice(0, -1);

          for (let cell in cells) {
            if (JSON.stringify(cells[cell].id) === JSON.stringify(parentCell)) {
              ctx.beginPath();
              ctx.lineWidth = 0.5;
              ctx.strokeStyle = "black";
              ctx.moveTo(cells[cell].x, cells[cell].y + cells[cell].radius);
              ctx.lineTo(
                cells[cellToGetParent].x,
                cells[cellToGetParent].y - cells[cellToGetParent].radius
              );
              ctx.stroke();
            }
          }
        }
      }
    }
  }

  drawCanvas(canvas, width, height) {
    canvas.width = width;
    canvas.height = height;
  }
}

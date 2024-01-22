export default class Table {
  constructor() {
    this.table = document.getElementById("cell-statistik");
    this.sortedBy = 1;
    this.sortedReverse = false;
    this.sortedCells = [];

    document.getElementById("cell-statistik").addEventListener("click", (e) => {
      console.log(e.target.tagName);
      if (e.target.tagName === "TH") {
        if (this.sortedBy === e.target.cellIndex) {
          this.sortedReverse = !this.sortedReverse;
        } else {
          this.sortedReverse = false;
        }
        this.sortedBy = e.target.cellIndex;
        this.update(this.sortedCells);
      }
    });
  }

  update(cells) {
    this.sortedCells = this.#sortCellsArrayByColumn(cells, this.sortedBy);
    this.table.innerHTML = this.#getStatsForIndividualCellsInArray(
      this.sortedCells
    );
  }

  //When holding mouse over cell in table, highlight cell on the canvas
  highlightCellOnCanvas(cells, id) {
    for (let cell in cells) {
      if (cells[cell].id.toString() === id) {
        cells[cell].highlighted = true;
      } else {
        cells[cell].highlighted = false;
      }
    }
  }

  //When mouse leaves cell in table, remove highlight from cell on the canvas
  removeHighlightFromCellOnCanvas(cells) {
    for (let cell in cells) {
      cells[cell].highlighted = false;
    }
  }

  //sort the table by the column
  #sortCellsArrayByColumn(cells, column) {
    const properties = [
      "radius",
      "jumpLength",
      "energyEfficiency",
      "splitEfficiency",
      "speed",
      "id",
      "maxEnergy",
      "mutationRate",
      "mutationAmount",
    ];

    // Special case for 'id' property, which needs to sort by length
    if (properties[column] === "id") {
      cells.sort((a, b) => {
        return this.sortedReverse
          ? b.id.length - a.id.length
          : a.id.length - b.id.length;
      });
    } else {
      cells.sort((a, b) => {
        return this.sortedReverse
          ? b[properties[column]] - a[properties[column]]
          : a[properties[column]] - b[properties[column]];
      });
    }

    return cells;
  }

  #getStatsForIndividualCellsInArray(cellArray) {
    let statsRow = "";
    let statsRubriker =
      "<thead><th>Radius</th> <th>Wiggle</th> <th>Energy effectivity</th> <th>Breeding effectivity</th> <th>Speed</th> <th>Generation</th><th>Energy</th><th>Mutation Rate</th><th>Mutation Amount</th></thead>";

    for (let cell in cellArray) {
      statsRow += `<tr>
          <td id="${cellArray[cell].id}">${cellArray[cell].radius.toFixed(
        2
      )}</td> 
          <td id="${cellArray[cell].id}">${cellArray[cell].jumpLength.toFixed(
        2
      )}</td>
          <td id="${cellArray[cell].id}">${cellArray[
        cell
      ].energyEfficiency.toFixed(2)}</td>
          <td id="${cellArray[cell].id}">${cellArray[
        cell
      ].splitEfficiency.toFixed(2)}</td>
          <td id="${cellArray[cell].id}">${cellArray[cell].speed.toFixed(
        3
      )}</td>
          <td id="${cellArray[cell].id}">${cellArray[cell].id.length}</td>
          <td id="${cellArray[cell].id}">${cellArray[cell].maxEnergy.toFixed(
        0
      )} </td>
          <td id="${cellArray[cell].id}">${cellArray[cell].mutationRate.toFixed(
        2
      )}</td>
          <td id="${cellArray[cell].id}">${cellArray[
        cell
      ].mutationAmount.toFixed(2)}</td>
          </tr>`;
    }

    return statsRubriker + "<tbody>" + statsRow + "</tbody>";
  }
}

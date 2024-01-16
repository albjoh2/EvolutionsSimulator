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

  //sort the table by the column
  #sortCellsArrayByColumn(cells, column) {
    if (this.sortedReverse) {
      switch (column) {
        case 0:
          cells.sort((a, b) => {
            return b.radius - a.radius;
          });
          break;
        case 1:
          cells.sort((a, b) => {
            return b.jumpLength - a.jumpLength;
          });
          break;
        case 2:
          cells.sort((a, b) => {
            return b.energyEfficiency - a.energyEfficiency;
          });
          break;
        case 3:
          cells.sort((a, b) => {
            return b.splitEfficiency - a.splitEfficiency;
          });
          break;
        case 4:
          cells.sort((a, b) => {
            return b.speed - a.speed;
          });
          break;
        case 5:
          cells.sort((a, b) => {
            return b.id.length - a.id.length;
          });
          break;
        case 6:
          cells.sort((a, b) => {
            return b.maxEnergy - a.maxEnergy;
          });
          break;
        case 7:
          cells.sort((a, b) => {
            return b.mutationRate - a.mutationRate;
          });
          break;
        case 8:
          cells.sort((a, b) => {
            return b.mutationAmount - a.mutationAmount;
          });
          break;
      }
      return cells;
    }
    switch (column) {
      case 0:
        cells.sort((a, b) => {
          return a.radius - b.radius;
        });
        break;
      case 1:
        cells.sort((a, b) => {
          return a.jumpLength - b.jumpLength;
        });
        break;
      case 2:
        cells.sort((a, b) => {
          return a.energyEfficiency - b.energyEfficiency;
        });
        break;
      case 3:
        cells.sort((a, b) => {
          return a.splitEfficiency - b.splitEfficiency;
        });
        break;
      case 4:
        cells.sort((a, b) => {
          return a.speed - b.speed;
        });
        break;
      case 5:
        cells.sort((a, b) => {
          return a.id.length - b.id.length;
        });
        break;
      case 6:
        cells.sort((a, b) => {
          return a.maxEnergy - b.maxEnergy;
        });
        break;
      case 7:
        cells.sort((a, b) => {
          return a.mutationRate - b.mutationRate;
        });
        break;
      case 8:
        cells.sort((a, b) => {
          return a.mutationAmount - b.mutationAmount;
        });
        break;
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

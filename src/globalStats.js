export default class GlobalStats {
  constructor(element) {
    this.element = element;
  }

  update(cells, heading) {
    this.element.innerHTML = this.getStatsFromCellsArray(cells, heading);
  }

  getStatsFromCellsArray(arrayOfCells, heading) {
    let radius = 0,
      jump = 0,
      energyEff = 0,
      celldelningsEff = 0,
      speed = 0;

    for (let cell in arrayOfCells) {
      radius += arrayOfCells[cell].radius / arrayOfCells.length;
      jump += arrayOfCells[cell].jumpLength / arrayOfCells.length;
      energyEff += arrayOfCells[cell].energyEfficiency / arrayOfCells.length;
      celldelningsEff +=
        arrayOfCells[cell].splitEfficiency / arrayOfCells.length;
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
}

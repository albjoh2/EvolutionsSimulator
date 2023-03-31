export default class Cell {
  constructor(options) {
    this.id = options.id;
    this.x = options.x;
    this.y = options.y;
    this.maxSpeed = options.maxSpeed;
    this.speed = options.speed;
    this.orientation = options.orientation;
    this.radius = options.radius;
    this.innerColor = options.innerColor;
    this.color = options.color;
    this.jumpLength = options.jumpLength;
    this.energiUpptagning = options.energiUpptagning;
    this.delningsEffektivitet = options.delningsEffektivitet;
    this.maxEnergi = options.maxEnergi;
    this.mutationRate = options.mutationRate;
    this.mutationAmount = options.mutationAmount;
    this.celldelningsProgress = 0;
    this.energi = this.maxEnergi / 2;
    this.dead = false;
    this.children = 0;
  }

  draw(cells, c) {
    if (cells) {
      c.save();
      c.translate(this.x, this.y);
      c.rotate(-this.orientation);
      c.beginPath();
      c.arc(0, 0, this.radius, 0, Math.PI * 2, false);
      const grd = c.createRadialGradient(0, 0, 0, 0, 0, this.radius);
      grd.addColorStop(
        0,
        `rgba(${this.innerColor.r},${this.innerColor.g},${this.innerColor.b},${this.innerColor.o})`
      );
      grd.addColorStop(
        1,
        `rgba(${this.color.r},${this.color.g},${this.color.b},${this.color.o})`
      );

      c.fillStyle = grd;
      c.fill();

      c.beginPath();
      c.fillStyle = "#3df322";
      c.fillRect(
        -this.radius,
        +this.radius * 1.5,
        ((this.radius * 2) / 1000) * this.celldelningsProgress,
        3
      );

      c.fillStyle = "blue";
      c.fillRect(
        -this.radius,
        +this.radius * 1.1,
        ((this.radius * 2) / this.maxEnergi) * this.energi,
        3
      );
      c.restore();
    } else {
      c.beginPath();

      c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);

      const grd = c.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        this.radius
      );

      grd.addColorStop(
        0,
        `rgba(${this.innerColor.r},${this.innerColor.g},${this.innerColor.b},${this.innerColor.o})`
      );
      grd.addColorStop(
        1,
        `rgba(${this.color.r},${this.color.g},${this.color.b},${this.color.o})`
      );

      c.fillStyle = grd;
      c.fill();
    }
  }

  drawSpecis(c, x, y) {
    c.beginPath();
    c.arc(x, y, this.radius, 0, Math.PI * 2, false);
    const grd = c.createRadialGradient(0, 0, 0, 0, 0, this.radius);
    grd.addColorStop(
      0,
      `rgba(${this.innerColor.r},${this.innerColor.g},${this.innerColor.b},${this.innerColor.o})`
    );
    grd.addColorStop(
      1,
      `rgba(${this.color.r},${this.color.g},${this.color.b},${this.color.o})`
    );
    c.fillStyle = grd;
    c.fill();
  }

  update(
    cells,
    c,
    foods,
    deadCells,
    SIZE_OF_CANVAS,
    SECTION_SIZE,
    activeSections
  ) {
    this.#move(SIZE_OF_CANVAS);
    this.#jump(SIZE_OF_CANVAS);
    this.draw(cells, c);
    this.#addCellsSection(activeSections, SECTION_SIZE);

    if (this.energi >= 0) {
      this.energi -=
        (Math.pow(this.speed + 1, 8) +
          Math.pow(this.jumpLength + 1, 10) +
          Math.pow(this.radius + 1, 1.1)) /
        50;
    }
    if (this.celldelningsProgress >= 0) {
      this.celldelningsProgress -=
        this.speed / 4 +
        Math.pow(this.jumpLength + 1, 3) / 2 +
        Math.pow(this.radius, 3) / 100;
    }

    this.#eat(foods, SECTION_SIZE);

    if (this.celldelningsProgress > 1000) {
      this.#reproduce(cells);
    }

    if (this.energi <= 0) {
      this.#die(cells, deadCells);
    }
  }

  #die(cells, deadCells) {
    this.dead = true;
    deadCells.push(this);
    cells.splice(cells.indexOf(this), 1);
    document.getElementById("cells").textContent = cells.length;
  }

  #eat(foodSections, SECTION_SIZE) {
    const sectionX = Math.floor(this.x / SECTION_SIZE);
    const sectionY = Math.floor(this.y / SECTION_SIZE);

    for (let food of foodSections[sectionX + "," + sectionY] || []) {
      const { x, y, radius } = food;
      if (
        this.x - this.radius < x + radius &&
        this.x + this.radius > x - radius &&
        this.y - this.radius < y + radius &&
        this.y + this.radius > y - radius
      ) {
        if (radius >= 0.005) {
          food.radius -= 0.003;
        }
        if (this.energi >= this.maxEnergi) {
          this.celldelningsProgress +=
            this.delningsEffektivitet * (Math.pow(radius, 2) / 2);
        } else if (radius > 0.3) {
          this.energi += this.energiUpptagning * Math.pow(radius, 2);
        }
      }
    }
  }

  #reproduce(cells) {
    this.children++;
    const newID = [...this.id, this.children];
    const cellOptions = {
      id: newID,
      x: this.x,
      y: this.y,
      maxSpeed: this.#mutate(this.maxSpeed),
      speed: this.#mutate(this.speed),
      orientation: Math.random() * 2 * Math.PI,
      radius: this.#mutate(this.radius),
      innerColor: {
        r: this.#mutate(this.innerColor.r),
        g: this.#mutate(this.innerColor.g),
        b: this.#mutate(this.innerColor.b),
        o: this.#mutate(this.innerColor.o),
      },
      color: {
        r: this.#mutate(this.color.r),
        g: this.#mutate(this.color.g),
        b: this.#mutate(this.color.b),
        o: this.#mutate(this.color.o),
      },
      jumpLength: this.#mutate(this.jumpLength),
      energiUpptagning: this.#mutate(this.energiUpptagning),
      delningsEffektivitet: this.#mutate(this.delningsEffektivitet),
      maxEnergi: this.#mutate(this.maxEnergi),
      mutationRate: this.#mutate(this.mutationRate),
      mutationAmount: this.#mutate(this.mutationAmount),
    };
    cells.push(new Cell(cellOptions));
    document.getElementById("cells").textContent = cells.length;
    this.celldelningsProgress = 0;
    this.energi = this.maxEnergi / 2;
  }

  #mutate(valueToMutate) {
    if (Math.random() < this.mutationRate) {
      return (
        valueToMutate +
        (Math.random() - 0.5) * this.mutationAmount * valueToMutate
      );
    } else {
      return valueToMutate;
    }
  }

  #move(SIZE_OF_CANVAS) {
    if (this.x > SIZE_OF_CANVAS - this.radius) {
      this.orientation += 0.1;
    }

    if (this.x < 0 + this.radius) {
      this.orientation += 0.1;
    }

    if (this.y > SIZE_OF_CANVAS - this.radius) {
      this.orientation += 0.1;
    }

    if (this.y < 0 + this.radius) {
      this.orientation += 0.1;
    }

    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    this.x -= Math.sin(this.orientation) * this.speed;
    this.y -= Math.cos(this.orientation) * this.speed;
  }

  #jump(SIZE_OF_CANVAS) {
    const jumpY = Math.random();
    const jumpX = Math.random();
    if (jumpX > 0.6666) {
      if (this.x < SIZE_OF_CANVAS - this.radius) this.x += this.jumpLength;
    }
    if (jumpX < 0.3334) {
      if (this.x > 0 + this.radius) this.x -= this.jumpLength;
    }
    if (jumpY > 0.6666) {
      if (this.y < SIZE_OF_CANVAS - this.radius) this.y += this.jumpLength;
    }
    if (jumpY < 0.3334) {
      if (this.y > 0 + this.radius) this.y -= this.jumpLength;
    }
  }
  #addCellsSection(activeSections, SECTION_SIZE) {
    const sectionX = Math.floor(this.x / SECTION_SIZE);
    const sectionY = Math.floor(this.y / SECTION_SIZE);
    activeSections[sectionX + "," + sectionY] = true;
  }
}

export default class Cell {
  constructor(options) {
    this.id = options.id;
    this.x = options.x;
    this.y = options.y;
    this.maxSpeed = options.maxSpeed;
    this.speed = Math.min(options.speed, this.maxSpeed);
    this.orientation = options.orientation;
    this.radius = Math.max(options.radius, 0.1);
    this.innerColor = options.innerColor;
    this.color = options.color;
    this.jumpLength = options.jumpLength;
    this.energyEfficiency = options.energyEfficiency;
    this.splitEfficiency = options.splitEfficiency;
    this.maxEnergy = Math.min(options.maxEnergy, this.radius * 100);
    this.mutationRate = options.mutationRate;
    this.mutationAmount = options.mutationAmount;
    this.splitProgress = 0;
    this.energy = this.maxEnergy / 2;
    this.children = 0;
    this.highlighted = false;
    this.targetOrientation = options.orientation;
    this.orientationChangeSpeed = options.orientationChangeSpeed;
    this.orientationChangeChance = options.orientationChangeChance;
    this.lifetime = 0;
  }

  draw(c, x, y, orientation, alive) {
    c.save();

    c.translate(x, y);
    c.rotate(-orientation);
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
    if (this.highlighted) {
      c.strokeStyle = "#ff4455";
      c.lineWidth = 2;
      c.stroke();
    }

    c.fillStyle = grd;
    c.fill();

    if (alive) {
      this.#drawProgressBar(c, this.energy, this.maxEnergy, 1.1, "#0000FF");
      this.#drawProgressBar(c, this.splitProgress, 1000, 1.5, "#dd5500");
    }

    c.restore();
  }

  #drawProgressBar(c, val, maxVal, drawY, color) {
    c.beginPath();
    c.fillStyle = color;

    c.fillRect(
      -this.radius,
      +this.radius * drawY,
      ((this.radius * 2) / maxVal) * val,
      3
    );
  }

  update(cells, c, foods, deadCells, SIZE_OF_CANVAS, SECTION_SIZE) {
    this.#move(SIZE_OF_CANVAS);
    this.#jump(SIZE_OF_CANVAS);
    this.#updateOrientation();
    this.draw(c, this.x, this.y, this.orientation, true);
    this.energy = this.#energyConsumption(this.energy, 50);
    this.splitProgress = this.#energyConsumption(this.splitProgress, 100);
    this.#eat(foods, SECTION_SIZE);
    this.lifetime++;
    if (this.splitProgress > 1000) {
      this.#reproduce(cells);
    }
    if (this.energy <= 0) {
      this.#die(cells, deadCells);
    }
  }

  #energyConsumption(resource, deteriorationSpeed) {
    if (resource >= 0) {
      resource -=
        (Math.pow(this.speed + 1, 8) +
          Math.pow(this.jumpLength + 1, 11) +
          Math.pow(this.radius + 1, 1.1) +
          this.lifetime / 10000) /
        deteriorationSpeed;
    }
    return resource;
  }

  #die(cells, deadCells) {
    this.highlighted = false;
    deadCells.push(this);
    cells.splice(cells.indexOf(this), 1);
    document.getElementById("cells").textContent = cells.length;
  }

  #updateOrientation() {
    // change the target orientation randomly
    if (Math.random() < this.orientationChangeChance) {
      this.targetOrientation += (Math.random() * Math.PI) / 4 - Math.PI / 8;
    }
    // gradually adjust the orientation to the target orientation
    const deltaOrientation = this.targetOrientation - this.orientation;
    if (Math.abs(deltaOrientation) > 0.01) {
      this.orientation += deltaOrientation * this.orientationChangeSpeed;
    } else {
      this.orientation = this.targetOrientation;
    }
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
        if (this.energy >= this.maxEnergy) {
          this.splitProgress +=
            this.splitEfficiency * (Math.pow(radius, 2) / 2);
        } else if (radius > 0.3) {
          this.energy += this.energyEfficiency * Math.pow(radius, 2);
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
        r: this.#mutate(this.innerColor.r, "fixed"),
        g: this.#mutate(this.innerColor.g, "fixed"),
        b: this.#mutate(this.innerColor.b, "fixed"),
        o: this.#mutate(this.innerColor.o, "fixed", 0.1),
      },
      color: {
        r: this.#mutate(this.color.r, "fixed"),
        g: this.#mutate(this.color.g, "fixed"),
        b: this.#mutate(this.color.b, "fixed"),
        o: this.#mutate(this.color.o, "fixed", 0.1),
      },
      jumpLength: this.#mutate(this.jumpLength),
      energyEfficiency: this.#mutate(this.energyEfficiency),
      splitEfficiency: this.#mutate(this.splitEfficiency),
      maxEnergy: this.#mutate(this.maxEnergy),
      mutationRate: this.#mutate(this.mutationRate),
      mutationAmount: this.#mutate(this.mutationAmount),
      targetOrientation: Math.random() * 2 * Math.PI,
      orientationChangeSpeed: this.#mutate(this.orientationChangeSpeed),
      orientationChangeChance: this.#mutate(this.orientationChangeChance),
    };
    cells.push(new Cell(cellOptions));
    this.splitProgress = 0;
    this.energy = this.maxEnergy / 2;
  }

  #mutate(valueToMutate, mutationType = "exponential", mutationAmount = 50) {
    if (Math.random() < this.mutationRate) {
      if (mutationType === "exponential") {
        return (
          valueToMutate +
          (Math.random() - 0.5) * this.mutationAmount * valueToMutate
        );
      } else if (mutationType === "fixed") {
        return valueToMutate + (Math.random() - 0.5) * mutationAmount;
      }
    }
    return valueToMutate;
  }

  #move(SIZE_OF_CANVAS) {
    //if cell is outside the canvas, it will be moved to the other side
    if (this.x > SIZE_OF_CANVAS + this.radius) {
      this.x = 0 - this.radius;
    }
    if (this.x < 0 - this.radius) {
      this.x = SIZE_OF_CANVAS + this.radius;
    }
    if (this.y > SIZE_OF_CANVAS + this.radius) {
      this.y = 0 - this.radius;
    }
    if (this.y < 0 - this.radius) {
      this.y = SIZE_OF_CANVAS + this.radius;
    }

    this.x -= Math.sin(this.orientation) * this.speed;
    this.y -= Math.cos(this.orientation) * this.speed;
  }

  #jump() {
    const jumpY = Math.random();
    const jumpX = Math.random();
    if (jumpX > 0.6666) {
      this.x += this.jumpLength;
    }
    if (jumpX < 0.3334) {
      this.x -= this.jumpLength;
    }
    if (jumpY > 0.6666) {
      this.y += this.jumpLength;
    }
    if (jumpY < 0.3334) {
      this.y -= this.jumpLength;
    }
  }
}

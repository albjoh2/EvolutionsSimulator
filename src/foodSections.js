import Food from "./food.js";

export default class FoodSections {
  constructor(SIZE_OF_CANVAS) {
    this.SIZE_OF_CANVAS = SIZE_OF_CANVAS;
    this.SIZE_OF_STARTING_FOOD = 3.5;
    this.SECTION_SIZE = 10;
    this.AMOUNT_OF_FOOD = 70; // lower = more food
    this.FOOD_GROWTH_RATE = 1100;
    this.foodSections = {};
  }

  update(c) {
    Object.keys(this.foodSections).forEach((section) => {
      this.foodSections[section].forEach((food) => {
        food.draw(c);
        food.radius += food.growthRate / (food.radius * this.FOOD_GROWTH_RATE);
      });
    });

    return this.foodSections;
  }

  getSectionSize() {
    return this.SECTION_SIZE;
  }

  drawFoodSections() {
    for (
      let i = 0;
      i < (this.SIZE_OF_CANVAS * this.SIZE_OF_CANVAS) / this.AMOUNT_OF_FOOD;
      i++
    ) {
      let x = Math.random() * this.SIZE_OF_CANVAS;
      let y = Math.random() * this.SIZE_OF_CANVAS;
      let radius = Math.min(
        (Math.random() * (this.SIZE_OF_STARTING_FOOD - 0) + 0) /
          (Math.abs(Math.abs(x) - Math.abs(y)) / 50) +
          0.01,
        this.SIZE_OF_STARTING_FOOD
      );

      const sectionX = Math.floor(x / this.SECTION_SIZE);
      const sectionY = Math.floor(y / this.SECTION_SIZE);

      if (!this.foodSections[sectionX + "," + sectionY]) {
        this.foodSections[sectionX + "," + sectionY] = [];
      }

      this.foodSections[sectionX + "," + sectionY].push(
        new Food(x, y, radius, "#aaFFaa")
      );
    }

    return this.foodSections;
  }
}

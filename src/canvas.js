export default class Canvas {
  constructor(width, height, canvas) {
    this.width = width;
    this.height = height;
    this.canvas = document.getElementById(canvas);
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  draw(width, height) {
    this.resize(width, height);
    return this.ctx;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    canvas.width = this.width;
    canvas.height = this.height;
  }

  hide() {
    this.canvas.style.display = "none";
  }
}

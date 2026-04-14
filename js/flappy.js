function newElement(tagName, className) {
  const elem = document.createElement(tagName);
  elem.className = className;
  return elem;
}

function Obstacle(reverse = false) {
  this.element = newElement("div", "obstacle");

  const border = newElement("div", "border");
  const body = newElement("div", "body");

  this.element.appendChild(reverse ? body : border);
  this.element.appendChild(reverse ? border : body);

  this.setHeight = (height) => (body.style.height = `${height}px`);
}
/*
const b = new Obstacle(true);
b.setHeight(200);
document.querySelector("[tp-flappy]").appendChild(b.element);*/

function ObstaclePair(height, opening, x) {
  this.element = newElement("div", "obstacle-pair");

  this.top = new Obstacle(true);
  this.bottom = new Obstacle(false);

  this.element.appendChild(this.top.element);
  this.element.appendChild(this.bottom.element);

  this.sortOpening = () => {
    const heightTop = Math.random() * (height - opening);
    const heightBottom = height - opening - heightTop;

    this.top.setHeight(heightTop);
    this.bottom.setHeight(heightBottom);
  };

  this.setX = (x) => {
    this.element.style.left = `${x}px`;
  };

  this.getX = () => {
    return parseInt(this.element.style.left.split("px")[0]);
  };

  this.getWidth = () => this.element.clientWidth;

  this.sortOpening();
  this.setX(x);
}

const b = new ObstaclePair(700, 200, 800);
document.querySelector("[tp-flappy]").appendChild(b.element);

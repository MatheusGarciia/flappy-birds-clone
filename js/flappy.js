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

function ObstaclePair(height, opening, x) {
  this.element = newElement("div", "obstacle-pair");

  this.top = new Obstacle(true);
  this.bottom = new Obstacle(false);

  this.top.element.classList.add("top");
  this.bottom.element.classList.add("bottom");

  this.element.appendChild(this.top.element);
  this.element.appendChild(this.bottom.element);

  this.sortOpening = () => {
    const openingHeight = opening;
    const minBottom = height * 0.15;

    const maxTop = height - openingHeight - minBottom;

    const heightTop = Math.random() * maxTop;
    const heightBottom = height - openingHeight - heightTop;

    this.top.setHeight(heightTop);
    this.bottom.setHeight(heightBottom);

    this.bottom.element.style.top = `${heightTop + openingHeight}px`;
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

function Obstacles(height, width, opening, space, notifyPoint) {
  this.pairs = [
    new ObstaclePair(height, opening, width),
    new ObstaclePair(height, opening, width + space),
    new ObstaclePair(height, opening, width + space * 2),
    new ObstaclePair(height, opening, width + space * 3),
  ];

  const displacement = 3;

  this.animate = () => {
    this.pairs.forEach((pair) => {
      pair.setX(pair.getX() - displacement);

      if (pair.getX() < -pair.getWidth()) {
        const maxX = Math.max(...this.pairs.map((p) => p.getX()));
        pair.setX(maxX + space);
        pair.sortOpening();
      }

      const middle = width / 2;
      const crossTheMiddle =
        pair.getX() + displacement >= middle && pair.getX() < middle;
      if (crossTheMiddle) notifyPoint();
    });
  };
}

function Bird(gameHeight) {
  let flying = false;

  this.element = newElement("img", "bird");
  this.element.src = "imagens/passaro.png";

  this.getY = () => parseInt(this.element.style.bottom || "0");
  this.setY = (y) => (this.element.style.bottom = `${y}px`);

  window.onkeydown = (e) => (flying = true);
  window.onkeyup = (e) => (flying = false);

  this.animate = () => {
    const newY = this.getY() + (flying ? 8 : -5);
    const maxHeight = gameHeight - this.element.clientHeight;

    if (newY <= 0) {
      this.setY(0);
    } else if (newY >= maxHeight) {
      this.setY(maxHeight);
    } else {
      this.setY(newY);
    }
  };

  this.setY(gameHeight / 2);
}

function Progress() {
  this.element = newElement("span", "progress");

  this.attPoints = (points) => {
    this.element.innerHTML = points;
  };
  this.attPoints(0);
}

function Overlapping(elementA, elementB) {
  const a = elementA.getBoundingClientRect();
  const b = elementB.getBoundingClientRect();

  const horizontal = a.left < b.right && a.right > b.left;
  const vertical = a.top < b.bottom && a.bottom > b.top;

  return horizontal && vertical;
}

function Collided(bird, obstacles) {
  let collided = false;

  obstacles.pairs.forEach((obstaclesPair) => {
    const top = obstaclesPair.top.element;
    const bottom = obstaclesPair.bottom.element;

    collided =
      collided ||
      Overlapping(bird.element, top) ||
      Overlapping(bird.element, bottom);
  });

  return collided;
}

function FlappyBird() {
  let points = 0;

  const gameArea = document.querySelector(`[tp-flappy]`);
  const height = gameArea.clientHeight;
  const width = gameArea.clientWidth;

  const progress = new Progress();
  const obstacles = new Obstacles(height, width, 200, 400, () =>
    progress.attPoints(++points),
  );

  const bird = new Bird(height);

  gameArea.appendChild(progress.element);
  gameArea.appendChild(bird.element);

  obstacles.pairs.forEach((pair) => gameArea.appendChild(pair.element));

  this.start = () => {
    const timer = setInterval(() => {
      obstacles.animate();
      bird.animate();

      if (Collided(bird, obstacles)) {
        clearInterval(timer);
      }
    }, 20);
  };
}

document.addEventListener("DOMContentLoaded", () => {
  new FlappyBird().start();
});

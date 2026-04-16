const newElement = (tagName, className) => {
  const element = document.createElement(tagName);
  element.className = className;
  return element;
};

class Obstacle {
  constructor(reverse = false) {
    this.element = newElement("div", "obstacle");

    this.border = newElement("div", "border");
    this.body = newElement("div", "body");

    this.element.appendChild(reverse ? this.body : this.border);
    this.element.appendChild(reverse ? this.border : this.body);
  }

  setHeight(height) {
    this.body.style.height = `${height}px`;
  }
}

class ObstaclePair {
  constructor(height, opening, x) {
    this.element = newElement("div", "obstacle-pair");

    this.top = new Obstacle(true);
    this.bottom = new Obstacle(false);

    this.top.element.classList.add("top");
    this.bottom.element.classList.add("bottom");

    this.element.append(this.top.element, this.bottom.element);

    this.height = height;
    this.opening = opening;

    this.sortOpening();
    this.setX(x);
  }

  sortOpening() {
    const minBottom = this.height * 0.15;
    const maxTop = this.height - this.opening - minBottom;

    const heightTop = Math.random() * maxTop;
    const heightBottom = this.height - this.opening - heightTop;

    this.top.setHeight(heightTop);
    this.bottom.setHeight(heightBottom);

    this.bottom.element.style.top = `${heightTop + this.opening}px`;
  }

  setX(x) {
    this.element.style.left = `${x}px`;
  }

  getX() {
    return parseInt(this.element.style.left, 10);
  }

  getWidth() {
    return this.element.clientWidth;
  }
}

class Obstacles {
  constructor(height, width, opening, space, notifyPoint) {
    this.space = space;
    this.notifyPoint = notifyPoint;
    this.width = width;
    this.displacement = 3;

    this.pairs = Array.from({ length: 4 }, (_, i) => {
      return new ObstaclePair(height, opening, width + space * i);
    });
  }

  animate() {
    this.pairs.forEach((pair) => {
      pair.setX(pair.getX() - this.displacement);

      if (pair.getX() < -pair.getWidth()) {
        const maxX = Math.max(...this.pairs.map((p) => p.getX()));
        pair.setX(maxX + this.space);
        pair.sortOpening();
      }

      const middle = this.width / 2;
      const crossed =
        pair.getX() + this.displacement >= middle && pair.getX() < middle;

      if (crossed) this.notifyPoint();
    });
  }
}

class Bird {
  constructor(gameHeight) {
    this.gameHeight = gameHeight;
    this.flying = false;

    this.element = newElement("img", "bird");
    this.element.src = "imagens/passaro.png";

    this.setY(gameHeight / 2);

    window.addEventListener("keydown", () => (this.flying = true));
    window.addEventListener("keyup", () => (this.flying = false));
  }

  getY() {
    return parseInt(this.element.style.bottom || "0", 10);
  }

  setY(y) {
    this.element.style.bottom = `${y}px`;
  }

  animate() {
    const newY = this.getY() + (this.flying ? 8 : -5);
    const maxHeight = this.gameHeight - this.element.clientHeight;

    this.setY(Math.max(0, Math.min(newY, maxHeight)));
  }
}

class Progress {
  constructor() {
    this.element = newElement("span", "progress");
    this.update(0);
  }

  update(points) {
    this.element.innerHTML = points;
  }
}

const isOverlapping = (a, b) => {
  const rectA = a.getBoundingClientRect();
  const rectB = b.getBoundingClientRect();

  const horizontal = rectA.left < rectB.right && rectA.right > rectB.left;

  const vertical = rectA.top < rectB.bottom && rectA.bottom > rectB.top;

  return horizontal && vertical;
};

const hasCollision = (bird, obstacles) => {
  return obstacles.pairs.some((pair) => {
    return (
      isOverlapping(bird.element, pair.top.element) ||
      isOverlapping(bird.element, pair.bottom.element)
    );
  });
};

class FlappyBird {
  constructor() {
    this.points = 0;

    this.gameArea = document.querySelector("[tp-flappy]");
    this.height = this.gameArea.clientHeight;
    this.width = this.gameArea.clientWidth;

    this.progress = new Progress();

    this.obstacles = new Obstacles(this.height, this.width, 200, 400, () =>
      this.progress.update(++this.points),
    );

    this.bird = new Bird(this.height);

    this.gameArea.append(
      this.progress.element,
      this.bird.element,
      ...this.obstacles.pairs.map((p) => p.element),
    );
  }

  start() {
    this.timer = setInterval(() => {
      this.obstacles.animate();
      this.bird.animate();

      if (hasCollision(this.bird, this.obstacles)) {
        clearInterval(this.timer);
      }
    }, 20);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new FlappyBird().start();
});

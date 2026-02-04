export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function createInitialState(width, height, rng = Math.random) {
  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);
  const snake = [
    { x: midX, y: midY },
    { x: midX - 1, y: midY },
    { x: midX - 2, y: midY },
  ];
  const direction = "right";
  const food = placeFood({ width, height, snake }, rng);

  return {
    width,
    height,
    snake,
    direction,
    nextDirection: direction,
    food,
    score: 0,
    gameOver: false,
  };
}

export function changeDirection(state, nextDirection) {
  if (OPPOSITE[state.direction] === nextDirection) {
    return state;
  }
  return { ...state, nextDirection };
}

export function step(state, rng = Math.random) {
  if (state.gameOver) return state;

  const direction = state.nextDirection || state.direction;
  const vector = DIRECTIONS[direction];
  const head = state.snake[0];
  const newHead = { x: head.x + vector.x, y: head.y + vector.y };

  const hitWall =
    newHead.x < 0 ||
    newHead.y < 0 ||
    newHead.x >= state.width ||
    newHead.y >= state.height;
  if (hitWall) {
    return { ...state, gameOver: true };
  }

  const willGrow = newHead.x === state.food.x && newHead.y === state.food.y;
  const bodyToCheck = willGrow
    ? state.snake
    : state.snake.slice(0, state.snake.length - 1);

  const hitSelf = bodyToCheck.some(
    (segment) => segment.x === newHead.x && segment.y === newHead.y
  );
  if (hitSelf) {
    return { ...state, gameOver: true };
  }

  const newSnake = [newHead, ...state.snake];
  if (!willGrow) newSnake.pop();

  return {
    ...state,
    snake: newSnake,
    direction,
    nextDirection: direction,
    food: willGrow ? placeFood({ ...state, snake: newSnake }, rng) : state.food,
    score: willGrow ? state.score + 1 : state.score,
  };
}

export function placeFood(state, rng = Math.random) {
  const emptyCells = [];
  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      const occupied = state.snake.some(
        (segment) => segment.x === x && segment.y === y
      );
      if (!occupied) emptyCells.push({ x, y });
    }
  }
  if (emptyCells.length === 0) {
    return { x: 0, y: 0 };
  }
  const index = Math.floor(rng() * emptyCells.length);
  return emptyCells[index];
}

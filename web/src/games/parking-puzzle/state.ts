// Parking Puzzle: slide cars horizontally or vertically to get the red car out.
// Similar to Rush Hour but simplified and self-contained.

export interface ParkingPuzzleSettings {
  difficulty: "easy" | "medium" | "hard";
}

export type CarOrientation = "H" | "V";

export interface Car {
  id: number;
  col: number;
  row: number;
  length: number;
  orientation: CarOrientation;
  isTarget: boolean;
}

export interface ParkingPuzzleState {
  settings: ParkingPuzzleSettings;
  size: number; // 6x6 grid
  cars: readonly Car[];
  /** Exit col (for target car exiting right) */
  exitCol: number;
  exitRow: number;
  selectedCar: number | null;
  moves: number;
  won: boolean;
}

export type ParkingPuzzleAction =
  | { type: "selectCar"; carId: number }
  | { type: "moveCar"; carId: number; delta: number };

function occupiedCells(car: Car): [number, number][] {
  const cells: [number, number][] = [];
  for (let i = 0; i < car.length; i++) {
    if (car.orientation === "H") cells.push([car.col + i, car.row]);
    else cells.push([car.col, car.row + i]);
  }
  return cells;
}

function isCellOccupied(cars: readonly Car[], col: number, row: number, excludeId: number): boolean {
  for (const car of cars) {
    if (car.id === excludeId) continue;
    for (const [c, r] of occupiedCells(car)) {
      if (c === col && r === row) return true;
    }
  }
  return false;
}

function canMove(cars: readonly Car[], carId: number, delta: number, size: number): boolean {
  const car = cars.find(c => c.id === carId)!;
  if (delta === 0) return false;
  const step = delta > 0 ? 1 : -1;
  let curDelta = 0;
  while (curDelta !== delta) {
    curDelta += step;
    let newCol = car.col, newRow = car.row;
    if (car.orientation === "H") newCol += curDelta;
    else newRow += curDelta;
    // Check bounds
    if (car.orientation === "H") {
      if (newCol < 0 || newCol + car.length - 1 >= size) return false;
    } else {
      if (newRow < 0 || newRow + car.length - 1 >= size) return false;
    }
    // Check for conflicts with new cells
    const newCar = { ...car, col: newCol, row: newRow };
    for (const [c, r] of occupiedCells(newCar)) {
      const originalOccupied = occupiedCells(car).some(([oc, or]) => oc === c && or === r);
      if (!originalOccupied && isCellOccupied(cars, c, r, carId)) return false;
    }
  }
  return true;
}

interface PuzzleDef {
  cars: Omit<Car, "isTarget">[];
  targetId: number;
}

const PUZZLES: PuzzleDef[] = [
  // Easy puzzles
  {
    targetId: 0,
    cars: [
      { id: 0, col: 1, row: 2, length: 2, orientation: "H" },
      { id: 1, col: 3, row: 0, length: 2, orientation: "V" },
      { id: 2, col: 4, row: 0, length: 2, orientation: "H" },
    ],
  },
  {
    targetId: 0,
    cars: [
      { id: 0, col: 0, row: 2, length: 2, orientation: "H" },
      { id: 1, col: 2, row: 0, length: 3, orientation: "V" },
      { id: 2, col: 3, row: 1, length: 2, orientation: "H" },
      { id: 3, col: 4, row: 3, length: 2, orientation: "V" },
    ],
  },
  {
    targetId: 0,
    cars: [
      { id: 0, col: 0, row: 2, length: 2, orientation: "H" },
      { id: 1, col: 2, row: 1, length: 2, orientation: "V" },
      { id: 2, col: 3, row: 2, length: 2, orientation: "H" },
    ],
  },
  // Medium puzzles
  {
    targetId: 0,
    cars: [
      { id: 0, col: 1, row: 2, length: 2, orientation: "H" },
      { id: 1, col: 3, row: 0, length: 3, orientation: "V" },
      { id: 2, col: 0, row: 0, length: 2, orientation: "V" },
      { id: 3, col: 4, row: 1, length: 2, orientation: "H" },
      { id: 4, col: 1, row: 4, length: 2, orientation: "H" },
    ],
  },
  {
    targetId: 0,
    cars: [
      { id: 0, col: 0, row: 2, length: 2, orientation: "H" },
      { id: 1, col: 2, row: 0, length: 2, orientation: "V" },
      { id: 2, col: 3, row: 0, length: 2, orientation: "H" },
      { id: 3, col: 4, row: 2, length: 3, orientation: "V" },
      { id: 4, col: 2, row: 3, length: 2, orientation: "H" },
    ],
  },
  {
    targetId: 0,
    cars: [
      { id: 0, col: 1, row: 2, length: 2, orientation: "H" },
      { id: 1, col: 3, row: 2, length: 2, orientation: "H" },
      { id: 2, col: 0, row: 0, length: 2, orientation: "H" },
      { id: 3, col: 3, row: 0, length: 2, orientation: "V" },
      { id: 4, col: 5, row: 1, length: 2, orientation: "V" },
    ],
  },
  // Hard puzzles
  {
    targetId: 0,
    cars: [
      { id: 0, col: 0, row: 2, length: 2, orientation: "H" },
      { id: 1, col: 2, row: 0, length: 3, orientation: "V" },
      { id: 2, col: 3, row: 0, length: 2, orientation: "H" },
      { id: 3, col: 0, row: 0, length: 2, orientation: "V" },
      { id: 4, col: 3, row: 3, length: 3, orientation: "V" },
      { id: 5, col: 4, row: 2, length: 2, orientation: "H" },
      { id: 6, col: 1, row: 4, length: 2, orientation: "H" },
    ],
  },
  {
    targetId: 0,
    cars: [
      { id: 0, col: 0, row: 2, length: 2, orientation: "H" },
      { id: 1, col: 2, row: 0, length: 2, orientation: "V" },
      { id: 2, col: 4, row: 0, length: 2, orientation: "V" },
      { id: 3, col: 0, row: 0, length: 2, orientation: "H" },
      { id: 4, col: 2, row: 2, length: 2, orientation: "H" },
      { id: 5, col: 3, row: 3, length: 2, orientation: "V" },
      { id: 6, col: 0, row: 4, length: 3, orientation: "H" },
      { id: 7, col: 4, row: 3, length: 2, orientation: "H" },
    ],
  },
];

export function initialState(seed: number, settings: ParkingPuzzleSettings): ParkingPuzzleState {
  const easyCount = 3, medCount = 3;
  let puzzleIndex: number;
  if (settings.difficulty === "easy") puzzleIndex = seed % easyCount;
  else if (settings.difficulty === "medium") puzzleIndex = easyCount + (seed % medCount);
  else puzzleIndex = easyCount + medCount + (seed % 2);

  const p = PUZZLES[puzzleIndex]!;
  const cars: Car[] = p.cars.map(c => ({ ...c, isTarget: c.id === p.targetId }));
  const SIZE = 6;
  return {
    settings,
    size: SIZE,
    cars,
    exitCol: SIZE,
    exitRow: cars.find(c => c.isTarget)?.row ?? 2,
    selectedCar: null,
    moves: 0,
    won: false,
  };
}

export function reducer(state: ParkingPuzzleState, action: ParkingPuzzleAction): ParkingPuzzleState {
  if (state.won) return state;

  if (action.type === "selectCar") {
    return { ...state, selectedCar: action.carId };
  }

  if (action.type === "moveCar") {
    const { carId, delta } = action;
    if (!canMove(state.cars, carId, delta, state.size)) return state;

    const cars = state.cars.map(car => {
      if (car.id !== carId) return car;
      const newCar = car.orientation === "H"
        ? { ...car, col: car.col + delta }
        : { ...car, row: car.row + delta };
      return newCar;
    });

    const targetCar = cars.find(c => c.isTarget)!;
    const won = targetCar.orientation === "H" && targetCar.col + targetCar.length >= state.size;
    return { ...state, cars, moves: state.moves + 1, won };
  }

  return state;
}

export function isTerminal(state: ParkingPuzzleState): { score: number } | null {
  if (!state.won) return null;
  return { score: Math.max(50, 600 - state.moves * 10) };
}

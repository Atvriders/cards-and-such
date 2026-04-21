export interface Coord { row: number; col: number }

export class Grid<T> {
  readonly rows: number;
  readonly cols: number;
  private readonly cells: readonly T[];

  constructor(rows: number, cols: number, cells: readonly T[]) {
    if (cells.length !== rows * cols) {
      throw new Error(`Grid size mismatch: ${cells.length} vs ${rows * cols}`);
    }
    this.rows = rows;
    this.cols = cols;
    this.cells = cells;
  }

  static filled<T>(rows: number, cols: number, value: T): Grid<T> {
    return new Grid(rows, cols, new Array(rows * cols).fill(value));
  }

  inBounds(c: Coord): boolean {
    return c.row >= 0 && c.row < this.rows && c.col >= 0 && c.col < this.cols;
  }

  get(c: Coord): T {
    if (!this.inBounds(c)) throw new Error(`Out of bounds: ${c.row},${c.col}`);
    return this.cells[c.row * this.cols + c.col]!;
  }

  set(c: Coord, value: T): Grid<T> {
    if (!this.inBounds(c)) throw new Error(`Out of bounds: ${c.row},${c.col}`);
    const next = [...this.cells];
    next[c.row * this.cols + c.col] = value;
    return new Grid(this.rows, this.cols, next);
  }

  *coords(): IterableIterator<Coord> {
    for (let r = 0; r < this.rows; r++) {
      for (let col = 0; col < this.cols; col++) yield { row: r, col };
    }
  }

  toArray(): readonly T[] { return this.cells; }
}

export function neighbors8(c: Coord): Coord[] {
  const out: Coord[] = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++)
      if (dr !== 0 || dc !== 0) out.push({ row: c.row + dr, col: c.col + dc });
  return out;
}

export function neighbors4(c: Coord): Coord[] {
  return [
    { row: c.row - 1, col: c.col },
    { row: c.row + 1, col: c.col },
    { row: c.row, col: c.col - 1 },
    { row: c.row, col: c.col + 1 },
  ];
}

const DIRS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],   // horizontal
  [1, 0],   // vertical
  [1, 1],   // diag down-right
  [1, -1],  // diag down-left
];

/**
 * If the coord is part of a run of `length` matching values (via eq), return that run as an array of coords.
 * Checks all 4 directions starting from this coord, extending both ways.
 */
export function lineThroughContains<T>(
  grid: Grid<T>,
  at: Coord,
  length: number,
  eq: (a: T, b: T) => boolean,
): Coord[] | null {
  const base = grid.get(at);
  for (const [dr, dc] of DIRS) {
    const line: Coord[] = [at];
    // extend forward
    for (let i = 1; i < length; i++) {
      const c = { row: at.row + dr * i, col: at.col + dc * i };
      if (!grid.inBounds(c) || !eq(grid.get(c), base)) break;
      line.push(c);
    }
    // extend backward
    for (let i = 1; i < length; i++) {
      const c = { row: at.row - dr * i, col: at.col - dc * i };
      if (!grid.inBounds(c) || !eq(grid.get(c), base)) break;
      line.unshift(c);
    }
    if (line.length >= length) return line.slice(0, length);
  }
  return null;
}

/** Find any winning line of a given length. Returns null if none. */
export function findWinningLine<T>(
  grid: Grid<T>,
  length: number,
  isFilled: (v: T) => boolean,
  eq: (a: T, b: T) => boolean = (a, b) => a === b,
): Coord[] | null {
  for (const c of grid.coords()) {
    if (!isFilled(grid.get(c))) continue;
    const line = lineThroughContains(grid, c, length, eq);
    if (line) return line;
  }
  return null;
}

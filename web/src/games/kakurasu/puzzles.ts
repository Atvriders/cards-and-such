// Kakurasu puzzles
// N×N grid. Column values = col index + 1 (e.g., col 0=1, col 1=2, ... col 4=5)
// Row values = row index + 1 similarly.
// Row clue = sum of column-values for shaded cells in that row.
// Col clue = sum of row-values for shaded cells in that column.
// Player shades cells to satisfy all clues.

export interface KakurasuPuzzle {
  size: number;
  rowClues: number[];
  colClues: number[];
  solution: boolean[];
}

function mk(size: number, solution: boolean[]): KakurasuPuzzle {
  const rowClues = new Array<number>(size).fill(0);
  const colClues = new Array<number>(size).fill(0);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (solution[r * size + c] === true) {
        rowClues[r]! += c + 1; // column value = col + 1
        colClues[c]! += r + 1; // row value = row + 1
      }
    }
  }
  return { size, rowClues, colClues, solution };
}

export const PUZZLES: KakurasuPuzzle[] = [
  // 5×5 puzzles
  mk(5, [
    true,false,true,false,true,
    false,true,false,true,false,
    true,true,false,false,true,
    false,false,true,true,false,
    true,false,false,false,true,
  ]),
  mk(5, [
    false,true,false,true,false,
    true,false,true,false,true,
    false,false,true,false,false,
    true,true,false,true,true,
    false,true,false,true,false,
  ]),
  mk(5, [
    true,true,true,false,false,
    false,false,false,true,true,
    true,false,true,false,true,
    false,true,false,true,false,
    true,false,false,false,true,
  ]),
  mk(5, [
    false,false,true,true,false,
    true,true,false,false,true,
    false,true,true,false,false,
    true,false,false,true,true,
    false,true,false,true,false,
  ]),
  mk(5, [
    true,false,false,true,false,
    false,true,true,false,false,
    true,true,false,true,true,
    false,false,true,false,true,
    true,false,true,false,false,
  ]),
  // 6×6 puzzles
  mk(6, [
    true,false,true,false,true,false,
    false,true,false,true,false,true,
    true,true,false,false,true,true,
    false,false,true,true,false,false,
    true,false,false,true,false,true,
    false,true,true,false,true,false,
  ]),
];

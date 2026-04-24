// Mosaic (also called Minesweeper-like) — 6×6 grid
// Each cell is black or white.
// Clue cells show a number = count of black cells in the cell's 3×3 neighbourhood (including itself).
// null = no clue given for that cell.
// solution: true = black, false = white.

export interface MosaicPuzzle {
  size: number;
  clues: (number | null)[];
  solution: boolean[];
}

function m(size: number, clues: (number | null)[], solution: boolean[]): MosaicPuzzle {
  return { size, clues, solution };
}

function _ (): null { return null; }
const X = true;
const O = false;

export const PUZZLES: MosaicPuzzle[] = [
  // Puzzle 1 — 6×6
  m(6,
    [2,_(),_(),_(),_(),1,
     _(),4,_(),_(),3,_(),
     _(),_(),5,4,_(),_(),
     _(),_(),4,5,_(),_(),
     _(),3,_(),_(),4,_(),
     1,_(),_(),_(),_(),2],
    [X,X,O,O,X,X,
     X,X,O,O,X,X,
     O,O,X,X,O,O,
     O,O,X,X,O,O,
     X,X,O,O,X,X,
     X,X,O,O,X,X]
  ),
  // Puzzle 2 — 6×6
  m(6,
    [1,_(),_(),_(),_(),2,
     _(),2,_(),_(),3,_(),
     _(),_(),4,3,_(),_(),
     _(),_(),3,4,_(),_(),
     _(),2,_(),_(),2,_(),
     2,_(),_(),_(),_(),1],
    [O,X,O,O,X,O,
     X,X,X,X,X,X,
     O,X,X,X,X,O,
     O,X,X,X,X,O,
     X,X,X,X,X,X,
     O,X,O,O,X,O]
  ),
  // Puzzle 3 — 6×6
  m(6,
    [3,_(),_(),_(),_(),3,
     _(),5,_(),_(),5,_(),
     _(),_(),4,4,_(),_(),
     _(),_(),4,4,_(),_(),
     _(),5,_(),_(),5,_(),
     3,_(),_(),_(),_(),3],
    [X,X,O,O,X,X,
     X,X,X,X,X,X,
     O,X,X,X,X,O,
     O,X,X,X,X,O,
     X,X,X,X,X,X,
     X,X,O,O,X,X]
  ),
  // Puzzle 4 — 6×6
  m(6,
    [0,_(),1,1,_(),0,
     _(),2,_(),_(),2,_(),
     2,_(),_(),_(),_(),2,
     2,_(),_(),_(),_(),2,
     _(),2,_(),_(),2,_(),
     0,_(),1,1,_(),0],
    [O,O,O,O,O,O,
     O,X,O,O,X,O,
     O,O,X,X,O,O,
     O,O,X,X,O,O,
     O,X,O,O,X,O,
     O,O,O,O,O,O]
  ),
  // Puzzle 5 — 6×6
  m(6,
    [2,_(),_(),_(),_(),2,
     _(),3,_(),_(),3,_(),
     _(),_(),2,2,_(),_(),
     _(),_(),2,2,_(),_(),
     _(),3,_(),_(),3,_(),
     2,_(),_(),_(),_(),2],
    [X,O,X,X,O,X,
     O,X,O,O,X,O,
     X,O,X,X,O,X,
     X,O,X,X,O,X,
     O,X,O,O,X,O,
     X,O,X,X,O,X]
  ),
];

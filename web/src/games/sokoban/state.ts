import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
import { SOKOBAN_LEVELS, parseLevel } from "./puzzles.js";
import type { ParsedLevel, CellType } from "./puzzles.js";

export type { CellType };

export interface SokobanSettings {
  difficulty: "easy" | "medium" | "hard";
}

export interface SokobanState {
  level: ParsedLevel;
  parMoves: number;
  playerPos: [number, number];
  crates: [number, number][];
  movesMade: number;
  won: boolean;
  settings: SokobanSettings;
}

export type SokobanAction =
  | { type: "move"; dr: number; dc: number }
  | { type: "reset" };

function isWall(level: ParsedLevel, r: number, c: number): boolean {
  const cell = level.grid[r]?.[c];
  return cell === "wall" || cell === "void" || cell === undefined;
}

function isTarget(level: ParsedLevel, r: number, c: number): boolean {
  return level.grid[r]?.[c] === "target";
}

function crateAt(crates: [number, number][], r: number, c: number): number {
  return crates.findIndex(([cr, cc]) => cr === r && cc === c);
}

function checkWon(crates: [number, number][], level: ParsedLevel): boolean {
  return crates.every(([r, c]) => isTarget(level, r, c));
}

export function initialState(seed: number, settings: SokobanSettings): SokobanState {
  const rng = mulberry32(seed);
  const pool = SOKOBAN_LEVELS.filter((l) => l.difficulty === settings.difficulty);
  const lvl = pool[Math.floor(rng() * pool.length)]!;
  const parsed = parseLevel(lvl);
  return {
    level: parsed,
    parMoves: lvl.parMoves,
    playerPos: parsed.playerPos,
    crates: parsed.crates.map((c) => [...c] as [number, number]),
    movesMade: 0,
    won: false,
    settings,
  };
}

export function reducer(state: SokobanState, action: SokobanAction): SokobanState {
  switch (action.type) {
    case "reset": {
      return { ...state, playerPos: state.level.playerPos, crates: state.level.crates.map((c) => [...c] as [number, number]), movesMade: 0, won: false };
    }
    case "move": {
      if (state.won) return state;
      const { dr, dc } = action;
      const [pr, pc] = state.playerPos;
      const nr = pr + dr;
      const nc = pc + dc;

      if (isWall(state.level, nr, nc)) return state;

      const crateIdx = crateAt(state.crates, nr, nc);
      if (crateIdx !== -1) {
        // Try to push crate
        const br = nr + dr;
        const bc = nc + dc;
        if (isWall(state.level, br, bc)) return state;
        if (crateAt(state.crates, br, bc) !== -1) return state; // another crate
        const newCrates = state.crates.map((c, i) =>
          i === crateIdx ? [br, bc] as [number, number] : c
        );
        const won = checkWon(newCrates, state.level);
        return {
          ...state,
          playerPos: [nr, nc],
          crates: newCrates,
          movesMade: state.movesMade + 1,
          won,
        };
      }

      return {
        ...state,
        playerPos: [nr, nc],
        movesMade: state.movesMade + 1,
      };
    }
    default:
      return state;
  }
}

export function isTerminal(state: SokobanState): { score: number } | null {
  if (!state.won) return null;
  const score = Math.max(50, state.parMoves - state.movesMade + 100);
  return { score };
}

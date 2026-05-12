import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KlotskiState, KlotskiSettings, Block } from "./state.js";
import { isTerminal, canMove, GOAL_ID, BOARD_ROWS, BOARD_COLS } from "./state.js";
import "./Klotski.css";

const CELL_PX = 60;
const GAP = 3;
const PAD = 3;

function blockStyle(b: Block): React.CSSProperties {
  return {
    top: PAD + b.row * (CELL_PX + GAP),
    left: PAD + b.col * (CELL_PX + GAP),
    width: b.w * CELL_PX + (b.w - 1) * GAP,
    height: b.h * CELL_PX + (b.h - 1) * GAP,
  };
}

function blockClass(b: Block, selected: boolean): string {
  let cls = "klotski-block";
  if (b.id === GOAL_ID) cls += " goal";
  else if (b.w === 1 && b.h > 1) cls += " vertical";
  else if (b.w > 1 && b.h === 1) cls += " horizontal";
  else cls += " square";
  if (selected) cls += " selected";
  return cls;
}

export function Klotski({
  state,
  dispatch,
  onGameOver,
}: GameProps<KlotskiState, KlotskiSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const sel = state.selectedId;

  function move(dr: number, dc: number) {
    if (sel === null) return;
    dispatch({ type: "move", id: sel, dr, dc });
  }

  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  return (
    <div className="klotski">
      <div className="klotski-info">
        <span>Moves: {state.moves}</span>
        {sel !== null && <span>Block {sel} selected</span>}
      </div>

      <div className={`klotski-status${state.won ? " won" : ""}`}>
        {state.won
          ? "Solved! Red block escaped! 🎉"
          : sel === null
          ? "Click a block to select it"
          : "Use arrow buttons below to slide the block"}
      </div>

      <div className="klotski-board-wrap">
        <div
          className="klotski-board"
          style={{ width: BOARD_COLS * CELL_PX + (BOARD_COLS - 1) * GAP + PAD * 2, height: BOARD_ROWS * CELL_PX + (BOARD_ROWS - 1) * GAP + PAD * 2 }}
        >
          {/* Background cells */}
          {Array.from({ length: BOARD_ROWS * BOARD_COLS }, (_, i) => (
            <div key={i} className="klotski-cell" />
          ))}

          {/* Blocks */}
          {state.blocks.map((b) => (
            <div
              key={b.id}
              className={blockClass(b, sel === b.id)}
              style={blockStyle(b)}
              onClick={() => dispatch({ type: "select", id: b.id })}
            >
              {b.id === GOAL_ID ? "🔴" : ""}
            </div>
          ))}
        </div>
        <div className="klotski-exit">EXIT</div>
      </div>

      {/* Direction buttons */}
      <div className="klotski-arrows">
        <div className="klotski-arrow-blank" />
        <button
          className="klotski-arrow-btn"
          title="Move block up"
          onClick={() => move(-1, 0)}
          disabled={sel === null || !canMove(state.blocks, sel, -1, 0)}
        >↑</button>
        <div className="klotski-arrow-blank" />

        <button
          className="klotski-arrow-btn"
          title="Move block left"
          onClick={() => move(0, -1)}
          disabled={sel === null || !canMove(state.blocks, sel, 0, -1)}
        >←</button>
        <div className="klotski-arrow-blank" />
        <button
          className="klotski-arrow-btn"
          title="Move block right"
          onClick={() => move(0, 1)}
          disabled={sel === null || !canMove(state.blocks, sel, 0, 1)}
        >→</button>

        <div className="klotski-arrow-blank" />
        <button
          className="klotski-arrow-btn"
          title="Move block down"
          onClick={() => move(1, 0)}
          disabled={sel === null || !canMove(state.blocks, sel, 1, 0)}
        >↓</button>
        <div className="klotski-arrow-blank" />
      </div>

      <p className="klotski-hint">
        Slide the red 🔴 block to the exit at the bottom center
      </p>
    </div>
  );
}

import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { XqState, XqSettings, XqAction } from "./state.js";
import { isTerminal, ROWS, COLS } from "./state.js";
import "./Game.css";

const PIECE_LABELS: Record<string, string> = {
  general: "將/帅", advisor: "士", elephant: "象", horse: "馬",
  chariot: "車", cannon: "砲", soldier: "兵",
};

const CELL = 52;
const PAD = 28;

export function Xiangqi({ state, dispatch, onGameOver }: GameProps<XqState, XqSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn === "red" && !state.winner;
  const W = (COLS - 1) * CELL + PAD * 2;
  const H = (ROWS - 1) * CELL + PAD * 2;

  let statusText = "";
  let statusClass = "";
  if (state.winner === "red") { statusText = "You win! Black general captured."; statusClass = "win"; }
  else if (state.winner === "black") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isMyTurn) statusText = "Bot (Black) thinking...";
  else if (state.selected !== null) statusText = "Select destination square";
  else statusText = "Your turn — select a Red piece";

  function handleClick(sq: number) {
    if (!isMyTurn) return;
    if (state.legalTargets.includes(sq)) {
      dispatch({ type: "move", to: sq } satisfies XqAction);
    } else {
      dispatch({ type: "select", sq } satisfies XqAction);
    }
  }

  return (
    <div className="xiangqi-game">
      <div className={`xiangqi-status ${statusClass}`}>{statusText}</div>
      <div className="xiangqi-board-wrap" style={{ width: W, height: H }}>
        <svg className="xiangqi-svg" width={W} height={H}>
          {/* Grid lines */}
          {Array.from({ length: ROWS }, (_, r) => (
            <line key={`hr${r}`} x1={PAD} y1={PAD + r * CELL} x2={PAD + (COLS-1)*CELL} y2={PAD + r * CELL} stroke="#8b4513" strokeWidth={1} />
          ))}
          {Array.from({ length: COLS }, (_, c) => (
            <g key={`vc${c}`}>
              {/* Columns split by river */}
              <line x1={PAD + c*CELL} y1={PAD} x2={PAD + c*CELL} y2={PAD + 4*CELL} stroke="#8b4513" strokeWidth={1} />
              <line x1={PAD + c*CELL} y1={PAD + 5*CELL} x2={PAD + c*CELL} y2={PAD + 9*CELL} stroke="#8b4513" strokeWidth={1} />
            </g>
          ))}
          {/* River label */}
          <text x={W/2} y={PAD + 4.5*CELL + 6} textAnchor="middle" fontSize={14} fill="#8b4513" fontStyle="italic">楚河  漢界</text>
          {/* Palace diagonals */}
          {[{r1:0,c1:3,r2:2,c2:5},{r1:0,c1:5,r2:2,c2:3},{r1:7,c1:3,r2:9,c2:5},{r1:7,c1:5,r2:9,c2:3}].map((d,i)=>(
            <line key={`pd${i}`} x1={PAD+d.c1*CELL} y1={PAD+d.r1*CELL} x2={PAD+d.c2*CELL} y2={PAD+d.r2*CELL} stroke="#8b4513" strokeWidth={1} />
          ))}
        </svg>
        {state.board.map((piece, sq) => {
          const r = Math.floor(sq / COLS);
          const c = sq % COLS;
          const x = PAD + c * CELL;
          const y = PAD + r * CELL;
          const isSelected = sq === state.selected;
          const isTarget = state.legalTargets.includes(sq);
          const size = 38;
          return (
            <div
              key={sq}
              className={`xiangqi-cell ${isSelected ? "selected" : ""} ${isTarget ? "target" : ""}`}
              style={{ left: x - size/2, top: y - size/2, width: size, height: size }}
              onClick={() => handleClick(sq)}
            >
              {piece ? (
                <div className={`xiangqi-piece ${piece.color}`}>
                  {piece.color === "red" ? PIECE_LABELS[piece.type]?.split("/")[1] ?? "?" : PIECE_LABELS[piece.type]?.split("/")[0] ?? "?"}
                </div>
              ) : isTarget ? (
                <div className="xiangqi-piece target-hint" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

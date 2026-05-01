import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniXiangqiState, MiniXiangqiAction, MiniXiangqiSettings } from "./state.js";
import { isTerminal, ROWS, COLS } from "./state.js";
import "./Game.css";

const ICONS: Record<string, string> = { K: "King", Cn: "Cnn", S: "Sld" };

export function MiniXiangqiGame({ state, dispatch, onGameOver }: GameProps<MiniXiangqiState, MiniXiangqiSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const onCell = (i: number) => {
    const p = state.board[i];
    if (state.selected !== null && state.legalTargets.includes(i)) {
      dispatch({ type: "moveTo", idx: i } as MiniXiangqiAction);
    } else if (p && p.color === "P") {
      dispatch({ type: "select", idx: i } as MiniXiangqiAction);
    }
  };

  return (
    <div className="mxq-wrap">
      <div className="mxq-header">
        <span>Mini Xiangqi</span>
        <span className="mxq-moves">Move {state.moves}</span>
      </div>
      <div className="mxq-board" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
        {Array.from({ length: ROWS * COLS }).map((_, i) => {
          const p = state.board[i];
          const isSel = state.selected === i;
          const isTarget = state.legalTargets.includes(i);
          const cls = `mxq-cell ${p ? (p.color === "P" ? "p" : "c") : ""} ${isSel ? "sel" : ""} ${isTarget ? "tgt" : ""}`;
          return (
            <button key={i} className={cls} onClick={() => onCell(i)}>
              {p ? ICONS[p.kind] : ""}
            </button>
          );
        })}
      </div>
      <div className="mxq-log">{state.log}</div>
      {state.phase === "done" && (
        <div className="mxq-done">
          <h3>{state.result === "P" ? "Victory!" : state.result === "C" ? "Defeat" : "Draw"}</h3>
          <div className="mxq-final">{state.score} pts</div>
        </div>
      )}
    </div>
  );
}

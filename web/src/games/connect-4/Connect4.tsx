import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import { COLS, ROWS, type Connect4State, type Connect4Action } from "@cards/shared";
import "./Connect4.css";

type Settings = { opponent: "bot" | "hot-seat"; botDepth: "2" | "4" };

export function Connect4({ state, dispatch, onGameOver }: GameProps<Connect4State & { settings: Settings }, Settings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    if (state.winner !== null && !endedRef.current) {
      endedRef.current = true;
      const score = state.winner === 0 ? 100 : state.winner === "draw" ? 50 : 0;
      onGameOver(score);
    }
  }, [state, onGameOver]);
  const winSet = new Set((state.winningLine ?? []).map(([r, c]) => `${r},${c}`));
  return (
    <div className="c4-root">
      <div className="c4-status">
        {state.winner === null
          ? <>Turn: <span className={state.turn === 0 ? "c4-red" : "c4-yellow"}>{state.turn === 0 ? "Red" : "Yellow"}</span></>
          : state.winner === "draw" ? "Draw" : `Winner: ${state.winner === 0 ? "Red" : "Yellow"}`}
      </div>
      <div className="c4-board" data-testid="connect4-board">
        {Array.from({ length: ROWS }, (_, r) => (
          <div className="c4-row" key={r}>
            {Array.from({ length: COLS }, (_, c) => {
              const v = state.board[r * COLS + c];
              const winning = winSet.has(`${r},${c}`);
              return (
                <button
                  key={c}
                  className={`c4-cell ${v === 0 ? "red" : v === 1 ? "yellow" : ""} ${winning ? "win" : ""}`}
                  onClick={() => dispatch({ type: "drop", col: c } satisfies Connect4Action)}
                  data-testid={`c4-col-${c}-row-${r}`}
                  aria-label={`column ${c + 1} row ${r + 1}`}
                  disabled={state.winner !== null}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

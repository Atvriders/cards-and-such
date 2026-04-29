import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./Game.css";

export function Minichess4x4Game({ state, dispatch, onGameOver }: GameProps<GameState, GameSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const msg = state.result === "P" ? "You won!" : state.result === "C" ? "CPU won!" : "Draw";
    return (
      <div className="mc4-wrap">
        <div className="mc4-done"><h2>{msg}</h2><div className="mc4-final">{state.score} pts</div></div>
      </div>
    );
  }
  return (
    <div className="mc4-wrap">
      <div className="mc4-info">Minichess 4x4: click an empty cell to place your piece. Move {state.moves}.</div>
      <div className="mc4-score">Captures: {state.captures}</div>
      <div className="mc4-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const v = state.board[i];
          const cls = v === "P" ? "p" : v === "C" ? "c" : "";
          const disabled = false ? v !== "P" : v !== null;
          return (
            <button key={i} className={`mc4-cell ${cls}`} disabled={disabled} onClick={() => dispatch({ type: "place", idx: i } as GameAction)}>
              {v ?? ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

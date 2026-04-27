import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NumlinksState, NumlinksAction, NumlinksSettings } from "./state.js";
import { isTerminal, TOTAL_PUZZLES, GRID_SIZE } from "./state.js";
import "./Game.css";

export function NumlinksGame({ state, dispatch, onGameOver }: GameProps<NumlinksState, NumlinksSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="nl-wrap"><div className="nl-done"><h2>Done!</h2><div className="nl-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="nl-wrap">
      <div className="nl-info">Puzzle {state.puzzle} / {TOTAL_PUZZLES}</div>
      <div className="nl-score">{state.score} pts</div>
      <div className="nl-info">Next: {state.next > GRID_SIZE ? "—" : state.next}</div>
      <div className="nl-grid">
        {state.cells.map((v, i) => (
          <button
            key={i}
            className={`nl-cell ${v < state.next ? "done" : ""}`}
            disabled={state.phase !== "playing" || v < state.next}
            onClick={() => dispatch({ type: "click", index: i } as NumlinksAction)}
          >{v}</button>
        ))}
      </div>
      {state.phase === "finished" && (
        <button className="nl-btn alt" onClick={() => dispatch({ type: "next" } as NumlinksAction)}>{state.puzzle >= TOTAL_PUZZLES ? "Finish" : "Next Puzzle"}</button>
      )}
    </div>
  );
}

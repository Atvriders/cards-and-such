import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Nonogram3x3State, Nonogram3x3Action, Nonogram3x3Settings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function Nonogram3x3Game({ state, dispatch, onGameOver }: GameProps<Nonogram3x3State, Nonogram3x3Settings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="ng3-wrap">
        <div className="ng3-banner">
          <h2 className="ng3-title">Picture Found!</h2>
          <div className="ng3-stat">Moves: <b>{state.moves}</b></div>
          <div className="ng3-final">{t?.score} pts</div>
          <button className="ng3-btn primary" onClick={() => dispatch({ type: "reset" } as Nonogram3x3Action)}>
            New Puzzle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ng3-wrap">
      <div className="ng3-info">Fill cells so each row and column matches its clue numbers.</div>
      <div className="ng3-stat">Moves: <b>{state.moves}</b></div>
      <div className="ng3-board">
        <div className="ng3-corner" />
        {state.colClues.map((c, i) => (
          <div key={`c${i}`} className="ng3-clue col">{c.join(" ")}</div>
        ))}
        {[0, 1, 2].map((r) => (
          <>
            <div key={`rc${r}`} className="ng3-clue row">{state.rowClues[r]!.join(" ")}</div>
            {[0, 1, 2].map((c) => {
              const i = r * 3 + c;
              return (
                <button
                  key={i}
                  className={`ng3-cell${state.cells[i] ? " on" : ""}`}
                  onClick={() => dispatch({ type: "toggle", index: i } as Nonogram3x3Action)}
                  aria-label={state.cells[i] ? "filled" : "empty"}
                />
              );
            })}
          </>
        ))}
      </div>
      {state.message && <div className="ng3-msg">{state.message}</div>}
      <div className="ng3-actions">
        <button className="ng3-btn primary" onClick={() => dispatch({ type: "check" } as Nonogram3x3Action)}>Check</button>
        <button className="ng3-btn secondary" onClick={() => dispatch({ type: "reset" } as Nonogram3x3Action)}>New Puzzle</button>
      </div>
    </div>
  );
}

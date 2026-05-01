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
      <div className="nonogram3x3candy-wrap">
        <div className="nonogram3x3candy-banner">
          <h2 className="nonogram3x3candy-title">Picture Found!</h2>
          <div className="nonogram3x3candy-stat">Moves: <b>{state.moves}</b></div>
          <div className="nonogram3x3candy-final">{t?.score} pts</div>
          <button className="nonogram3x3candy-btn primary" onClick={() => dispatch({ type: "reset" } as Nonogram3x3Action)}>
            New Puzzle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nonogram3x3candy-wrap">
      <div className="nonogram3x3candy-info">Fill cells so each row and column matches its clue numbers.</div>
      <div className="nonogram3x3candy-stat">Moves: <b>{state.moves}</b></div>
      <div className="nonogram3x3candy-board">
        <div className="nonogram3x3candy-corner" />
        {state.colClues.map((c, i) => (
          <div key={`c${i}`} className="nonogram3x3candy-clue col">{c.join(" ")}</div>
        ))}
        {[0, 1, 2].map((r) => (
          <>
            <div key={`rc${r}`} className="nonogram3x3candy-clue row">{state.rowClues[r]!.join(" ")}</div>
            {[0, 1, 2].map((c) => {
              const i = r * 3 + c;
              return (
                <button
                  key={i}
                  className={`nonogram3x3candy-cell${state.cells[i] ? " on" : ""}`}
                  onClick={() => dispatch({ type: "toggle", index: i } as Nonogram3x3Action)}
                  aria-label={state.cells[i] ? "filled" : "empty"}
                />
              );
            })}
          </>
        ))}
      </div>
      {state.message && <div className="nonogram3x3candy-msg">{state.message}</div>}
      <div className="nonogram3x3candy-actions">
        <button className="nonogram3x3candy-btn primary" onClick={() => dispatch({ type: "check" } as Nonogram3x3Action)}>Check</button>
        <button className="nonogram3x3candy-btn secondary" onClick={() => dispatch({ type: "reset" } as Nonogram3x3Action)}>New Puzzle</button>
      </div>
    </div>
  );
}

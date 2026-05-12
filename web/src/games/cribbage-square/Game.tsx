import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CribbageSquareState, CribbageSquareAction, CribbageSquareSettings } from "./state.js";
import { isTerminal, cardName, scoreHand, calcTotalScore } from "./state.js";
import "./Game.css";

export function CribbageSquare({ state, dispatch, onGameOver }: GameProps<CribbageSquareState, CribbageSquareSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isRed = (c: number) => { const s = Math.floor(c / 13); return s === 1 || s === 2; };

  const rowScores = [0, 1, 2, 3].map(r => scoreHand([state.grid[r * 4]!, state.grid[r * 4 + 1]!, state.grid[r * 4 + 2]!, state.grid[r * 4 + 3]!]));
  const colScores = [0, 1, 2, 3].map(c => scoreHand([state.grid[c]!, state.grid[4 + c]!, state.grid[8 + c]!, state.grid[12 + c]!]));

  if (state.phase === "done") {
    return (
      <div className="csq-wrap">
        <h2>Complete! Score: {state.score}</h2>
        <div className="csq-grid">
          {state.grid.map((c, i) => (
            <div key={i} className="csq-cell" style={{ color: c !== null && isRed(c) ? "#e74c3c" : "#222" }}>{c !== null ? cardName(c) : ""}</div>
          ))}
        </div>
        <div style={{ fontSize: "0.85rem", color: "#555" }}>
          {rowScores.map((s, i) => <span key={i}>R{i + 1}:{s} </span>)} | {colScores.map((s, i) => <span key={i}>C{i + 1}:{s} </span>)}
        </div>
      </div>
    );
  }

  const total = calcTotalScore(state.grid);

  return (
    <div className="csq-wrap">
      <div className="csq-header">
        <span>Card: {state.currentCard !== null ? <strong style={{ color: isRed(state.currentCard) ? "#e74c3c" : "#222" }}>{cardName(state.currentCard)}</strong> : "Done"}</span>
        <span>Running: {total} pts</span>
        <span>{state.deckPos}/16</span>
      </div>
      <div className="csq-grid">
        {state.grid.map((c, i) => (
          <button key={i} className={`csq-cell${c === null ? " empty" : ""}`}
            title="Place card here"
            style={{ color: c !== null && isRed(c) ? "#e74c3c" : "#222" }}
            disabled={c !== null}
            onClick={() => dispatch({ type: "place", cellIndex: i } as CribbageSquareAction)}>
            {c !== null ? cardName(c) : "+"}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: "6px", fontSize: "0.8rem", color: "#555", flexWrap: "wrap", justifyContent: "center" }}>
        {rowScores.map((s, i) => <span key={i}>Row{i + 1}: {s}pts</span>)}
        {colScores.map((s, i) => <span key={i}>Col{i + 1}: {s}pts</span>)}
      </div>
    </div>
  );
}

import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConnectionsState, ConnectionsAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

type ConnectionsSettings = Record<string, never>;

export function WordConnections({ state, dispatch, onGameOver }: GameProps<ConnectionsState, ConnectionsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const solvedGroups = state.groups.filter(g => state.solvedColors.includes(g.color));
  const isGoodMsg = state.message.startsWith("Correct") || state.message === "Brilliant!";

  if (state.phase !== "playing" && state.allWords.length === 0) {
    return (
      <div className="conn-wrap">
        <div className="conn-title">Word Connections</div>
        <div className="conn-done">
          <h2>{state.phase === "won" ? "Solved!" : "Better luck next time"}</h2>
          <p style={{ fontWeight: 900, fontSize: "1.4rem", color: state.phase === "won" ? "#27ae60" : "#e74c3c" }}>
            Score: {terminal?.score ?? 0}
          </p>
        </div>
        <div className="conn-solved">
          {state.groups.map(g => (
            <div key={g.color} className={`conn-solved-row ${g.color}`}>
              <strong>{g.label}</strong>: {g.words.join(", ")}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="conn-wrap">
      <div className="conn-title">Word Connections</div>
      <div className="conn-solved">
        {solvedGroups.map(g => (
          <div key={g.color} className={`conn-solved-row ${g.color}`}>
            <strong>{g.label}</strong>: {g.words.join(", ")}
          </div>
        ))}
      </div>
      <div className="conn-grid">
        {state.allWords.map(w => (
          <div
            key={w}
            className={`conn-word${state.selected.includes(w) ? " selected" : ""}`}
            onClick={() => dispatch({ type: "toggle", word: w } as ConnectionsAction)}
          >{w}</div>
        ))}
      </div>
      <div className={`conn-message${isGoodMsg ? " good" : ""}`}>{state.message}</div>
      <div className="conn-btns">
        <button
          className="conn-btn secondary"
          onClick={() => dispatch({ type: "shuffle" } as ConnectionsAction)}
        >Shuffle</button>
        <button
          className="conn-btn"
          disabled={state.selected.length !== 4}
          onClick={() => dispatch({ type: "submit" } as ConnectionsAction)}
        >Submit</button>
      </div>
      <div className="conn-attempts">
        Mistakes remaining: {state.maxAttempts - state.attempts}
      </div>
    </div>
  );
}

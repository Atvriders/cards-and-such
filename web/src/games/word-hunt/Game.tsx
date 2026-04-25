import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WordHuntState, WordHuntAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

type WordHuntSettings = Record<string, never>;

export function WordHunt({ state, dispatch, onGameOver }: GameProps<WordHuntState, WordHuntSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as WordHuntAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  const urgent = state.timeLeft <= 15;
  const isGood = state.lastMessage.startsWith("+") || state.lastMessage === "";
  const pct = Math.round((state.found.length / state.category.words.length) * 100);

  if (state.phase === "done") {
    return (
      <div className="wordhunt-wrap">
        <div className="wordhunt-title">Word Hunt</div>
        <div className="wordhunt-done">
          <h2>Time's Up!</h2>
          <p>Category: <strong>{state.category.name}</strong></p>
          <p>Found {state.found.length} of {state.category.words.length} words ({pct}%)</p>
          <p style={{ fontWeight: 900, fontSize: "1.5rem", color: "#27ae60" }}>Score: {state.score}</p>
        </div>
        <div className="wordhunt-found">
          {state.found.map(w => <span key={w} className="wordhunt-chip">{w}</span>)}
        </div>
      </div>
    );
  }

  return (
    <div className="wordhunt-wrap">
      <div className="wordhunt-title">Word Hunt</div>
      <div className="wordhunt-header">
        <span className="wordhunt-score">Score: {state.score} | {state.found.length}/{state.category.words.length}</span>
        <span className={`wordhunt-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
      </div>
      <div className="wordhunt-category">{state.category.name}</div>
      <div className="wordhunt-hint">{state.category.hint}</div>
      <div className="wordhunt-found">
        {state.found.length === 0
          ? <span style={{ color: "#bdc3c7", fontSize: "0.85rem" }}>Found words appear here…</span>
          : state.found.map(w => <span key={w} className="wordhunt-chip">{w}</span>)
        }
      </div>
      <div className="wordhunt-input-row">
        <input
          className="wordhunt-input"
          type="text"
          value={state.input}
          placeholder={`Type a ${state.category.name.toLowerCase()}…`}
          autoFocus
          onChange={e => dispatch({ type: "type", text: e.target.value } as WordHuntAction)}
          onKeyDown={e => { if (e.key === "Enter") dispatch({ type: "submit" } as WordHuntAction); }}
        />
        <button className="wordhunt-btn" onClick={() => dispatch({ type: "submit" } as WordHuntAction)}>
          Go
        </button>
      </div>
      <div className={`wordhunt-message${!isGood ? " bad" : ""}`}>{state.lastMessage}</div>
      <div className="wordhunt-stats">Each word scores its letter count × 5 (min 5 pts)</div>
    </div>
  );
}

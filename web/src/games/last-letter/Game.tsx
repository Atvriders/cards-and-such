import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LastLetterState, LastLetterAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function LastLetter({ state, dispatch, onGameOver }: GameProps<LastLetterState, { duration: "60" | "90" | "120" }>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as LastLetterAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);

  const lastWord = state.chain[state.chain.length - 1]!;
  const needed = lastWord[lastWord.length - 1]!.toUpperCase();
  const urgent = state.timeLeft <= 10;

  const chainLen = state.chain.length;
  const display = chainLen > 6 ? state.chain.slice(chainLen - 6) : state.chain;

  if (state.phase === "done") {
    return (
      <div className="lastletter-wrap">
        <div className="lastletter-title">Last Letter</div>
        <div className="lastletter-done">
          <h2>Time's Up!</h2>
          <p>Chain: <strong>{chainLen - 1}</strong> words</p>
          <p style={{ fontWeight: 900, fontSize: "1.5rem", color: "#27ae60" }}>Score: {state.score}</p>
        </div>
        <div className="lastletter-chain">
          {state.chain.map((w, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {i > 0 && <span className="ll-arrow">→</span>}
              <span className={`ll-word${i === 0 ? " starter" : ""}`}>{w}</span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lastletter-wrap">
      <div className="lastletter-title">Last Letter</div>
      <div className="lastletter-header">
        <span className="lastletter-score">Score: {state.score} | Words: {chainLen - 1}</span>
        <span className={`lastletter-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
      </div>
      <div className="lastletter-chain">
        {chainLen > 6 && <span style={{ color: "#bdc3c7" }}>…</span>}
        {display.map((w, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {(i > 0 || chainLen > 6) && <span className="ll-arrow">→</span>}
            <span className={`ll-word${i === 0 && chainLen <= 6 ? " starter" : ""}`}>{w}</span>
          </span>
        ))}
      </div>
      <div className="lastletter-needed">
        Next word must start with: <strong style={{ fontSize: "1.3rem" }}>{needed}</strong>
      </div>
      <div className="lastletter-input-row">
        <input
          className="lastletter-input"
          type="text"
          value={state.input}
          placeholder={`Starts with "${needed}"…`}
          autoFocus
          onChange={e => dispatch({ type: "type", text: e.target.value } as LastLetterAction)}
          onKeyDown={e => { if (e.key === "Enter") dispatch({ type: "submit" } as LastLetterAction); }}
        />
        <button className="lastletter-btn" onClick={() => dispatch({ type: "submit" } as LastLetterAction)}>Add</button>
      </div>
      <div className="lastletter-error">{state.lastError}</div>
    </div>
  );
}

import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WordAssocState, WordAssocAction, WordAssocSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function WordAssociation({ state, dispatch, onGameOver }: GameProps<WordAssocState, WordAssocSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.phase !== "playing") {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      dispatch({ type: "tick" } as WordAssocAction);
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [state.phase, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="wordassoc-wrap">
        <div className="wordassoc-done">
          <h2>Time's Up!</h2>
          <p>Chain length: <strong>{state.chain.length - 1}</strong> words</p>
          <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#27ae60" }}>Score: {state.chain.length - 1}</p>
          <div className="wordassoc-final-chain">
            {state.chain.map((w, i) => (
              <span key={i} className={`wordassoc-word${i === 0 ? " starter" : ""}`}>{w}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const urgent = state.timeLeft <= 10;
  const chainLen = state.chain.length;
  const displayChain = chainLen > 8 ? state.chain.slice(chainLen - 8) : state.chain;

  return (
    <div className="wordassoc-wrap">
      <div className="wordassoc-header">
        <span className="wordassoc-score">Chain: {chainLen - 1} words</span>
        <span className={`wordassoc-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
      </div>

      <div className="wordassoc-chain-label">Associate from each word → next word</div>

      <div className="wordassoc-chain">
        {displayChain.map((w, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {i > 0 && <span className="wordassoc-arrow">→</span>}
            <span className={`wordassoc-word${i === 0 && state.chain.length <= 8 ? " starter" : ""}`}>{w}</span>
          </span>
        ))}
        {chainLen > 8 && <span style={{ color: "#bdc3c7" }}>…</span>}
      </div>

      <div className="wordassoc-input-row">
        <input
          className="wordassoc-input"
          type="text"
          value={state.inputText}
          placeholder={`Relates to "${state.chain[state.chain.length - 1]}"…`}
          onChange={e => dispatch({ type: "type", text: e.target.value } as WordAssocAction)}
          onKeyDown={e => {
            if (e.key === "Enter") dispatch({ type: "submit" } as WordAssocAction);
          }}
          autoFocus
        />
        <button
          className="wordassoc-btn"
          onClick={() => dispatch({ type: "submit" } as WordAssocAction)}
        >
          Add
        </button>
      </div>

      <div className="wordassoc-error">{state.lastError}</div>
    </div>
  );
}

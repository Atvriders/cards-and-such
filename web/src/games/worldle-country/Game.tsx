import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WorldleCountryState, WorldleCountryAction, WorldleCountrySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const KEY_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

const DIR_ARROW: Record<string, string> = {
  N: "↑",
  NE: "↗",
  E: "→",
  SE: "↘",
  S: "↓",
  SW: "↙",
  W: "←",
  NW: "↖",
  HERE: "★",
};

const BUCKET_LABEL = ["<100km", "<1000km", "<3000km", "<6000km", "<10000km", "far"];

export function WorldleCountryGame({ state, dispatch, onGameOver }: GameProps<WorldleCountryState, WorldleCountrySettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (state.status !== "playing") return;
    if (e.key === "Enter") dispatch({ type: "enter" } as WorldleCountryAction);
    else if (e.key === "Backspace") dispatch({ type: "backspace" } as WorldleCountryAction);
    else if (/^[a-zA-Z]$/.test(e.key)) dispatch({ type: "key", ch: e.key } as WorldleCountryAction);
  }, [state.status, dispatch]);
  useEffect(() => { window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onKey]);

  const isDone = state.status !== "playing";

  return (
    <div className="wdl-wrap">
      <div className="wdl-header">
        <span className="wdl-progress">Guess {Math.min(state.guesses.length + (isDone ? 0 : 1), state.maxGuesses)} / {state.maxGuesses}</span>
        <span className="wdl-score">{state.status === "won" ? "Won" : state.status === "lost" ? "Lost" : ""}</span>
      </div>
      <div className="wdl-prompt"><span className="wdl-label">Guess:</span> Type a country name and press Enter.</div>
      <div className="wdl-choices">
        {state.guesses.map((g, i) => (
          <div key={i} className={`wdl-choice ${g.direction === "HERE" ? "correct" : ""}`}>
            <span className="wdl-choice-letter">{i + 1}</span>
            <span>{g.name}</span>
            <span style={{ marginLeft: "auto", fontWeight: 800 }}>{BUCKET_LABEL[g.distance]} {DIR_ARROW[g.direction]}</span>
          </div>
        ))}
        {!isDone && (
          <div className="wdl-choice selected">
            <span className="wdl-choice-letter">{state.guesses.length + 1}</span>
            <span>{state.current || " "}</span>
          </div>
        )}
      </div>
      {state.message && (
        <div className={`wdl-feedback ${state.status === "won" ? "correct" : "wrong"}`}>{state.message}</div>
      )}
      {state.status === "lost" && (
        <div className="wdl-feedback wrong">Answer: {state.answer.name}</div>
      )}
      <div className="wdl-actions">
        {!isDone && (
          <button className="wdl-btn submit" disabled={state.current.length === 0} onClick={() => dispatch({ type: "enter" } as WorldleCountryAction)}>Submit</button>
        )}
        {isDone && (
          <button className="wdl-btn next" onClick={() => dispatch({ type: "reset" } as WorldleCountryAction)}>Play Again</button>
        )}
      </div>
      {!isDone && (
        <div className="wdl-choices" style={{ gap: 6 }}>
          {KEY_ROWS.map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
              {ri === 2 && (
                <button className="wdl-btn submit" style={{ padding: "8px 14px" }} onClick={() => dispatch({ type: "enter" } as WorldleCountryAction)}>ENTER</button>
              )}
              {row.split("").map(ch => (
                <button key={ch} className="wdl-choice" style={{ padding: "8px 12px", minWidth: 32, justifyContent: "center" }} onClick={() => dispatch({ type: "key", ch } as WorldleCountryAction)}>{ch}</button>
              ))}
              {ri === 2 && (
                <button className="wdl-btn next" style={{ padding: "8px 14px" }} onClick={() => dispatch({ type: "backspace" } as WorldleCountryAction)}>DEL</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

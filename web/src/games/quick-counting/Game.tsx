import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuickCountingState } from "./state.js";
import { isTerminal } from "./state.js";
import type { quickCountingSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type Settings = SettingsOf<typeof quickCountingSettings>;

// Emoji dots displayed for the counting task
function buildDots(count: number): string[] {
  const emojis = ["🔵","🔴","🟢","🟡","🟣","🟠","⚪","🔶","🔷","🟤"];
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(emojis[i % emojis.length]!);
  }
  return result;
}

export function QuickCounting({
  state,
  dispatch,
  onGameOver,
}: GameProps<QuickCountingState, Settings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase !== "showing") return;
    timerRef.current = setTimeout(() => dispatch({ type: "reveal" }), state.showMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.phase, state.round, state.showMs, dispatch]);

  const digits = ["1","2","3","4","5","6","7","8","9","0"];
  const dots = state.phase === "showing" ? buildDots(state.target) : [];

  return (
    <div className="qc-game">
      <div className="qc-header">
        <span>Round <strong>{state.round}/{state.totalRounds}</strong></span>
        <span>Score <strong>{state.score}</strong></span>
      </div>

      {state.phase === "idle" && (
        <div className="qc-center">
          <p className="qc-desc">Dots flash briefly. Count them and type the number!</p>
          <button className="qc-btn-primary" onClick={() => dispatch({ type: "start" })}>Start</button>
        </div>
      )}

      {state.phase === "showing" && (
        <div className="qc-center">
          <p className="qc-label">How many dots?</p>
          <div className="qc-dots">
            {dots.map((d, i) => <span key={i} className="qc-dot">{d}</span>)}
          </div>
        </div>
      )}

      {state.phase === "input" && (
        <div className="qc-center">
          <p className="qc-label">How many did you see?</p>
          <div className="qc-input-display">
            {state.playerInput || <span className="qc-placeholder">?</span>}
          </div>
          <div className="qc-keypad">
            {digits.map((d) => (
              <button key={d} className="qc-key" onClick={() => dispatch({ type: "type-digit", digit: d })}>{d}</button>
            ))}
            <button className="qc-key qc-key-del" onClick={() => dispatch({ type: "backspace" })}>⌫</button>
            <button
              className="qc-key qc-key-ok"
              disabled={!state.playerInput}
              onClick={() => dispatch({ type: "submit" })}
            >OK</button>
          </div>
        </div>
      )}

      {state.phase === "result" && (
        <div className="qc-center">
          <div className={`qc-result ${state.lastCorrect ? "correct" : "wrong"}`}>
            {state.lastCorrect ? "Correct!" : "Wrong!"}
          </div>
          <p className="qc-answer">The answer was: <strong>{state.target}</strong></p>
          {!state.lastCorrect && (
            <p className="qc-answer">You said: <strong>{state.playerInput}</strong></p>
          )}
          <button className="qc-btn-primary" onClick={() => dispatch({ type: "next" })}>
            {state.round >= state.totalRounds ? "Finish" : "Next"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="qc-center">
          <div className="qc-result correct">Done!</div>
          <p className="qc-answer">Score: <strong>{terminal?.score ?? state.score}</strong> / {state.totalRounds * 10}</p>
          <button className="qc-btn-primary" onClick={() => dispatch({ type: "start" })}>Play Again</button>
        </div>
      )}
    </div>
  );
}

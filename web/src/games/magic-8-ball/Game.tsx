import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Magic8BallState, Magic8BallSettings } from "./state.js";
import type { Magic8BallAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function Magic8Ball({
  state,
  dispatch,
  onGameOver,
}: GameProps<Magic8BallState, Magic8BallSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [localQ, setLocalQ] = useState(state.question);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const answerColor =
    state.currentAnswer?.kind === "positive" ? "#4dff88"
    : state.currentAnswer?.kind === "negative" ? "#ff4466"
    : "#aaccff";

  function handleShake() {
    if (!localQ.trim()) return;
    dispatch({ type: "setQuestion", question: localQ } as Magic8BallAction);
    dispatch({ type: "shake" } as Magic8BallAction);
    setLocalQ("");
  }

  const unlimited = state.maxShakes === 9999;

  return (
    <div className="m8b-game">
      <div className="m8b-title">Magic 8-Ball</div>
      {!unlimited && (
        <div className="m8b-counter">
          Shakes: {state.shakesUsed} / {state.maxShakes}
        </div>
      )}

      <div className="m8b-ball-wrapper">
        <div className="m8b-ball">
          <div className="m8b-ball-inner">
            {state.currentAnswer ? (
              <div className="m8b-answer" style={{ color: answerColor }}>
                {state.currentAnswer.text}
              </div>
            ) : (
              <div className="m8b-eight">8</div>
            )}
          </div>
        </div>
      </div>

      {!state.gameOver && (
        <div className="m8b-input-area">
          <input
            className="m8b-input"
            type="text"
            placeholder="Ask a yes/no question..."
            value={localQ}
            onChange={e => setLocalQ(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleShake(); }}
            maxLength={120}
          />
          <button
            className="m8b-shake-btn"
            onClick={handleShake}
            disabled={!localQ.trim()}
          >
            Shake!
          </button>
        </div>
      )}

      {state.gameOver && (
        <div className="m8b-game-over">
          <div>All questions answered!</div>
          <div className="m8b-final-score">Score: {terminal?.score}</div>
          <button className="m8b-shake-btn" onClick={() => dispatch({ type: "reset" } as Magic8BallAction)}>
            New Session
          </button>
        </div>
      )}

      {state.history.length > 0 && (
        <div className="m8b-history">
          {state.history.slice(0, 6).map((entry, i) => (
            <div key={i} className={`m8b-history-entry ${entry.answer.kind}`}>
              <span className="m8b-hq">Q: {entry.question}</span>
              <span className="m8b-ha">A: {entry.answer.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

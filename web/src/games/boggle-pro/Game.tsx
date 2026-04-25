import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BoggleProState, BoggleProAction } from "./state.js";
import { isTerminal, GRID_SIZE, MAX_TURNS, scoreWord } from "./state.js";
import "./Game.css";

export function BoggleProGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<BoggleProState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [input, setInput] = useState("");
  const d = (a: BoggleProAction) => dispatch(a);

  const handleSubmit = () => {
    if (!input.trim()) return;
    d({ type: "submitWord", word: input.trim() });
    setInput("");
  };

  return (
    <div className="bg-wrap">
      <div className="bg-header">
        <span className="bg-title">🔡 Boggle Pro</span>
        <span>Turns: {state.turns}/{MAX_TURNS}</span>
        <span className="bg-score">{state.score} pts</span>
      </div>

      <div className="bg-grid">
        {state.grid.map((letter, i) => (
          <div key={i} className="bg-cell">{letter}</div>
        ))}
      </div>

      {state.phase === "play" && (
        <div>
          <div className="bg-input-row">
            <input
              className="bg-input"
              type="text"
              value={input}
              placeholder="Type a word..."
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              maxLength={GRID_SIZE * GRID_SIZE}
            />
            <button className="bg-submit-btn" onClick={handleSubmit}>Submit</button>
          </div>

          {state.lastWord && (
            <div className={`bg-feedback ${state.lastValid ? "bg-valid" : "bg-invalid"}`}>
              {state.lastValid
                ? `"${state.lastWord}" +${scoreWord(state.lastWord)} pts!`
                : `"${state.lastWord}" is not valid`}
            </div>
          )}

          <div className="bg-actions">
            <button className="bg-pass-btn" onClick={() => d({ type: "pass" })}>Pass Turn</button>
            <button className="bg-end-btn" onClick={() => d({ type: "endGame" })}>End Game</button>
          </div>

          {state.foundWords.length > 0 && (
            <div className="bg-words">
              {[...state.foundWords].map(w => (
                <span key={w} className="bg-word-chip">{w}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {state.phase === "done" && (
        <div className="bg-done">
          <div className="bg-final">Score: {state.score}</div>
          <div className="bg-turns">Words found: {state.foundWords.length}</div>
          <div className="bg-words">
            {[...state.foundWords].map(w => (
              <span key={w} className="bg-word-chip">{w}</span>
            ))}
          </div>
          <div>{state.score >= 30 ? "🏆 Word Master!" : state.score >= 15 ? "👍 Nice vocabulary!" : "📖 Keep practicing!"}</div>
        </div>
      )}
    </div>
  );
}

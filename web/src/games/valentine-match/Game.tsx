import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ValentineMatchState, ValentineMatchSettings } from "./state.js";
import { isTerminal, SYMBOLS } from "./state.js";
import "./Game.css";

export function ValentineMatchGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<ValentineMatchState, ValentineMatchSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const resolveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.lockBoard) {
      resolveTimer.current = setTimeout(() => dispatch({ type: "resolve" }), 800);
    }
    return () => { if (resolveTimer.current) clearTimeout(resolveTimer.current); };
  }, [state.lockBoard, dispatch]);

  const cols = Math.ceil(Math.sqrt(state.cards.length));
  const numPairs = parseInt(state.settings.pairs, 10);

  return (
    <div className="vm-game">
      <div className="vm-title">Valentine Match</div>
      <div className="vm-stats">
        <span>Moves: {state.moves}</span>
        <span>Score: {state.score}</span>
        {state.combo > 1 && <span className="vm-combo">Combo x{state.combo}!</span>}
        <span>Matched: {state.matched.filter(Boolean).length / 2}/{numPairs}</span>
      </div>
      <div className="vm-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {state.cards.map((type, i) => {
          const isFlipped = state.flipped[i] || state.matched[i];
          return (
            <div
              key={i}
              className={`vm-card ${isFlipped ? "flipped" : ""} ${state.matched[i] ? "matched" : ""}`}
              onClick={() => !state.lockBoard && !state.over && dispatch({ type: "flip", index: i })}
            >
              {isFlipped ? SYMBOLS[type] : "💟"}
            </div>
          );
        })}
      </div>
      {state.over && (
        <div className="vm-win">All hearts found! Score: {state.score}</div>
      )}
    </div>
  );
}

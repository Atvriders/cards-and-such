import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EasterEggHuntState, EasterEggHuntSettings } from "./state.js";
import { isTerminal, ROWS, COLS } from "./state.js";
import "./Game.css";

export function EasterEggHuntGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<EasterEggHuntState, EasterEggHuntSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  function cellContent(idx: number): string {
    if (!state.revealed.has(idx)) return "🌿";
    if (state.eggPositions.has(idx)) return "🥚";
    return "❌";
  }

  return (
    <div className="eeh-game">
      <div className="eeh-title">Easter Egg Hunt</div>
      <div className="eeh-stats">
        <span>Found: {state.found}/{parseInt(state.settings.eggs, 10)}</span>
        <span>Misses: {state.misses}/{state.maxMisses}</span>
        <span>Score: {state.score}</span>
      </div>
      <div className="eeh-grid">
        {Array.from({ length: ROWS }, (_, r) => (
          <div key={r} className="eeh-row">
            {Array.from({ length: COLS }, (_, c) => {
              const idx = r * COLS + c;
              const isRevealed = state.revealed.has(idx);
              return (
                <div
                  key={c}
                  className={`eeh-cell ${isRevealed ? (state.eggPositions.has(idx) ? "egg" : "miss") : "hidden"}`}
                  onClick={() => !state.over && dispatch({ type: "dig", index: idx })}
                >
                  {cellContent(idx)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {state.over && (
        <div className={`eeh-end ${state.won ? "won" : "lost"}`}>
          {state.won ? "You found all the eggs!" : "Too many misses!"} Score: {state.score}
        </div>
      )}
      {!state.over && <div className="eeh-hint">Click grass tiles to search for hidden eggs!</div>}
    </div>
  );
}

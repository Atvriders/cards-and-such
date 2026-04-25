import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChristmasCookieState, ChristmasCookieSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const COOKIE_EMOJIS = ["🍪", "🎄", "⭐", "🎁", "🔔", "🦌", "⛄", "🕯️", "🧦", "🎅"];

export function ChristmasCookieGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<ChristmasCookieState, ChristmasCookieSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const resolveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.lockBoard) {
      resolveTimer.current = setTimeout(() => {
        dispatch({ type: "resolve" });
      }, 800);
    }
    return () => {
      if (resolveTimer.current) clearTimeout(resolveTimer.current);
    };
  }, [state.lockBoard, dispatch]);

  const cols = Math.ceil(Math.sqrt(state.cards.length));

  return (
    <div className="cc-game">
      <div className="cc-title">Christmas Cookie Match</div>
      <div className="cc-stats">
        <span>Moves: {state.moves}</span>
        <span>Score: {state.score}</span>
        <span>Matched: {state.matched.filter(Boolean).length / 2}/{parseInt(state.settings.pairs, 10)}</span>
      </div>
      <div className="cc-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {state.cards.map((type, i) => {
          const isFlipped = state.flipped[i] || state.matched[i];
          return (
            <div
              key={i}
              className={`cc-card ${isFlipped ? "flipped" : ""} ${state.matched[i] ? "matched" : ""}`}
              onClick={() => !state.lockBoard && !state.over && dispatch({ type: "flip", index: i })}
            >
              {isFlipped ? COOKIE_EMOJIS[type] : "❓"}
            </div>
          );
        })}
      </div>
      {state.over && (
        <div className="cc-win">
          All matched! Final Score: {state.score}
        </div>
      )}
    </div>
  );
}

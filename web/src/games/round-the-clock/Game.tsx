import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RoundTheClockState, RoundTheClockSettings } from "./state.js";
import { type RoundTheClockAction, SEQUENCE, DARTS_PER_TURN, isTerminal } from "./state.js";
import "./Game.css";

export function RoundTheClock({
  state,
  dispatch,
  onGameOver,
}: GameProps<RoundTheClockState, RoundTheClockSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { currentTargetIdx, pendingThrows, won } = state;
  const currentTarget = SEQUENCE[currentTargetIdx];
  const hasPending = pendingThrows.length > 0;

  function throwClass(h: number | null, aimed: number) {
    if (h === aimed) return "hit";
    if (h !== null) return "neighbor";
    return "miss";
  }

  function throwLabel(h: number | null, aimed: number) {
    if (h === aimed) return `Hit ${aimed}!`;
    if (h !== null) return `Hit ${h} (neighbor)`;
    return "Miss";
  }

  return (
    <div className="rtc fade-in">
      <div className="rtc-title">Round the Clock 🎯</div>
      <div className={`rtc-status${won ? " win" : ""}`}>
        {won
          ? `Finished! Total throws: ${state.totalThrows}. Score: ${terminal?.score ?? 0}`
          : `Target: ${currentTarget === 25 ? "Bullseye" : currentTarget} — Turn ${state.turns.length + 1}`}
      </div>

      {/* Sequence progress */}
      <div className="rtc-sequence">
        {SEQUENCE.map((n, i) => (
          <div
            key={n}
            className={`rtc-seq-item${i < currentTargetIdx ? " done" : i === currentTargetIdx ? " current" : ""}`}
          >
            {n === 25 ? "🎯" : n}
          </div>
        ))}
      </div>

      {/* Pending throws */}
      {hasPending && (
        <div className="rtc-throws">
          {pendingThrows.map((t, i) => (
            <div key={i} className={`rtc-throw ${throwClass(t.hit, t.aimed)}`}>
              {throwLabel(t.hit, t.aimed)}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {!won && (
        <div className="rtc-actions">
          <button
            className="rtc-btn throw"
            disabled={hasPending}
            onClick={() => dispatch({ type: "throwDarts" } satisfies RoundTheClockAction)}
            data-testid="throw-darts"
          >
            Throw {DARTS_PER_TURN} Darts
          </button>
          <button
            className="rtc-btn next"
            disabled={!hasPending}
            onClick={() => dispatch({ type: "nextTurn" } satisfies RoundTheClockAction)}
            data-testid="next-turn"
          >
            Next Turn
          </button>
        </div>
      )}

      {/* Turn history */}
      {state.turns.length > 0 && (
        <div className="rtc-history">
          {state.turns
            .slice()
            .reverse()
            .map((turn, i) => (
              <div className="rtc-hist-row" key={i}>
                <span>Turn {state.turns.length - i}: aiming {turn.target === 25 ? "Bull" : turn.target}</span>
                <span>
                  {turn.throws.map((t) => (t.hit === t.aimed ? "✓" : t.hit !== null ? "~" : "✗")).join(" ")}
                </span>
                {turn.advanced && <span className="rtc-hist-adv">→ advanced!</span>}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

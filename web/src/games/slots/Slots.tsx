import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SlotsState, SlotsSettings, SlotsAction } from "./state.js";
import { isTerminal, SYMBOL_EMOJI } from "./state.js";
import "./Slots.css";

const PAYTABLE = [
  { label: "7  7  7", payout: "100×" },
  { label: "BAR BAR BAR", payout: "25×" },
  { label: "🔔 🔔 🔔", payout: "10×" },
  { label: "🍒 🍒 🍒", payout: "5×" },
  { label: "🍋/🍊/🍇 ×3", payout: "2×" },
  { label: "Any two 🍒", payout: "1×" },
];

export function Slots({
  state,
  dispatch,
  onGameOver,
}: GameProps<SlotsState, SlotsSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { credits, spinsPlayed, settings, reels, lastResult } = state;
  const maxSpins = parseInt(settings.maxSpins, 10);
  const bet = parseInt(settings.betSize, 10);

  function dis(a: SlotsAction) { dispatch(a); }

  const canSpin = !terminal && credits >= bet && spinsPlayed < maxSpins;

  function getReelClass(symbol: string): string {
    if (symbol === "seven") return "slots-reel seven";
    if (symbol === "bar") return "slots-reel bar";
    return "slots-reel";
  }

  return (
    <div className="slots">
      <div className="slots-header">
        <span>Credits: {credits}</span>
        <span>Spin: {spinsPlayed} / {maxSpins}</span>
        <span>Bet: {bet}</span>
      </div>

      <div className="slots-machine">
        <div className="slots-reels">
          {reels
            ? reels.map((sym, i) => (
                <div key={i} className={getReelClass(sym)}>
                  {SYMBOL_EMOJI[sym]}
                </div>
              ))
            : [0, 1, 2].map((i) => (
                <div key={i} className="slots-reel">?</div>
              ))}
        </div>

        {lastResult && <div className="slots-result">{lastResult}</div>}

        {!terminal && (
          <button data-testid="hint-target-slots-action"
            className="slots-lever"
            onClick={() => dis({ type: "spin" })}
            disabled={!canSpin}
          >
            Spin!
          </button>
        )}
      </div>

      <div className="slots-paytable">
        <h3>Paytable (per credit bet)</h3>
        {PAYTABLE.map(({ label, payout }) => (
          <div key={label} className="slots-pay-row">
            <span>{label}</span>
            <span>{payout}</span>
          </div>
        ))}
      </div>

      {terminal && (
        <div className="slots-game-over">
          Game Over — Final Credits: {terminal.score}
        </div>
      )}
    </div>
  );
}

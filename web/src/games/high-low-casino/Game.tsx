import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HighLowState, HighLowSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const RED_SUITS = new Set(["♥", "♦"]);

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function HighLowCasino({ state, dispatch, onGameOver }: GameProps<HighLowState, HighLowSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { phase, bankroll, handsPlayed, settings, baseCard, streak, lastResult } = state;

  return (
    <div className="hl-root">
      <div className="hl-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Round: {handsPlayed + (phase === "decision" ? 1 : 0)} / {settings.handsPerSession}</span>
        <span>Bet: ${settings.bet}</span>
      </div>

      <div className="hl-cards">
        {baseCard ? (
          <div className={`hl-card${RED_SUITS.has(baseCard.suit) ? " red" : ""}`}>
            <span>{rankLabel(baseCard.rank)}</span>
            <span>{baseCard.suit}</span>
          </div>
        ) : (
          <div className="hl-card placeholder">?</div>
        )}
        <div className="hl-arrow">→</div>
        <div className="hl-card placeholder">?</div>
      </div>

      {streak > 0 && <div className="hl-streak">Streak: {streak} ({streak === 1 ? "1x" : streak === 2 ? "2x" : streak === 3 ? "4x" : "8x"} multiplier)</div>}
      {lastResult && <div className="hl-result">{lastResult}</div>}

      <div className="hl-actions">
        {(phase === "betting" || phase === "settled") && !terminal && (
          <button className="deal" onClick={() => dispatch({ type: "deal" })}>Deal</button>
        )}
        {phase === "decision" && (
          <>
            <button className="higher" onClick={() => dispatch({ type: "guess", prediction: "higher" })}>Higher</button>
            <button className="lower" onClick={() => dispatch({ type: "guess", prediction: "lower" })}>Lower</button>
            <button className="same" onClick={() => dispatch({ type: "guess", prediction: "same" })}>Same</button>
            {streak > 0 && (
              <button className="bank" onClick={() => dispatch({ type: "bank" })}>Bank</button>
            )}
          </>
        )}
        {terminal && <div className="hl-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>

      <div className="hl-multipliers">Streak multipliers: 1 correct=1x | 2=2x | 3=4x | 4+=8x</div>
    </div>
  );
}

import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TwentySixState, TwentySixAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./TwentySix.css";

type TwentySixSettings = TwentySixState["settings"];

export function TwentySix({
  state,
  dispatch,
  onGameOver,
}: GameProps<TwentySixState, TwentySixSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { targetNumber, rolls, rollIndex, hitCount, payout, totalScore, phase } = state;

  const lastRoll = rolls.length > 0 ? rolls[rolls.length - 1] : null;

  function payoutLabel(p: number): string {
    if (p > 0) return `+${p}`;
    return `${p}`;
  }

  return (
    <div className="twentysix">
      <div className="ts-header">
        <strong>Twenty-Six</strong>
        <span className="ts-sub">Roll 10 dice, 13 times — count your number</span>
      </div>

      <div className="ts-info">
        <span>Total score: <strong>{totalScore}</strong></span>
        {targetNumber && <span>Target: <span className="ts-target">{targetNumber}</span></span>}
        <span>Hits: <strong>{hitCount}</strong></span>
        <span>Roll: {rollIndex}/13</span>
      </div>

      {phase === "chooseTarget" && (
        <div className="ts-choose">
          <div className="ts-label">Choose your lucky number:</div>
          <div className="ts-num-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                className="ts-num-btn"
                onClick={() => dispatch({ type: "chooseTarget", num: n } as TwentySixAction)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {lastRoll && (
        <div className="ts-dice">
          {lastRoll.map((v, i) => (
            <span key={i} className={`ts-die ${v === targetNumber ? "hit" : ""}`}>
              {v}
            </span>
          ))}
        </div>
      )}

      {phase === "roundOver" && (
        <div className={`ts-payout ${payout > 0 ? "win" : payout < 0 ? "lose" : "even"}`}>
          {hitCount} hits → payout: {payoutLabel(payout)} point{Math.abs(payout) !== 1 ? "s" : ""}
        </div>
      )}

      {phase === "done" && (
        <div className={`ts-gameover ${totalScore > 0 ? "win" : "lose"}`}>
          Final: {totalScore} points
        </div>
      )}

      <div className="ts-controls">
        {phase === "rolling" && (
          <button className="ts-btn" onClick={() => dispatch({ type: "roll" } as TwentySixAction)}>
            Roll #{rollIndex + 1}
          </button>
        )}
        {phase === "roundOver" && (
          <button className="ts-btn" onClick={() => dispatch({ type: "nextRound" } as TwentySixAction)}>
            {state.roundsPlayed + 1 >= Number(state.settings.rounds) ? "Finish" : "Next Round"}
          </button>
        )}
      </div>
    </div>
  );
}

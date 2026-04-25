import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePoolMatchState, DicePoolMatchAction } from "./state.js";
import { isTerminal, PATTERN_LABELS, PATTERN_SCORES } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./DicePoolMatch.css";

export function DicePoolMatch({
  state,
  dispatch,
  onGameOver,
}: GameProps<DicePoolMatchState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const roundDone = state.rollsLeft === 0 && !state.gameOver;

  return (
    <div className="dice-pool-match">
      <h2>DICE POOL MATCH</h2>
      <div className="dpm-info">
        <span>Round: <b>{Math.min(state.round, 5)}/5</b></span>
        <span>Total: <b>{state.totalScore}</b></span>
      </div>

      <div className="dpm-target">
        Target: <b>{PATTERN_LABELS[state.target]}</b> ({PATTERN_SCORES[state.target]} pts)
      </div>

      <div className="dpm-dice">
        {state.dice.map((v, i) => (
          <button
            key={i}
            className={`dpm-die-btn${state.kept[i] ? " kept" : ""}`}
            onClick={() => dispatch({ type: "toggleKeep", index: i } as DicePoolMatchAction)}
            disabled={state.rollsLeft === 0 || state.gameOver}
          >
            <Die value={v as 1|2|3|4|5|6} kept={state.kept[i]!} />
          </button>
        ))}
      </div>

      <div className="dpm-rolls">Rolls left: <b>{state.rollsLeft}</b></div>

      {roundDone && (
        <div className={`dpm-round-result${state.roundScore > 0 ? " hit" : " miss"}`}>
          {state.roundScore > 0 ? `+${state.roundScore} — Matched!` : "No match this round"}
        </div>
      )}

      {terminal && (
        <div className="dpm-gameover">
          All 5 rounds done! Final: {state.totalScore}
        </div>
      )}

      <button
        className="dpm-btn"
        onClick={() => dispatch({ type: "roll" } as DicePoolMatchAction)}
        disabled={state.gameOver || state.rollsLeft === 0}
      >
        Roll
      </button>
    </div>
  );
}

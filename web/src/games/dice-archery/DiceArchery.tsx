import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceArcheryState, DiceArcheryAction } from "./state.js";
import { isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./DiceArchery.css";

const RING_LABELS = ["BULLSEYE!", "Ring 1", "Ring 2", "Ring 3", "Ring 4", "Miss"];
const RING_SCORES = [100, 80, 60, 40, 20, 0];

export function DiceArchery({
  state,
  dispatch,
  onGameOver,
}: GameProps<DiceArcheryState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="dice-archery">
      <h2>DICE ARCHERY</h2>
      <div className="da-info">
        <span>Arrows: <b>{state.arrowsRemaining}</b></span>
        <span>Score: <b>{state.score}</b></span>
      </div>

      <div className="da-target">
        {[5, 4, 3, 2, 1, 0].map((ring) => (
          <div
            key={ring}
            className={`da-ring ring-${ring}${state.lastRing === ring ? " hit" : ""}`}
          />
        ))}
      </div>

      {state.lastRoll && (
        <div className="da-dice-row">
          <Die value={state.lastRoll[0] as 1|2|3|4|5|6} kept={false} />
          <Die value={state.lastRoll[1] as 1|2|3|4|5|6} kept={false} />
        </div>
      )}

      {state.lastRing !== null && (
        <div className="da-result">
          {RING_LABELS[state.lastRing]} — {RING_SCORES[state.lastRing ?? 5]} pts
        </div>
      )}

      {terminal && (
        <div className="da-gameover">
          All arrows shot! Final: {state.score}
        </div>
      )}

      <button
        className="da-btn"
        onClick={() => dispatch({ type: "shoot" } as DiceArcheryAction)}
        disabled={state.gameOver}
      >
        {state.lastRoll === null ? "Draw & Shoot!" : "Next Arrow"}
      </button>

      <div className="da-hint">Diff of dice = ring. Same dice = Bullseye (100 pts)!</div>
    </div>
  );
}

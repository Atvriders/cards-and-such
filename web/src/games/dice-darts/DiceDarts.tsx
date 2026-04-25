import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceDartsState, DiceDartsAction } from "./state.js";
import { isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./DiceDarts.css";

export function DiceDarts({
  state,
  dispatch,
  onGameOver,
}: GameProps<DiceDartsState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="dice-darts">
      <h2>DICE DARTS</h2>
      <div className="dd-score-display">
        <div className="dd-score-value">{state.score}</div>
        <div className="dd-score-label">remaining</div>
      </div>

      <div className="dd-info">
        <span>Turns: <b>{state.turns}</b></span>
      </div>

      {state.lastRoll && (
        <div className="dd-dice-row">
          <Die value={state.lastRoll[0] as 1|2|3|4|5|6} kept={false} />
          <Die value={state.lastRoll[1] as 1|2|3|4|5|6} kept={false} />
          <Die value={state.lastRoll[2] as 1|2|3|4|5|6} kept={false} />
        </div>
      )}

      {state.lastRoll && (
        <div className={`dd-result${state.busted ? " bust" : ""}`}>
          {state.busted
            ? `Bust! (rolled ${state.lastSum}, too many)`
            : `Scored ${state.lastSum}`}
        </div>
      )}

      {terminal && (
        <div className="dd-gameover">
          Checkout! {state.turns} turns. Score: {terminal.score}
        </div>
      )}

      <button
        className="dd-btn"
        onClick={() => dispatch({ type: "throw" } as DiceDartsAction)}
        disabled={state.gameOver}
      >
        {state.lastRoll === null ? "Throw Darts!" : "Throw Again"}
      </button>

      <div className="dd-hint">Roll 3 dice. Count down from 301 to exactly 0!</div>
    </div>
  );
}

import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RollingThunderState, RollingThunderAction } from "./state.js";
import { isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./RollingThunderDice.css";

export function RollingThunderDice({
  state,
  dispatch,
  onGameOver,
}: GameProps<RollingThunderState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="rolling-thunder">
      <h2>ROLLING THUNDER</h2>
      <div className="rt-info">
        <span>Turn: <b>{state.turns + 1}/6</b></span>
        <span>Banked: <b>{state.bankedScore}</b></span>
        <span>This turn: <b>{state.turnScore}</b></span>
      </div>

      {state.busted && (
        <div className="rt-bust">THUNDER BUST! Lost all banked score!</div>
      )}

      {state.thunder > 0 && !state.busted && (
        <div className="rt-thunder">⚡ {state.thunder} thunder die removed!</div>
      )}

      <div className="rt-dice">
        {state.currentDice.length > 0
          ? state.currentDice.map((v, i) => (
              <Die key={i} value={v as 1|2|3|4|5|6} kept={false} />
            ))
          : <div className="rt-empty">Ready to roll 5 dice</div>
        }
      </div>

      {terminal && (
        <div className="rt-gameover">
          Game over! Final score: {state.bankedScore}
        </div>
      )}

      <div className="rt-controls">
        <button
          className="rt-btn rt-roll"
          onClick={() => dispatch({ type: "roll" } as RollingThunderAction)}
          disabled={state.gameOver}
        >
          {state.currentDice.length === 0 ? "Roll 5 Dice!" : `Roll ${state.currentDice.length} Dice`}
        </button>
        <button
          className="rt-btn rt-bank"
          onClick={() => dispatch({ type: "bank" } as RollingThunderAction)}
          disabled={state.gameOver || state.turnScore === 0}
        >
          Bank ({state.turnScore} pts)
        </button>
      </div>
      <div className="rt-hint">Two thunder rolls in a row = BUST (lose all banked)!</div>
    </div>
  );
}

import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UnderOver7State, UnderOver7Action, UnderOver7Settings } from "./state.js";
import { isTerminal } from "./state.js";
import "./UnderOver7.css";

const DICE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function UnderOver7({ state, dispatch, onGameOver }: GameProps<UnderOver7State, UnderOver7Settings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  return (
    <div className="uo7">
      <h2>Under / Over 7</h2>
      <div className="uo7-info">
        <span>Round: <strong>{state.round}/{state.maxRounds}</strong></span>
        <span>Bankroll: <strong>{state.bankroll}</strong></span>
        <span>Bet: <strong>{state.betSize}</strong></span>
      </div>

      <div className="uo7-message">{state.message}</div>

      {state.lastRoll && (
        <div className="uo7-dice">
          <span>{DICE_FACES[state.lastRoll[0]] ?? "?"}</span>
          <span>{DICE_FACES[state.lastRoll[1]] ?? "?"}</span>
          <span style={{ fontSize: "1rem" }}>= {state.lastSum}</span>
        </div>
      )}

      {state.lastResult && (
        <div className={`uo7-result ${state.lastResult}`}>
          {state.lastResult === "win"
            ? `Win +${state.lastPayout}!`
            : `Loss -${state.betSize}`}
        </div>
      )}

      {state.phase === "betting" && (
        <>
          <div className="uo7-buttons">
            <button data-testid="hint-target-under-over-7-bet" className="uo7-btn under" onClick={() => dispatch({ type: "bet", bet: "under" } as UnderOver7Action)}>
              Under 7 (1:1)
            </button>
            <button data-testid="hint-target-under-over-7-bet" className="uo7-btn seven" onClick={() => dispatch({ type: "bet", bet: "seven" } as UnderOver7Action)}>
              Exactly 7 (4:1)
            </button>
            <button data-testid="hint-target-under-over-7-bet" className="uo7-btn over" onClick={() => dispatch({ type: "bet", bet: "over" } as UnderOver7Action)}>
              Over 7 (1:1)
            </button>
          </div>
          <div className="uo7-odds">Under 7: 15/36 chance · Exactly 7: 6/36 · Over 7: 15/36</div>
        </>
      )}

      {state.phase === "rolled" && (
        <button data-testid="hint-target-under-over-7-next" className="uo7-btn" onClick={() => dispatch({ type: "next" } as UnderOver7Action)}>
          Next Round →
        </button>
      )}

      {state.gameOver && (
        <div className="uo7-game-over">
          Final Bankroll: {state.bankroll}
          {state.bankroll > 1000 ? " — Profit!" : state.bankroll < 1000 ? " — Loss." : " — Break even."}
        </div>
      )}
    </div>
  );
}

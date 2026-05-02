import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceShippingState, DiceShippingAction, DiceShippingSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceShippingGame({ state, dispatch, onGameOver }: GameProps<DiceShippingState, DiceShippingSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap dice-shipping-theme"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap dice-shipping-theme">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      <div className="dm-ships">
        {state.ships.map((ship, i) => {
          const sum = ship.reduce((a, b) => a + b, 0);
          const picked = state.chosen === i;
          return (
            <button data-testid="hint-target-dice-shipping-roll" key={i} className={`dm-ship${picked ? " picked" : ""}`} disabled={state.phase !== "choosing"} onClick={() => dispatch({ type:"pick", ship:i } as DiceShippingAction)}>
              <div className="dm-ship-name">Ship {i + 1}</div>
              <div className="dm-row">{ship.map((d, j) => <div key={j} className="dm-die">{d}</div>)}</div>
              <div className="dm-ship-sum">Sum: {sum}</div>
            </button>
          );
        })}
      </div>
      {state.phase === "scored" && (
        <>
          <div className="dm-result">Picked Ship {state.chosen! + 1} → +{state.pts}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceShippingAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}

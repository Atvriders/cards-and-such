import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceRocketState, DiceRocketAction, DiceRocketSettings } from "./state.js";
import { isTerminal, GOAL, MAX_ROLLS } from "./state.js";
import "./Game.css";
const PIPS = ["⚀","⚁","⚂","⚃","⚄","⚅"];
export function DiceRocketGame({ state, dispatch, onGameOver }: GameProps<DiceRocketState, DiceRocketSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const reached = state.altitude >= GOAL;
    return <div className="drkt-wrap drkt-theme"><div className="drkt-done"><h2>{reached ? "Liftoff!" : "Out of Fuel"}</h2><div>Altitude: {state.altitude}</div><div className="drkt-final">{t?.score} pts</div></div></div>;
  }
  const pct = Math.min(100, (state.altitude / GOAL) * 100);
  return (
    <div className="drkt-wrap drkt-theme">
      <div className="drkt-header">Altitude {state.altitude}/{GOAL} — Rolls {state.rolls}/{MAX_ROLLS}</div>
      <div className="drkt-track">
        <div className="drkt-rocket" style={{ bottom: `calc(${pct}% - 12px)` }}>🚀</div>
      </div>
      {state.lastDie && <div className="drkt-die">{PIPS[state.lastDie - 1]}</div>}
      <button data-testid="hint-target-dice-rocket-roll" className="drkt-btn" onClick={() => dispatch({ type:"boost" } as DiceRocketAction)}>BOOST</button>
    </div>
  );
}

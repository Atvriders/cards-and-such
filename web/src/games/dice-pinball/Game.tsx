import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePinballState, DicePinballAction, DicePinballSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
const PIPS = ["⚀","⚁","⚂","⚃","⚄","⚅"];
export function DicePinballGame({ state, dispatch, onGameOver }: GameProps<DicePinballState, DicePinballSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dpnb-wrap dpnb-theme"><div className="dpnb-done"><h2>Tilt!</h2><div className="dpnb-final">{t?.score} pts</div></div></div>;
  }
  return (
    <div className="dpnb-wrap dpnb-theme">
      <div className="dpnb-header">Round {state.round}/{TOTAL_ROUNDS} <span className="dpnb-score">{state.score}</span></div>
      <div className="dpnb-board">
        {state.dice ? (
          <>
            <div className="dpnb-dice">{PIPS[state.dice[0] - 1]}{PIPS[state.dice[1] - 1]}</div>
            <div className="dpnb-mult">x{state.multiplier} multiplier</div>
            <div className="dpnb-points">+{state.history[state.history.length - 1]}</div>
          </>
        ) : (
          <div className="dpnb-empty">Press LAUNCH</div>
        )}
      </div>
      {state.phase === "idle" ? (
        <button className="dpnb-btn launch" onClick={() => dispatch({ type:"launch" } as DicePinballAction)}>LAUNCH</button>
      ) : (
        <button className="dpnb-btn next" onClick={() => dispatch({ type:"next" } as DicePinballAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next Round"}</button>
      )}
    </div>
  );
}

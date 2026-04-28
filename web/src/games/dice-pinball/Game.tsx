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
    return <div className="dpb-wrap"><div className="dpb-done"><h2>Tilt!</h2><div className="dpb-final">{t?.score} pts</div></div></div>;
  }
  return (
    <div className="dpb-wrap">
      <div className="dpb-header">Round {state.round}/{TOTAL_ROUNDS} <span className="dpb-score">{state.score}</span></div>
      <div className="dpb-board">
        {state.dice ? (
          <>
            <div className="dpb-dice">{PIPS[state.dice[0] - 1]}{PIPS[state.dice[1] - 1]}</div>
            <div className="dpb-mult">x{state.multiplier} multiplier</div>
            <div className="dpb-points">+{state.history[state.history.length - 1]}</div>
          </>
        ) : (
          <div className="dpb-empty">Press LAUNCH</div>
        )}
      </div>
      {state.phase === "idle" ? (
        <button className="dpb-btn launch" onClick={() => dispatch({ type:"launch" } as DicePinballAction)}>LAUNCH</button>
      ) : (
        <button className="dpb-btn next" onClick={() => dispatch({ type:"next" } as DicePinballAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next Round"}</button>
      )}
    </div>
  );
}

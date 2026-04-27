import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrapsLightState, CrapsLightAction, CrapsLightSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function CrapsLightGame({ state, dispatch, onGameOver }: GameProps<CrapsLightState, CrapsLightSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && <div className="dm-row"><div className="dm-die">{state.dice[0]}</div><div className="dm-die">{state.dice[1]}</div></div>}
      {state.phase === "betting" && <div className="dm-row">
        <button className="dm-btn" onClick={() => dispatch({ type:"bet", bet:"pass" } as CrapsLightAction)}>Pass Line</button>
        <button className="dm-btn alt" onClick={() => dispatch({ type:"bet", bet:"dont" } as CrapsLightAction)}>Don't Pass</button>
      </div>}
      {state.phase === "result" && <>
        <div className="dm-result">Bet: {state.bet} — {state.outcome === "win" ? "WIN +10" : state.outcome === "lose" ? "LOSE" : "PUSH"}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as CrapsLightAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}

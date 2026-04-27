import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { YahtzeeMiniState, YahtzeeMiniAction, YahtzeeMiniSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function YahtzeeMiniGame({ state, dispatch, onGameOver }: GameProps<YahtzeeMiniState, YahtzeeMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}{state.phase === "rolling" ? ` — Rolls left: ${state.rollsLeft}` : ""}</div>
      <div className="dm-score">{state.score} pts</div>
      <div className="dm-row">{state.dice.map((d, i) => (
        <button key={i} className={`dm-die small`} style={{ background: state.held[i] ? "#fffde6" : "#fff" }} onClick={() => state.phase === "rolling" && dispatch({ type:"toggle", index:i } as YahtzeeMiniAction)}>{d}{state.held[i] ? " *" : ""}</button>
      ))}</div>
      {state.phase === "rolling" && <div className="dm-row">
        <button className="dm-btn" disabled={state.rollsLeft <= 0} onClick={() => dispatch({ type:"roll" } as YahtzeeMiniAction)}>Roll</button>
        <button className="dm-btn alt" onClick={() => dispatch({ type:"score" } as YahtzeeMiniAction)}>Score</button>
      </div>}
      {state.phase === "scored" && <>
        <div className="dm-result">+{state.lastPts}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as YahtzeeMiniAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}

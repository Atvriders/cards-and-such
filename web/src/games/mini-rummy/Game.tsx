import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniRummyState, MiniRummyAction, MiniRummySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function MiniRummyGame({ state, dispatch, onGameOver }: GameProps<MiniRummyState, MiniRummySettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      <div className="dm-row">{state.hand.map((c, i) => <div key={i} className={`dm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <button className="dm-btn" onClick={() => dispatch({ type:"score" } as MiniRummyAction)}>Auto-score</button>}
      {state.phase === "scored" && <>
        <div className="dm-result">Melds: {state.melds.length === 0 ? "none" : state.melds.map(m => m.map(c=>cardName(c)).join(", ")).join(" | ")} — +{state.pts}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as MiniRummyAction)}>Next</button>
      </>}
    </div>
  );
}

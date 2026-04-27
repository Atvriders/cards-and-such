import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBaccaratState, DiceBaccaratAction, DiceBaccaratSettings, DBChoice } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

const opts: { id: DBChoice; label: string }[] = [
  { id: "player", label: "Player" },
  { id: "banker", label: "Banker" },
  { id: "tie", label: "Tie (3x)" },
];

export function DiceBaccaratGame({ state, dispatch, onGameOver }: GameProps<DiceBaccaratState, DiceBaccaratSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.player && state.banker && (
        <>
          <div className="dm-line">Player ({state.pSum}): <span className="dm-die">{state.player[0]}</span><span className="dm-die">{state.player[1]}</span></div>
          <div className="dm-line">Banker ({state.bSum}): <span className="dm-die">{state.banker[0]}</span><span className="dm-die">{state.banker[1]}</span></div>
        </>
      )}
      {state.phase === "betting" && (
        <div className="dm-row">
          {opts.map(o => <button key={o.id} className="dm-btn" onClick={() => dispatch({ type:"bet", choice: o.id } as DiceBaccaratAction)}>{o.label}</button>)}
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="dm-result">{state.result === state.bet ? `Win! +${state.lastPts}` : `Lose (${state.result}) — 0`}</div>
          <button className="dm-btn alt" onClick={() => dispatch({ type:"next" } as DiceBaccaratAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}

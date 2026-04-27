import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniShutBoxState, MiniShutBoxAction, MiniShutBoxSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
export function MiniShutBoxGame({ state, dispatch, onGameOver }: GameProps<MiniShutBoxState, MiniShutBoxSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  const selSum = state.selected.reduce((a,i) => a + (i+1), 0);
  return (
    <div className="dm-wrap">
      <div className="dm-info">Mini Shut the Box</div>
      <div className="dm-score">{state.score} pts</div>
      {state.dice && <div className="dm-row"><div className="dm-die">{state.dice[0]}</div><div className="dm-die">{state.dice[1]}</div><div style={{ alignSelf:"center" }}>= {state.sum}</div></div>}
      <div className="dm-row" style={{ display:"grid", gridTemplateColumns:"repeat(9,1fr)", gap:6, width:"100%" }}>
        {[0,1,2,3,4,5,6,7,8].map(i => {
          const sel = state.selected.includes(i);
          return <button key={i} className="dm-cell" disabled={!state.open[i] || state.phase !== "selecting"} style={{ background: !state.open[i] ? "#bdc3c7" : sel ? "#3498db" : "#fff", color: sel ? "#fff" : !state.open[i] ? "#7f8c8d" : "#2c3e50" }} onClick={() => dispatch({ type:"toggle", idx:i } as MiniShutBoxAction)}>{i + 1}</button>;
        })}
      </div>
      {state.phase === "rolling" && <button className="dm-btn" onClick={() => dispatch({ type:"roll" } as MiniShutBoxAction)}>Roll dice</button>}
      {state.phase === "selecting" && <>
        <div className="dm-result">Selected sum: {selSum} / target {state.sum}</div>
        <div className="dm-row">
          <button className="dm-btn" disabled={selSum !== state.sum} onClick={() => dispatch({ type:"submit" } as MiniShutBoxAction)}>Submit</button>
          <button className="dm-btn danger" onClick={() => dispatch({ type:"endgame" } as MiniShutBoxAction)}>Give up</button>
        </div>
      </>}
    </div>
  );
}

import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HelpingNeighborState, HelpingNeighborAction, HelpingNeighborSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function HelpingNeighborGame({ state, dispatch, onGameOver }: GameProps<HelpingNeighborState, HelpingNeighborSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="hn-wrap"><div className="hn-done"><h2>Done!</h2><div className="hn-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="hn-wrap">
      <div className="hn-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="hn-score">{state.score} pts</div>
      {state.dice.length > 0 && <div className="hn-row">{state.dice.map((d, i) => <div key={i} className="hn-die">{d}</div>)}</div>}
      {state.message && <div className="hn-result">{state.message}</div>}
      {state.phase === "roll" && <button className="hn-btn" data-testid="hint-target-helping-neighbor-roll" onClick={() => dispatch({ type:"roll" } as HelpingNeighborAction)}>Roll</button>}
      {state.phase === "result" && <button className="hn-btn alt" data-testid="hint-target-helping-neighbor-next" onClick={() => dispatch({ type:"next" } as HelpingNeighborAction)}>Next</button>}
    </div>
  );
}

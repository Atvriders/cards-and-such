import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FreeBetBjState, FreeBetBjAction, FreeBetBjSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function FreeBetBjGame({ state, dispatch, onGameOver }: GameProps<FreeBetBjState, FreeBetBjSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS} — Total: {state.total}</div>
      <div className="dm-score">{state.score} pts</div>
      <div className="dm-row">{state.hand.map((c, i) => <div key={i} className={`dm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "play" && <div className="dm-row">
        <button data-testid="hint-target-free-bet-bj-hit" className="dm-btn" onClick={() => dispatch({ type: "hit" } as FreeBetBjAction)}>Hit</button>
        <button data-testid="hint-target-free-bet-bj-stand" className="dm-btn alt" onClick={() => dispatch({ type: "stand" } as FreeBetBjAction)}>Stand</button>
      </div>}
      {state.phase === "scored" && <>
        <div className="dm-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-free-bet-bj-next" className="dm-btn alt" onClick={() => dispatch({ type: "next" } as FreeBetBjAction)}>Next</button>
      </>}
    </div>
  );
}

import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DeucesWildVpState, DeucesWildVpAction, DeucesWildVpSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, CARDS_PER_HAND, cardName, isRed } from "./state.js";
import "./Game.css";
export function DeucesWildVpGame({ state, dispatch, onGameOver }: GameProps<DeucesWildVpState, DeucesWildVpSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.hand.length > 0 && (
        <div className="dm-row">{state.hand.map((c, i) => <div key={i} className={`dm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      )}
      {state.phase === "deal" && <button className="dm-btn" data-testid="hint-target-deuces-wild-vp-primary" onClick={() => dispatch({ type: "deal" } as DeucesWildVpAction)}>Deal {CARDS_PER_HAND} cards</button>}
      {state.phase === "scored" && <>
        <div className="dm-result">{state.rank} — +{state.rankPts}</div>
        <button className="dm-btn alt" onClick={() => dispatch({ type: "next" } as DeucesWildVpAction)}>Next</button>
      </>}
    </div>
  );
}

import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ManilaPokerState, ManilaPokerAction, ManilaPokerSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, CARDS_PER_HAND, cardName, isRed } from "./state.js";
import "./Game.css";
export function ManilaPokerGame({ state, dispatch, onGameOver }: GameProps<ManilaPokerState, ManilaPokerSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap thmManila"><div className="dm-done bounce-in"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap thmManila">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score pulse">{state.score} pts</div>
      {state.hand.length > 0 && (
        <div className="dm-row">{state.hand.map((c, i) => <div key={i} className={`dm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      )}
      {state.phase === "deal" && <button className="dm-btn" data-testid="hint-target-manila-poker-deal" onClick={() => dispatch({ type: "deal" } as ManilaPokerAction)}>Deal {CARDS_PER_HAND} cards</button>}
      {state.phase === "scored" && <>
        <div className="dm-result">{state.rank} — +{state.rankPts}</div>
        <button className="dm-btn alt" data-testid="hint-target-manila-poker-next" onClick={() => dispatch({ type: "next" } as ManilaPokerAction)}>Next</button>
      </>}
    </div>
  );
}

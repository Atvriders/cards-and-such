import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ClosedChinesePokerState, ClosedChinesePokerAction, ClosedChinesePokerSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, CARDS_PER_HAND, cardName, isRed } from "./state.js";
import "./Game.css";
export function ClosedChinesePokerGame({ state, dispatch, onGameOver }: GameProps<ClosedChinesePokerState, ClosedChinesePokerSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap thmCCP"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap thmCCP">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      {state.hand.length > 0 && (
        <div className="dm-row">{state.hand.map((c, i) => <div key={i} className={`dm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      )}
      {state.phase === "deal" && <button className="dm-btn" data-testid="hint-target-closed-chinese-poker-deal" onClick={() => dispatch({ type: "deal" } as ClosedChinesePokerAction)}>Deal {CARDS_PER_HAND} cards</button>}
      {state.phase === "scored" && <>
        <div className="dm-result">{state.rank} — +{state.rankPts}</div>
        <button className="dm-btn alt" data-testid="hint-target-closed-chinese-poker-next" onClick={() => dispatch({ type: "next" } as ClosedChinesePokerAction)}>Next</button>
      </>}
    </div>
  );
}

import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ClosedChinesePokerCasState, ClosedChinesePokerCasAction, ClosedChinesePokerCasSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, cardName, isRed } from "./state.js";
import "./Game.css";
export function ClosedChinesePokerCasGame({ state, dispatch, onGameOver }: GameProps<ClosedChinesePokerCasState, ClosedChinesePokerCasSettings>): JSX.Element {
  const t = isTerminal(state); useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><div className="dm-final">{state.score} pts</div></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="dm-score">{state.score} pts</div>
      <div className="dm-info">You:</div>
      <div className="dm-row">{state.you.map((c, i) => <div key={i} className={`dm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
      {state.phase === "see" && <div className="dm-row">
        <button data-testid="hint-target-closed-chinese-poker-cas-primary" className="dm-btn" onClick={() => dispatch({ type: "play" } as ClosedChinesePokerCasAction)}>Play</button>
        <button className="dm-btn alt" onClick={() => dispatch({ type: "fold" } as ClosedChinesePokerCasAction)}>Fold</button>
      </div>}
      {state.phase === "scored" && <>
        <div className="dm-info">CPU:</div>
        <div className="dm-row">{state.cpu.map((c, i) => <div key={i} className={`dm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}</div>
        <div className="dm-result">{state.result} — +{state.pts}</div>
        <button data-testid="hint-target-closed-chinese-poker-cas-secondary" className="dm-btn alt" onClick={() => dispatch({ type: "next" } as ClosedChinesePokerCasAction)}>Next</button>
      </>}
    </div>
  );
}

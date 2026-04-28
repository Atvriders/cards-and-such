import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardSpikeState, CardSpikeAction, CardSpikeSettings } from "./state.js";
import { isTerminal, cardName, isRed, rankName, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";
export function CardSpikeGame({ state, dispatch, onGameOver }: GameProps<CardSpikeState, CardSpikeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">{state.score} pts</div>
      <div className="cm-info">Target rank: <b>{rankName(state.targetRank)}</b></div>
      {state.card !== null && <div className={`cm-card ${isRed(state.card)?"red":"black"}`}>{cardName(state.card)}</div>}
      {state.phase === "draw" && <button className="cm-btn" onClick={() => dispatch({ type:"draw" } as CardSpikeAction)}>Spike!</button>}
      {state.phase === "result" && (<><div className="cm-result">{state.lastWin ? "Hit! +25" : "Miss"}</div><button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as CardSpikeAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button></>)}
    </div>
  );
}

import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardTrioQuestState, CardTrioQuestAction, CardTrioQuestSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";
export function CardTrioQuestGame({ state, dispatch, onGameOver }: GameProps<CardTrioQuestState, CardTrioQuestSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cm-wrap"><div className="cm-done bounce-in"><h2>Done!</h2><div>Matches: {state.matches}</div><div className="cm-final">{state.score} pts</div></div></div>;
  return (
    <div className="cm-wrap fade-in">
      <div className="cm-info">Draw {state.drawIdx} / {TOTAL_DRAWS} — Matches: {state.matches}</div>
      <div className="cm-score pulse">{state.score} pts</div>
      {state.lastCard !== null && <div className={`cm-card ${isRed(state.lastCard) ? "red" : "black"}`}>{cardName(state.lastCard)}</div>}
      {state.lastMatched && <div className="cm-result">Match!</div>}
      <button data-testid="hint-target-card-trio-quest-primary" className="cm-btn" onClick={() => dispatch({ type:"draw" } as CardTrioQuestAction)}>Draw</button>
    </div>
  );
}

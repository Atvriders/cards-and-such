import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardQuadQuestState, CardQuadQuestAction, CardQuadQuestSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";
export function CardQuadQuestGame({ state, dispatch, onGameOver }: GameProps<CardQuadQuestState, CardQuadQuestSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div>Matches: {state.matches}</div><div className="cm-final">{state.score} pts</div></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.drawIdx} / {TOTAL_DRAWS} — Matches: {state.matches}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.lastCard !== null && <div className={`cm-card ${isRed(state.lastCard) ? "red" : "black"}`}>{cardName(state.lastCard)}</div>}
      {state.lastMatched && <div className="cm-result">Match!</div>}
      <button className="cm-btn" onClick={() => dispatch({ type:"draw" } as CardQuadQuestAction)}>Draw</button>
    </div>
  );
}

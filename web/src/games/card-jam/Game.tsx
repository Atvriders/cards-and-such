import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardJamState, CardJamAction, CardJamSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_CARDS } from "./state.js";
import "./Game.css";
const JARS = ["\u2660","\u2665","\u2666","\u2663"];
export function CardJamGame({ state, dispatch, onGameOver }: GameProps<CardJamState, CardJamSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  const card = state.cards[state.idx]!;
  return (
    <div className="cm-wrap">
      <div className="cm-info">Card {state.idx + 1} / {TOTAL_CARDS}</div>
      <div className="cm-score">{state.score} pts</div>
      <div className={`cm-card ${isRed(card)?"red":"black"}`}>{cardName(card)}</div>
      <div className="cm-row">
        {JARS.map((j,i)=><button data-testid="hint-target-card-jam-primary" key={i} className="cm-btn" onClick={() => dispatch({ type:"jam", jar:i } as CardJamAction)}>Jar {j}</button>)}
      </div>
    </div>
  );
}

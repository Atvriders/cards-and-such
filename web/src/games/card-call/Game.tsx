import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardCallState, CardCallAction, CardCallSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard, Suit, Rank } from "../../engines/deck/index.js";
import "./Game.css";

// state.ts encodes cards as 0..51 with rank order [2,3,..,K,A] (index 12 = A).
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
function toEngineCard(c: number): EngineCard {
  const rIdx = c % 13;
  const sIdx = Math.floor(c / 13);
  const rank = (rIdx === 12 ? 1 : rIdx + 2) as Rank;
  return { suit: SUITS[sIdx]!, rank, id: `cc-${c}` };
}

export function CardCallGame({ state, dispatch, onGameOver }: GameProps<CardCallState, CardCallSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.card !== null && <Card card={toEngineCard(state.card)} className="cm-card" />}
      {state.phase === "predict" && (
        <div className="cm-row">
          <button data-testid="hint-target-card-call-primary" className="cm-btn red" onClick={() => dispatch({ type:"predict", choice:"red" } as CardCallAction)}>Red</button>
          <button className="cm-btn" onClick={() => dispatch({ type:"predict", choice:"black" } as CardCallAction)}>Black</button>
        </div>
      )}
      {state.phase === "result" && (
        <>
          <div className="cm-result">{state.lastWin ? "Correct! +10" : "Wrong — 0"}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as CardCallAction)}>Next</button>
        </>
      )}
    </div>
  );
}

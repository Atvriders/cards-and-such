import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardEqualityState, CardEqualityAction, CardEqualitySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard, Suit, Rank } from "../../engines/deck/index.js";
import "./Game.css";

// state.ts encodes cards as 0..51 with rank order [2,3,..,K,A] (index 12 = A).
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
function toEngineCard(c: number, i: number): EngineCard {
  const rIdx = c % 13;
  const sIdx = Math.floor(c / 13);
  const rank = (rIdx === 12 ? 1 : rIdx + 2) as Rank;
  return { suit: SUITS[sIdx]!, rank, id: `ceq-${i}-${c}` };
}

export function CardEqualityGame({ state, dispatch, onGameOver }: GameProps<CardEqualityState, CardEqualitySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-header">
        <span className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="cm-score">{state.score} pts</span>
      </div>
      <div className="cm-hand">
        {state.hand.map((c, i) => (
          <Card key={i} card={toEngineCard(c, i)} className="cm-card" />
        ))}
      </div>
      {state.phase === "dealing" && (
        <button data-testid="hint-target-card-equality-primary" className="cm-btn" onClick={() => dispatch({ type:"deal" } as CardEqualityAction)}>Deal</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">{state.lastPts > 0 ? `+${state.lastPts}` : "0"}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as CardEqualityAction)}>Next</button>
        </>
      )}
    </div>
  );
}

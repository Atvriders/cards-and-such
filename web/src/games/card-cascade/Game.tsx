import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardCascadeState, CardCascadeAction, CardCascadeSettings } from "./state.js";
import { isTerminal, TOTAL_DRAWS } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard, Suit, Rank } from "../../engines/deck/index.js";
import "./Game.css";

// state.ts encodes cards as 0..51 with rank order [2,3,..,K,A] (index 12 = A).
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
function toEngineCard(c: number, i: number): EngineCard {
  const rIdx = c % 13;
  const sIdx = Math.floor(c / 13);
  const rank = (rIdx === 12 ? 1 : rIdx + 2) as Rank;
  return { suit: SUITS[sIdx]!, rank, id: `ccas-${i}-${c}` };
}

export function CardCascadeGame({ state, dispatch, onGameOver }: GameProps<CardCascadeState, CardCascadeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase==="done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><p>Streaks: {state.matches}</p><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.drawn} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts</div>
      <div className="cm-result">Cards must descend in rank — each cascade extends the streak bonus.</div>
      {state.lastCard !== null && (
        <Card card={toEngineCard(state.lastCard, -1)} className="cm-card" />
      )}
      <div className="cm-row">
        {state.hand.slice(-8).map((c,i)=>(
          <Card key={i} card={toEngineCard(c, i)} className="cm-card small" />
        ))}
      </div>
      <button data-testid="hint-target-card-cascade-primary" className="cm-btn" onClick={() => dispatch({ type:"draw" } as CardCascadeAction)}>Draw</button>
    </div>
  );
}

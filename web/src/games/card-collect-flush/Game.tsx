import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardCollectFlushState, CardCollectFlushAction, CardCollectFlushSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS, bestSuitCount } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard, Suit, Rank } from "../../engines/deck/index.js";
import "./Game.css";

// state.ts encodes cards as 0..51 with rank order [2,3,..,K,A] (index 12 = A).
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
function toEngineCard(c: number, i: number): EngineCard {
  const rIdx = c % 13;
  const sIdx = Math.floor(c / 13);
  const rank = (rIdx === 12 ? 1 : rIdx + 2) as Rank;
  return { suit: SUITS[sIdx]!, rank, id: `ccf-${i}-${c}` };
}

export function CardCollectFlushGame({ state, dispatch, onGameOver }: GameProps<CardCollectFlushState, CardCollectFlushSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.hand.length > 0 && <div className="cm-row">{state.hand.map((c,i) => <Card key={i} card={toEngineCard(c, i)} className="cm-card" />)}</div>}
      {state.phase === "playing" && <button data-testid="hint-target-card-collect-flush-primary" className="cm-btn" onClick={() => dispatch({ type:"deal" } as CardCollectFlushAction)}>Deal 5</button>}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">Best suit: {bestSuitCount(state.hand)} of 5 — {state.lastPts > 0 ? `+${state.lastPts}` : "no points"}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as CardCollectFlushAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}

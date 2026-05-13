import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardBakeryState, CardBakeryAction, CardBakerySettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard, Suit, Rank } from "../../engines/deck/index.js";
import "./Game.css";

// state.ts encodes cards as 0..51 with rank order [2,3,..,K,A] (index 12 = A).
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
function toEngineCard(c: number, tag: string): EngineCard {
  const rIdx = c % 13;
  const sIdx = Math.floor(c / 13);
  const rank = (rIdx === 12 ? 1 : rIdx + 2) as Rank;
  return { suit: SUITS[sIdx]!, rank, id: `${tag}-${c}` };
}

export function CardBakeryGame({ state, dispatch, onGameOver }: GameProps<CardBakeryState, CardBakerySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div className="cm-final">{state.score} pts</div><div className="cm-kept-row">{state.decisions.map((c,i) => <Card key={i} card={toEngineCard(c, `kept-${i}`)} className="cm-card kept" />)}</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Round {state.round + 1} / {TOTAL_ROUNDS}</div>
      <div className="cm-score">Kept: {state.decisions.length}</div>
      {state.phase === "deal" && (
        <button data-testid="hint-target-card-bakery-primary" className="cm-btn" onClick={() => dispatch({ type:"deal" } as CardBakeryAction)}>Deal pair</button>
      )}
      {state.phase === "decide" && state.pair && (
        <>
          <div className="cm-row">
            {state.pair.map((c, i) => <Card key={i} card={toEngineCard(c, `pair-${i}`)} className="cm-card" />)}
          </div>
          <div className="cm-row">
            <button className="cm-btn" onClick={() => dispatch({ type:"take" } as CardBakeryAction)}>Take</button>
            <button className="cm-btn alt" onClick={() => dispatch({ type:"skip" } as CardBakeryAction)}>Skip</button>
          </div>
        </>
      )}
      <div className="cm-kept-row">{state.decisions.map((c,i) => <Card key={i} card={toEngineCard(c, `kept-${i}`)} className="cm-card kept" />)}</div>
    </div>
  );
}

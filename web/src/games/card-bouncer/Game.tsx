import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardBouncerState, CardBouncerAction, CardBouncerSettings } from "./state.js";
import { isTerminal, rankOf, TOTAL_DRAWS } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard, Suit, Rank } from "../../engines/deck/index.js";
import "./Game.css";

// state.ts encodes cards as 0..51 with rank order [2,3,..,K,A] (index 12 = A).
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
function toEngineCard(c: number): EngineCard {
  const rIdx = c % 13;
  const sIdx = Math.floor(c / 13);
  const rank = (rIdx === 12 ? 1 : rIdx + 2) as Rank;
  return { suit: SUITS[sIdx]!, rank, id: `cb-${c}` };
}

export function CardBouncerGame({ state, dispatch, onGameOver }: GameProps<CardBouncerState, CardBouncerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cb-wrap"><div className="cb-done"><h2>Done!</h2><div className="cb-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cb-wrap">
      <div className="cb-info">Draw {state.draw} / {TOTAL_DRAWS}</div>
      <div className="cb-score">{state.score} pts</div>
      <div className="cb-info">Bounces used: {state.bounceCount} / 1</div>
      {state.current !== null && (
        <>
          <div className="cb-card-wrap">
            <Card card={toEngineCard(state.current)} className="cb-card" />
            <div className="cb-rank">+{rankOf(state.current)}</div>
          </div>
          <div className="cb-row">
            <button data-testid="hint-target-card-bouncer-accept" className="cb-btn" onClick={() => dispatch({ type: "accept" } as CardBouncerAction)}>Accept</button>
            <button data-testid="hint-target-card-bouncer-reject" className="cb-btn alt" disabled={state.bounceCount >= 1} onClick={() => dispatch({ type: "reject" } as CardBouncerAction)}>Reject</button>
          </div>
        </>
      )}
    </div>
  );
}

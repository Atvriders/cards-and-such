import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardClockState, CardClockAction, CardClockSettings } from "./state.js";
import { isTerminal, TOTAL_DRAWS, POINTS_PER_HIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard, Suit, Rank } from "../../engines/deck/index.js";
import "./Game.css";

// state.ts encodes cards as 0..51 with rank order [2,3,..,K,A] (index 12 = A).
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
function toEngineCard(c: number): EngineCard {
  const rIdx = c % 13;
  const sIdx = Math.floor(c / 13);
  const rank = (rIdx === 12 ? 1 : rIdx + 2) as Rank;
  return { suit: SUITS[sIdx]!, rank, id: `cclk-${c}` };
}

export function CardClockGame({ state, dispatch, onGameOver }: GameProps<CardClockState, CardClockSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div>Hits: {state.hits} / {TOTAL_DRAWS}</div><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Hour {state.currentHour} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts • Hits: {state.hits}</div>
      {state.card !== null && (
        <Card card={toEngineCard(state.card)} className="cm-card" />
      )}
      {state.phase === "drawing" && (
        <button data-testid="hint-target-card-clock-primary" className="cm-btn" onClick={() => dispatch({ type: "draw" } as CardClockAction)}>Draw for hour {state.currentHour}</button>
      )}
      {state.phase === "shown" && (
        <>
          <div className="cm-result">{state.lastWasHit ? `Match! +${POINTS_PER_HIT}` : `No match — 0`}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type: "next" } as CardClockAction)}>Next</button>
        </>
      )}
    </div>
  );
}

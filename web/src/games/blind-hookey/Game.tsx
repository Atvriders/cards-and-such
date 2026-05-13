import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BlindHookeyState, BlindHookeyAction, BlindHookeySettings } from "./state.js";
import { isTerminal, ROUNDS } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard, Suit, Rank } from "../../engines/deck/index.js";
import "./Game.css";

// state.ts encodes cards as 0..51 with rank order [A,2,..,K] (index 0 = A).
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
function toEngineCard(c: number, i: number): EngineCard {
  const rIdx = c % 13;
  const sIdx = Math.floor(c / 13) % 4;
  const rank = (rIdx + 1) as Rank;
  return { suit: SUITS[sIdx]!, rank, id: `bh-${i}-${c}` };
}

export function BlindHookeyGame({ state, dispatch, onGameOver }: GameProps<BlindHookeyState, BlindHookeySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    const rating = state.score >= 120 ? "Excellent" : state.score >= 80 ? "Good" : state.score >= 40 ? "Fair" : "Pass";
    return <div className="sol-wrap"><div className="sol-done bounce-in"><h2>Done!</h2><div className="sol-final">{state.score} pts</div><div>{rating}</div></div></div>;
  }
  return (
    <div className="sol-wrap fade-in">
      <div className="sol-header">
        <span className="sol-info">Round: {state.round + 1} / {ROUNDS}</span>
        <span className="sol-score pulse">{state.score} pts</span>
      </div>
      <div className="sol-board">
        {state.hand.map((c, i) => (
          <Card key={i} card={toEngineCard(c, i)} className="sol-card" onClick={() => dispatch({ type: "swap", index: i } as BlindHookeyAction)} />
        ))}
      </div>
      <div className="sol-actions">
        <button data-testid="hint-target-blind-hookey-primary" className="sol-btn sol-btn-keep" onClick={() => dispatch({ type: "keep" } as BlindHookeyAction)}>Keep & Score</button>
        <button className="sol-btn sol-btn-disc" onClick={() => dispatch({ type: "discard", index: 0 } as BlindHookeyAction)}>Discard Hand</button>
      </div>
      <div className="sol-log">
        {state.log.slice(-3).map((l, i) => (<div key={i}>{l}</div>))}
      </div>
    </div>
  );
}

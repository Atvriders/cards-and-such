import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AcesUpMiniState, AcesUpMiniAction, AcesUpMiniSettings } from "./state.js";
import { isTerminal, TOTAL_DRAWS } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard, Suit, Rank } from "../../engines/deck/index.js";
import "./Game.css";

// state.ts encodes cards as 0..51 with rank order [2,3,..,K,A] (index 12 = A).
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
function toEngineCard(c: number): EngineCard {
  const rIdx = c % 13;
  const sIdx = Math.floor(c / 13);
  const rank = (rIdx === 12 ? 1 : rIdx + 2) as Rank;
  return { suit: SUITS[sIdx]!, rank, id: `aum-${c}` };
}

export function AcesUpMiniGame({ state, dispatch, onGameOver }: GameProps<AcesUpMiniState, AcesUpMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap aum-wrap"><div className="cm-done"><h2>Done!</h2><div>Aces found: {state.acesFound}</div><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap aum-wrap">
      <div className="cm-info">Draw {state.draw} / {TOTAL_DRAWS}</div>
      <div className="cm-score">{state.score} pts • Aces: {state.acesFound}</div>
      {state.card !== null && (
        <Card card={toEngineCard(state.card)} className="cm-card" />
      )}
      {state.phase === "drawing" && (
        <button data-testid="hint-target-aces-up-mini-primary" className="cm-btn" onClick={() => dispatch({ type: "draw" } as AcesUpMiniAction)}>Draw</button>
      )}
      {state.phase === "shown" && (
        <>
          <div className="cm-result">{state.lastWasAce ? "Ace! +50" : "Not an Ace — 0"}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type: "next" } as AcesUpMiniAction)}>Next</button>
        </>
      )}
    </div>
  );
}

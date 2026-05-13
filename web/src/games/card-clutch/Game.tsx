import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardClutchState, CardClutchAction, CardClutchSettings } from "./state.js";
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
  return { suit: SUITS[sIdx]!, rank, id: `cclt-${c}` };
}

export function CardClutchGame({ state, dispatch, onGameOver }: GameProps<CardClutchState, CardClutchSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cc-wrap"><div className="cc-done"><h2>Done!</h2><div className="cc-final">{state.score} pts</div></div></div>;
  }
  const isClutchRound = state.round === TOTAL_ROUNDS;
  return (
    <div className="cc-wrap">
      <div className={`cc-info ${isClutchRound ? "clutch" : ""}`}>{isClutchRound ? "CLUTCH ROUND!" : `Round ${state.round} / ${TOTAL_ROUNDS}`}</div>
      <div className="cc-score">{state.score} pts</div>
      {state.card !== null && (
        <Card card={toEngineCard(state.card)} className="cc-card" />
      )}
      {state.phase === "predict" && (
        <>
          <div className="cc-prompt">Predict: HIGH (8+) or LOW (≤7)?</div>
          <div className="cc-row">
            <button data-testid="hint-target-card-clutch-primary" className="cc-btn" onClick={() => dispatch({ type: "predict", choice: "high" } as CardClutchAction)}>HIGH</button>
            <button className="cc-btn alt" onClick={() => dispatch({ type: "predict", choice: "low" } as CardClutchAction)}>LOW</button>
          </div>
        </>
      )}
      {state.phase === "result" && (
        <>
          <div className={`cc-feedback ${state.lastWin ? "ok" : "no"}`}>
            {state.lastWin ? `Correct! ${state.lastClutch ? "+50 (CLUTCH)" : "+10"}` : `Wrong! ${state.lastClutch ? "−25 (CLUTCH)" : "0"}`}
          </div>
          <button className="cc-btn alt" onClick={() => dispatch({ type: "next" } as CardClutchAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}

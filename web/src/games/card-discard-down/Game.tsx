import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardDiscardDownState, CardDiscardDownAction, CardDiscardDownSettings } from "./state.js";
import { isTerminal, pipValue, TOTAL_ROUNDS } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import type { Card as EngineCard, Suit, Rank } from "../../engines/deck/index.js";
import "./Game.css";

// state.ts encodes cards as 0..51 with rank order [2,3,..,K,A] (index 12 = A).
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
function toEngineCard(c: number, i: number): EngineCard {
  const rIdx = c % 13;
  const sIdx = Math.floor(c / 13);
  const rank = (rIdx === 12 ? 1 : rIdx + 2) as Rank;
  return { suit: SUITS[sIdx]!, rank, id: `cdd-${i}-${c}` };
}

export function CardDiscardDownGame({ state, dispatch, onGameOver }: GameProps<CardDiscardDownState, CardDiscardDownSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cdd-wrap"><div className="cdd-done"><h2>Done!</h2><div className="cdd-final">{state.score} pts</div></div></div>;
  }
  const handSum = state.hand.reduce((a, b) => a + pipValue(b), 0);
  return (
    <div className="cdd-wrap">
      <div className="cdd-info">Round {state.round} / {TOTAL_ROUNDS}</div>
      <div className="cdd-score">{state.score} pts</div>
      <div className="cdd-info">Hand sum: {handSum} (lower is better)</div>
      <div className="cdd-row">
        {state.hand.map((c, i) => {
          const sel = state.selected.includes(i);
          const cls = `cdd-card ${sel ? "selected" : ""}`;
          const canClick = state.phase === "selecting";
          return (
            <div key={i} className="cdd-card-wrap">
              <Card
                card={toEngineCard(c, i)}
                className={cls}
                {...(canClick ? { onClick: () => dispatch({ type: "toggle", index: i } as CardDiscardDownAction) } : {})}
              />
              <div className="cdd-pip">({pipValue(c)})</div>
            </div>
          );
        })}
      </div>
      {state.phase === "selecting" && (
        <>
          <div className="cdd-info">Selected to discard: {state.selected.length} / 2</div>
          <button data-testid="hint-target-card-discard-down-primary" className="cdd-btn" onClick={() => dispatch({ type: "discard" } as CardDiscardDownAction)}>Discard & Draw</button>
        </>
      )}
      {state.phase === "result" && (
        <>
          <div className="cdd-feedback">Final sum: {state.finalSum}</div>
          <button className="cdd-btn alt" onClick={() => dispatch({ type: "next" } as CardDiscardDownAction)}>{state.round >= TOTAL_ROUNDS ? "Finish" : "Next"}</button>
        </>
      )}
    </div>
  );
}

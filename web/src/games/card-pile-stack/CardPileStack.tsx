import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardPileStackState, CardPileStackSettings } from "./state.js";
import { isTerminal, cardRank, cardSuit, RANK_NAMES, SUIT_SYMS, cardValue } from "./state.js";
import "./CardPileStack.css";

export function CardPileStack({ state, dispatch, onGameOver }: GameProps<CardPileStackState, CardPileStackSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const total = state.pile.reduce((s, c) => s + cardValue(c), 0);
  const bust = total > 21;

  return (
    <div className="cps-wrap">
      <div className="cps-info">
        <span>Round {state.round}/{state.totalRounds}</span>
        <span>Score: {state.score}</span>
      </div>
      {!terminal ? (
        <>
          <div className={`cps-total${bust ? " bust" : ""}`}>{total > 0 ? total : "—"}</div>
          <div className="cps-pile">
            {state.pile.map((card, i) => {
              const suit = cardSuit(card);
              const red = suit === 1 || suit === 2;
              return <div key={i} className={`cps-mini-card ${red ? "red" : "black"}`}>{RANK_NAMES[cardRank(card)]}{SUIT_SYMS[suit]}</div>;
            })}
          </div>
          {bust && <p style={{ color: "#dc3545", fontWeight: "bold" }}>Bust! Round lost.</p>}
          <div className="cps-btns">
            <button className="cps-btn draw" disabled={bust} onClick={() => dispatch({ type: "draw" })}>Draw Card</button>
            <button className="cps-btn bank" disabled={state.pile.length === 0 || bust} onClick={() => dispatch({ type: "bank" })}>Bank {total > 0 ? `(+${total})` : ""}</button>
          </div>
        </>
      ) : (
        <div className="cps-done"><h2>Game Over!</h2><div className="cps-final">Final Score: {state.score}</div></div>
      )}
    </div>
  );
}

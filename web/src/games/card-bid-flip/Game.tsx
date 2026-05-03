import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardBidFlipState, CardBidFlipAction, CardBidFlipSettings } from "./state.js";
import { isTerminal, cardName, isRed } from "./state.js";
import "./Game.css";

export function CardBidFlip({ state, dispatch, onGameOver }: GameProps<CardBidFlipState, CardBidFlipSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const [bidInput, setBidInput] = useState(10);

  if (state.phase === "gameover") return (
    <div className="cbf-wrap"><div className="cbf-done">
      <h2>Game Over!</h2>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#f39c12" }}>{state.coins} coins</p>
    </div></div>
  );

  return (
    <div className="cbf-wrap">
      <div className="cbf-header">
        <span>Round {state.round} / {state.maxRounds}</span>
        <span className="cbf-coins">{state.coins} coins</span>
      </div>
      {state.phase === "bidding" && (
        <div className="cbf-body">
          <p className="cbf-hint">Bet on whether the next card is <strong>8 or higher</strong> (ranks 8–A win).</p>
          <div className="cbf-bid-row">
            <input type="number" min={1} max={state.coins} value={bidInput} onChange={e => setBidInput(Number(e.target.value))} className="cbf-input" />
            <button data-testid="hint-target-card-bid-flip-primary" className="cbf-btn" onClick={() => dispatch({ type: "bid", amount: bidInput } as CardBidFlipAction)}>Flip</button>
          </div>
        </div>
      )}
      {state.phase === "flipped" && state.currentCard !== null && (
        <div className="cbf-body">
          <div className={`cbf-card ${isRed(state.currentCard) ? "red" : ""}`}>{cardName(state.currentCard)}</div>
          <div className={`cbf-result ${state.lastWin ? "win" : "lose"}`}>{state.lastWin ? `+${state.bid} coins!` : `-${state.bid} coins`}</div>
          <button className="cbf-btn next" onClick={() => dispatch({ type: "next" } as CardBidFlipAction)}>Next</button>
        </div>
      )}
    </div>
  );
}

import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AuctionState, AuctionSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function AuctionGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<AuctionState, AuctionSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="ag-game">
      <div className="ag-title">Auction House</div>
      <div className="ag-stats">
        <span>Round {state.round}/{state.totalRounds}</span>
        <span>Your Balance: <b>${state.playerMoney}</b></span>
        <span>AI Balance: ${state.aiMoney}</span>
      </div>

      {state.phase !== "over" && (
        <div className="ag-item">
          <div className="ag-item-name">{state.item.name}</div>
          <div className="ag-item-value">True Value: <b>${state.item.trueValue}</b></div>
          <div className="ag-current-bid">Current Bid: <b>${state.item.currentBid}</b></div>
        </div>
      )}

      <div className="ag-log">{state.log}</div>

      {state.phase === "bid" && (
        <div className="ag-actions">
          <div className="ag-raise-row">
            {[10, 25, 50, 100].map(amt => (
              <button key={amt} className="ag-raise-btn"
                onClick={() => dispatch({ type: "raise", amount: amt })}>
                +${amt}
              </button>
            ))}
          </div>
          <button className="ag-pass-btn" onClick={() => dispatch({ type: "pass" })}>
            Pass
          </button>
        </div>
      )}

      {state.phase === "result" && (
        <button className="ag-next-btn" onClick={() => dispatch({ type: "next" })}>
          Next Round &rarr;
        </button>
      )}

      {state.phase === "over" && (
        <div className="ag-result">
          Final Score: {state.score}
        </div>
      )}
    </div>
  );
}

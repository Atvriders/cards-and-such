import { useState, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KingdomsDiceState, KingdomsDiceAction, KingdomsDiceSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./KingdomsDice.css";

export function KingdomsDice({
  state,
  dispatch,
  onGameOver,
}: GameProps<KingdomsDiceState, KingdomsDiceSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selectedDie, setSelectedDie] = useState<number | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    setSelectedDie(null);
  }, [state.phase]);

  const { phase, dice, market, playerScore, botScore, targetScore, message, winner, lastBotAction } = state;
  const canRoll = phase === "roll" && state.turn === 0 && winner === null;
  const canBuy = phase === "buy" && state.turn === 0 && winner === null;
  const canPass = phase === "buy" && state.turn === 0;

  function handleDieClick(i: number) {
    if (!canBuy) return;
    setSelectedDie(i === selectedDie ? null : i);
  }

  function handleKingdomClick(mi: number) {
    if (!canBuy || selectedDie === null) return;
    dispatch({ type: "buy", dieIndex: selectedDie, marketIndex: mi } as KingdomsDiceAction);
  }

  function isDieMatchable(i: number): boolean {
    const face = dice[i];
    return market.some((k) => k.rank === face);
  }

  function isKingdomBuyable(mi: number): boolean {
    if (selectedDie !== null) {
      return market[mi]!.rank === dice[selectedDie];
    }
    return dice.some((d) => d === market[mi]!.rank);
  }

  return (
    <div className="kingdoms-dice">
      <div className="kingdoms-scoreboard">
        <span className="kingdoms-player-score">You: {playerScore} / {targetScore}</span>
        <span className="kingdoms-bot-score">Bot: {botScore} / {targetScore}</span>
      </div>

      <div className="kingdoms-market-label">Kingdom Market (rank needed → point value):</div>
      <div className="kingdoms-market">
        {market.map((k, mi) => (
          <div
            key={mi}
            className={`kingdom-card${isKingdomBuyable(mi) && canBuy ? " buyable" : ""}${selectedDie !== null && k.rank === dice[selectedDie] ? " selected" : ""}`}
            onClick={() => handleKingdomClick(mi)}
          >
            <div className="kingdom-rank">Rank <strong>{k.rank}</strong></div>
            <div className="kingdom-value">{k.value}</div>
            <div style={{ fontSize: "0.7rem", color: "#999" }}>pts</div>
          </div>
        ))}
      </div>

      {dice.length > 0 && (
        <>
          <div style={{ fontSize: "0.85rem", color: "#666" }}>
            Your dice — {selectedDie !== null ? "now click a kingdom to buy" : "click a die to select it"}:
          </div>
          <div className="kingdoms-dice-row">
            {dice.map((v, i) => (
              <div
                key={i}
                className={`kingdoms-die${selectedDie === i ? " selected-die" : isDieMatchable(i) && canBuy ? " matchable" : ""}`}
                onClick={() => handleDieClick(i)}
              >
                {v}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="kingdoms-controls">
        {canRoll && (
          <button data-testid="hint-target-kingdoms-dice-roll" onClick={() => dispatch({ type: "roll" } as KingdomsDiceAction)}>
            Roll 3 Dice
          </button>
        )}
        {canPass && (
          <button data-testid="hint-target-kingdoms-dice-pass" onClick={() => dispatch({ type: "pass" } as KingdomsDiceAction)}>
            Pass
          </button>
        )}
      </div>

      <div className={`kingdoms-message${winner === 0 ? " win" : ""}`}>{message}</div>

      {lastBotAction && (
        <div className="kingdoms-bot-msg">{lastBotAction}</div>
      )}
    </div>
  );
}

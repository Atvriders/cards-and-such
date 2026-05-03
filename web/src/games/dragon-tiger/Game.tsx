import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DragonTigerState, DragonTigerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const RED_SUITS = new Set(["♥", "♦"]);

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function DragonTiger({ state, dispatch, onGameOver }: GameProps<DragonTigerState, DragonTigerSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { phase, bankroll, handsPlayed, settings, betChoice, dragonCard, tigerCard, lastResult } = state;

  return (
    <div className="dt-root">
      <div className="dt-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Hand: {handsPlayed + (phase === "betting" ? 0 : 0)} / {settings.handsPerSession}</span>
        <span>Bet: ${settings.bet}</span>
      </div>

      <div className="dt-table">
        <div className="dt-side">
          <div className="dt-label dragon">Dragon</div>
          {dragonCard ? (
            <div className={`dt-card${RED_SUITS.has(dragonCard.suit) ? " red" : ""}`}>
              <span>{rankLabel(dragonCard.rank)}</span>
              <span>{dragonCard.suit}</span>
            </div>
          ) : <div className="dt-card empty" />}
        </div>
        <div className="dt-vs">VS</div>
        <div className="dt-side">
          <div className="dt-label tiger">Tiger</div>
          {tigerCard ? (
            <div className={`dt-card${RED_SUITS.has(tigerCard.suit) ? " red" : ""}`}>
              <span>{rankLabel(tigerCard.rank)}</span>
              <span>{tigerCard.suit}</span>
            </div>
          ) : <div className="dt-card empty" />}
        </div>
      </div>

      {lastResult && <div className="dt-result">{lastResult}</div>}

      {(phase === "betting" || phase === "settled") && !terminal && (
        <>
          <div className="dt-bets">
            <button
              className={`dt-bet-btn dragon-btn${betChoice === "dragon" ? " selected" : ""}`}
              onClick={() => dispatch({ type: "bet", on: "dragon" })}
            >Dragon (1:1)</button>
            <button
              className={`dt-bet-btn tie-btn${betChoice === "tie" ? " selected" : ""}`}
              onClick={() => dispatch({ type: "bet", on: "tie" })}
            >Tie (8:1)</button>
            <button
              className={`dt-bet-btn tiger-btn${betChoice === "tiger" ? " selected" : ""}`}
              onClick={() => dispatch({ type: "bet", on: "tiger" })}
            >Tiger (1:1)</button>
          </div>
          <button
            data-testid="hint-target-dragon-tiger-action" className="dt-deal-btn"
            onClick={() => dispatch({ type: "deal" })}
            disabled={!betChoice}
          >
            Deal
          </button>
        </>
      )}
      {terminal && <div className="dt-game-over">Game Over — Final: ${terminal.score}</div>}
    </div>
  );
}

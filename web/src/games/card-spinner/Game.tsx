import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardSpinnerState, CardSpinnerSettings, CardSpinnerAction, Bet, BetType } from "./state.js";
import { isTerminal, SUITS, RANKS, BET_PAYOUTS, BET_COSTS } from "./state.js";
import "./Game.css";

const SUIT_COLOR: Record<string, string> = { "♥": "#cc1111", "♦": "#cc1111", "♠": "#111", "♣": "#111" };

export function CardSpinner({
  state,
  dispatch,
  onGameOver,
}: GameProps<CardSpinnerState, CardSpinnerSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const card = state.spunCard;
  const roundDone = card !== null;

  function addBet(type: BetType, value: string) {
    dispatch({ type: "placeBet", bet: { type, value } } as CardSpinnerAction);
  }

  function handleNextRound() {
    dispatch({ type: "nextRound" } as CardSpinnerAction);
  }

  return (
    <div className="cs-game">
      <div className="cs-title">Card Spinner</div>
      <div className="cs-stats">
        <span>Round {Math.min(state.round, state.totalRounds)} / {state.totalRounds}</span>
        <span>Score: <strong className={state.score >= 0 ? "pos" : "neg"}>{state.score}</strong></span>
      </div>

      {/* Card display */}
      <div className="cs-card-area">
        {card ? (
          <div className="cs-card" style={{ color: SUIT_COLOR[card.suit] ?? "#111" }}>
            <div className="cs-card-corner cs-top">
              <div>{card.rank}</div>
              <div>{card.suit}</div>
            </div>
            <div className="cs-card-center">{card.suit}</div>
            <div className="cs-card-corner cs-bot">
              <div>{card.rank}</div>
              <div>{card.suit}</div>
            </div>
          </div>
        ) : (
          <div className="cs-card-back">🃏</div>
        )}
      </div>

      {/* Bets placed */}
      {state.bets.length > 0 && !roundDone && (
        <div className="cs-bets-placed">
          {state.bets.map((b, i) => (
            <span key={i} className="cs-bet-chip">
              {b.value} ({b.type})
              <button className="cs-remove-bet" onClick={() => dispatch({ type: "removeBet", index: i } as CardSpinnerAction)} aria-label="Clear" data-tooltip="Clear input">×</button>
            </span>
          ))}
        </div>
      )}

      {/* Last result */}
      {roundDone && state.history[0] && (
        <div className={`cs-result ${state.history[0].net >= 0 ? "win" : "loss"}`}>
          {state.history[0].net >= 0 ? `+${state.history[0].net} pts` : `${state.history[0].net} pts`}
          {state.history[0].wins > 0 && <span> — Won bets: {state.history[0].bets.filter((b) => {
            const c = card!;
            if (b.type === "color") return c.color === b.value;
            if (b.type === "suit") return c.suit === b.value;
            if (b.type === "rank") return c.rank === b.value;
            return false;
          }).map(b => b.value).join(", ")}</span>}
        </div>
      )}

      {/* Betting controls */}
      {!roundDone && !state.gameOver && (
        <div className="cs-bet-panel">
          <div className="cs-bet-group">
            <div className="cs-bet-label">Color (cost: {BET_COSTS.color}, pays: {BET_PAYOUTS.color})</div>
            <div className="cs-bet-row">
              {["red", "black"].map((c, ci) => (
                <button key={c} {...(ci === 0 ? { "data-testid": "hint-target-card-spinner-bet" } : {})} className={`cs-bet-btn color-${c}`} onClick={() => addBet("color", c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="cs-bet-group">
            <div className="cs-bet-label">Suit (cost: {BET_COSTS.suit}, pays: {BET_PAYOUTS.suit})</div>
            <div className="cs-bet-row">
              {SUITS.map(s => (
                <button key={s} className="cs-bet-btn suit-btn" style={{ color: SUIT_COLOR[s] }} onClick={() => addBet("suit", s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="cs-bet-group">
            <div className="cs-bet-label">Rank (cost: {BET_COSTS.rank}, pays: {BET_PAYOUTS.rank})</div>
            <div className="cs-bet-row cs-ranks">
              {RANKS.map(r => (
                <button key={r} className="cs-bet-btn rank-btn" onClick={() => addBet("rank", r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <button
            data-testid="hint-target-card-spinner-spin"
            className="cs-spin-btn"
            onClick={() => dispatch({ type: "spin" } as CardSpinnerAction)}
          >
            Spin!
          </button>
        </div>
      )}

      {roundDone && !state.gameOver && (
        <button data-testid="hint-target-card-spinner-next" className="cs-next-btn" onClick={handleNextRound}>
          Next Round
        </button>
      )}

      {state.gameOver && (
        <div className="cs-game-over">
          <div>Game Over!</div>
          <div>Final Score: {terminal?.score}</div>
          <button className="cs-spin-btn" onClick={() => dispatch({ type: "restart" } as CardSpinnerAction)}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

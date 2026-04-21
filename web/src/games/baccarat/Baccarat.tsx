import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BaccaratState, BaccaratSettings, BaccaratAction, BaccaratBet } from "./state.js";
import { handTotal, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Baccarat.css";

export function Baccarat({
  state,
  dispatch,
  onGameOver,
}: GameProps<BaccaratState, BaccaratSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, bankroll, handsPlayed, settings, playerCards, bankerCards, currentBet, lastResult } = state;
  const maxHands = parseInt(settings.hands, 10);

  function dis(a: BaccaratAction) { dispatch(a); }

  const betOptions: { label: string; value: BaccaratBet }[] = [
    { label: "Player (1:1)", value: "player" },
    { label: "Banker (1:1 -5%)", value: "banker" },
    { label: "Tie (8:1)", value: "tie" },
  ];

  return (
    <div className="baccarat">
      <div className="bac-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Hand: {handsPlayed} / {maxHands}</span>
        <span>Bet: ${settings.betSize}</span>
      </div>

      {lastResult && <div className="bac-result">{lastResult}</div>}

      <div className="bac-table">
        <div className="bac-side">
          <div className="bac-side-label">Player</div>
          <div className="bac-cards">
            {playerCards.map((c, i) => <Card key={c.id + i} card={c} />)}
          </div>
          {playerCards.length > 0 && (
            <div className="bac-total">{handTotal(playerCards)}</div>
          )}
        </div>
        <div className="bac-side">
          <div className="bac-side-label">Banker</div>
          <div className="bac-cards">
            {bankerCards.map((c, i) => <Card key={c.id + i} card={c} />)}
          </div>
          {bankerCards.length > 0 && (
            <div className="bac-total">{handTotal(bankerCards)}</div>
          )}
        </div>
      </div>

      {!terminal && (phase === "betting" || phase === "settled") && (
        <div className="bac-bet-buttons">
          <div className="bac-bet-label">Bet on:</div>
          {betOptions.map(({ label, value }) => (
            <button
              key={value}
              className={`bac-bet-btn${currentBet === value ? " selected" : ""}`}
              onClick={() => dis({ type: "bet", bet: value })}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="bac-actions">
        {!terminal && (phase === "betting" || phase === "settled") && (
          <button onClick={() => dis({ type: "deal" })}>
            Deal Hand
          </button>
        )}
        {terminal && (
          <div className="bac-game-over">
            Game Over — Final Bankroll: ${terminal.score}
          </div>
        )}
      </div>
    </div>
  );
}

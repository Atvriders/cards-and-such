import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrownAndAnchorState, CrownAndAnchorSettings, CrownAndAnchorAction, Symbol } from "./state.js";
import { isTerminal, SYMBOLS, SYMBOL_LABELS } from "./state.js";
import "./CrownAndAnchor.css";

const SYMBOL_ICONS: Record<Symbol, string> = {
  crown: "👑",
  anchor: "⚓",
  heart: "♥",
  diamond: "♦",
  club: "♣",
  spade: "♠",
};

export function CrownAndAnchor({
  state,
  dispatch,
  onGameOver,
}: GameProps<CrownAndAnchorState, CrownAndAnchorSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, coins, bet, betSymbol, lastRoll, lastWin, roundsPlayed } = state;

  return (
    <div className="ca">
      <div className="ca-coins">Coins: {coins} | Rounds: {roundsPlayed}</div>

      <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>Pick your symbol:</div>
      <div className="ca-symbols">
        {SYMBOLS.map((sym) => (
          <button
            key={sym}
            className={`ca-symbol-btn${betSymbol === sym ? " selected" : ""}`}
            onClick={() => phase === "betting" && dispatch({ type: "setBetSymbol", symbol: sym } as CrownAndAnchorAction)}
          >
            {SYMBOL_ICONS[sym]}
            <span>{sym}</span>
          </button>
        ))}
      </div>

      <div className="ca-bet-row">
        <label htmlFor="ca-bet">Bet:</label>
        <input
          id="ca-bet"
          type="number"
          min={1}
          max={coins}
          value={bet}
          onChange={(e) => dispatch({ type: "setBet", amount: parseInt(e.target.value) || 1 } as CrownAndAnchorAction)}
          disabled={phase !== "betting"}
        />
        <span>coins</span>
      </div>

      {lastRoll.length > 0 && (
        <div className="ca-dice">
          {lastRoll.map((sym, i) => (
            <div key={i} className={`ca-die${sym === betSymbol ? " match" : ""}`}>
              {SYMBOL_ICONS[sym]}
            </div>
          ))}
        </div>
      )}

      {phase === "rolled" && (
        <div className={`ca-result ${lastWin > 0 ? "win" : "lose"}`}>
          {lastWin > 0 ? `Won +${lastWin} coins!` : `Lost ${-lastWin} coins!`}
        </div>
      )}

      {terminal && (
        <div className="ca-message">Bankrupt! Survived {roundsPlayed} rounds.</div>
      )}

      <div className="ca-controls">
        {phase === "betting" && (
          <button className="roll-btn" onClick={() => dispatch({ type: "roll" } as CrownAndAnchorAction)}>
            Roll Dice
          </button>
        )}
        {phase === "rolled" && (
          <button onClick={() => dispatch({ type: "nextRound" } as CrownAndAnchorAction)}>
            Next Round
          </button>
        )}
      </div>
    </div>
  );
}

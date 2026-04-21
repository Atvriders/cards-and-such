import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RouletteState, RouletteSettings, RouletteAction, BetType } from "./state.js";
import { displayNumber, getColor, isTerminal } from "./state.js";
import "./Roulette.css";

const BET_TYPES: { value: BetType; label: string }[] = [
  { value: "red", label: "Red (1:1)" },
  { value: "black", label: "Black (1:1)" },
  { value: "odd", label: "Odd (1:1)" },
  { value: "even", label: "Even (1:1)" },
  { value: "low", label: "Low 1-18 (1:1)" },
  { value: "high", label: "High 19-36 (1:1)" },
  { value: "dozen1", label: "1st 12 (2:1)" },
  { value: "dozen2", label: "2nd 12 (2:1)" },
  { value: "dozen3", label: "3rd 12 (2:1)" },
  { value: "col1", label: "Col 1 (2:1)" },
  { value: "col2", label: "Col 2 (2:1)" },
  { value: "col3", label: "Col 3 (2:1)" },
  { value: "straight", label: "Straight (35:1)" },
];

export function Roulette({
  state,
  dispatch,
  onGameOver,
}: GameProps<RouletteState, RouletteSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const [localAmount, setLocalAmount] = useState(10);
  const [localStraight, setLocalStraight] = useState(7);

  const { phase, bankroll, spinsPlayed, settings, currentBets, lastNumber, lastResult, pendingBetType } = state;
  const maxSpins = parseInt(settings.maxSpins, 10);

  function dis(a: RouletteAction) { dispatch(a); }

  const wheelColor = lastNumber !== null ? getColor(lastNumber) : "green";
  const wheelDisplay = lastNumber !== null ? displayNumber(lastNumber) : "?";

  const isBetting = phase === "betting" || phase === "settled";
  const canSpin = isBetting && currentBets.length > 0 && !terminal;

  return (
    <div className="roulette">
      <div className="rou-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Spin: {spinsPlayed} / {maxSpins}</span>
      </div>

      <div className={`rou-wheel ${wheelColor}`}>
        {wheelDisplay}
      </div>

      {lastResult && <div className="rou-result">{lastResult}</div>}

      {!terminal && isBetting && (
        <div className="rou-controls">
          <div className="rou-control-row">
            <label>Bet type:</label>
            <div className="rou-bet-types">
              {BET_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  className={`rou-bet-type-btn${pendingBetType === value ? " selected" : ""}`}
                  onClick={() => dis({ type: "set-bet-type", betType: value })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {pendingBetType === "straight" && (
            <div className="rou-control-row">
              <label>Number:</label>
              <input
                type="number"
                min={0}
                max={37}
                value={localStraight}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  setLocalStraight(n);
                  dis({ type: "set-straight-number", num: n });
                }}
              />
              <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>(37 = 00)</span>
            </div>
          )}

          <div className="rou-control-row">
            <label>Amount: $</label>
            <input
              type="number"
              min={1}
              max={bankroll}
              value={localAmount}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                setLocalAmount(n);
                dis({ type: "set-bet-amount", amount: n });
              }}
            />
            <button onClick={() => dis({ type: "place-bet" })}>Add Bet</button>
          </div>

          {currentBets.length > 0 && (
            <div className="rou-current-bets">
              <strong>Placed bets:</strong>{" "}
              {currentBets.map((b, i) => (
                <span key={i}>
                  {b.type === "straight" ? `straight(${b.number === 37 ? "00" : b.number})` : b.type} ${b.amount}
                  {i < currentBets.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rou-actions">
        {!terminal && isBetting && (
          <>
            <button
              className="rou-spin-btn"
              onClick={() => dis({ type: "spin" })}
              disabled={!canSpin}
            >
              Spin
            </button>
            {currentBets.length > 0 && (
              <button className="danger" onClick={() => dis({ type: "clear-bets" })}>
                Clear Bets
              </button>
            )}
          </>
        )}
        {terminal && (
          <div className="rou-game-over">
            Game Over — Final Bankroll: ${terminal.score}
          </div>
        )}
      </div>
    </div>
  );
}

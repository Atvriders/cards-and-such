import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniRouletteState, MiniRouletteSettings } from "./state.js";
import { isTerminal, RED_NUMBERS, BLACK_NUMBERS, COLUMNS } from "./state.js";
import "./Game.css";

export function MiniRoulette({ state, dispatch, onGameOver }: GameProps<MiniRouletteState, MiniRouletteSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { phase, bankroll, spinsPlayed, settings, bets, landedNumber, lastResult } = state;
  const totalBet = bets.reduce((s, b) => s + b.amount, 0);
  const canSpin = phase === "betting" && bets.length > 0;

  return (
    <div className="mr-root">
      <div className="mr-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Spin: {spinsPlayed + (phase === "betting" ? 0 : 0)} / {settings.spinsPerSession}</span>
        <span>Chip: ${settings.chipValue}</span>
        {totalBet > 0 && <span>Bet: ${totalBet}</span>}
      </div>

      {lastResult && <div className="mr-result">{lastResult}</div>}

      <div className="mr-wheel">
        {Array.from({ length: 13 }, (_, i) => {
          const color = i === 0 ? "green" : RED_NUMBERS.has(i) ? "red" : "black";
          const isLanded = landedNumber === i && phase === "settled";
          return (
            <div
              key={i}
              className={`mr-num ${color}${isLanded ? " landed" : ""}`}
              onClick={() => phase === "betting" && dispatch({ type: "place-bet", betType: "straight", numbers: [i] })}
              title={`Straight bet on ${i} (pays 11:1)`}
            >
              {i}
            </div>
          );
        })}
      </div>

      <div className="mr-outside">
        <button data-testid="hint-target-mini-roulette-bet" onClick={() => phase === "betting" && dispatch({ type: "place-bet", betType: "color", numbers: [1,3,5,7,9,11] })}
          title="Red (1:1)">Red (1:1)</button>
        <button onClick={() => phase === "betting" && dispatch({ type: "place-bet", betType: "color", numbers: [2,4,6,8,10,12] })}
          title="Black (1:1)">Black (1:1)</button>
        <button onClick={() => phase === "betting" && dispatch({ type: "place-bet", betType: "even-odd", numbers: [2,4,6,8,10,12] })}
          title="Even (1:1)">Even (1:1)</button>
        <button onClick={() => phase === "betting" && dispatch({ type: "place-bet", betType: "even-odd", numbers: [1,3,5,7,9,11] })}
          title="Odd (1:1)">Odd (1:1)</button>
        {COLUMNS.map((col, ci) => (
          <button key={ci}
            onClick={() => phase === "betting" && dispatch({ type: "place-bet", betType: "column", numbers: col })}
            title={`Column ${ci+1} (2:1)`}>
            {col.join("-")} (2:1)
          </button>
        ))}
      </div>

      {bets.length > 0 && (
        <div className="mr-bets">
          Bets: {bets.map((b, i) => `${b.type}[${b.numbers.join(",")}]=$${b.amount}`).join(", ")}
        </div>
      )}

      <div className="mr-actions">
        {phase === "betting" && (
          <>
            <button data-testid="hint-target-mini-roulette-spin" className="spin" onClick={() => dispatch({ type: "spin" })} disabled={!canSpin}>Spin</button>
            <button className="clear" onClick={() => dispatch({ type: "clear-bets" })} disabled={bets.length === 0}>Clear</button>
          </>
        )}
        {phase === "settled" && !terminal && (
          <button data-testid="hint-target-mini-roulette-next" className="next" onClick={() => dispatch({ type: "spin" })}>Next Spin</button>
        )}
        {terminal && <div className="mr-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>
    </div>
  );
}

import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FanTanState, FanTanSettings, FanTanBet } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const NUMBERS: FanTanBet[] = [1, 2, 3, 4];

export function FanTan({ state, dispatch, onGameOver }: GameProps<FanTanState, FanTanSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { phase, bankroll, roundsPlayed, settings, bets, result, beanCount, lastResult } = state;
  const canReveal = phase === "betting" && bets.length > 0;

  return (
    <div className="ft-root">
      <div className="ft-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Round: {roundsPlayed} / {settings.roundsPerSession}</span>
        <span>Bet: ${settings.bet} each</span>
      </div>

      {beanCount !== null && (
        <div className="ft-beans">
          <div style={{ fontSize: "0.85rem", marginBottom: 4 }}>Beans scooped:</div>
          <div>{beanCount}</div>
          <div style={{ fontSize: "0.85rem", marginTop: 4 }}>{beanCount} ÷ 4 = {Math.floor(beanCount / 4)} remainder {beanCount % 4 === 0 ? 4 : beanCount % 4}</div>
        </div>
      )}

      <div className="ft-table">
        {NUMBERS.map(n => {
          const isBet = bets.includes(n);
          const isResult = result === n;
          return (
            <button
              key={n}
              className={`ft-btn${isBet ? " bet" : ""}${isResult ? " result" : ""}`}
              onClick={() => {
                if (phase !== "betting") return;
                if (isBet) dispatch({ type: "remove-bet", on: n });
                else dispatch({ type: "place-bet", on: n });
              }}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div className="ft-hint">
        {phase === "betting" && bets.length === 0 && "Click a number to bet (max 2 numbers)"}
        {phase === "betting" && bets.length > 0 && `Bet on: ${bets.join(", ")}. Click again to remove.`}
      </div>

      {lastResult && <div className="ft-result">{lastResult}</div>}

      <div className="ft-actions">
        {phase === "betting" && (
          <button className="reveal" onClick={() => dispatch({ type: "reveal" })} disabled={!canReveal}>
            Reveal
          </button>
        )}
        {phase === "settled" && !terminal && (
          <button className="next" onClick={() => dispatch({ type: "next-round" })}>Next Round</button>
        )}
        {terminal && <div className="ft-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>

      <div className="ft-hint">
        1 number: pays 3:1. 2 numbers: pays 1:1 on the hit (lose the other bet).
      </div>
    </div>
  );
}

import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Bonus6State, Bonus6Action, Bonus6Settings } from "./state.js";
import { containsSix, isTerminal } from "./state.js";
import "./Game.css";

export function Bonus6Game({
  state,
  dispatch,
  onGameOver,
}: GameProps<Bonus6State, Bonus6Settings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { phase, bankroll, spinsPlayed, settings, spinResult, lastResult } = state;
  const hit = spinResult !== null && containsSix(spinResult);

  function dis(a: Bonus6Action) { dispatch(a); }

  return (
    <div className="bonus6">
      <div className="bonus6-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Spin: {spinsPlayed + (phase !== "settled" ? 1 : 0)}/{settings.spinsPerSession}</span>
        <span>Bet: ${settings.bet}</span>
      </div>

      {spinResult !== null ? (
        <div className={`bonus6-result-num${hit ? " hit" : ""}`}>{spinResult}</div>
      ) : (
        <div className="bonus6-wheel">?</div>
      )}

      <div className="bonus6-rule">
        Bet the spin will contain the digit 6 — pays 6:1
      </div>

      {lastResult && <div className="bonus6-result">{lastResult}</div>}

      <div className="bonus6-actions">
        {phase === "betting" && (
          <button onClick={() => dis({ type: "place-bet" })} data-testid="hint-target-bonus6-bet">Place Bet</button>
        )}
        {phase === "spinning" && (
          <button onClick={() => dis({ type: "spin" })} data-testid="hint-target-bonus6-spin">Spin!</button>
        )}
        {phase === "settled" && !terminal && (
          <button onClick={() => dis({ type: "next" })} data-testid="hint-target-bonus6-next">Next Spin</button>
        )}
        {terminal && <div className="bonus6-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>
    </div>
  );
}

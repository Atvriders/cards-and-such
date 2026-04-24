import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KenoMiniState, KenoMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PAYTABLE_DISPLAY: Record<number, [number, number][]> = {
  1: [[1, 3]],
  2: [[2, 12], [1, 1]],
  3: [[3, 45], [2, 4], [1, 1]],
  4: [[4, 120], [3, 6], [2, 2]],
  5: [[5, 350], [4, 20], [3, 4], [2, 1]],
};

export function KenoMini({ state, dispatch, onGameOver }: GameProps<KenoMiniState, KenoMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { phase, bankroll, roundsPlayed, settings, picked, drawn, lastResult } = state;
  const spots = parseInt(settings.spotsToPlay, 10);
  const drawnSet = new Set(drawn);
  const pickedSet = new Set(picked);

  function numClass(n: number): string {
    const isDrawn = drawnSet.has(n);
    const isPicked = pickedSet.has(n);
    if (isPicked && isDrawn) return "km-num hit";
    if (isPicked && phase === "settled") return "km-num picked not-drawn";
    if (isPicked) return "km-num picked";
    if (isDrawn) return "km-num drawn";
    return "km-num";
  }

  const payRows = PAYTABLE_DISPLAY[spots] ?? [];

  return (
    <div className="km-root">
      <div className="km-header">
        <span>Bankroll: ${bankroll}</span>
        <span>Round: {roundsPlayed} / {settings.roundsPerSession}</span>
        <span>Bet: ${settings.bet}</span>
        <span>Pick {spots} numbers</span>
        <span>Selected: {picked.length}/{spots}</span>
      </div>

      <div className="km-board">
        {Array.from({ length: 40 }, (_, i) => i + 1).map(n => (
          <div
            key={n}
            className={numClass(n)}
            onClick={() => {
              if (phase !== "picking") return;
              if (pickedSet.has(n)) dispatch({ type: "unpick", number: n });
              else dispatch({ type: "pick", number: n });
            }}
          >
            {n}
          </div>
        ))}
      </div>

      {lastResult && <div className="km-result">{lastResult}</div>}

      <div className="km-actions">
        {phase === "picking" && (
          <button
            className="draw"
            onClick={() => dispatch({ type: "draw" })}
            disabled={picked.length !== spots}
          >
            Draw! (${settings.bet})
          </button>
        )}
        {phase === "settled" && !terminal && (
          <button className="next" onClick={() => dispatch({ type: "new-round" })}>Next Round</button>
        )}
        {terminal && <div className="km-game-over">Game Over — Final: ${terminal.score}</div>}
      </div>

      <table className="km-paytable">
        <thead><tr><th>Hits</th><th>Pays (x bet)</th></tr></thead>
        <tbody>
          {payRows.map(([hits, mult]) => (
            <tr key={hits}><td>{hits}/{spots}</td><td>{mult}x</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

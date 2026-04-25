import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceGolfState, DiceGolfAction, DiceGolfSettings, ShotResult } from "./state.js";
import { isTerminal, totalStrokes, totalPar, scoreVsPar, getHolePar } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./DiceGolf.css";

const RESULT_LABELS: Record<ShotResult, string> = {
  holeInOne: "HOLE IN ONE!",
  perfectDrive: "Perfect Drive! (+3 advance)",
  powerShot: "Power Shot (+2 advance)",
  normalShot: "Normal Shot (+1 advance)",
  rough: "Into the Rough (+1 advance, +1 stroke penalty)",
};

export function DiceGolf({
  state,
  dispatch,
  onGameOver,
}: GameProps<DiceGolfState, DiceGolfSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const totalHoles = parseInt(state.settings.holes, 10);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const holePar = getHolePar(state.currentHole - 1);
  const vsPar = scoreVsPar(state.holes);
  const vsParStr = vsPar === 0 ? "E" : vsPar > 0 ? `+${vsPar}` : `${vsPar}`;

  function strokeClass(h: { par: number; strokes: number }): string {
    const diff = h.strokes - h.par;
    if (diff <= -2) return "eagle";
    if (diff === -1) return "birdie";
    if (diff === 0) return "";
    if (diff === 1) return "bogey";
    return "double-bogey";
  }

  return (
    <div className="dice-golf">
      <h2>DICE GOLF</h2>

      <div className="golf-header">
        <div>Hole <span>{Math.min(state.currentHole, totalHoles)}</span> / <span>{totalHoles}</span></div>
        <div>Strokes: <span>{state.currentStrokes}</span></div>
        <div>vs Par: <span>{vsParStr}</span></div>
      </div>

      {!state.gameOver && (
        <>
          <div className="golf-hole-info">
            Hole {state.currentHole} — Par {holePar}
          </div>
          <div className="golf-progress">
            {Array.from({ length: holePar }).map((_, i) => (
              <div key={i} className={`golf-progress-dot${i < state.currentProgress ? " filled" : ""}`} />
            ))}
          </div>
        </>
      )}

      {state.lastRoll && (
        <div className="golf-dice-row">
          <Die value={state.lastRoll[0] as 1|2|3|4|5|6} kept={false} />
          <Die value={state.lastRoll[1] as 1|2|3|4|5|6} kept={false} />
        </div>
      )}

      {state.lastResult && (
        <div className="golf-result">{RESULT_LABELS[state.lastResult]}</div>
      )}

      {terminal && (
        <div className="golf-message">
          Round complete! {totalStrokes(state.holes)} strokes on par {totalPar(state.holes)} ({vsParStr})
        </div>
      )}

      <div className="golf-controls">
        <button
          onClick={() => dispatch({ type: "roll" } as DiceGolfAction)}
          disabled={state.gameOver}
        >
          {state.lastRoll === null ? "Tee Off!" : "Take Shot"}
        </button>
      </div>

      {state.holes.length > 0 && (
        <>
          <div className="golf-scorecard">
            {state.holes.slice(0, 9).map((_, i) => (
              <div key={i} className="golf-scorecard-header">H{i + 1}</div>
            ))}
            {state.holes.slice(0, 9).map((h, i) => (
              <div key={i} className="golf-scorecard-par">{h.par}</div>
            ))}
            {state.holes.slice(0, 9).map((h, i) => (
              <div key={i} className={`golf-scorecard-strokes ${strokeClass(h)}`}>{h.strokes}</div>
            ))}
          </div>
          <div className="golf-totals">
            Total: {totalStrokes(state.holes)} strokes / Par {totalPar(state.holes)}
          </div>
        </>
      )}

      <div className="golf-shot-legend">
        Sum 2/12=Hole in One · 3-4=Power(+2) · 5-8=Normal(+1) · 9-11=Rough(+1+pen) · 12=Perfect(+3)
      </div>
    </div>
  );
}

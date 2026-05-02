import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBaseballState, DiceBaseballAction, DiceBaseballSettings, BaseballResult } from "./state.js";
import { isTerminal } from "./state.js";
import { Die } from "../../engines/dice/Die.js";
import "./DiceBaseball.css";

const RESULT_LABELS: Record<BaseballResult, string> = {
  homeRun: "HOME RUN!",
  triple: "Triple!",
  double: "Double!",
  single: "Single",
  walk: "Walk",
  flyOut: "Fly Out",
  groundOut: "Ground Out",
  strikeOut: "Strike Out",
};

export function DiceBaseball({
  state,
  dispatch,
  onGameOver,
}: GameProps<DiceBaseballState, DiceBaseballSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const maxInnings = parseInt(state.settings.innings, 10);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const [b1, b2, b3] = state.bases;

  return (
    <div className="dice-baseball">
      <h2>DICE BASEBALL</h2>

      <div className="baseball-scoreboard">
        <div>Inning: <span>{Math.min(state.inning, maxInnings)}</span> / <span>{maxInnings}</span></div>
        <div>Runs: <span>{state.runs}</span></div>
      </div>

      <div className="baseball-diamond">
        <div className="diamond-base diamond-second" style={{ background: b3 ? "#ffcc44" : undefined, borderColor: b3 ? "#eeaa22" : undefined }} />
        <div className="diamond-base diamond-third" style={{ background: b2 ? "#ffcc44" : undefined, borderColor: b2 ? "#eeaa22" : undefined }} />
        <div className="diamond-base diamond-first" style={{ background: b1 ? "#ffcc44" : undefined, borderColor: b1 ? "#eeaa22" : undefined }} />
        <div className="diamond-base diamond-home" />
      </div>

      <div className="baseball-outs">
        <span>Outs:</span>
        {[0, 1, 2].map((i) => (
          <div key={i} className={`out-dot${state.outs > i ? " filled" : ""}`} />
        ))}
      </div>

      {state.lastRoll && (
        <div className="baseball-dice-row">
          <Die value={state.lastRoll[0] as 1|2|3|4|5|6} kept={false} />
          <Die value={state.lastRoll[1] as 1|2|3|4|5|6} kept={false} />
        </div>
      )}

      {state.lastResult && (
        <div className="baseball-result">
          {RESULT_LABELS[state.lastResult]}
        </div>
      )}

      {terminal && (
        <div className="baseball-message">
          Game over! Final score: {state.runs} run{state.runs !== 1 ? "s" : ""}!
        </div>
      )}

      <div className="baseball-controls">
        <button data-testid="hint-target-dice-baseball-roll"
          onClick={() => dispatch({ type: "roll" } as DiceBaseballAction)}
          disabled={state.gameOver}
        >
          {state.lastRoll === null ? "Play Ball!" : "Next At-Bat"}
        </button>
      </div>

      <div className="baseball-result-label">
        Roll 2 = HR · 3 = Triple · 4 = Double · 5/9 = Single · 10 = Walk · 6/8 = Fly · 7 = GOut · 11 = K · 12 = HR
      </div>
    </div>
  );
}

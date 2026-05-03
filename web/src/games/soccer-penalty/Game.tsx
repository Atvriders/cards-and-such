import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SoccerPenaltyState, SoccerPenaltySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SoccerPenalty({ state, dispatch, onGameOver }: GameProps<SoccerPenaltyState, SoccerPenaltySettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const lastType = state.lastResult === "GOAL!" ? "goal" : "saved";

  return (
    <div className="spk-game">
      <div className="spk-title">Soccer Penalty Kick</div>

      <div className="spk-scoreboard">
        <span>Goals: {state.goals}/{state.kickIndex}</span>
        <span>Kicks left: {state.totalKicks - state.kickIndex}</span>
      </div>

      {/* Goal visual */}
      <div className="spk-goal-visual">
        <div className="spk-target-dot" style={{ left: `${state.aim * 100}%`, bottom: `${state.height * 85}%` }} />
        <div className="spk-keeper" style={{ left: `${state.keeperSide * 100}%` }} />
      </div>

      <div className="spk-history">
        {state.kicks.map((k, i) => (
          <div key={i} className={`spk-dot ${k.scored ? "goal" : "saved"}`} title={k.scored ? "Goal" : "Saved"} />
        ))}
        {Array.from({ length: state.totalKicks - state.kicks.length }, (_, i) => (
          <div key={`e-${i}`} className="spk-dot empty" />
        ))}
      </div>

      {state.phase === "aim" && (
        <div className="spk-controls">
          <label>
            Aim Left↔Right: {state.aim < 0.4 ? "Left" : state.aim > 0.6 ? "Right" : "Center"}
            <input type="range" min={0} max={1} step={0.01} value={state.aim}
              onChange={(e) => dispatch({ type: "set-aim", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Height: {state.height < 0.3 ? "Low" : state.height > 0.7 ? "High" : "Mid"}
            <input type="range" min={0} max={1} step={0.01} value={state.height}
              onChange={(e) => dispatch({ type: "set-height", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Power: {Math.round(state.power * 100)}%
            <input type="range" min={0} max={1} step={0.01} value={state.power}
              onChange={(e) => dispatch({ type: "set-power", value: parseFloat(e.target.value) })} />
          </label>
          <button data-testid="hint-target-soccer-penalty-action" className="spk-btn" onClick={() => dispatch({ type: "kick" })}>Kick!</button>
        </div>
      )}

      {state.phase === "result" && (
        <div className={`spk-result ${lastType}`}>
          {state.lastResult}
          <button className="spk-btn" onClick={() => dispatch({ type: "next" })}>Next Kick</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="spk-game-over">
          {state.goals}/{state.totalKicks} Goals<br />
          {state.goals === state.totalKicks ? "Perfect!" : state.goals >= state.totalKicks * 0.8 ? "Excellent!" : state.goals >= state.totalKicks * 0.5 ? "Good effort!" : "Goalkeeper wins!"}
          <br />Score: {terminal?.score ?? 0}
        </div>
      )}
    </div>
  );
}

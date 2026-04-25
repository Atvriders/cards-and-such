import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HockeyShootoutState, HockeyShootoutSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function HockeyShootout({ state, dispatch, onGameOver }: GameProps<HockeyShootoutState, HockeyShootoutSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const lastType = state.lastResult === "GOAL!" ? "goal" : "saved";

  return (
    <div className="hsh-game">
      <div className="hsh-title">Hockey Shootout</div>

      <div className="hsh-scoreboard">
        <span>Goals: {state.goals}/{state.shotIndex}</span>
        <span>Remaining: {state.totalShots - state.shotIndex}</span>
      </div>

      <div className="hsh-net">
        <div className="hsh-puck-aim" style={{ left: `${state.aim * 100}%`, bottom: `${state.height * 80}%` }} />
        <div className="hsh-goalie" style={{ left: `${state.goalieReact * 100}%` }} />
      </div>

      <div className="hsh-history">
        {state.attempts.map((a, i) => (
          <div key={i} className={`hsh-dot ${a.scored ? "goal" : "saved"}`} title={a.scored ? "Goal" : "Saved"} />
        ))}
        {Array.from({ length: state.totalShots - state.attempts.length }, (_, i) => (
          <div key={`e-${i}`} className="hsh-dot empty" />
        ))}
      </div>

      {state.phase === "aim" && (
        <div className="hsh-controls">
          <label>
            Shot Left↔Right: {state.aim < 0.4 ? "Left post" : state.aim > 0.6 ? "Right post" : "Five-hole"}
            <input type="range" min={0} max={1} step={0.01} value={state.aim}
              onChange={(e) => dispatch({ type: "set-aim", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Height: {state.height < 0.35 ? "Low" : state.height > 0.65 ? "High shelf" : "Mid"}
            <input type="range" min={0} max={1} step={0.01} value={state.height}
              onChange={(e) => dispatch({ type: "set-height", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Deke direction: {state.fakeDir < 0.4 ? "Fake left" : state.fakeDir > 0.6 ? "Fake right" : "No deke"}
            <input type="range" min={0} max={1} step={0.01} value={state.fakeDir}
              onChange={(e) => dispatch({ type: "set-fake", value: parseFloat(e.target.value) })} />
          </label>
          <button className="hsh-btn" onClick={() => dispatch({ type: "shoot" })}>Shoot!</button>
        </div>
      )}

      {state.phase === "result" && (
        <div className={`hsh-result ${lastType}`}>
          {state.lastResult}
          <button className="hsh-btn" onClick={() => dispatch({ type: "next" })}>Next Shot</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="hsh-game-over">
          {state.goals}/{state.totalShots} Goals<br />
          {state.goals === state.totalShots ? "Perfect shootout!" : state.goals >= state.totalShots * 0.7 ? "Sharp shooter!" : "Goalie wins today."}
          <br />Score: {terminal?.score ?? 0}
        </div>
      )}
    </div>
  );
}

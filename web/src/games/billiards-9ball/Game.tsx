import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Billiards9BallState, Billiards9BallAction, Billiards9BallSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const BALL_COLORS = ["#f5c400","#0050a0","#e82020","#6a0dad","#e85000","#1a7a1a","#8b0000","#111111","#f5c400"];

export function Billiards9Ball({ state, dispatch, onGameOver }: GameProps<Billiards9BallState, Billiards9BallSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="nine-game">
      <div className="nine-title">9-Ball Billiards</div>

      <div className="nine-meta">Turn {state.turns + 1} | Fouls: {state.fouls} | Target: Ball {state.lowestBall}</div>

      <div className="nine-rack">
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={i + 1}
            className={`nine-ball ${state.pocketed[i] ? "pocketed" : ""} ${i + 1 === state.lowestBall ? "target" : ""}`}
            style={{ background: state.pocketed[i] ? undefined : BALL_COLORS[i] }}
          >
            {state.pocketed[i] ? "○" : i + 1}
          </div>
        ))}
      </div>

      {state.phase === "aim" && (
        <div className="nine-aim">
          <p className="nine-rule">Hit ball {state.lowestBall} first. Sink the 9-ball anytime after a legal hit to win!</p>
          <label>
            Angle: {Math.round(state.angle * 100)}%
            <input type="range" min={0} max={1} step={0.01} value={state.angle}
              onChange={(e) => dispatch({ type: "set-angle", value: parseFloat(e.target.value) })} />
          </label>
          <label>
            Power: {Math.round(state.power * 100)}%
            <input type="range" min={0} max={1} step={0.01} value={state.power}
              onChange={(e) => dispatch({ type: "set-power", value: parseFloat(e.target.value) })} />
          </label>
          <button className="nine-btn" onClick={() => dispatch({ type: "shoot" })}>Shoot</button>
        </div>
      )}

      {state.lastResult && (
        <div className={`nine-result ${state.winner ? "win" : ""}`}>{state.lastResult}</div>
      )}

      {state.phase === "result" && (
        <button className="nine-btn" onClick={() => dispatch({ type: "next" })}>Next Shot</button>
      )}

      {state.winner && (
        <div className="nine-win">
          WIN! Score: {terminal?.score ?? 0}
          <div style={{ fontSize: "0.85rem", opacity: 0.8, marginTop: 6 }}>Turns: {state.turns} | Fouls: {state.fouls}</div>
        </div>
      )}
    </div>
  );
}

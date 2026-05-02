import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardPileTossState, CardPileTossAction, CardPileTossSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CardPileTossGame({ state, dispatch, onGameOver }: GameProps<CardPileTossState, CardPileTossSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><p>Score: {state.score}</p></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-header"><span>Round {state.round}/{state.maxRounds}</span><span className="cm-score">{state.score} pts</span></div>
      <p>Aim the toss angle to land in the pile!</p>
      {state.phase === "aiming" && <>
        <div className="cm-slider-row">
          <span>Angle</span>
          <input type="range" className="cm-slider" min={0} max={100} value={state.power} onChange={e => dispatch({ type:"setPower", value:+e.target.value } as CardPileTossAction)} />
          <span>{state.power}</span>
        </div>
        <button data-testid="hint-target-card-pile-toss-primary" className="cm-btn" onClick={() => dispatch({ type:"toss" } as CardPileTossAction)}>Toss!</button>
      </>}
      {state.phase === "result" && <>
        <div className="cm-result">+{state.lastPts} pts</div>
        <button className="cm-btn" onClick={() => dispatch({ type:"next" } as CardPileTossAction)}>{state.round >= state.maxRounds ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}

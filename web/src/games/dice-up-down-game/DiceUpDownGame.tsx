import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceUpDownGameState, DiceUpDownGameSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./DiceUpDownGame.css";

export function DiceUpDownGame({ state, dispatch, onGameOver }: GameProps<DiceUpDownGameState, DiceUpDownGameSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  return (
    <div className="dg-wrap">
      <div className="dg-info"><span>Round {state.round}/{state.totalRounds}</span><span>Score: {state.score}</span><span>Streak: {state.streak}</span></div>
      {!terminal ? (
        <>
          <p style={{margin:0,color:"#555",fontSize:".9rem"}}>Will the next die be higher or lower?</p>
          <div className="dg-dice">
            {state.prevRoll !== null && <div className="dg-die disabled" style={{opacity:.5}}>{state.prevRoll}</div>}
            <div className="dg-die disabled">{state.currentRoll}</div>
            <div className="dg-die disabled" style={{background:"#4a6fa5",color:"#fff"}}>?</div>
          </div>
          {state.lastCorrect !== null && <div className="dg-result" style={{color:state.lastCorrect?"#28a745":"#dc3545"}}>{state.lastCorrect ? "Correct!" : "Wrong!"}</div>}
          <div style={{display:"flex",gap:12}}>
            <button data-testid="hint-target-dice-up-down-game-action" className="dg-btn" style={{background:"#28a745"}} onClick={() => dispatch({ type: "guess", dir: "up" })}>Higher ▲</button>
            <button className="dg-btn" style={{background:"#dc3545"}} onClick={() => dispatch({ type: "guess", dir: "down" })}>Lower ▼</button>
          </div>
        </>
      ) : (
        <div className="dg-done"><h2>Game Over!</h2><div className="dg-final">Final Score: {state.score}</div></div>
      )}
    </div>
  );
}

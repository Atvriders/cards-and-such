import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceLowRollState, DiceLowRollAction, DiceLowRollSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DiceLowRollGame({ state, dispatch, onGameOver }: GameProps<DiceLowRollState, DiceLowRollSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><p>Coins: {state.coins}</p></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-header"><span>Round {state.round}/{state.maxRounds}</span><span className="dm-score">{state.coins} coins</span></div>
      {state.phase === "betting" && <>
        <p>Bet that 3 dice sum to 9 or less (Low)?</p>
        <div className="dm-bets">
          {([5,10,20] as const).map(a => <button data-testid="hint-target-dice-low-roll-roll" key={a} className="dm-bet-btn" onClick={() => dispatch({ type:"bet", amount:a } as DiceLowRollAction)}>Bet Low: {a} coins</button>)}
        </div>
      </>}
      {state.phase === "result" && state.dice && <>
        <div className="dm-dice">{state.dice.map((d,i) => <div key={i} className="dm-die">{d}</div>)}</div>
        <div className="dm-result">Sum: {state.dice.reduce((s,v)=>s+v,0)} — {state.lastWin ? "WIN!" : "Lose"}</div>
        <button className="dm-btn" onClick={() => dispatch({ type:"next" } as DiceLowRollAction)}>{state.round >= state.maxRounds ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}

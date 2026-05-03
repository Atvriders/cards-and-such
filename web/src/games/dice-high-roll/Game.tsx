import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceHighRollState, DiceHighRollAction, DiceHighRollSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DiceHighRollGame({ state, dispatch, onGameOver }: GameProps<DiceHighRollState, DiceHighRollSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="dm-wrap"><div className="dm-done"><h2>Done!</h2><p>Coins: {state.coins}</p></div></div>;
  return (
    <div className="dm-wrap">
      <div className="dm-header"><span>Round {state.round}/{state.maxRounds}</span><span className="dm-score">{state.coins} coins</span></div>
      {state.phase === "betting" && <>
        <p>Bet that 3 dice sum to 12+ (High) — pays 2x if you win!</p>
        <div className="dm-bets">
          {([5,10,20] as const).map(a => <button key={a} className="dm-bet-btn" onClick={() => dispatch({ type:"bet", amount:a } as DiceHighRollAction)} data-testid="hint-target-dicehighroll-bet">Bet High: {a} coins</button>)}
        </div>
      </>}
      {state.phase === "result" && state.dice && <>
        <div className="dm-dice">{state.dice.map((d,i) => <div key={i} className="dm-die">{d}</div>)}</div>
        <div className="dm-result">Sum: {state.dice.reduce((s,v)=>s+v,0)} — {state.lastWin ? "WIN! 2x!" : "Lose"}</div>
        <button className="dm-btn" onClick={() => dispatch({ type:"next" } as DiceHighRollAction)} data-testid="hint-target-dicehighroll-next">{state.round >= state.maxRounds ? "Finish" : "Next"}</button>
      </>}
    </div>
  );
}

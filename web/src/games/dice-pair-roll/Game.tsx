import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DicePairRollState, DicePairRollAction, DicePairRollSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const FACES = ["","⚀","⚁","⚂","⚃","⚄","⚅"];

export function DicePairRoll({ state, dispatch, onGameOver }: GameProps<DicePairRollState, DicePairRollSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="dg-wrap"><div className="dg-done"><h2>Done!</h2><p>Total: {state.coins} pts</p></div></div>;
  const isDouble = state.dice && state.dice[0] === state.dice[1];
  return (
    <div className="dg-wrap">
      <div className="dg-header"><span>Round {state.round} / {state.maxRounds}</span><span className="dg-score">{state.coins} pts</span></div>
      <div className="dg-dice">
        {state.dice ? state.dice.map((d,i) => <div key={i} className="dg-die">{FACES[d]}</div>) : [1,2].map(i => <div key={i} className="dg-die" style={{opacity:0.3}}>?</div>)}
      </div>
      {state.phase === "result" && <p className="dg-msg">{isDouble ? `Doubles! ×2 — +${state.lastGain} pts` : `Sum ${state.dice![0]!+state.dice![1]!} — +${state.lastGain} pts`}</p>}
      <div>
        {state.phase === "rolling" && <button data-testid="hint-target-dice-pair-roll-roll" className="dg-btn" onClick={()=>dispatch({type:"roll"} as DicePairRollAction)}>Roll Dice</button>}
        {state.phase === "result" && <button data-testid="hint-target-dice-pair-roll-next" className="dg-btn" onClick={()=>dispatch({type:"next"} as DicePairRollAction)}>{state.round>=state.maxRounds?"Finish":"Next"}</button>}
      </div>
    </div>
  );
}

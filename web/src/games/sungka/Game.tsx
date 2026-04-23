import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SungkaState, SungkaSettings, SungkaAction } from "./state.js";
import { isTerminal, P0_PITS, P1_PITS, P0_STORE, P1_STORE } from "./state.js";
import "./Game.css";

export function Sungka({ state, dispatch, onGameOver }: GameProps<SungkaState, SungkaSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if(terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn===0 && !state.winner;
  let st=""; let sc="";
  if(state.winner===0){st="You win!";sc="win";}
  else if(state.winner===1){st="Bot wins!";sc="loss";}
  else if(state.winner==="draw"){st="Draw!";}
  else if(!isMyTurn) st="Bot thinking...";
  else st="Your turn — click a pit (bottom row)";

  function handlePit(pit: number) {
    if(!isMyTurn||state.board[pit]===0) return;
    dispatch({type:"sow",pit} satisfies SungkaAction);
  }

  return (
    <div className="sungka-game">
      <div className={`sungka-status ${sc}`}>{st}</div>
      <div className="sungka-board">
        <div className="sungka-head">{state.board[P0_STORE]}</div>
        <div className="sungka-pits">
          {/* Bot row (top) — P1 pits reversed for visual */}
          <div className="sungka-pit-row">
            {[...P1_PITS].reverse().map(p=>(
              <div key={p} className={`sungka-pit ${p===state.lastSow?"last-sow":""} ${state.board[p]===0?"empty":""}`}>
                {state.board[p]}
              </div>
            ))}
          </div>
          {/* Player row (bottom) */}
          <div className="sungka-pit-row">
            {P0_PITS.map(p=>(
              <div key={p}
                className={`sungka-pit ${isMyTurn&&state.board[p]!>0?"clickable":""} ${p===state.lastSow?"last-sow":""} ${state.board[p]===0?"empty":""}`}
                onClick={()=>handlePit(p)}>
                {state.board[p]}
              </div>
            ))}
          </div>
        </div>
        <div className="sungka-head">{state.board[P1_STORE]}</div>
      </div>
      <div className="sungka-scores">You: {state.board[P0_STORE]} seeds | Bot: {state.board[P1_STORE]} seeds</div>
    </div>
  );
}

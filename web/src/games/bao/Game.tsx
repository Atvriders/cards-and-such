import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BaoState, BaoSettings, BaoAction } from "./state.js";
import { isTerminal, P0_PITS, P1_PITS, P0_STORE, P1_STORE } from "./state.js";
import "./Game.css";

export function Bao({ state, dispatch, onGameOver }: GameProps<BaoState, BaoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if(terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn===0 && !state.winner;
  let st=""; let sc="";
  if(state.winner===0){st="You win!";sc="win";}
  else if(state.winner===1){st="Bot wins!";sc="loss";}
  else if(state.winner==="draw"){st="Draw!";}
  else if(!isMyTurn) st="Bot thinking...";
  else st="Your turn — click a pit to sow";

  function handlePit(pit: number) {
    if(!isMyTurn) return;
    if(state.board[pit]===0) return;
    dispatch({type:"sow",pit} satisfies BaoAction);
  }

  return (
    <div className="bao-game">
      <div className={`bao-status ${sc}`}>{st}</div>
      <div className="bao-board">
        {/* Bot row (top, P1 pits reversed) */}
        <div className="bao-row">
          <div className="bao-store">{state.board[P1_STORE]}</div>
          <div className="bao-pits">
            {[...P1_PITS].reverse().map(p=>(
              <div key={p} className={`bao-pit ${state.board[p]===0?"empty":""} ${p===state.lastSow?"last-sow":""}`}>
                {state.board[p]}
              </div>
            ))}
          </div>
          <div className="bao-store">&nbsp;</div>
        </div>
        {/* Player row (bottom, P0 pits left to right) */}
        <div className="bao-row">
          <div className="bao-store">&nbsp;</div>
          <div className="bao-pits">
            {P0_PITS.map(p=>(
              <div key={p} className={`bao-pit ${state.board[p]===0?"empty":"active"} ${p===state.lastSow?"last-sow":""}`}
                onClick={()=>handlePit(p)}>
                {state.board[p]}
              </div>
            ))}
          </div>
          <div className="bao-store">{state.board[P0_STORE]}</div>
        </div>
      </div>
      <div className="bao-scores">
        <span>You (store): {state.board[P0_STORE]}</span>
        <span>Bot (store): {state.board[P1_STORE]}</span>
      </div>
    </div>
  );
}

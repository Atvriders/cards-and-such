import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SittuyinState, SittuyinSettings, SittuyinAction } from "./state.js";
import { isTerminal, ROWS, COLS } from "./state.js";
import "./Game.css";

const LABELS: Record<string, string> = {
  king:"King",thida:"Thida",ein:"Ein",myin:"Myin",yahhta:"Rook",ne:"Ne",pne:"Thida+",
};
const SHORT: Record<string, string> = {
  king:"Sit",thida:"Thi",ein:"Ein",myin:"My",yahhta:"Rk",ne:"Ne",pne:"Th+",
};

export function Sittuyin({ state, dispatch, onGameOver }: GameProps<SittuyinState, SittuyinSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if(terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn==="white" && !state.winner;
  let st=""; let sc="";
  if(state.winner==="white"){st="You win!";sc="win";}
  else if(state.winner==="black"){st="Bot wins!";sc="loss";}
  else if(state.winner==="draw"){st="Draw — stalemate";}
  else if(!isMyTurn) st="Bot (Black) thinking...";
  else if(state.selected!==null) st="Select destination";
  else st="Your turn — select a White piece";

  function handleClick(sq: number) {
    if(!isMyTurn) return;
    if(state.legalTargets.includes(sq)) dispatch({type:"move",to:sq} satisfies SittuyinAction);
    else dispatch({type:"select",sq} satisfies SittuyinAction);
  }

  return (
    <div className="sittuyin-game">
      <div className={`sittuyin-status ${sc}`}>{st}</div>
      <div className="sittuyin-board">
        {Array.from({length:ROWS*COLS},(_,sq)=>{
          const r=Math.floor(sq/COLS);const c=sq%COLS;
          const piece=state.board[sq];
          return (
            <div key={sq} className={`sittuyin-cell ${(r+c)%2===0?"light":"dark"} ${sq===state.selected?"selected":""} ${state.legalTargets.includes(sq)?"target":""}`}
              onClick={()=>handleClick(sq)}>
              {piece
                ? <div className={`sittuyin-piece ${piece.color}`} title={LABELS[piece.type]}>{SHORT[piece.type]}</div>
                : state.legalTargets.includes(sq) ? <div className="target-dot"/> : null}
            </div>
          );
        })}
      </div>
      <div style={{fontSize:"0.75rem",color:"#555"}}>Thida=diagonal, Ein=leap, Myin=knight, Rk=rook, Ne=pawn</div>
    </div>
  );
}

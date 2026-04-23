import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniShogiState, MiniShogiSettings, MiniShogiAction, MiniBase } from "./state.js";
import { isTerminal, ROWS, COLS } from "./state.js";
import "./Game.css";

const LABEL: Record<string, string> = {
  king:"王",gold:"金",silver:"銀",bishop:"角",rook:"飛",pawn:"歩",
  prook:"龍",pbishop:"馬",psilver:"全",ppawn:"と",
};
const CELL = 66;

export function MiniShogi({ state, dispatch, onGameOver }: GameProps<MiniShogiState, MiniShogiSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if(terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn==="sente" && !state.winner;
  const W = COLS*CELL; const H = ROWS*CELL;

  let st=""; let sc="";
  if(state.winner==="sente"){st="You win!";sc="win";}
  else if(state.winner==="gote"){st="Bot wins!";sc="loss";}
  else if(!isMyTurn) st="Bot (Gote) thinking...";
  else if(state.selectedDrop) st=`Drop ${LABEL[state.selectedDrop]} — click empty square`;
  else if(state.selected!==null) st="Select destination";
  else st="Your turn — select piece or drop";

  function handleClick(sq: number) {
    if(!isMyTurn) return;
    if(state.selectedDrop) {
      if(state.legalTargets.includes(sq)) dispatch({type:"drop",to:sq} satisfies MiniShogiAction);
    } else if(state.selected!==null&&state.legalTargets.includes(sq)) {
      dispatch({type:"move",to:sq} satisfies MiniShogiAction);
    } else {
      dispatch({type:"select",sq} satisfies MiniShogiAction);
    }
  }

  const handEntries = Object.entries(state.senteHand).filter(([,v])=>v&&v>0) as [MiniBase,number][];

  return (
    <div className="minishogi-game">
      <div className={`minishogi-status ${sc}`}>{st}</div>
      <div className="minishogi-hand" style={{opacity:0.6}}>
        Bot hand: {Object.entries(state.goteHand).filter(([,v])=>v&&v>0).map(([t,cnt])=>
          <span key={t} className="minishogi-hand-piece">{LABEL[t]}×{cnt}</span>
        )}
      </div>
      <div className="minishogi-board" style={{width:W,height:H}}>
        {state.board.map((piece,sq)=>{
          const r=Math.floor(sq/COLS);const c=sq%COLS;
          return (
            <div key={sq} className={`minishogi-cell ${sq===state.selected?"selected":""} ${state.legalTargets.includes(sq)?"target":""}`}
              style={{left:c*CELL,top:r*CELL,width:CELL,height:CELL}}
              onClick={()=>handleClick(sq)}>
              {piece&&<div className={`minishogi-piece ${piece.color} ${piece.promoted?"promoted":""}`}>{LABEL[piece.type]??"?"}</div>}
              {!piece&&state.legalTargets.includes(sq)&&<div style={{width:12,height:12,background:"rgba(0,180,0,0.5)",borderRadius:"50%"}}/>}
            </div>
          );
        })}
      </div>
      <div className="minishogi-hand">
        Your hand:{" "}
        {handEntries.map(([t,cnt])=>(
          <span key={t} className={`minishogi-hand-piece ${state.selectedDrop===t?"selected-drop":""}`}
            onClick={()=>isMyTurn&&dispatch({type:"selectDrop",piece:t} satisfies MiniShogiAction)}>
            {LABEL[t]}×{cnt}
          </span>
        ))}
        {!handEntries.length&&<span style={{fontSize:"0.75rem",color:"#888"}}>empty</span>}
      </div>
    </div>
  );
}

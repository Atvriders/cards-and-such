import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MakrukState, MakrukSettings, MakrukAction } from "./state.js";
import { isTerminal, ROWS, COLS } from "./state.js";
import "./Game.css";

const LABELS: Record<string, string> = {
  king:"♚",met:"♛",khon:"♝",ma:"♞",ruea:"♜",bia:"♟",pbia:"♛",
};

export function Makruk({ state, dispatch, onGameOver }: GameProps<MakrukState, MakrukSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if(terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn==="white" && !state.winner;
  let st=""; let sc="";
  if(state.winner==="white"){st="You win!";sc="win";}
  else if(state.winner==="black"){st="Bot wins!";sc="loss";}
  else if(state.winner==="draw"){st="Draw!";sc="";}
  else if(!isMyTurn) st="Bot (Black) thinking...";
  else if(state.selected!==null) st="Select destination";
  else st="Your turn — select a White piece";

  function handleClick(sq: number) {
    if(!isMyTurn) return;
    if(state.legalTargets.includes(sq)) dispatch({type:"move",to:sq} satisfies MakrukAction);
    else dispatch({type:"select",sq} satisfies MakrukAction);
  }

  return (
    <div className="makruk-game">
      <div className={`makruk-status ${sc}`}>{st}</div>
      <div className="makruk-board">
        {Array.from({length:ROWS*COLS},(_,sq)=>{
          const r=Math.floor(sq/COLS);const c=sq%COLS;
          const light=(r+c)%2===0;
          const piece=state.board[sq];
          const isSelected=sq===state.selected;
          const isTarget=state.legalTargets.includes(sq);
          return (
            <div key={sq} className={`makruk-cell ${light?"light":"dark"} ${isSelected?"selected":""} ${isTarget?"target":""}`}
              onClick={()=>handleClick(sq)}>
              {piece
                ? <div className={`makruk-piece ${piece.color} ${piece.type==="pbia"?"promoted":""}`}>{LABELS[piece.type]}</div>
                : isTarget ? <div className="target-dot"/> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

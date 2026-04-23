import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { JanggiState, JanggiSettings, JanggiAction } from "./state.js";
import { isTerminal, ROWS, COLS } from "./state.js";
import "./Game.css";

const LABELS: Record<string, [string,string]> = {
  general: ["將","帥"],
  advisor: ["士","士"],
  elephant: ["象","象"],
  horse: ["馬","馬"],
  chariot: ["車","車"],
  cannon: ["砲","包"],
  soldier: ["卒","兵"],
};

const CELL = 50;
const PAD = 26;

export function Janggi({ state, dispatch, onGameOver }: GameProps<JanggiState, JanggiSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if(terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn==="blue" && !state.winner;
  const W = (COLS-1)*CELL + PAD*2;
  const H = (ROWS-1)*CELL + PAD*2;

  let st=""; let sc="";
  if(state.winner==="blue"){st="You win! (Blue)";sc="win";}
  else if(state.winner==="red"){st="Bot wins! (Red)";sc="loss";}
  else if(!isMyTurn) st="Bot (Red) thinking...";
  else if(state.selected!==null) st="Select destination";
  else st="Your turn — select a Blue piece";

  function handleClick(sq: number) {
    if(!isMyTurn) return;
    if(state.legalTargets.includes(sq)) dispatch({type:"move",to:sq} satisfies JanggiAction);
    else dispatch({type:"select",sq} satisfies JanggiAction);
  }

  const pieceSize = 42;

  return (
    <div className="janggi-game">
      <div className={`janggi-status ${sc}`}>{st}</div>
      <div className="janggi-board" style={{width:W,height:H}}>
        <svg className="janggi-svg" width={W} height={H}>
          {Array.from({length:ROWS},(_,r)=>(
            <line key={`hr${r}`} x1={PAD} y1={PAD+r*CELL} x2={PAD+(COLS-1)*CELL} y2={PAD+r*CELL} stroke="#5d4037" strokeWidth={1}/>
          ))}
          {Array.from({length:COLS},(_,c)=>(
            <g key={`vc${c}`}>
              <line x1={PAD+c*CELL} y1={PAD} x2={PAD+c*CELL} y2={PAD+9*CELL} stroke="#5d4037" strokeWidth={1}/>
            </g>
          ))}
          {/* Palace diagonals */}
          {[{r1:0,c1:3,r2:2,c2:5},{r1:0,c1:5,r2:2,c2:3},{r1:7,c1:3,r2:9,c2:5},{r1:7,c1:5,r2:9,c2:3}].map((d,i)=>(
            <line key={`pd${i}`} x1={PAD+d.c1*CELL} y1={PAD+d.r1*CELL} x2={PAD+d.c2*CELL} y2={PAD+d.r2*CELL} stroke="#5d4037" strokeWidth={1}/>
          ))}
        </svg>
        {state.board.map((piece, sq) => {
          const r=Math.floor(sq/COLS);const c=sq%COLS;
          const x=PAD+c*CELL;const y=PAD+r*CELL;
          const isSelected=sq===state.selected;
          const isTarget=state.legalTargets.includes(sq);
          return (
            <div key={sq} className={`janggi-cell ${isSelected?"selected":""} ${isTarget?"target":""}`}
              style={{left:x-pieceSize/2,top:y-pieceSize/2,width:pieceSize,height:pieceSize}}
              onClick={()=>handleClick(sq)}>
              {piece ? (
                <div className={`janggi-piece ${piece.color}`}>
                  {LABELS[piece.type]?.[piece.color==="blue"?0:1]??"?"}
                </div>
              ) : isTarget ? <div className="target-dot"/> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

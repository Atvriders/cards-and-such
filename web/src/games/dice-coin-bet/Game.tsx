import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCoinBetState, DiceCoinBetAction, DiceCoinBetSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

export function DiceCoinBet({ state, dispatch, onGameOver }: GameProps<DiceCoinBetState, DiceCoinBetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const [amount, setAmount] = useState(10);

  if (state.phase === "gameover") return (
    <div className="dcb-wrap"><div className="dcb-done">
      <h2>Game Over!</h2>
      <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#e67e22" }}>{state.coins} coins</p>
    </div></div>
  );

  return (
    <div className="dcb-wrap">
      <div className="dcb-header">
        <span>Round {state.round} / {state.maxRounds}</span>
        <span className="dcb-coins">{state.coins} coins</span>
      </div>
      {state.dieResult && <div className="dcb-die">{FACES[state.dieResult]}</div>}
      {!state.dieResult && <div className="dcb-die dim">?</div>}
      {state.phase === "betting" && (
        <div className="dcb-body">
          <p className="dcb-hint">Bet on Odd or Even result:</p>
          <div className="dcb-row">
            <input type="number" min={1} max={state.coins} value={amount} onChange={e => setAmount(Number(e.target.value))} className="dcb-input" />
            <button data-testid="hint-target-dice-coin-bet-bet" className="dcb-btn odd" onClick={() => dispatch({ type: "bet", amount, side: "odd" } as DiceCoinBetAction)}>Odd</button>
            <button data-testid="hint-target-dice-coin-bet-bet" className="dcb-btn even" onClick={() => dispatch({ type: "bet", amount, side: "even" } as DiceCoinBetAction)}>Even</button>
          </div>
        </div>
      )}
      {state.phase === "rolled" && (
        <div className="dcb-body">
          <div className={`dcb-result ${state.lastWin ? "win" : "lose"}`}>{state.lastWin ? `+${state.bid}` : `-${state.bid}`}</div>
          <button data-testid="hint-target-dice-coin-bet-next" className="dcb-btn next" onClick={() => dispatch({ type: "next" } as DiceCoinBetAction)}>Next</button>
        </div>
      )}
    </div>
  );
}

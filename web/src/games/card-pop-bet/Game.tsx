import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardPopBetState, CardPopBetAction, CardPopBetSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CardPopBetGame({ state, dispatch, onGameOver }: GameProps<CardPopBetState, CardPopBetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "gameover") return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><p>Coins: {state.coins}</p></div></div>;
  return (
    <div className="cm-wrap">
      <div className="cm-header"><span>Round {state.round}/{state.maxRounds}</span><span className="cm-score">{state.coins} coins</span></div>
      {state.phase === "betting" && <><p>Bet Hi (&ge;7) or Lo (&lt;7)?</p><div className="cm-bets">
        {[5,10,20].map(a => <button key={`hi${a}`} className="cm-bet-btn hi" onClick={() => dispatch({ type:"bet", amount:a, side:"hi" } as CardPopBetAction)}>Hi +{a}</button>)}
        {[5,10,20].map(a => <button key={`lo${a}`} className="cm-bet-btn lo" onClick={() => dispatch({ type:"bet", amount:a, side:"lo" } as CardPopBetAction)}>Lo +{a}</button>)}
      </div></>}
      {state.phase === "result" && state.card !== null && <><div className="cm-result">{state.lastWin ? "Win!" : "Lose!"} Card: rank {state.card % 13 + 2}</div><button className="cm-btn" onClick={() => dispatch({ type:"next" } as CardPopBetAction)}>Next</button></>}
    </div>
  );
}

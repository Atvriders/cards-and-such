import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CardPickBetState, CardPickBetSettings } from "./state.js";
import { isTerminal, cardRank, cardSuit, RANK_NAMES, SUIT_SYMS } from "./state.js";
import "./CardPickBet.css";

function CardDisplay({ card, hidden }: { card: number; hidden?: boolean }): JSX.Element {
  const suit = cardSuit(card);
  const isRed = suit === 1 || suit === 2;
  return (
    <div className={`cpb-card${hidden ? " hidden" : isRed ? " red" : " black"}`}>
      {hidden ? "?" : `${RANK_NAMES[cardRank(card)]}${SUIT_SYMS[suit]}`}
    </div>
  );
}

export function CardPickBet({ state, dispatch, onGameOver }: GameProps<CardPickBetState, CardPickBetSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const topRank = cardRank(state.topCard);
  const nextRank = state.nextCard !== null ? cardRank(state.nextCard) : null;
  const correct = state.phase === "revealed" && state.bet !== null && nextRank !== null && (
    (state.bet === "higher" && nextRank > topRank) || (state.bet === "lower" && nextRank < topRank)
  );

  return (
    <div className="cpb-wrap">
      <div className="cpb-info"><span>Round {state.round}/{state.totalRounds}</span><span>Score: {state.score}</span></div>
      {state.phase !== "gameover" ? (
        <>
          <div className="cpb-cards">
            <CardDisplay card={state.topCard} />
            <div className="cpb-arrow">→</div>
            {state.nextCard !== null ? <CardDisplay card={state.nextCard} /> : <CardDisplay card={0} hidden />}
          </div>
          {state.phase === "playing" && (
            <div className="cpb-btns">
              <button className="cpb-btn higher" onClick={() => dispatch({ type: "bet", choice: "higher" })}>Higher ▲</button>
              <button className="cpb-btn lower" onClick={() => dispatch({ type: "bet", choice: "lower" })}>Lower ▼</button>
            </div>
          )}
          {state.phase === "revealed" && (
            <>
              <div className={`cpb-result ${correct ? "win" : "loss"}`}>{correct ? "+10 Correct!" : "Wrong!"}</div>
              <button className="cpb-next" onClick={() => dispatch({ type: "next" })}>{state.round < state.totalRounds ? "Next" : "Finish"}</button>
            </>
          )}
        </>
      ) : (
        <div className="cpb-done"><h2>Game Over!</h2><div className="cpb-final">Final Score: {state.score}</div></div>
      )}
    </div>
  );
}

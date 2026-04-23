import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PresidentsState, PresidentsSettings } from "./state.js";
import { isTerminal, isLegalPlay, rankVal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

type PresidentsAction =
  | { type: "play"; cardIds: string[] }
  | { type: "pass" }
  | { type: "selectSwapCard"; cardId: string }
  | { type: "confirmSwap" }
  | { type: "nextRound" };

export function PresidentsGame({ state, dispatch, onGameOver }: GameProps<PresidentsState, PresidentsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { hands, turn, lastPlay, phase, finishOrder, titles, playerRoundWins, botRoundWins, settings, swapCardsSelected } = state;
  const myHand = hands[0]!;
  const isMyTurn = turn === 0 && phase === "playing";

  const toggle = (id: string) => isMyTurn && setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const sel = myHand.filter(c => selected.has(c.id));
  const canPlay = isMyTurn && isLegalPlay(sel, lastPlay ?? null);
  const canPass = isMyTurn && lastPlay !== null;
  const sorted = [...myHand].sort((a, b) => rankVal(a.rank) - rankVal(b.rank));
  const seatName = (s: number) => s === 0 ? "You" : `Bot ${s}`;

  const myTitle = titles ? titles[0] : null;
  const isSwapPhase = phase === "swap";
  const needsSwap = myTitle === "President" || myTitle === "Scum";

  return (
    <div className="presidents">
      <div className="presidents-header">
        <h2>Presidents</h2>
        <div className="presidents-score">Round wins — You: {playerRoundWins} Bot: {botRoundWins} (target: {settings.rounds})</div>
        {titles && <div className="presidents-titles">{[0,1,2,3].map(s => <span key={s} className={s===0?"presidents-you":""}>{seatName(s)}: {titles[s]}</span>)}</div>}
      </div>

      {isSwapPhase && (
        <div className="presidents-swap">
          <div className="presidents-swap-info">
            {myTitle === "President" && "You are President! Give 1 card to Scum, receive their best card."}
            {myTitle === "Scum" && "You are Scum! Give 1 card to President, receive their best card."}
            {!needsSwap && "Vice positions watch the swap. Click Next Round to continue."}
          </div>
          {needsSwap && (
            <>
              <div className="presidents-hand">
                {sorted.map(c => (
                  <div key={c.id}
                    className={`presidents-slot${swapCardsSelected.includes(c.id) ? " sel" : " clickable"}`}
                    onClick={() => dispatch({ type: "selectSwapCard", cardId: c.id } as PresidentsAction)}>
                    <Card card={c} />
                  </div>
                ))}
              </div>
              <button className="presidents-btn confirm" disabled={swapCardsSelected.length !== 1}
                onClick={() => dispatch({ type: "confirmSwap" } as PresidentsAction)}>
                Confirm Swap ({swapCardsSelected.length}/1)
              </button>
            </>
          )}
          {!needsSwap && (
            <button className="presidents-btn confirm" onClick={() => dispatch({ type: "confirmSwap" } as PresidentsAction)}>
              Start Round
            </button>
          )}
        </div>
      )}

      {phase === "playing" && (
        <>
          <div className="presidents-seats">
            {[0,1,2,3].map(s => (
              <span key={s} className={turn === s ? "presidents-active" : ""}>
                {seatName(s)}: {hands[s]!.length}{finishOrder.includes(s) ? " ✓" : ""}
              </span>
            ))}
          </div>
          <div className="presidents-pile">
            {lastPlay ? (
              <><span className="presidents-pile-label">Played by {seatName(state.lastPlaySeat!)}:</span>
                <div className="presidents-pile-cards">{lastPlay.map(c => <Card key={c.id} card={c} />)}</div></>
            ) : <span className="presidents-new-round">New round — any set</span>}
          </div>
          <div className="presidents-hand">
            {sorted.map(c => (
              <div key={c.id} className={`presidents-slot${selected.has(c.id) ? " sel" : ""}${isMyTurn ? " clickable" : ""}`}
                onClick={() => toggle(c.id)}>
                <Card card={c} />
              </div>
            ))}
          </div>
          <div className="presidents-actions">
            <button className="presidents-btn play" disabled={!canPlay}
              onClick={() => { dispatch({ type: "play", cardIds: [...selected] } as PresidentsAction); setSelected(new Set()); }}>
              Play ({selected.size})
            </button>
            <button className="presidents-btn pass" disabled={!canPass}
              onClick={() => { dispatch({ type: "pass" } as PresidentsAction); setSelected(new Set()); }}>
              Pass
            </button>
          </div>
        </>
      )}

      {phase === "roundEnd" && (
        <div className="presidents-round-end">
          <div className="presidents-round-result">Round over! {finishOrder[0] === 0 ? "You are President!" : `Bot ${finishOrder[0]} is President.`}</div>
          <button className="presidents-btn next" onClick={() => dispatch({ type: "nextRound" } as PresidentsAction)}>
            Next Round
          </button>
        </div>
      )}

      {phase === "done" && (
        <div className="presidents-done">
          <h3>{playerRoundWins > botRoundWins ? "You Win!" : "Bot Wins!"}</h3>
          <div>Final: You {playerRoundWins} — Bot {botRoundWins}</div>
        </div>
      )}
    </div>
  );
}

// Shared stud poker table renderer.
import { useState } from "react";
import { Card } from "../../engines/deck/Card.js";
import type { StudState } from "./stud-game.js";

export interface StudTableProps<S> {
  prefix: string;
  state: StudState<S>;
  totalHands: number;
  smallBet: number;
  playerHandLabel?: string | undefined;
  cpuHandLabel?: string | undefined;
  onDeal: () => void;
  onFold: () => void;
  onCheck: () => void;
  onCall: () => void;
  onRaise: (amount: number) => void;
}

export function StudTable<S>(p: StudTableProps<S>): JSX.Element {
  const { prefix, state, totalHands, smallBet } = p;
  const minRaise = smallBet;
  const maxRaise = Math.max(minRaise, Math.min(state.player.stack, state.pot * 2 + smallBet));
  const [raiseAmt, setRaiseAmt] = useState<number>(minRaise);

  const toCall = Math.max(0, state.cpu.bet - state.player.bet);
  const inHand = state.street > 0 && !state.done;
  const canAct = state.toAct === "player" && inHand;
  const canCheck = canAct && toCall === 0;
  const canCall = canAct && toCall > 0;
  const canRaise = canAct && state.player.stack > toCall;
  const cls = (s: string): string => `${prefix}${s}`;

  return (
    <div className={cls("felt")}>
      <div className={cls("hud")}>
        <span className={cls("stat")}>Hand {Math.min(state.handsPlayed + 1, totalHands)}/{totalHands}</span>
        <span className={cls("stat")}>Street: {state.street}</span>
        <span className={cls("stat")}>Pot: ${state.pot}</span>
      </div>

      <div className={`${cls("seat")} ${cls("cpu")}`}>
        <div className={cls("name")}>
          CPU <span className={cls("stack")}>${state.cpu.stack}</span>
          {state.cpu.bet > 0 && <span className={cls("bet")}>bet ${state.cpu.bet}</span>}
        </div>
        <div className={cls("cards")}>
          {state.cpu.cards.map((c, i) => (
            <Card key={i} card={c} faceDown={!(state.cpu.up[i] || state.showdownReveal)} />
          ))}
        </div>
        {p.cpuHandLabel && <div className={cls("handname")}>{p.cpuHandLabel}</div>}
      </div>

      <div className={cls("board")}>
        <div className={cls("pot")}>Pot ${state.pot}</div>
        <div className={cls("msg")}>{state.message}</div>
      </div>

      <div className={`${cls("seat")} ${cls("player")}`}>
        <div className={cls("name")}>
          You <span className={cls("stack")}>${state.player.stack}</span>
          {state.player.bet > 0 && <span className={cls("bet")}>bet ${state.player.bet}</span>}
        </div>
        <div className={cls("cards")}>
          {state.player.cards.map((c, i) => (
            <Card key={i} card={c} faceDown={false} />
          ))}
        </div>
        {p.playerHandLabel && <div className={cls("handname")}>{p.playerHandLabel}</div>}
      </div>

      <div className={cls("actions")}>
        {state.street === 0 ? (
          <button className={`${cls("btn")} ${cls("deal")}`} onClick={p.onDeal} disabled={state.done}>
            {state.handsPlayed === 0 ? "Deal" : "Next Hand"}
          </button>
        ) : (
          <>
            <button className={`${cls("btn")} ${cls("fold")}`} onClick={p.onFold} disabled={!canAct}>Fold</button>
            <button className={cls("btn")} onClick={p.onCheck} disabled={!canCheck}>Check</button>
            <button className={cls("btn")} onClick={p.onCall} disabled={!canCall}>
              Call {toCall > 0 ? `$${toCall}` : ""}
            </button>
            <div className={cls("raise")}>
              <input
                type="range"
                min={minRaise}
                max={maxRaise}
                step={smallBet}
                value={Math.min(Math.max(raiseAmt, minRaise), maxRaise)}
                onChange={(e) => setRaiseAmt(parseInt(e.target.value, 10))}
                disabled={!canRaise}
              />
              <button className={`${cls("btn")} ${cls("raisebtn")}`} onClick={() => p.onRaise(raiseAmt)} disabled={!canRaise}>
                Raise ${raiseAmt}
              </button>
            </div>
          </>
        )}
      </div>

      {state.done && (
        <div className={cls("gameover")}>Final Stack: ${state.player.stack}</div>
      )}
    </div>
  );
}

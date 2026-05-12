import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OpenFaceChineseState, OpenFaceChineseAction, OpenFaceChineseSettings, OFCBoard } from "./state.js";
import { isTerminal, isValidBoard } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Game.css";

function BoardView({ board, prefix, label }: { board: OFCBoard; prefix: string; label: string }): JSX.Element {
  const cls = (s: string): string => `${prefix}${s}`;
  const valid = board.top.length === 3 && board.middle.length === 5 && board.bottom.length === 5
    ? isValidBoard(board) : true;
  return (
    <div className={cls("boardview")}>
      <div className={cls("rowlabel")}>{label} {!valid && <span className={cls("foul")}>FOUL</span>}</div>
      <div className={cls("ofcrow")}>
        <div className={cls("rowname")}>Top (3)</div>
        <div className={cls("ofcards")}>
          {board.top.map((c, i) => <Card key={i} card={c} />)}
          {Array.from({ length: 3 - board.top.length }).map((_, i) => <div key={`pt${i}`} className={cls("placeholder")} />)}
        </div>
      </div>
      <div className={cls("ofcrow")}>
        <div className={cls("rowname")}>Mid (5)</div>
        <div className={cls("ofcards")}>
          {board.middle.map((c, i) => <Card key={i} card={c} />)}
          {Array.from({ length: 5 - board.middle.length }).map((_, i) => <div key={`pm${i}`} className={cls("placeholder")} />)}
        </div>
      </div>
      <div className={cls("ofcrow")}>
        <div className={cls("rowname")}>Bot (5)</div>
        <div className={cls("ofcards")}>
          {board.bottom.map((c, i) => <Card key={i} card={c} />)}
          {Array.from({ length: 5 - board.bottom.length }).map((_, i) => <div key={`pb${i}`} className={cls("placeholder")} />)}
        </div>
      </div>
    </div>
  );
}

export function OpenFaceChineseGame({ state, dispatch, onGameOver }: GameProps<OpenFaceChineseState, OpenFaceChineseSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const dis = (a: OpenFaceChineseAction): void => dispatch(a);
  const cls = (s: string): string => `ofc-${s}`;

  const cur = state.cardIdx < state.hand.length ? state.hand[state.cardIdx] : null;
  const canTop = cur !== null && state.player.top.length < 3;
  const canMid = cur !== null && state.player.middle.length < 5;
  const canBot = cur !== null && state.player.bottom.length < 5;

  return (
    <div className={`${cls("felt")} thmOFC`}>
      <div className={cls("hud")}>
        <span className={cls("stat")}>Round {Math.max(state.round, 1)}/{state.totalRounds}</span>
        <span className={cls("stat")}>Score: {state.score >= 0 ? "+" : ""}{state.score}</span>
      </div>

      <BoardView board={state.cpu} prefix="ofc-" label="CPU" />

      <div className={cls("currentcard")}>
        <div className={cls("msg")}>{state.message}</div>
        {cur && (
          <>
            <div className={cls("cardlabel")}>Place this card:</div>
            <div className={cls("cardbox")}><Card card={cur} /></div>
            <div className={cls("placeactions")}>
              <button data-testid="hint-target-ofc-top" title="Place in top row" className={cls("btn")} onClick={() => dis({ type: "place", row: "top" })} disabled={!canTop}>Top</button>
              <button data-testid="hint-target-ofc-mid" title="Place in middle row" className={cls("btn")} onClick={() => dis({ type: "place", row: "middle" })} disabled={!canMid}>Mid</button>
              <button data-testid="hint-target-ofc-bot" title="Place in bottom row" className={cls("btn")} onClick={() => dis({ type: "place", row: "bottom" })} disabled={!canBot}>Bot</button>
            </div>
          </>
        )}
      </div>

      <BoardView board={state.player} prefix="ofc-" label="You" />

      <div className={cls("actions")}>
        {state.phase === "scored" && (
          <>
            <button data-testid="hint-target-ofc-deal" className={`${cls("btn")} ${cls("deal")}`} onClick={() => dis({ type: "next" })}>Next Round</button>
          </>
        )}
        {state.phase === "placing" && state.cardIdx === 0 && state.round === 0 && (
          <button data-testid="hint-target-ofc-deal" className={`${cls("btn")} ${cls("deal")}`} onClick={() => dis({ type: "deal" })}>Deal</button>
        )}
        {state.phase === "placing" && state.cardIdx === 0 && state.round > 0 && state.player.top.length === 0 && (
          <button data-testid="hint-target-ofc-deal" className={`${cls("btn")} ${cls("deal")}`} onClick={() => dis({ type: "deal" })}>Deal Round {state.round + 1}</button>
        )}
      </div>

      {state.phase === "done" && <div className={cls("gameover")}>Final Score: {state.score >= 0 ? "+" : ""}{state.score}</div>}
    </div>
  );
}

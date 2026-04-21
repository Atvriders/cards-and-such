import type { GamePlugin } from "../platform/game-plugin/types.js";
import { yachtPlugin } from "./yacht/index.js";
import { balutPlugin } from "./balut/index.js";
import { generalaPlugin } from "./generala/index.js";
import { shipCaptainCrewPlugin } from "./ship-captain-crew/index.js";
import { buncoPlugin } from "./bunco/index.js";
import { tenThousandPlugin } from "./ten-thousand/index.js";
import { zombieDicePlugin } from "./zombie-dice/index.js";
import { canfieldPlugin } from "./canfield/index.js";
import { golfPlugin } from "./golf/index.js";
import { yukonPlugin } from "./yukon/index.js";
import { fortyThievesPlugin } from "./forty-thieves/index.js";
import { scorpionPlugin } from "./scorpion/index.js";
import { laBelleLuciePlugin } from "./la-belle-lucie/index.js";
import { clockPlugin } from "./clock/index.js";
import { monteCarloPlugin } from "./monte-carlo/index.js";
import { goFishPlugin } from "./go-fish/index.js";
import { warPlugin } from "./war/index.js";
import { pigPlugin } from "./pig/index.js";
import { klondikePlugin } from "./klondike/index.js";
import { freecellPlugin } from "./freecell/index.js";
import { yahtzeePlugin } from "./yahtzee/index.js";
import { farklePlugin } from "./farkle/index.js";
import { ticTacToePlugin } from "./tic-tac-toe/index.js";
import { checkersPlugin } from "./checkers/index.js";
import { blackjackPlugin } from "./blackjack/index.js";
import { videoPokerPlugin } from "./video-poker/index.js";
import { connect4Plugin } from "./connect-4/index.js";
import { unoLikePlugin } from "./uno-like/index.js";
import { spiderPlugin } from "./spider/index.js";
import { sudokuPlugin } from "./sudoku/index.js";
import { snakePlugin } from "./snake/index.js";
import { heartsPlugin } from "./hearts/index.js";
import { wordGuessPlugin } from "./word-guess/index.js";
import { minesweeperPlugin } from "./minesweeper/index.js";
import { twoFortyEightPlugin } from "./twenty-forty-eight/index.js";
import { memoryMatchPlugin } from "./memory-match/index.js";
import { crazyEightsPlugin } from "./crazy-eights/index.js";
import { pyramidPlugin } from "./pyramid/index.js";
import { triPeaksPlugin } from "./tri-peaks/index.js";
import { reversiPlugin } from "./reversi/index.js";
import { lightsOutPlugin } from "./lights-out/index.js";
import { fifteenPuzzlePlugin } from "./fifteen/index.js";
import { hangmanPlugin } from "./hangman/index.js";
import { liarsDicePlugin } from "./liars-dice/index.js";
import { breakoutPlugin } from "./breakout/index.js";
import { oldMaidPlugin } from "./old-maid/index.js";
import { snapPlugin } from "./snap/index.js";
import { slapjackPlugin } from "./slapjack/index.js";
import { presidentPlugin } from "./president/index.js";
import { bsPlugin } from "./bs/index.js";
import { egyptianRatscrewPlugin } from "./egyptian-ratscrew/index.js";
import { speedPlugin } from "./speed/index.js";
import { nineMensMorrisPlugin } from "./nine-mens-morris/index.js";
import { mancalaPlugin } from "./mancala/index.js";
import { mastermindPlugin } from "./mastermind/index.js";
import { gomokuPlugin } from "./gomoku/index.js";
import { dotsAndBoxesPlugin } from "./dots-and-boxes/index.js";
import { battleshipPlugin } from "./battleship/index.js";

export const GAMES: GamePlugin[] = [
  yachtPlugin as unknown as GamePlugin,
  balutPlugin as unknown as GamePlugin,
  generalaPlugin as unknown as GamePlugin,
  shipCaptainCrewPlugin as unknown as GamePlugin,
  buncoPlugin as unknown as GamePlugin,
  tenThousandPlugin as unknown as GamePlugin,
  zombieDicePlugin as unknown as GamePlugin,
  canfieldPlugin as unknown as GamePlugin,
  golfPlugin as unknown as GamePlugin,
  yukonPlugin as unknown as GamePlugin,
  fortyThievesPlugin as unknown as GamePlugin,
  scorpionPlugin as unknown as GamePlugin,
  laBelleLuciePlugin as unknown as GamePlugin,
  clockPlugin as unknown as GamePlugin,
  monteCarloPlugin as unknown as GamePlugin,
  goFishPlugin as unknown as GamePlugin,
  warPlugin as unknown as GamePlugin,
  klondikePlugin as unknown as GamePlugin,
  freecellPlugin as unknown as GamePlugin,
  spiderPlugin as unknown as GamePlugin,
  yahtzeePlugin as unknown as GamePlugin,
  farklePlugin as unknown as GamePlugin,
  pigPlugin as unknown as GamePlugin,
  ticTacToePlugin as unknown as GamePlugin,
  checkersPlugin as unknown as GamePlugin,
  blackjackPlugin as unknown as GamePlugin,
  videoPokerPlugin as unknown as GamePlugin,
  connect4Plugin as unknown as GamePlugin,
  unoLikePlugin as unknown as GamePlugin,
  sudokuPlugin as unknown as GamePlugin,
  snakePlugin as unknown as GamePlugin,
  heartsPlugin as unknown as GamePlugin,
  wordGuessPlugin as unknown as GamePlugin,
  minesweeperPlugin as unknown as GamePlugin,
  twoFortyEightPlugin as unknown as GamePlugin,
  memoryMatchPlugin as unknown as GamePlugin,
  crazyEightsPlugin as unknown as GamePlugin,
  pyramidPlugin as unknown as GamePlugin,
  triPeaksPlugin as unknown as GamePlugin,
  reversiPlugin as unknown as GamePlugin,
  lightsOutPlugin as unknown as GamePlugin,
  fifteenPuzzlePlugin as unknown as GamePlugin,
  hangmanPlugin as unknown as GamePlugin,
  liarsDicePlugin as unknown as GamePlugin,
  breakoutPlugin as unknown as GamePlugin,
  oldMaidPlugin as unknown as GamePlugin,
  snapPlugin as unknown as GamePlugin,
  slapjackPlugin as unknown as GamePlugin,
  presidentPlugin as unknown as GamePlugin,
  bsPlugin as unknown as GamePlugin,
  egyptianRatscrewPlugin as unknown as GamePlugin,
  speedPlugin as unknown as GamePlugin,
  nineMensMorrisPlugin as unknown as GamePlugin,
  mancalaPlugin as unknown as GamePlugin,
  mastermindPlugin as unknown as GamePlugin,
  gomokuPlugin as unknown as GamePlugin,
  dotsAndBoxesPlugin as unknown as GamePlugin,
  battleshipPlugin as unknown as GamePlugin,
];

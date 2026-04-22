import type { GamePlugin } from "../platform/game-plugin/types.js";
import { cameroonPlugin } from "./cameroon/index.js";
import { kismetPlugin } from "./kismet/index.js";
import { miaPlugin } from "./mia/index.js";
import { chicagoDicePlugin } from "./chicago-dice/index.js";
import { shutTheBoxPlugin } from "./shut-the-box/index.js";
import { dicePokerPlugin } from "./dice-poker/index.js";
import { accordionPlugin } from "./accordion/index.js";
import { beleagueredCastlePlugin } from "./beleaguered-castle/index.js";
import { streetsAndAlleysPlugin } from "./streets-and-alleys/index.js";
import { penguinPlugin } from "./penguin/index.js";
import { bakersGamePlugin } from "./bakers-game/index.js";
import { westcliffPlugin } from "./westcliff/index.js";
import { kingsInTheCornerPlugin } from "./kings-in-the-corner/index.js";
import { acesUpPlugin } from "./aces-up/index.js";
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
import { nonogramPlugin } from "./nonogram/index.js";
import { wordSearchPlugin } from "./word-search/index.js";
import { wordLadderPlugin } from "./word-ladder/index.js";
import { anagramPlugin } from "./anagram/index.js";
import { make24Plugin } from "./make-24/index.js";
import { pegSolitairePlugin } from "./peg-solitaire/index.js";
import { pongPlugin } from "./pong/index.js";
import { tetrisPlugin } from "./tetris-like/index.js";
import { froggerPlugin } from "./frogger-like/index.js";
import { asteroidsPlugin } from "./asteroids-like/index.js";
import { spaceInvadersPlugin } from "./space-invaders-like/index.js";
import { baccaratPlugin } from "./baccarat/index.js";
import { roulettePlugin } from "./roulette/index.js";
import { crapsPlugin } from "./craps/index.js";
import { slotsPlugin } from "./slots/index.js";
import { caribbeanStudPlugin } from "./caribbean-stud/index.js";
import { whackAMolePlugin } from "./whack-a-mole/index.js";
import { plinkoPlugin } from "./plinko/index.js";
import { bubbleShooterPlugin } from "./bubble-shooter/index.js";
import { towerOfHanoiPlugin } from "./tower-of-hanoi/index.js";
import { reactionTimePlugin } from "./reaction-time/index.js";
import { simonPlugin } from "./simon/index.js";
import { ginRummyPlugin } from "./gin-rummy/index.js";
import { spadesPlugin } from "./spades/index.js";
import { euchrePlugin } from "./euchre/index.js";
import { rummy500Plugin } from "./rummy-500/index.js";
import { casinoPlugin } from "./casino/index.js";
import { fiveCrownsPlugin } from "./five-crowns/index.js";
import { highCardFlushPlugin } from "./high-card-flush/index.js";
import { sevensPlugin } from "./sevens/index.js";
import { bowlingPlugin } from "./bowling/index.js";
import { horseshoesPlugin } from "./horseshoes/index.js";
import { ticTacToe3DPlugin } from "./tictactoe-3d/index.js";
import { numberGuesserPlugin } from "./number-guesser/index.js";
import { bingoPlugin } from "./bingo/index.js";
import { coinFlipStreakPlugin } from "./coin-flip-streak/index.js";
import { spiderettePlugin } from "./spiderette/index.js";
import { eightOffPlugin } from "./eight-off/index.js";
import { missMilliganPlugin } from "./miss-milligan/index.js";
import { crescentPlugin } from "./crescent/index.js";
import { gatePlugin } from "./gate/index.js";
import { yukonCellsPlugin } from "./yukon-cells/index.js";
import { whiteheadPlugin } from "./whitehead/index.js";
import { slyFoxPlugin } from "./sly-fox/index.js";
import { hexPlugin } from "./hex/index.js";
import { abalonePlugin } from "./abalone/index.js";
import { santoriniPlugin } from "./santorini/index.js";
import { blokusDuoPlugin } from "./blokus-duo/index.js";
import { pentagoPlugin } from "./pentago/index.js";
import { amazonsPlugin } from "./amazons/index.js";
import { bullsAndCowsPlugin } from "./bulls-and-cows/index.js";
import { slitherlinkPlugin } from "./slitherlink/index.js";
import { nurikabePlugin } from "./nurikabe/index.js";
import { hidatoPlugin } from "./hidato/index.js";
import { futoshikiPlugin } from "./futoshiki/index.js";
import { cryptogramPlugin } from "./cryptogram/index.js";
import { kakuroPlugin } from "./kakuro/index.js";
import { kenkenPlugin } from "./kenken/index.js";
import { tentsPlugin } from "./tents/index.js";
import { skyscrapersPlugin } from "./skyscrapers/index.js";
import { hitoriPlugin } from "./hitori/index.js";
import { masyuPlugin } from "./masyu/index.js";
import { killerSudokuPlugin } from "./killer-sudoku/index.js";
import { rushHourPlugin } from "./rush-hour/index.js";
import { sokobanPlugin } from "./sokoban/index.js";
import { unrulyPlugin } from "./unruly/index.js";
import { starBattlePlugin } from "./star-battle/index.js";
import { missileCommandPlugin } from "./missile-command-like/index.js";
import { mazeChasePlugin } from "./maze-chase/index.js";
import { climbJumperPlugin } from "./climb-jumper/index.js";
import { gravityLanderPlugin } from "./gravity-lander/index.js";
import { endlessRunnerPlugin } from "./endless-runner/index.js";
import { bouncerPlugin } from "./bouncer/index.js";
import { bogglePlugin } from "./boggle/index.js";
import { acrophobiaPlugin } from "./acrophobia/index.js";
import { wordPokerPlugin } from "./word-poker/index.js";
import { crossCluesPlugin } from "./cross-clues/index.js";
import { codewordsPlugin } from "./codewords/index.js";
import { letterBoxedPlugin } from "./letter-boxed/index.js";
import { whistPlugin } from "./whist/index.js";
import { fiveHundredPlugin } from "./five-hundred/index.js";
import { pinochlePlugin } from "./pinochle/index.js";
import { sheepsheadPlugin } from "./sheepshead/index.js";
import { wizardPlugin } from "./wizard/index.js";
import { ninetyNinePlugin } from "./ninety-nine/index.js";
import { cantStopPlugin } from "./cant-stop/index.js";
import { perudoPlugin } from "./perudo/index.js";
import { dudoPlugin } from "./dudo/index.js";
import { kingdomsDicePlugin } from "./kingdoms-dice/index.js";
import { tenziPlugin } from "./tenzi/index.js";
import { beatThatPlugin } from "./beat-that/index.js";
import { parcheesiPlugin } from "./parcheesi/index.js";
import { ludoPlugin } from "./ludo/index.js";
import { sorryPlugin } from "./sorry/index.js";
import { troublePlugin } from "./trouble/index.js";
import { snakesAndLaddersPlugin } from "./snakes-and-ladders/index.js";
import { ratRacePlugin } from "./rat-race/index.js";
import { hnefataflPlugin } from "./hnefatafl/index.js";
import { fanoronaPlugin } from "./fanorona/index.js";
import { alquerquePlugin } from "./alquerque/index.js";
import { konanePlugin } from "./konane/index.js";
import { owarePlugin } from "./oware/index.js";
import { tablutPlugin } from "./tablut/index.js";
import { briscolaPlugin } from "./briscola/index.js";
import { scopaPlugin } from "./scopa/index.js";
import { tutePlugin } from "./tute/index.js";
import { conquianPlugin } from "./conquian/index.js";
import { setbackPlugin } from "./setback/index.js";
import { musPlugin } from "./mus/index.js";

export const GAMES: GamePlugin[] = [
  cameroonPlugin as unknown as GamePlugin,
  kismetPlugin as unknown as GamePlugin,
  miaPlugin as unknown as GamePlugin,
  chicagoDicePlugin as unknown as GamePlugin,
  shutTheBoxPlugin as unknown as GamePlugin,
  dicePokerPlugin as unknown as GamePlugin,
  accordionPlugin as unknown as GamePlugin,
  beleagueredCastlePlugin as unknown as GamePlugin,
  streetsAndAlleysPlugin as unknown as GamePlugin,
  penguinPlugin as unknown as GamePlugin,
  bakersGamePlugin as unknown as GamePlugin,
  westcliffPlugin as unknown as GamePlugin,
  kingsInTheCornerPlugin as unknown as GamePlugin,
  acesUpPlugin as unknown as GamePlugin,
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
  nonogramPlugin as unknown as GamePlugin,
  wordSearchPlugin as unknown as GamePlugin,
  wordLadderPlugin as unknown as GamePlugin,
  anagramPlugin as unknown as GamePlugin,
  make24Plugin as unknown as GamePlugin,
  pegSolitairePlugin as unknown as GamePlugin,
  pongPlugin as unknown as GamePlugin,
  tetrisPlugin as unknown as GamePlugin,
  froggerPlugin as unknown as GamePlugin,
  asteroidsPlugin as unknown as GamePlugin,
  spaceInvadersPlugin as unknown as GamePlugin,
  baccaratPlugin as unknown as GamePlugin,
  roulettePlugin as unknown as GamePlugin,
  crapsPlugin as unknown as GamePlugin,
  slotsPlugin as unknown as GamePlugin,
  caribbeanStudPlugin as unknown as GamePlugin,
  whackAMolePlugin as unknown as GamePlugin,
  plinkoPlugin as unknown as GamePlugin,
  bubbleShooterPlugin as unknown as GamePlugin,
  towerOfHanoiPlugin as unknown as GamePlugin,
  reactionTimePlugin as unknown as GamePlugin,
  simonPlugin as unknown as GamePlugin,
  ginRummyPlugin as unknown as GamePlugin,
  spadesPlugin as unknown as GamePlugin,
  euchrePlugin as unknown as GamePlugin,
  rummy500Plugin as unknown as GamePlugin,
  casinoPlugin as unknown as GamePlugin,
  fiveCrownsPlugin as unknown as GamePlugin,
  highCardFlushPlugin as unknown as GamePlugin,
  sevensPlugin as unknown as GamePlugin,
  bowlingPlugin as unknown as GamePlugin,
  horseshoesPlugin as unknown as GamePlugin,
  ticTacToe3DPlugin as unknown as GamePlugin,
  numberGuesserPlugin as unknown as GamePlugin,
  bingoPlugin as unknown as GamePlugin,
  coinFlipStreakPlugin as unknown as GamePlugin,
  spiderettePlugin as unknown as GamePlugin,
  eightOffPlugin as unknown as GamePlugin,
  missMilliganPlugin as unknown as GamePlugin,
  crescentPlugin as unknown as GamePlugin,
  gatePlugin as unknown as GamePlugin,
  yukonCellsPlugin as unknown as GamePlugin,
  whiteheadPlugin as unknown as GamePlugin,
  slyFoxPlugin as unknown as GamePlugin,
  hexPlugin as unknown as GamePlugin,
  abalonePlugin as unknown as GamePlugin,
  santoriniPlugin as unknown as GamePlugin,
  blokusDuoPlugin as unknown as GamePlugin,
  pentagoPlugin as unknown as GamePlugin,
  amazonsPlugin as unknown as GamePlugin,
  bullsAndCowsPlugin as unknown as GamePlugin,
  slitherlinkPlugin as unknown as GamePlugin,
  nurikabePlugin as unknown as GamePlugin,
  hidatoPlugin as unknown as GamePlugin,
  futoshikiPlugin as unknown as GamePlugin,
  cryptogramPlugin as unknown as GamePlugin,
  kakuroPlugin as unknown as GamePlugin,
  kenkenPlugin as unknown as GamePlugin,
  tentsPlugin as unknown as GamePlugin,
  skyscrapersPlugin as unknown as GamePlugin,
  hitoriPlugin as unknown as GamePlugin,
  masyuPlugin as unknown as GamePlugin,
  killerSudokuPlugin as unknown as GamePlugin,
  rushHourPlugin as unknown as GamePlugin,
  sokobanPlugin as unknown as GamePlugin,
  unrulyPlugin as unknown as GamePlugin,
  starBattlePlugin as unknown as GamePlugin,
  missileCommandPlugin as unknown as GamePlugin,
  mazeChasePlugin as unknown as GamePlugin,
  climbJumperPlugin as unknown as GamePlugin,
  gravityLanderPlugin as unknown as GamePlugin,
  endlessRunnerPlugin as unknown as GamePlugin,
  bouncerPlugin as unknown as GamePlugin,
  bogglePlugin as unknown as GamePlugin,
  acrophobiaPlugin as unknown as GamePlugin,
  wordPokerPlugin as unknown as GamePlugin,
  crossCluesPlugin as unknown as GamePlugin,
  codewordsPlugin as unknown as GamePlugin,
  letterBoxedPlugin as unknown as GamePlugin,
  whistPlugin as unknown as GamePlugin,
  fiveHundredPlugin as unknown as GamePlugin,
  pinochlePlugin as unknown as GamePlugin,
  sheepsheadPlugin as unknown as GamePlugin,
  wizardPlugin as unknown as GamePlugin,
  ninetyNinePlugin as unknown as GamePlugin,
  cantStopPlugin as unknown as GamePlugin,
  perudoPlugin as unknown as GamePlugin,
  dudoPlugin as unknown as GamePlugin,
  kingdomsDicePlugin as unknown as GamePlugin,
  tenziPlugin as unknown as GamePlugin,
  beatThatPlugin as unknown as GamePlugin,
  parcheesiPlugin as unknown as GamePlugin,
  ludoPlugin as unknown as GamePlugin,
  sorryPlugin as unknown as GamePlugin,
  troublePlugin as unknown as GamePlugin,
  snakesAndLaddersPlugin as unknown as GamePlugin,
  ratRacePlugin as unknown as GamePlugin,
  hnefataflPlugin as unknown as GamePlugin,
  fanoronaPlugin as unknown as GamePlugin,
  alquerquePlugin as unknown as GamePlugin,
  konanePlugin as unknown as GamePlugin,
  owarePlugin as unknown as GamePlugin,
  tablutPlugin as unknown as GamePlugin,
  briscolaPlugin as unknown as GamePlugin,
  scopaPlugin as unknown as GamePlugin,
  tutePlugin as unknown as GamePlugin,
  conquianPlugin as unknown as GamePlugin,
  setbackPlugin as unknown as GamePlugin,
  musPlugin as unknown as GamePlugin,
];

import type { GamePlugin } from "../platform/game-plugin/types.js";
import { texasHoldemPlugin } from "./texas-holdem/index.js";
import { omahaHoldemPlugin } from "./omaha-holdem/index.js";
import { sevenCardStudPlugin } from "./seven-card-stud/index.js";
import { fiveCardDrawPlugin } from "./five-card-draw/index.js";
import { razzPlugin } from "./razz/index.js";
import { badugiPlugin } from "./badugi/index.js";
import { chessPlugin } from "./chess/index.js";
import { suicideChessPlugin } from "./suicide-chess/index.js";
import { atomicChessPlugin } from "./atomic-chess/index.js";
import { internationalDraughtsPlugin } from "./international-draughts/index.js";
import { chineseCheckersPlugin } from "./chinese-checkers/index.js";
import { halmaPlugin } from "./halma/index.js";
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
import { xiangqiPlugin } from "./xiangqi/index.js";
import { shogiPlugin } from "./shogi/index.js";
import { miniShogiPlugin } from "./mini-shogi/index.js";
import { makrukPlugin } from "./makruk/index.js";
import { sittuyinPlugin } from "./sittuyin/index.js";
import { janggiPlugin } from "./janggi/index.js";
import { baoPlugin } from "./bao/index.js";
import { sungkaPlugin } from "./sungka/index.js";
import { tablutPlugin } from "./tablut/index.js";
import { briscolaPlugin } from "./briscola/index.js";
import { scopaPlugin } from "./scopa/index.js";
import { tutePlugin } from "./tute/index.js";
import { conquianPlugin } from "./conquian/index.js";
import { setbackPlugin } from "./setback/index.js";
import { musPlugin } from "./mus/index.js";
import { dutchBlitzPlugin } from "./dutch-blitz/index.js";
import { nertzPlugin } from "./nertz/index.js";
import { ligrettoPlugin } from "./ligretto/index.js";
import { spitPlugin } from "./spit/index.js";
import { californiaSpeedPlugin } from "./california-speed/index.js";
import { kempsPlugin } from "./kemps/index.js";
import { hanabiPlugin } from "./hanabi/index.js";
import { theCrewPlugin } from "./the-crew/index.js";
import { justOnePlugin } from "./just-one/index.js";
import { codenamesLitePlugin } from "./codenames-lite/index.js";
import { spotItPlugin } from "./spot-it/index.js";
import { setGamePlugin } from "./set-game/index.js";
import { tangramPlugin } from "./tangram/index.js";
import { chainReactionPlugin } from "./chain-reaction/index.js";
import { match3Plugin } from "./match-3/index.js";
import { columnsPlugin } from "./columns/index.js";
import { drMarioPlugin } from "./dr-mario-like/index.js";
import { puyoPopPlugin } from "./puyo-pop-like/index.js";
import { drop7Plugin } from "./drop7-like/index.js";
import { sameGamePlugin } from "./same-game/index.js";
import { mahjongTurtlePlugin } from "./mahjong-solitaire-turtle/index.js";
import { mahjongDragonPlugin } from "./mahjong-solitaire-dragon/index.js";
import { mahjongPyramidPlugin } from "./mahjong-solitaire-pyramid/index.js";
import { shisenShoPlugin } from "./shisen-sho/index.js";
import { pairsThemedPlugin } from "./pairs-themed/index.js";
import { tileMatchRushPlugin } from "./tile-match-rush/index.js";
import { russianSolitairePlugin } from "./russian-solitaire/index.js";
import { bakersDozPlugin } from "./bakers-dozen/index.js";
import { sultanPlugin } from "./sultan-of-turkey/index.js";
import { grandfathersClockPlugin } from "./grandfathers-clock/index.js";
import { scorpionTailPlugin } from "./scorpion-tail/index.js";
import { carpetPlugin } from "./carpet/index.js";
import { cruelPlugin } from "./cruel/index.js";
import { fortyAndEightPlugin } from "./forty-and-eight/index.js";
import { diplomatPlugin } from "./diplomat/index.js";
import { congressPlugin } from "./congress/index.js";
import { simpleSimonPlugin } from "./simple-simon/index.js";
import { emperorPlugin } from "./emperor/index.js";
import { perseverancePlugin } from "./perseverance/index.js";
import { canisterPlugin } from "./canister/index.js";
import { paiGowPokerPlugin } from "./pai-gow-poker/index.js";
import { letItRidePlugin } from "./let-it-ride/index.js";
import { threeCardPokerPlugin } from "./three-card-poker/index.js";
import { redDogPlugin } from "./red-dog/index.js";
import { casinoWarPlugin } from "./casino-war/index.js";
import { sicBoPlugin } from "./sic-bo/index.js";
import { rockPaperScissorsPlugin } from "./rock-paper-scissors/index.js";
import { nimPlugin } from "./nim/index.js";
import { truelPlugin } from "./truel/index.js";
import { secretNumberPlugin } from "./secret-number/index.js";
import { primeClimbPlugin } from "./prime-climb/index.js";
import { rummikubPlugin } from "./rummikub/index.js";
import { quixoPlugin } from "./quixo/index.js";
import { quartoPlugin } from "./quarto/index.js";
import { akariPlugin } from "./akari/index.js";
import { yajilinPlugin } from "./yajilin/index.js";
import { shikakuPlugin } from "./shikaku/index.js";
import { heyawakePlugin } from "./heyawake/index.js";
import { cavePlugin } from "./cave/index.js";
import { fillominoPlugin } from "./fillomino/index.js";
import { aquariumPlugin } from "./aquarium/index.js";
import { tapaPlugin } from "./tapa/index.js";
import { skatPlugin } from "./skat/index.js";
import { klaverjasPlugin } from "./klaverjas/index.js";
import { doppelkopfPlugin } from "./doppelkopf/index.js";
import { belotePlugin } from "./belote/index.js";
import { tressettePlugin } from "./tressette/index.js";
import { schnapsenPlugin } from "./schnapsen/index.js";
import { mariagePlugin } from "./mariage/index.js";
import { preferansPlugin } from "./preferans/index.js";
import { choHanPlugin } from "./cho-han/index.js";
import { acesInThePotPlugin } from "./aces-in-the-pot/index.js";
import { safeKeeperPlugin } from "./safe-keeper/index.js";
import { underOver7Plugin } from "./under-over-7/index.js";
import { bossDicePlugin } from "./boss-dice/index.js";
import { fiveDiceShootoutPlugin } from "./five-dice-shootout/index.js";
import { centennialPlugin } from "./centennial/index.js";
import { gluckshausPlugin } from "./gluckshaus/index.js";
import { typingSpeedPlugin } from "./typing-speed/index.js";
import { targetPracticePlugin } from "./target-practice/index.js";
import { colorMatchPlugin } from "./color-match/index.js";
import { mathChallengePlugin } from "./math-challenge/index.js";
import { frogCatcherPlugin } from "./frog-catcher/index.js";
import { fallingCatcherPlugin } from "./falling-catcher/index.js";
import { duckShootPlugin } from "./duck-shoot/index.js";
import { stackerPlugin } from "./stacker/index.js";
import { handAndFootPlugin } from "./hand-and-foot/index.js";
import { canastaPlugin } from "./canasta/index.js";
import { sambaPlugin } from "./samba/index.js";
import { boliviaPlugin } from "./bolivia/index.js";
import { continentalRummyPlugin } from "./continental-rummy/index.js";
import { contractRummyPlugin } from "./contract-rummy/index.js";
import { fiveHundredRumPlugin } from "./five-hundred-rum/index.js";
import { kalookiPlugin } from "./kalooki/index.js";
import { breakthroughPlugin } from "./breakthrough/index.js";
import { clobberPlugin } from "./clobber/index.js";
import { linesOfActionPlugin } from "./lines-of-action/index.js";
import { go9x9Plugin } from "./go-9x9/index.js";
import { atariGoPlugin } from "./atari-go/index.js";
import { phutballPlugin } from "./phutball/index.js";
import { dvonnLitePlugin } from "./dvonn-lite/index.js";
import { dotsCapturePlugin } from "./dots-capture/index.js";
import { europeanPegSolitairePlugin } from "./european-peg-solitaire/index.js";
import { uncleWiggilyPlugin } from "./uncle-wiggily/index.js";
import { lotto90Plugin } from "./lotto-90/index.js";
import { klotskiPlugin } from "./klotski/index.js";
import { coinCounterPlugin } from "./coin-counter/index.js";
import { guessFlagPlugin } from "./guess-the-flag/index.js";
import { oddOneOutPlugin } from "./odd-one-out/index.js";
import { lightsOut3DPlugin } from "./lights-out-3d/index.js";
import { windmillPlugin } from "./windmill/index.js";
import { seaTowersPlugin } from "./sea-towers/index.js";
import { thumbAndPouchPlugin } from "./thumb-and-pouch/index.js";
import { flowerGardenPlugin } from "./flower-garden/index.js";
import { easthavenPlugin } from "./easthaven/index.js";
import { klondikeByThreesPlugin } from "./klondike-by-threes/index.js";
import { aceOfThePilePlugin } from "./ace-of-the-pile/index.js";
import { relaxedSpiderPlugin } from "./relaxed-spider/index.js";
import { spellingBeePlugin } from "./spelling-bee/index.js";
import { crosswordMiniPlugin } from "./crossword-mini/index.js";
import { textTwistPlugin } from "./text-twist/index.js";
import { acrosticPlugin } from "./acrostic/index.js";
import { bananagramsPlugin } from "./bananagrams/index.js";
import { quordlePlugin } from "./quordle/index.js";
import { wordChainPlugin } from "./word-chain/index.js";
import { wordConstructionPlugin } from "./word-construction/index.js";

export const GAMES: GamePlugin[] = [
  texasHoldemPlugin as unknown as GamePlugin,
  omahaHoldemPlugin as unknown as GamePlugin,
  sevenCardStudPlugin as unknown as GamePlugin,
  fiveCardDrawPlugin as unknown as GamePlugin,
  razzPlugin as unknown as GamePlugin,
  badugiPlugin as unknown as GamePlugin,
  chessPlugin as unknown as GamePlugin,
  suicideChessPlugin as unknown as GamePlugin,
  atomicChessPlugin as unknown as GamePlugin,
  internationalDraughtsPlugin as unknown as GamePlugin,
  chineseCheckersPlugin as unknown as GamePlugin,
  halmaPlugin as unknown as GamePlugin,
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
  xiangqiPlugin as unknown as GamePlugin,
  shogiPlugin as unknown as GamePlugin,
  miniShogiPlugin as unknown as GamePlugin,
  makrukPlugin as unknown as GamePlugin,
  sittuyinPlugin as unknown as GamePlugin,
  janggiPlugin as unknown as GamePlugin,
  baoPlugin as unknown as GamePlugin,
  sungkaPlugin as unknown as GamePlugin,
  tablutPlugin as unknown as GamePlugin,
  briscolaPlugin as unknown as GamePlugin,
  scopaPlugin as unknown as GamePlugin,
  tutePlugin as unknown as GamePlugin,
  conquianPlugin as unknown as GamePlugin,
  setbackPlugin as unknown as GamePlugin,
  musPlugin as unknown as GamePlugin,
  dutchBlitzPlugin as unknown as GamePlugin,
  nertzPlugin as unknown as GamePlugin,
  ligrettoPlugin as unknown as GamePlugin,
  spitPlugin as unknown as GamePlugin,
  californiaSpeedPlugin as unknown as GamePlugin,
  kempsPlugin as unknown as GamePlugin,
  hanabiPlugin as unknown as GamePlugin,
  theCrewPlugin as unknown as GamePlugin,
  justOnePlugin as unknown as GamePlugin,
  codenamesLitePlugin as unknown as GamePlugin,
  spotItPlugin as unknown as GamePlugin,
  setGamePlugin as unknown as GamePlugin,
  tangramPlugin as unknown as GamePlugin,
  chainReactionPlugin as unknown as GamePlugin,
  match3Plugin as unknown as GamePlugin,
  columnsPlugin as unknown as GamePlugin,
  drMarioPlugin as unknown as GamePlugin,
  puyoPopPlugin as unknown as GamePlugin,
  drop7Plugin as unknown as GamePlugin,
  sameGamePlugin as unknown as GamePlugin,
  mahjongTurtlePlugin as unknown as GamePlugin,
  mahjongDragonPlugin as unknown as GamePlugin,
  mahjongPyramidPlugin as unknown as GamePlugin,
  shisenShoPlugin as unknown as GamePlugin,
  pairsThemedPlugin as unknown as GamePlugin,
  tileMatchRushPlugin as unknown as GamePlugin,
  russianSolitairePlugin as unknown as GamePlugin,
  bakersDozPlugin as unknown as GamePlugin,
  sultanPlugin as unknown as GamePlugin,
  grandfathersClockPlugin as unknown as GamePlugin,
  scorpionTailPlugin as unknown as GamePlugin,
  carpetPlugin as unknown as GamePlugin,
  paiGowPokerPlugin as unknown as GamePlugin,
  letItRidePlugin as unknown as GamePlugin,
  threeCardPokerPlugin as unknown as GamePlugin,
  redDogPlugin as unknown as GamePlugin,
  casinoWarPlugin as unknown as GamePlugin,
  sicBoPlugin as unknown as GamePlugin,
  rockPaperScissorsPlugin as unknown as GamePlugin,
  nimPlugin as unknown as GamePlugin,
  truelPlugin as unknown as GamePlugin,
  secretNumberPlugin as unknown as GamePlugin,
  primeClimbPlugin as unknown as GamePlugin,
  rummikubPlugin as unknown as GamePlugin,
  quixoPlugin as unknown as GamePlugin,
  quartoPlugin as unknown as GamePlugin,
  akariPlugin as unknown as GamePlugin,
  yajilinPlugin as unknown as GamePlugin,
  shikakuPlugin as unknown as GamePlugin,
  heyawakePlugin as unknown as GamePlugin,
  cavePlugin as unknown as GamePlugin,
  fillominoPlugin as unknown as GamePlugin,
  aquariumPlugin as unknown as GamePlugin,
  tapaPlugin as unknown as GamePlugin,
  cruelPlugin as unknown as GamePlugin,
  fortyAndEightPlugin as unknown as GamePlugin,
  diplomatPlugin as unknown as GamePlugin,
  congressPlugin as unknown as GamePlugin,
  simpleSimonPlugin as unknown as GamePlugin,
  emperorPlugin as unknown as GamePlugin,
  perseverancePlugin as unknown as GamePlugin,
  canisterPlugin as unknown as GamePlugin,
  skatPlugin as unknown as GamePlugin,
  klaverjasPlugin as unknown as GamePlugin,
  doppelkopfPlugin as unknown as GamePlugin,
  belotePlugin as unknown as GamePlugin,
  tressettePlugin as unknown as GamePlugin,
  schnapsenPlugin as unknown as GamePlugin,
  mariagePlugin as unknown as GamePlugin,
  preferansPlugin as unknown as GamePlugin,
  choHanPlugin as unknown as GamePlugin,
  acesInThePotPlugin as unknown as GamePlugin,
  safeKeeperPlugin as unknown as GamePlugin,
  underOver7Plugin as unknown as GamePlugin,
  bossDicePlugin as unknown as GamePlugin,
  fiveDiceShootoutPlugin as unknown as GamePlugin,
  centennialPlugin as unknown as GamePlugin,
  gluckshausPlugin as unknown as GamePlugin,
  typingSpeedPlugin as unknown as GamePlugin,
  targetPracticePlugin as unknown as GamePlugin,
  colorMatchPlugin as unknown as GamePlugin,
  mathChallengePlugin as unknown as GamePlugin,
  frogCatcherPlugin as unknown as GamePlugin,
  fallingCatcherPlugin as unknown as GamePlugin,
  duckShootPlugin as unknown as GamePlugin,
  stackerPlugin as unknown as GamePlugin,
  handAndFootPlugin as unknown as GamePlugin,
  canastaPlugin as unknown as GamePlugin,
  sambaPlugin as unknown as GamePlugin,
  boliviaPlugin as unknown as GamePlugin,
  continentalRummyPlugin as unknown as GamePlugin,
  contractRummyPlugin as unknown as GamePlugin,
  fiveHundredRumPlugin as unknown as GamePlugin,
  kalookiPlugin as unknown as GamePlugin,
  breakthroughPlugin as unknown as GamePlugin,
  clobberPlugin as unknown as GamePlugin,
  linesOfActionPlugin as unknown as GamePlugin,
  go9x9Plugin as unknown as GamePlugin,
  atariGoPlugin as unknown as GamePlugin,
  phutballPlugin as unknown as GamePlugin,
  dvonnLitePlugin as unknown as GamePlugin,
  dotsCapturePlugin as unknown as GamePlugin,
  europeanPegSolitairePlugin as unknown as GamePlugin,
  uncleWiggilyPlugin as unknown as GamePlugin,
  lotto90Plugin as unknown as GamePlugin,
  klotskiPlugin as unknown as GamePlugin,
  coinCounterPlugin as unknown as GamePlugin,
  guessFlagPlugin as unknown as GamePlugin,
  oddOneOutPlugin as unknown as GamePlugin,
  lightsOut3DPlugin as unknown as GamePlugin,
  windmillPlugin as unknown as GamePlugin,
  seaTowersPlugin as unknown as GamePlugin,
  thumbAndPouchPlugin as unknown as GamePlugin,
  flowerGardenPlugin as unknown as GamePlugin,
  easthavenPlugin as unknown as GamePlugin,
  klondikeByThreesPlugin as unknown as GamePlugin,
  aceOfThePilePlugin as unknown as GamePlugin,
  relaxedSpiderPlugin as unknown as GamePlugin,
  spellingBeePlugin as unknown as GamePlugin,
  crosswordMiniPlugin as unknown as GamePlugin,
  textTwistPlugin as unknown as GamePlugin,
  acrosticPlugin as unknown as GamePlugin,
  bananagramsPlugin as unknown as GamePlugin,
  quordlePlugin as unknown as GamePlugin,
  wordChainPlugin as unknown as GamePlugin,
  wordConstructionPlugin as unknown as GamePlugin,
];

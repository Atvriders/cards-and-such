import type { GamePlugin } from "../platform/game-plugin/types.js";
import { additionSprintPlugin } from "./addition-sprint/index.js";
import { subtractionSprintPlugin } from "./subtraction-sprint/index.js";
import { algebraSolveXPlugin } from "./algebra-solve-x/index.js";
import { orderOfOpsPlugin } from "./order-of-ops/index.js";
import { primeFactorPlugin } from "./prime-factor/index.js";
import { exponentDrillPlugin } from "./exponent-drill/index.js";
import { romanNumeralsPlugin } from "./roman-numerals/index.js";
import { numberBondsPlugin } from "./number-bonds/index.js";
import { memoryPairsKidsPlugin } from "./memory-pairs-kids/index.js";
import { countingBearsPlugin } from "./counting-bears/index.js";
import { applePickingPlugin } from "./apple-picking/index.js";
import { farmyardMatchPlugin } from "./farmyard-match/index.js";
import { treasureHuntPlugin } from "./treasure-hunt/index.js";
import { rainbowSortPlugin } from "./rainbow-sort/index.js";
import { alphabetCatchPlugin } from "./alphabet-catch/index.js";
import { numberOrderPlugin } from "./number-order/index.js";
import { cannonShotPlugin } from "./cannon-shot/index.js";
import { archeryTargetPlugin } from "./archery-target/index.js";
import { dartThrowPlugin } from "./dart-throw/index.js";
import { axeThrowPlugin } from "./axe-throw/index.js";
import { pendulumDropPlugin } from "./pendulum-drop/index.js";
import { marbleDropPlugin } from "./marble-drop/index.js";
import { catapultCastlePlugin } from "./catapult-castle/index.js";
import { skeeBallPlugin } from "./skee-ball/index.js";
import { schafkopfPlugin } from "./schafkopf/index.js";
import { ohHellPlugin } from "./oh-hell/index.js";
import { bourrePlugin } from "./bourre/index.js";
import { fortyFivesPlugin } from "./forty-fives/index.js";
import { beziquePlugin } from "./bezique/index.js";
import { piquetPlugin } from "./piquet/index.js";
import { soloWhistPlugin } from "./solo-whist/index.js";
import { bostonPlugin } from "./boston/index.js";
import { galaxyFormationPlugin } from "./galaga-like/index.js";
import { tunnelDigPlugin } from "./dig-dug-like/index.js";
import { qJumpPlugin } from "./qbert-like/index.js";
import { barrelJumperPlugin } from "./donkey-kong-like/index.js";
import { skyJoustPlugin } from "./joust-like/index.js";
import { skyDefenderPlugin } from "./defender-like/index.js";
import { iceBlocksPlugin } from "./pengo-like/index.js";
import { lunarDescentPlugin } from "./lunar-lander-like/index.js";
import { dropDeadPlugin } from "./drop-dead/index.js";
import { mexicoDicePlugin } from "./mexico-dice/index.js";
import { zilchPlugin } from "./zilch/index.js";
import { twentySixPlugin } from "./twenty-six/index.js";
import { qwixxPlugin } from "./qwixx/index.js";
import { rollThroughAgesPlugin } from "./roll-through-ages/index.js";
import { macaoDicePlugin } from "./macao-dice/index.js";
import { helanGarPlugin } from "./helan-gar/index.js";
import { agonPlugin } from "./agon/index.js";
import { turkishDraughtsPlugin } from "./turkish-draughts/index.js";
import { armenianDraughtsPlugin } from "./armenian-draughts/index.js";
import { foxAndGeesePlugin } from "./fox-and-geese/index.js";
import { kharbagaPlugin } from "./kharbaga/index.js";
import { gomokuProPlugin } from "./gomoku-pro/index.js";
import { fiveFieldKonoPlugin } from "./five-field-kono/index.js";
import { baghChalPlugin } from "./bagh-chal/index.js";
import { farmManagerPlugin } from "./farm-manager/index.js";
import { stockTickerPlugin } from "./stock-ticker/index.js";
import { storehousePlugin } from "./storehouse/index.js";
import { milliganCellPlugin } from "./milligan-cell/index.js";
import { doubleFreeCellPlugin } from "./double-freecell/index.js";
import { westcliffEasyPlugin } from "./westcliff-easy/index.js";
import { numberMemoryPlugin } from "./number-memory/index.js";
import { colorSequencePlugin } from "./color-sequence/index.js";
import { imageMemoryPlugin } from "./image-memory/index.js";
import { dualNBackPlugin } from "./dual-n-back/index.js";
import { patternRecallPlugin } from "./pattern-recall/index.js";
import { quickCountingPlugin } from "./quick-counting/index.js";
import { oddShapeOutPlugin } from "./odd-shape-out/index.js";
import { faceRecognitionPlugin } from "./face-recognition/index.js";
import { texasHoldemPlugin } from "./texas-holdem/index.js";
import { omahaHoldemPlugin } from "./omaha-holdem/index.js";
import { sevenCardStudPlugin } from "./seven-card-stud/index.js";
import { fiveCardDrawPlugin } from "./five-card-draw/index.js";
import { razzPlugin } from "./razz/index.js";
import { badugiPlugin } from "./badugi/index.js";
import { chessPlugin } from "./chess/index.js";
import { suicideChessPlugin } from "./suicide-chess/index.js";
import { atomicChessPlugin } from "./atomic-chess/index.js";
import { chess960Plugin } from "./chess960/index.js";
import { racingKingsPlugin } from "./racing-kings/index.js";
import { hordeChessPlugin } from "./horde-chess/index.js";
import { threeCheckPlugin } from "./three-check/index.js";
import { crazyhousePlugin } from "./crazyhouse/index.js";
import { kingOfTheHillPlugin } from "./king-of-the-hill/index.js";
import { antichessPlugin } from "./antichess/index.js";
import { progressiveChessPlugin } from "./progressive-chess/index.js";
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
import { fortressSolitairePlugin } from "./fortress-solitaire/index.js";
import { seaHavenTowersPlugin } from "./sea-haven-towers/index.js";
import { canfieldStorehousePlugin } from "./canfield-storehouse/index.js";
import { cornersSolitairePlugin } from "./corners-solitaire/index.js";
import { kingAlbertPlugin } from "./king-albert/index.js";
import { napoleonAtSaintHelenaPlugin } from "./napoleon-at-saint-helena/index.js";
import { fourSeasonsPlugin } from "./four-seasons/index.js";
import { deucesSolitairePlugin } from "./deuces-solitaire/index.js";
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
import { logicGridPlugin } from "./logic-grid/index.js";
import { bridgesPlugin } from "./bridges/index.js";
import { dominoPlacementPlugin } from "./domino-placement/index.js";
import { kropkiPlugin } from "./kropki/index.js";
import { thermometerPlugin } from "./thermometer/index.js";
import { numberlinkPlugin } from "./numberlink/index.js";
import { kakurasuPlugin } from "./kakurasu/index.js";
import { laserMazePlugin } from "./laser-maze/index.js";
import { cuckooPlugin } from "./cuckoo/index.js";
import { germanWhistPlugin } from "./german-whist/index.js";
import { knockOutWhistPlugin } from "./knock-out-whist/index.js";
import { bastraPlugin } from "./bastra/index.js";
import { agramPlugin } from "./agram/index.js";
import { scatPlugin } from "./scat/index.js";
import { doubleDummyWhistPlugin } from "./double-dummy-whist/index.js";
import { twentyNinePlugin } from "./twenty-nine/index.js";
import { auldLangSynePlugin } from "./auld-lang-syne/index.js";
import { klondikeSuperSolverPlugin } from "./klondike-super-solver/index.js";
import { calculationPlugin } from "./calculation/index.js";
import { pokerSolitairePlugin } from "./poker-solitaire/index.js";
import { pyramidGolfPlugin } from "./pyramid-golf/index.js";
import { nestorPlugin } from "./nestor/index.js";
import { fortyEightOneDeckPlugin } from "./forty-eight-one-deck/index.js";
import { dozenPlugin } from "./dozen/index.js";
import { candyLandPlugin } from "./candy-land/index.js";
import { hiHoCherryOPlugin } from "./hi-ho-cherry-o/index.js";
import { dontBreakIcePlugin } from "./dont-break-ice/index.js";
import { popThePigPlugin } from "./pop-the-pig/index.js";
import { operationGamePlugin } from "./operation-game/index.js";
import { guessWhoPlugin } from "./guess-who/index.js";
import { chutesLaddersKidsPlugin } from "./chutes-ladders-kids/index.js";
import { connectLightsPlugin } from "./connect-lights/index.js";
import { rollASixPlugin } from "./roll-a-six/index.js";
import { highCardDrawPlugin } from "./high-card-draw/index.js";
import { pennyFlipPlugin } from "./penny-flip/index.js";
import { oddDicePlugin } from "./odd-dice/index.js";
import { mathBingoPlugin } from "./math-bingo/index.js";
import { balloonPopPlugin } from "./balloon-pop/index.js";
import { cardLineupPlugin } from "./card-lineup/index.js";
import { numberMazePlugin } from "./number-maze/index.js";
import { generalTriviaPlugin } from "./general-trivia/index.js";
import { twoTruthsLiePlugin } from "./two-truths-lie/index.js";
import { wouldYouRatherPlugin } from "./would-you-rather/index.js";
import { triviaTowerPlugin } from "./trivia-tower/index.js";
import { wordAssociationPlugin } from "./word-association/index.js";
import { rhymeTimePlugin } from "./rhyme-time/index.js";
import { charadesPlugin } from "./charades-prompter/index.js";
import { pictionaryPlugin } from "./pictionary-prompter/index.js";
import { flappyBirdPlugin } from "./flappy-bird-like/index.js";
import { doodleJumpPlugin } from "./doodle-jump-like/index.js";
import { helicopterPlugin } from "./helicopter-game/index.js";
import { wallJumperPlugin } from "./wall-jumper/index.js";
import { tapRunnerPlugin } from "./tap-runner/index.js";
import { meteorDodgerPlugin } from "./meteor-dodger/index.js";
import { paddleBallPlugin } from "./paddle-ball-juggle/index.js";
import { ringThrowerPlugin } from "./ring-thrower/index.js";
import { rikudoPlugin } from "./rikudo/index.js";
import { kingsAndKnightsPlugin } from "./kings-and-knights/index.js";
import { battleshipSolitairePlugin } from "./battleship-solitaire/index.js";
import { trainTracksPlugin } from "./train-tracks/index.js";
import { stitchesPlugin } from "./stitches/index.js";
import { rangePlugin } from "./range/index.js";
import { shakashakaPlugin } from "./shakashaka/index.js";
import { crossTheStreamsPlugin } from "./cross-the-streams/index.js";
import { lcrPlugin } from "./lcr/index.js";
import { snakesRacePlugin } from "./snakes-race/index.js";
import { rollRightPlugin } from "./roll-right/index.js";
import { diddlerPlugin } from "./diddler/index.js";
import { fifteensPlugin } from "./fifteens/index.js";
import { napoleonsTombPlugin } from "./napoleons-tomb/index.js";
import { quickTickPlugin } from "./quick-tick/index.js";
import { paperTossPlugin } from "./paper-toss/index.js";
import { brainiacPlugin } from "./brainiac/index.js";
import { narcoticPlugin } from "./narcotic/index.js";
import { bisleyPlugin } from "./bisley/index.js";
import { kingsPlugin } from "./kings/index.js";
import { gizaPlugin } from "./giza/index.js";
import { alhambraPlugin } from "./alhambra/index.js";
import { pouncePlugin } from "./pounce/index.js";
import { capriciesePlugin } from "./capricieuse/index.js";
import { bigTwoPlugin } from "./big-two/index.js";
import { tienLenPlugin } from "./tien-len/index.js";
import { daifugoPlugin } from "./daifugo/index.js";
import { tichuPlugin } from "./tichu/index.js";
import { lastCardPlugin } from "./last-card/index.js";
import { maoPlugin } from "./mao/index.js";
import { stopTheBusPlugin } from "./stop-the-bus/index.js";
import { zhengPlugin } from "./zheng-shangyou/index.js";
import { newmarketPlugin } from "./newmarket/index.js";
import { michiganPlugin } from "./michigan/index.js";
import { pusoyDosPlugin } from "./pusoy-dos/index.js";
import { nineCardBragPlugin } from "./nine-card-brag/index.js";
import { presidentsPlugin } from "./presidents/index.js";
import { rideTheBusPlugin } from "./ride-the-bus/index.js";
import { pokerSquares2PPlugin } from "./poker-squares-2p/index.js";
import { californiaJackPlugin } from "./california-jack/index.js";
import { wheelSpinPlugin } from "./wheel-spin/index.js";
import { priceGuessPlugin } from "./price-guess/index.js";
import { dealOrNoDealPlugin } from "./deal-or-no-deal/index.js";
import { jeopardyLikePlugin } from "./jeopardy-like/index.js";
import { familyFeudPlugin } from "./family-feud/index.js";
import { lightningRoundPlugin } from "./lightning-round/index.js";
import { millionairePlugin } from "./millionaire/index.js";
import { cashCabPlugin } from "./cash-cab/index.js";
import { timesTablesPlugin } from "./times-tables/index.js";
import { divisionDrillPlugin } from "./division-drill/index.js";
import { fractionMatcherPlugin } from "./fraction-matcher/index.js";
import { sequencePredictorPlugin } from "./sequence-predictor/index.js";
import { unitConverterQuizPlugin } from "./unit-converter-quiz/index.js";
import { percentCalculatorPlugin } from "./percent-calculator/index.js";
import { geographyQuizPlugin } from "./geography-quiz/index.js";
import { chemistryQuizPlugin } from "./chemistry-quiz/index.js";
import { blackjackSwitchPlugin } from "./blackjack-switch/index.js";
import { spanish21Plugin } from "./spanish-21/index.js";
import { pontoonPlugin } from "./pontoon/index.js";
import { videoKenoPlugin } from "./video-keno/index.js";
import { bonus6Plugin } from "./bonus-6/index.js";
import { anteUpBlackjackPlugin } from "./ante-up-blackjack/index.js";
import { casinoHoldemPlugin } from "./casino-holdem/index.js";
import { mississippiStudPlugin } from "./mississippi-stud/index.js";
import { surakartaPlugin } from "./surakarta/index.js";
import { yotePlugin } from "./yote/index.js";
import { muTorerePlugin } from "./mu-torere/index.js";
import { shobuPlugin } from "./shobu/index.js";
import { loaSmallPlugin } from "./loa-small/index.js";
import { tumbleweedPlugin } from "./tumbleweed/index.js";
import { pentalathPlugin } from "./pentalath/index.js";
import { slitherPlugin } from "./slither/index.js";
import { fortuneTellerPlugin } from "./fortune-teller/index.js";
import { magic8BallPlugin } from "./magic-8-ball/index.js";
import { coinCollectorPlugin } from "./coin-collector/index.js";
import { diceLadderPlugin } from "./dice-ladder/index.js";
import { leafBlowerPlugin } from "./leaf-blower/index.js";
import { puzzleBoxPlugin } from "./puzzle-box/index.js";
import { cardSpinnerPlugin } from "./card-spinner/index.js";
import { rollEmPlugin } from "./roll-em/index.js";
import { trucoPlugin } from "./truco/index.js";
import { escobaPlugin } from "./escoba/index.js";
import { chinchonPlugin } from "./chinchon/index.js";
import { durakPlugin } from "./durak/index.js";
import { trucoPaulistaPlugin } from "./truco-paulista/index.js";
import { tarneebPlugin } from "./tarneeb/index.js";
import { tonkPlugin } from "./tonk/index.js";
import { kachuufiPlugin } from "./kachuufi/index.js";
import { lemonadeStandPlugin } from "./lemonade-stand/index.js";
import { farmTycoonPlugin } from "./farm-tycoon/index.js";
import { stockMarketMiniPlugin } from "./stock-market-mini/index.js";
import { cityBuilderMicroPlugin } from "./city-builder-micro/index.js";
import { restaurantTycoonPlugin } from "./restaurant-tycoon/index.js";
import { coffeeShopPlugin } from "./coffee-shop/index.js";
import { hotelTycoonPlugin } from "./hotel-tycoon/index.js";
import { airlineSimPlugin } from "./airline-sim/index.js";
import { bakeryShopPlugin } from "./bakery-shop/index.js";
import { oilTycoonPlugin } from "./oil-tycoon/index.js";
import { factoryLinePlugin } from "./factory-line/index.js";
import { gameDevStudioPlugin } from "./game-dev-studio/index.js";
import { zooKeeperPlugin } from "./zoo-keeper/index.js";
import { islandSurvivalPlugin } from "./island-survival/index.js";
import { piratesBountyPlugin } from "./pirates-bounty/index.js";
import { spaceColonyPlugin } from "./space-colony/index.js";
import { pool8BallPlugin } from "./pool-8ball/index.js";
import { billiards9BallPlugin } from "./billiards-9ball/index.js";
import { shuffleboardPlugin } from "./shuffleboard/index.js";
import { miniGolfPlugin } from "./mini-golf/index.js";
import { golf18Plugin } from "./golf-18/index.js";
import { basketballFTPlugin } from "./basketball-free-throws/index.js";
import { fieldGoalPlugin } from "./field-goal-kicker/index.js";
import { tennisServePlugin } from "./tennis-serve/index.js";
import { nonogram5x5Plugin } from "./nonogram-5x5/index.js";
import { battleshipSoloPlugin } from "./battleship-solo/index.js";
import { lightSwitchPuzzlePlugin } from "./light-switch-puzzle/index.js";
import { numberChainPlugin } from "./number-chain/index.js";
import { pegSolitairePlusPlugin } from "./peg-solitaire-plus/index.js";
import { logicGatesSimPlugin } from "./logic-gates-sim/index.js";
import { cipherCrackPlugin } from "./cipher-crack/index.js";
import { binaryPuzzlePlugin } from "./binary-puzzle/index.js";
import { colorMatchDashPlugin } from "./color-match-dash/index.js";
import { rhythmTapPlugin } from "./rhythm-tap/index.js";
import { stackTowerPlugin } from "./stack-tower/index.js";
import { planeDodgePlugin } from "./plane-dodge/index.js";
import { laserDodgePlugin } from "./laser-dodge/index.js";
import { bubblePopChainPlugin } from "./bubble-pop-chain/index.js";
import { whackAVirusPlugin } from "./whack-a-virus/index.js";
import { tunnelRunnerPlugin } from "./tunnel-runner/index.js";
import { wordScramblePlugin } from "./word-scramble/index.js";
import { categoryQuizPlugin } from "./category-quiz/index.js";
import { missingLettersPlugin } from "./missing-letters/index.js";
import { synonymMatchPlugin } from "./synonym-match/index.js";
import { deucesWildPlugin } from "./deuces-wild/index.js";
import { doubleBonusPokerPlugin } from "./double-bonus-poker/index.js";
import { miniRoulettePlugin } from "./mini-roulette/index.js";
import { highLowCasinoPlugin } from "./high-low-casino/index.js";
import { casinoWarMultiPlugin } from "./casino-war-multi/index.js";
import { kenoMiniPlugin } from "./keno-mini/index.js";
import { fanTanPlugin } from "./fan-tan/index.js";
import { dragonTigerPlugin } from "./dragon-tiger/index.js";
import { floodItPlugin } from "./flood-it/index.js";
import { colorLinesPlugin } from "./color-lines/index.js";
import { dominosaPlugin } from "./dominosa/index.js";
import { kyodaiPlugin } from "./kyodai/index.js";
import { pipeManiaPlugin } from "./pipe-mania/index.js";
import { hexMatch3Plugin } from "./hex-match-3/index.js";
import { rotateMatchPlugin } from "./rotate-match/index.js";
import { triangleMatchPlugin } from "./triangle-match/index.js";
import { tradingPostPlugin } from "./trading-post/index.js";
import { resourceChainPlugin } from "./resource-chain/index.js";
import { dungeonDelvePlugin } from "./dungeon-delve/index.js";
import { kingdomBuilderPlugin } from "./kingdom-builder/index.js";
import { alchemyShopPlugin } from "./alchemy-shop/index.js";
import { spyHeistPlugin } from "./spy-heist/index.js";
import { towerDefenseMiniPlugin } from "./tower-defense-mini/index.js";
import { fishingVillagePlugin } from "./fishing-village/index.js";
import { antFarmPlugin } from "./ant-farm/index.js";
import { auctionGamePlugin } from "./auction-game/index.js";
import { pizzaRushPlugin } from "./pizza-rush/index.js";
import { stockDayTraderPlugin } from "./stock-day-trader/index.js";
import { codeBreakerPlugin } from "./code-breaker/index.js";
import { roundTheClockPlugin } from "./round-the-clock/index.js";
import { gridRoguePlugin } from "./grid-rogue/index.js";
import { cardCrawlerPlugin } from "./card-crawler/index.js";
import { diceDungeonPlugin } from "./dice-dungeon/index.js";
import { slayTheDeckPlugin } from "./slay-the-deck/index.js";
import { mineDelverPlugin } from "./mine-delver/index.js";
import { cursedCryptPlugin } from "./cursed-crypt/index.js";
import { dragonHuntPlugin } from "./dragon-hunt/index.js";
import { wizardTowerPlugin } from "./wizard-tower/index.js";
import { neverHaveIEverPlugin } from "./never-have-i-ever/index.js";
import { truthOrDarePlugin } from "./truth-or-dare/index.js";
import { mostLikelyToPlugin } from "./most-likely-to/index.js";
import { hotSeatPlugin } from "./hot-seat/index.js";
import { storyBuilderPlugin } from "./story-builder/index.js";
import { fiveSecondRulePlugin } from "./five-second-rule/index.js";
import { headsUpPlugin } from "./heads-up/index.js";
import { hotTakePlugin } from "./hot-take/index.js";
import { arrowSudokuPlugin } from "./arrow-sudoku/index.js";
import { mosaicPuzzlePlugin } from "./mosaic-puzzle/index.js";
import { nurimisakiPlugin } from "./nurimisaki/index.js";
import { castleWallPlugin } from "./castle-wall/index.js";
import { galaxiesPuzzlePlugin } from "./galaxies-puzzle/index.js";
import { corralPuzzlePlugin } from "./corral-puzzle/index.js";
import { countryRoadPlugin } from "./country-road/index.js";
import { pearlPuzzlePlugin } from "./pearl-puzzle/index.js";
import { typingWordsPlugin } from "./typing-words/index.js";
import { typingQuotesPlugin } from "./typing-quotes/index.js";
import { verbalMemoryPlugin } from "./verbal-memory/index.js";
import { chimpTestPlugin } from "./chimp-test/index.js";
import { stroopTestPlugin } from "./stroop-test/index.js";
import { digitSpanPlugin } from "./digit-span/index.js";
import { aimTrainerPlugin } from "./aim-trainer/index.js";
import { visualMemoryGridPlugin } from "./visual-memory-grid/index.js";
import { homeRunDerbyPlugin } from "./home-run-derby/index.js";
import { soccerPenaltyPlugin } from "./soccer-penalty/index.js";
import { hockeyShootoutPlugin } from "./hockey-shootout/index.js";
import { pingPongRallyPlugin } from "./ping-pong-rally/index.js";
import { longJumpPlugin } from "./long-jump/index.js";
import { discusPlugin } from "./discus/index.js";
import { curlingPlugin } from "./curling/index.js";
import { darts501Plugin } from "./darts-501/index.js";
import { cookieClickerMiniPlugin } from "./cookie-clicker-mini/index.js";
import { idleMinerPlugin } from "./idle-miner/index.js";
import { bpmTapPlugin } from "./bpm-tap/index.js";
import { hexColorGuessPlugin } from "./hex-color-guess/index.js";
import { rgbMixerPlugin } from "./rgb-mixer/index.js";
import { keyboardWarriorPlugin } from "./keyboard-warrior/index.js";
import { dicePredictionPlugin } from "./dice-prediction/index.js";
import { breathGaugePlugin } from "./breath-gauge/index.js";
import { osmosisPlugin } from "./osmosis/index.js";
import { shamrocksPlugin } from "./shamrocks/index.js";
import { terracePlugin } from "./terrace/index.js";
import { marthaPlugin } from "./martha/index.js";
import { littleSpiderPlugin } from "./little-spider/index.js";
import { quadrillePlugin } from "./quadrille/index.js";
import { rankAndFilePlugin } from "./rank-and-file/index.js";
import { royalCotillionPlugin } from "./royal-cotillion/index.js";
import { senetPlugin } from "./senet/index.js";
import { royalGameOfUrPlugin } from "./royal-game-of-ur/index.js";
import { morabarabaPlugin } from "./morabaraba/index.js";
import { picariaPlugin } from "./picaria/index.js";
import { seegaPlugin } from "./seega/index.js";
import { frisianDraughtsPlugin } from "./frisian-draughts/index.js";
import { russianDraughtsPlugin } from "./russian-draughts/index.js";
import { poolCheckersPlugin } from "./pool-checkers/index.js";
import { eggCatcherPlugin } from "./egg-catcher/index.js";
import { fishFeederPlugin } from "./fish-feeder/index.js";
import { ninjaHopPlugin } from "./ninja-hop/index.js";
import { samuraiSlicePlugin } from "./samurai-slice/index.js";
import { caveFlyerPlugin } from "./cave-flyer/index.js";
import { dodgeCarsPlugin } from "./dodge-cars/index.js";
import { parachuteDropPlugin } from "./parachute-drop/index.js";
import { swarmShootPlugin } from "./swarm-shoot/index.js";
import { moviesTriviaPlugin } from "./movies-trivia/index.js";
import { musicTriviaPlugin } from "./music-trivia/index.js";
import { sportsTriviaPlugin } from "./sports-trivia/index.js";
import { scienceTriviaPlugin } from "./science-trivia/index.js";
import { historyTriviaPlugin } from "./history-trivia/index.js";
import { mythologyQuizPlugin } from "./mythology-quiz/index.js";
import { spaceQuizPlugin } from "./space-quiz/index.js";
import { foodQuizPlugin } from "./food-quiz/index.js";
import { animalQuizPlugin } from "./animal-quiz/index.js";
import { phrazlePlugin } from "./phrazle/index.js";
import { connectionsPlugin } from "./connections-clone/index.js";
import { compoundWordPlugin } from "./compound-word/index.js";
import { wordPyramidPlugin } from "./word-pyramid/index.js";
import { panagramPlugin } from "./panagram/index.js";
import { lastLetterPlugin } from "./last-letter/index.js";
import { phrasePuzzlePlugin } from "./phrase-puzzle/index.js";
import { wordHuntPlugin } from "./word-hunt/index.js";
import { idleFarmerPlugin } from "./idle-farmer/index.js";
import { idleWizardPlugin } from "./idle-wizard/index.js";
import { idleBlacksmithPlugin } from "./idle-blacksmith/index.js";
import { idleWarriorPlugin } from "./idle-warrior/index.js";
import { idleBakerPlugin } from "./idle-baker/index.js";
import { gemClickerPlugin } from "./gem-clicker/index.js";
import { goldRushIdlePlugin } from "./gold-rush-idle/index.js";
import { prestigeClickerPlugin } from "./prestige-clicker/index.js";
import { klondikeDicePlugin } from "./klondike-dice/index.js";
import { goingToBostonPlugin } from "./going-to-boston/index.js";
import { cosmicWimpoutPlugin } from "./cosmic-wimpout/index.js";
import { cragPlugin } from "./crag/index.js";
import { crownAndAnchorPlugin } from "./crown-and-anchor/index.js";
import { fourFiveSixPlugin } from "./four-five-six/index.js";
import { streetCrapsPlugin } from "./street-craps/index.js";
import { pirateDicePlugin } from "./pirate-dice/index.js";
import { napoleonCardPlugin } from "./napoleon-card/index.js";
import { ecartePlugin } from "./ecarte/index.js";
import { tarockPlugin } from "./tarock/index.js";
import { pidroPlugin } from "./pidro/index.js";
import { hokmPlugin } from "./hokm/index.js";
import { ultiPlugin } from "./ulti/index.js";
import { klopPlugin } from "./klop/index.js";
import { sjavsPlugin } from "./sjavs/index.js";
import { cubeRollPlugin } from "./cube-roll/index.js";
import { tiltMazePlugin } from "./tilt-maze/index.js";
import { tubeColorPlugin } from "./tube-color/index.js";
import { wireConnectPlugin } from "./wire-connect/index.js";
import { mirrorMazePlugin } from "./mirror-maze/index.js";
import { gearPuzzlePlugin } from "./gear-puzzle/index.js";
import { pentominoPuzzlePlugin } from "./pentomino-puzzle/index.js";
import { parkingPuzzlePlugin } from "./parking-puzzle/index.js";
import { classicMazePlugin } from "./classic-maze/index.js";
import { fogMazePlugin } from "./fog-maze/index.js";
import { keyMazePlugin } from "./key-maze/index.js";
import { iceSlideMazePlugin } from "./ice-slide-maze/index.js";
import { teleportMazePlugin } from "./teleport-maze/index.js";
import { ghostMazePlugin } from "./ghost-maze/index.js";
import { gravityMazePlugin } from "./gravity-maze/index.js";
import { coloredTileMazePlugin } from "./colored-tile-maze/index.js";
import { wishPlugin } from "./wish/index.js";
import { royalMarriagePlugin } from "./royal-marriage/index.js";
import { jubileePlugin } from "./jubilee/index.js";
import { intelligencePlugin } from "./intelligence/index.js";
import { eagleWingPlugin } from "./eagle-wing/index.js";
import { demonPlugin } from "./demon/index.js";
import { coloradoPlugin } from "./colorado/index.js";
import { algerianPatiencePlugin } from "./algerian-patience/index.js";
import { interregnumPlugin } from "./interregnum/index.js";
import { boxerKnockoutPlugin } from "./boxer-knockout/index.js";
import { tankBattlePlugin } from "./tank-battle/index.js";
import { pixelRunnerPlugin } from "./pixel-runner/index.js";
import { castleDefenderPlugin } from "./castle-defender/index.js";
import { submarineHuntPlugin } from "./submarine-hunt/index.js";
import { pinballMiniPlugin } from "./pinball-mini/index.js";
import { ufoRescuePlugin } from "./ufo-rescue/index.js";
import { motorcycleJumpPlugin } from "./motorcycle-jump/index.js";
import { einsteinPuzzlePlugin } from "./einstein-puzzle/index.js";
import { weighingPuzzlePlugin } from "./weighing-puzzle/index.js";
import { prisonerHatPlugin } from "./prisoner-hat/index.js";
import { montyHallPlugin } from "./monty-hall/index.js";
import { seatingPuzzlePlugin } from "./seating-puzzle/index.js";
import { safeCrackerPlugin } from "./safe-cracker/index.js";
import { riddleMachinePlugin } from "./riddle-machine/index.js";
import { digitDeducePlugin } from "./digit-deduce/index.js";
import { spoonsPlugin } from "./spoons/index.js";
import { palacePlugin } from "./palace/index.js";
import { parliamentPlugin } from "./parliament/index.js";
import { karmaCardPlugin } from "./karma-card/index.js";
import { garbageCardPlugin } from "./garbage-card/index.js";
import { pigCardPlugin } from "./pig-card/index.js";
import { playOrPayPlugin } from "./play-or-pay/index.js";
import { snipSnapSnoremPlugin } from "./snip-snap-snorem/index.js";
import { christmasCookiePlugin } from "./christmas-cookie/index.js";
import { easterEggHuntPlugin } from "./easter-egg-hunt/index.js";
import { halloweenPumpkinPlugin } from "./halloween-pumpkin/index.js";
import { valentineMatchPlugin } from "./valentine-match/index.js";
import { wizardSpellCastPlugin } from "./wizard-spell-cast/index.js";
import { dragonEggHatchPlugin } from "./dragon-egg-hatch/index.js";
import { robotArenaPlugin } from "./robot-arena/index.js";
import { marsColonyPlugin } from "./mars-colony/index.js";
import { taxiDriverPlugin } from "./taxi-driver/index.js";
import { foragerGamePlugin } from "./forager-game/index.js";
import { spaceTraderPlugin } from "./space-trader/index.js";
import { bountyHunterPlugin } from "./bounty-hunter/index.js";
import { boggleProPlugin } from "./boggle-pro/index.js";
import { slotMachineProPlugin } from "./slot-machine-pro/index.js";
import { diceStackPlugin } from "./dice-stack/index.js";
import { towerBuilderPlugin } from "./tower-builder/index.js";
import { bottleFlipPlugin } from "./bottle-flip/index.js";
import { paperAirplanePlugin } from "./paper-airplane/index.js";
import { frisbeeTossPlugin } from "./frisbee-toss/index.js";
import { boomerangThrowPlugin } from "./boomerang-throw/index.js";
import { targetShooterPlugin } from "./target-shooter/index.js";
import { marbleRollPlugin } from "./marble-roll/index.js";
import { cupFlipPlugin } from "./cup-flip/index.js";
import { slingshotLaunchPlugin } from "./slingshot-launch/index.js";
import { australianPatiencePlugin } from "./australian-patience/index.js";
import { betsyRossPlugin } from "./betsy-ross/index.js";
import { florentinePlugin } from "./florentine-patience/index.js";
import { fourLeafCloverPlugin } from "./four-leaf-clover/index.js";
import { kingsRowPlugin } from "./kings-row/index.js";
import { precedencePlugin } from "./precedence/index.js";
import { tripletsPlugin } from "./triplets/index.js";
import { paganiniPlugin } from "./paganini/index.js";
import { danceArrowsPlugin } from "./dance-arrows/index.js";
import { melodyRepeaterPlugin } from "./melody-repeater/index.js";
import { morseTapPlugin } from "./morse-tap/index.js";
import { sequenceFlashPlugin } from "./sequence-flash/index.js";
import { drumPadPlugin } from "./drum-pad/index.js";
import { mosaicCopyPlugin } from "./mosaic-copy/index.js";
import { repeatAfterMePlugin } from "./repeat-after-me/index.js";
import { rhythmLadderPlugin } from "./rhythm-ladder/index.js";
import { cosmicDicePlugin } from "./cosmic-dice/index.js";
import { vikingDicePlugin } from "./viking-dice/index.js";
import { medievalDicePlugin } from "./medieval-dice/index.js";
import { cowboyDicePlugin } from "./cowboy-dice/index.js";
import { samuraiDicePlugin } from "./samurai-dice/index.js";
import { diceBaseballPlugin } from "./dice-baseball/index.js";
import { diceGolfPlugin } from "./dice-golf/index.js";
import { straightOrBustPlugin } from "./straight-or-bust/index.js";
import { mateIn1Plugin } from "./mate-in-1/index.js";
import { mateIn2Plugin } from "./mate-in-2/index.js";
import { mateIn3Plugin } from "./mate-in-3/index.js";
import { chessTacticsPlugin } from "./chess-tactics/index.js";
import { chessEndgameKrPlugin } from "./chess-endgame-kr/index.js";
import { chessEndgameKqkPlugin } from "./chess-endgame-kqk/index.js";
import { pawnPromotionPuzzlePlugin } from "./pawn-promotion-puzzle/index.js";
import { chessBackRankPlugin } from "./chess-back-rank/index.js";
import { textAdventureMiniPlugin } from "./text-adventure-mini/index.js";
import { cyoaFantasyPlugin } from "./cyoa-fantasy/index.js";
import { cyoaHorrorPlugin } from "./cyoa-horror/index.js";
import { questTavernPlugin } from "./quest-tavern/index.js";
import { monsterSlayerPlugin } from "./monster-slayer/index.js";
import { lootGoblinPlugin } from "./loot-goblin/index.js";
import { arenaChampionPlugin } from "./arena-champion/index.js";
import { tombOfKingsPlugin } from "./tomb-of-kings/index.js";
import { acronymQuizPlugin } from "./acronym-quiz/index.js";
import { idiomQuizPlugin } from "./idiom-quiz/index.js";
import { homophoneMatchPlugin } from "./homophone-match/index.js";
import { silentLettersPlugin } from "./silent-letters/index.js";
import { prefixSuffixPlugin } from "./prefix-suffix/index.js";
import { grammarFixPlugin } from "./grammar-fix/index.js";
import { anagramPairPlugin } from "./anagram-pair/index.js";
import { rhymeFinderPlugin } from "./rhyme-finder/index.js";
import { kalahPlugin } from "./kalah/index.js";
import { brandubPlugin } from "./brandub/index.js";
import { tawlbwrddPlugin } from "./tawlbwrdd/index.js";
import { connect6Plugin } from "./connect6/index.js";
import { havannahPlugin } from "./havannah/index.js";
import { hareAndHoundsPlugin } from "./hare-and-hounds/index.js";
import { wolfAndSheepPlugin } from "./wolf-and-sheep/index.js";
import { cathedralGamePlugin } from "./cathedral-game/index.js";
import { safeDriverPlugin } from "./safe-driver/index.js";
import { submarineSonarPlugin } from "./submarine-sonar/index.js";
import { nimMultiPlugin } from "./nim-multi/index.js";
import { tripleDicePlugin } from "./triple-dice/index.js";
import { rollAndWriteProPlugin } from "./roll-and-write-pro/index.js";
import { solitaireMarathonPlugin } from "./solitaire-marathon/index.js";
import { towerOfHanoi7Plugin } from "./tower-of-hanoi-7/index.js";
import { swarmDefensePlugin } from "./swarm-defense/index.js";

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
  chess960Plugin as unknown as GamePlugin,
  racingKingsPlugin as unknown as GamePlugin,
  hordeChessPlugin as unknown as GamePlugin,
  threeCheckPlugin as unknown as GamePlugin,
  crazyhousePlugin as unknown as GamePlugin,
  kingOfTheHillPlugin as unknown as GamePlugin,
  antichessPlugin as unknown as GamePlugin,
  progressiveChessPlugin as unknown as GamePlugin,
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
  logicGridPlugin as unknown as GamePlugin,
  bridgesPlugin as unknown as GamePlugin,
  dominoPlacementPlugin as unknown as GamePlugin,
  kropkiPlugin as unknown as GamePlugin,
  thermometerPlugin as unknown as GamePlugin,
  numberlinkPlugin as unknown as GamePlugin,
  kakurasuPlugin as unknown as GamePlugin,
  laserMazePlugin as unknown as GamePlugin,
  cuckooPlugin as unknown as GamePlugin,
  germanWhistPlugin as unknown as GamePlugin,
  knockOutWhistPlugin as unknown as GamePlugin,
  bastraPlugin as unknown as GamePlugin,
  agramPlugin as unknown as GamePlugin,
  scatPlugin as unknown as GamePlugin,
  doubleDummyWhistPlugin as unknown as GamePlugin,
  twentyNinePlugin as unknown as GamePlugin,
  auldLangSynePlugin as unknown as GamePlugin,
  klondikeSuperSolverPlugin as unknown as GamePlugin,
  calculationPlugin as unknown as GamePlugin,
  pokerSolitairePlugin as unknown as GamePlugin,
  pyramidGolfPlugin as unknown as GamePlugin,
  nestorPlugin as unknown as GamePlugin,
  fortyEightOneDeckPlugin as unknown as GamePlugin,
  dozenPlugin as unknown as GamePlugin,
  candyLandPlugin as unknown as GamePlugin,
  hiHoCherryOPlugin as unknown as GamePlugin,
  dontBreakIcePlugin as unknown as GamePlugin,
  popThePigPlugin as unknown as GamePlugin,
  operationGamePlugin as unknown as GamePlugin,
  guessWhoPlugin as unknown as GamePlugin,
  chutesLaddersKidsPlugin as unknown as GamePlugin,
  connectLightsPlugin as unknown as GamePlugin,
  rollASixPlugin as unknown as GamePlugin,
  highCardDrawPlugin as unknown as GamePlugin,
  pennyFlipPlugin as unknown as GamePlugin,
  oddDicePlugin as unknown as GamePlugin,
  mathBingoPlugin as unknown as GamePlugin,
  balloonPopPlugin as unknown as GamePlugin,
  cardLineupPlugin as unknown as GamePlugin,
  numberMazePlugin as unknown as GamePlugin,
  generalTriviaPlugin as unknown as GamePlugin,
  twoTruthsLiePlugin as unknown as GamePlugin,
  wouldYouRatherPlugin as unknown as GamePlugin,
  triviaTowerPlugin as unknown as GamePlugin,
  wordAssociationPlugin as unknown as GamePlugin,
  rhymeTimePlugin as unknown as GamePlugin,
  charadesPlugin as unknown as GamePlugin,
  pictionaryPlugin as unknown as GamePlugin,
  flappyBirdPlugin as unknown as GamePlugin,
  doodleJumpPlugin as unknown as GamePlugin,
  helicopterPlugin as unknown as GamePlugin,
  wallJumperPlugin as unknown as GamePlugin,
  tapRunnerPlugin as unknown as GamePlugin,
  meteorDodgerPlugin as unknown as GamePlugin,
  paddleBallPlugin as unknown as GamePlugin,
  ringThrowerPlugin as unknown as GamePlugin,
  rikudoPlugin as unknown as GamePlugin,
  kingsAndKnightsPlugin as unknown as GamePlugin,
  battleshipSolitairePlugin as unknown as GamePlugin,
  trainTracksPlugin as unknown as GamePlugin,
  stitchesPlugin as unknown as GamePlugin,
  rangePlugin as unknown as GamePlugin,
  shakashakaPlugin as unknown as GamePlugin,
  crossTheStreamsPlugin as unknown as GamePlugin,
  lcrPlugin as unknown as GamePlugin,
  snakesRacePlugin as unknown as GamePlugin,
  rollRightPlugin as unknown as GamePlugin,
  diddlerPlugin as unknown as GamePlugin,
  fifteensPlugin as unknown as GamePlugin,
  napoleonsTombPlugin as unknown as GamePlugin,
  quickTickPlugin as unknown as GamePlugin,
  paperTossPlugin as unknown as GamePlugin,
  brainiacPlugin as unknown as GamePlugin,
  narcoticPlugin as unknown as GamePlugin,
  bisleyPlugin as unknown as GamePlugin,
  kingsPlugin as unknown as GamePlugin,
  gizaPlugin as unknown as GamePlugin,
  alhambraPlugin as unknown as GamePlugin,
  pouncePlugin as unknown as GamePlugin,
  capriciesePlugin as unknown as GamePlugin,
  bigTwoPlugin as unknown as GamePlugin,
  tienLenPlugin as unknown as GamePlugin,
  pusoyDosPlugin as unknown as GamePlugin,
  nineCardBragPlugin as unknown as GamePlugin,
  presidentsPlugin as unknown as GamePlugin,
  rideTheBusPlugin as unknown as GamePlugin,
  pokerSquares2PPlugin as unknown as GamePlugin,
  californiaJackPlugin as unknown as GamePlugin,
  wheelSpinPlugin as unknown as GamePlugin,
  priceGuessPlugin as unknown as GamePlugin,
  dealOrNoDealPlugin as unknown as GamePlugin,
  jeopardyLikePlugin as unknown as GamePlugin,
  familyFeudPlugin as unknown as GamePlugin,
  lightningRoundPlugin as unknown as GamePlugin,
  millionairePlugin as unknown as GamePlugin,
  cashCabPlugin as unknown as GamePlugin,
  timesTablesPlugin as unknown as GamePlugin,
  divisionDrillPlugin as unknown as GamePlugin,
  fractionMatcherPlugin as unknown as GamePlugin,
  sequencePredictorPlugin as unknown as GamePlugin,
  unitConverterQuizPlugin as unknown as GamePlugin,
  percentCalculatorPlugin as unknown as GamePlugin,
  geographyQuizPlugin as unknown as GamePlugin,
  chemistryQuizPlugin as unknown as GamePlugin,
  blackjackSwitchPlugin as unknown as GamePlugin,
  spanish21Plugin as unknown as GamePlugin,
  pontoonPlugin as unknown as GamePlugin,
  videoKenoPlugin as unknown as GamePlugin,
  bonus6Plugin as unknown as GamePlugin,
  anteUpBlackjackPlugin as unknown as GamePlugin,
  casinoHoldemPlugin as unknown as GamePlugin,
  mississippiStudPlugin as unknown as GamePlugin,
  surakartaPlugin as unknown as GamePlugin,
  yotePlugin as unknown as GamePlugin,
  muTorerePlugin as unknown as GamePlugin,
  shobuPlugin as unknown as GamePlugin,
  loaSmallPlugin as unknown as GamePlugin,
  tumbleweedPlugin as unknown as GamePlugin,
  pentalathPlugin as unknown as GamePlugin,
  slitherPlugin as unknown as GamePlugin,
  numberMemoryPlugin as unknown as GamePlugin,
  colorSequencePlugin as unknown as GamePlugin,
  imageMemoryPlugin as unknown as GamePlugin,
  dualNBackPlugin as unknown as GamePlugin,
  patternRecallPlugin as unknown as GamePlugin,
  quickCountingPlugin as unknown as GamePlugin,
  oddShapeOutPlugin as unknown as GamePlugin,
  faceRecognitionPlugin as unknown as GamePlugin,
  fortuneTellerPlugin as unknown as GamePlugin,
  magic8BallPlugin as unknown as GamePlugin,
  coinCollectorPlugin as unknown as GamePlugin,
  diceLadderPlugin as unknown as GamePlugin,
  leafBlowerPlugin as unknown as GamePlugin,
  puzzleBoxPlugin as unknown as GamePlugin,
  cardSpinnerPlugin as unknown as GamePlugin,
  rollEmPlugin as unknown as GamePlugin,
  trucoPlugin as unknown as GamePlugin,
  escobaPlugin as unknown as GamePlugin,
  chinchonPlugin as unknown as GamePlugin,
  durakPlugin as unknown as GamePlugin,
  trucoPaulistaPlugin as unknown as GamePlugin,
  tarneebPlugin as unknown as GamePlugin,
  tonkPlugin as unknown as GamePlugin,
  kachuufiPlugin as unknown as GamePlugin,
  lemonadeStandPlugin as unknown as GamePlugin,
  farmTycoonPlugin as unknown as GamePlugin,
  stockMarketMiniPlugin as unknown as GamePlugin,
  cityBuilderMicroPlugin as unknown as GamePlugin,
  zooKeeperPlugin as unknown as GamePlugin,
  islandSurvivalPlugin as unknown as GamePlugin,
  piratesBountyPlugin as unknown as GamePlugin,
  spaceColonyPlugin as unknown as GamePlugin,
  pool8BallPlugin as unknown as GamePlugin,
  billiards9BallPlugin as unknown as GamePlugin,
  shuffleboardPlugin as unknown as GamePlugin,
  miniGolfPlugin as unknown as GamePlugin,
  golf18Plugin as unknown as GamePlugin,
  basketballFTPlugin as unknown as GamePlugin,
  fieldGoalPlugin as unknown as GamePlugin,
  tennisServePlugin as unknown as GamePlugin,
  farmManagerPlugin as unknown as GamePlugin,
  stockTickerPlugin as unknown as GamePlugin,
  storehousePlugin as unknown as GamePlugin,
  milliganCellPlugin as unknown as GamePlugin,
  doubleFreeCellPlugin as unknown as GamePlugin,
  westcliffEasyPlugin as unknown as GamePlugin,
  nonogram5x5Plugin as unknown as GamePlugin,
  battleshipSoloPlugin as unknown as GamePlugin,
  lightSwitchPuzzlePlugin as unknown as GamePlugin,
  numberChainPlugin as unknown as GamePlugin,
  pegSolitairePlusPlugin as unknown as GamePlugin,
  logicGatesSimPlugin as unknown as GamePlugin,
  cipherCrackPlugin as unknown as GamePlugin,
  binaryPuzzlePlugin as unknown as GamePlugin,
  colorMatchDashPlugin as unknown as GamePlugin,
  rhythmTapPlugin as unknown as GamePlugin,
  stackTowerPlugin as unknown as GamePlugin,
  planeDodgePlugin as unknown as GamePlugin,
  laserDodgePlugin as unknown as GamePlugin,
  bubblePopChainPlugin as unknown as GamePlugin,
  whackAVirusPlugin as unknown as GamePlugin,
  tunnelRunnerPlugin as unknown as GamePlugin,
  wordScramblePlugin as unknown as GamePlugin,
  categoryQuizPlugin as unknown as GamePlugin,
  missingLettersPlugin as unknown as GamePlugin,
  synonymMatchPlugin as unknown as GamePlugin,
  deucesWildPlugin as unknown as GamePlugin,
  doubleBonusPokerPlugin as unknown as GamePlugin,
  miniRoulettePlugin as unknown as GamePlugin,
  highLowCasinoPlugin as unknown as GamePlugin,
  casinoWarMultiPlugin as unknown as GamePlugin,
  kenoMiniPlugin as unknown as GamePlugin,
  fanTanPlugin as unknown as GamePlugin,
  dragonTigerPlugin as unknown as GamePlugin,
  fortressSolitairePlugin as unknown as GamePlugin,
  seaHavenTowersPlugin as unknown as GamePlugin,
  canfieldStorehousePlugin as unknown as GamePlugin,
  cornersSolitairePlugin as unknown as GamePlugin,
  kingAlbertPlugin as unknown as GamePlugin,
  napoleonAtSaintHelenaPlugin as unknown as GamePlugin,
  fourSeasonsPlugin as unknown as GamePlugin,
  deucesSolitairePlugin as unknown as GamePlugin,
  agonPlugin as unknown as GamePlugin,
  turkishDraughtsPlugin as unknown as GamePlugin,
  armenianDraughtsPlugin as unknown as GamePlugin,
  foxAndGeesePlugin as unknown as GamePlugin,
  kharbagaPlugin as unknown as GamePlugin,
  gomokuProPlugin as unknown as GamePlugin,
  fiveFieldKonoPlugin as unknown as GamePlugin,
  baghChalPlugin as unknown as GamePlugin,
  dropDeadPlugin as unknown as GamePlugin,
  mexicoDicePlugin as unknown as GamePlugin,
  zilchPlugin as unknown as GamePlugin,
  twentySixPlugin as unknown as GamePlugin,
  qwixxPlugin as unknown as GamePlugin,
  rollThroughAgesPlugin as unknown as GamePlugin,
  macaoDicePlugin as unknown as GamePlugin,
  helanGarPlugin as unknown as GamePlugin,
  floodItPlugin as unknown as GamePlugin,
  colorLinesPlugin as unknown as GamePlugin,
  dominosaPlugin as unknown as GamePlugin,
  kyodaiPlugin as unknown as GamePlugin,
  pipeManiaPlugin as unknown as GamePlugin,
  hexMatch3Plugin as unknown as GamePlugin,
  rotateMatchPlugin as unknown as GamePlugin,
  triangleMatchPlugin as unknown as GamePlugin,
  tradingPostPlugin as unknown as GamePlugin,
  resourceChainPlugin as unknown as GamePlugin,
  dungeonDelvePlugin as unknown as GamePlugin,
  kingdomBuilderPlugin as unknown as GamePlugin,
  alchemyShopPlugin as unknown as GamePlugin,
  spyHeistPlugin as unknown as GamePlugin,
  towerDefenseMiniPlugin as unknown as GamePlugin,
  fishingVillagePlugin as unknown as GamePlugin,
  codeBreakerPlugin as unknown as GamePlugin,
  roundTheClockPlugin as unknown as GamePlugin,
  galaxyFormationPlugin as unknown as GamePlugin,
  tunnelDigPlugin as unknown as GamePlugin,
  qJumpPlugin as unknown as GamePlugin,
  barrelJumperPlugin as unknown as GamePlugin,
  skyJoustPlugin as unknown as GamePlugin,
  skyDefenderPlugin as unknown as GamePlugin,
  iceBlocksPlugin as unknown as GamePlugin,
  lunarDescentPlugin as unknown as GamePlugin,
  schafkopfPlugin as unknown as GamePlugin,
  ohHellPlugin as unknown as GamePlugin,
  bourrePlugin as unknown as GamePlugin,
  fortyFivesPlugin as unknown as GamePlugin,
  beziquePlugin as unknown as GamePlugin,
  piquetPlugin as unknown as GamePlugin,
  soloWhistPlugin as unknown as GamePlugin,
  bostonPlugin as unknown as GamePlugin,
  cannonShotPlugin as unknown as GamePlugin,
  archeryTargetPlugin as unknown as GamePlugin,
  dartThrowPlugin as unknown as GamePlugin,
  axeThrowPlugin as unknown as GamePlugin,
  pendulumDropPlugin as unknown as GamePlugin,
  marbleDropPlugin as unknown as GamePlugin,
  catapultCastlePlugin as unknown as GamePlugin,
  skeeBallPlugin as unknown as GamePlugin,
  additionSprintPlugin as unknown as GamePlugin,
  subtractionSprintPlugin as unknown as GamePlugin,
  algebraSolveXPlugin as unknown as GamePlugin,
  orderOfOpsPlugin as unknown as GamePlugin,
  primeFactorPlugin as unknown as GamePlugin,
  exponentDrillPlugin as unknown as GamePlugin,
  romanNumeralsPlugin as unknown as GamePlugin,
  numberBondsPlugin as unknown as GamePlugin,
  memoryPairsKidsPlugin as unknown as GamePlugin,
  countingBearsPlugin as unknown as GamePlugin,
  applePickingPlugin as unknown as GamePlugin,
  farmyardMatchPlugin as unknown as GamePlugin,
  treasureHuntPlugin as unknown as GamePlugin,
  rainbowSortPlugin as unknown as GamePlugin,
  alphabetCatchPlugin as unknown as GamePlugin,
  numberOrderPlugin as unknown as GamePlugin,
  gridRoguePlugin as unknown as GamePlugin,
  cardCrawlerPlugin as unknown as GamePlugin,
  diceDungeonPlugin as unknown as GamePlugin,
  slayTheDeckPlugin as unknown as GamePlugin,
  mineDelverPlugin as unknown as GamePlugin,
  cursedCryptPlugin as unknown as GamePlugin,
  dragonHuntPlugin as unknown as GamePlugin,
  wizardTowerPlugin as unknown as GamePlugin,
  neverHaveIEverPlugin as unknown as GamePlugin,
  truthOrDarePlugin as unknown as GamePlugin,
  mostLikelyToPlugin as unknown as GamePlugin,
  hotSeatPlugin as unknown as GamePlugin,
  storyBuilderPlugin as unknown as GamePlugin,
  fiveSecondRulePlugin as unknown as GamePlugin,
  headsUpPlugin as unknown as GamePlugin,
  hotTakePlugin as unknown as GamePlugin,
  daifugoPlugin as unknown as GamePlugin,
  tichuPlugin as unknown as GamePlugin,
  lastCardPlugin as unknown as GamePlugin,
  maoPlugin as unknown as GamePlugin,
  stopTheBusPlugin as unknown as GamePlugin,
  zhengPlugin as unknown as GamePlugin,
  newmarketPlugin as unknown as GamePlugin,
  michiganPlugin as unknown as GamePlugin,
  arrowSudokuPlugin as unknown as GamePlugin,
  mosaicPuzzlePlugin as unknown as GamePlugin,
  nurimisakiPlugin as unknown as GamePlugin,
  castleWallPlugin as unknown as GamePlugin,
  galaxiesPuzzlePlugin as unknown as GamePlugin,
  corralPuzzlePlugin as unknown as GamePlugin,
  countryRoadPlugin as unknown as GamePlugin,
  pearlPuzzlePlugin as unknown as GamePlugin,
  typingWordsPlugin as unknown as GamePlugin,
  typingQuotesPlugin as unknown as GamePlugin,
  verbalMemoryPlugin as unknown as GamePlugin,
  chimpTestPlugin as unknown as GamePlugin,
  stroopTestPlugin as unknown as GamePlugin,
  digitSpanPlugin as unknown as GamePlugin,
  aimTrainerPlugin as unknown as GamePlugin,
  visualMemoryGridPlugin as unknown as GamePlugin,
  homeRunDerbyPlugin as unknown as GamePlugin,
  soccerPenaltyPlugin as unknown as GamePlugin,
  hockeyShootoutPlugin as unknown as GamePlugin,
  pingPongRallyPlugin as unknown as GamePlugin,
  longJumpPlugin as unknown as GamePlugin,
  discusPlugin as unknown as GamePlugin,
  curlingPlugin as unknown as GamePlugin,
  darts501Plugin as unknown as GamePlugin,
  cookieClickerMiniPlugin as unknown as GamePlugin,
  idleMinerPlugin as unknown as GamePlugin,
  bpmTapPlugin as unknown as GamePlugin,
  hexColorGuessPlugin as unknown as GamePlugin,
  rgbMixerPlugin as unknown as GamePlugin,
  keyboardWarriorPlugin as unknown as GamePlugin,
  dicePredictionPlugin as unknown as GamePlugin,
  breathGaugePlugin as unknown as GamePlugin,
  osmosisPlugin as unknown as GamePlugin,
  shamrocksPlugin as unknown as GamePlugin,
  terracePlugin as unknown as GamePlugin,
  marthaPlugin as unknown as GamePlugin,
  littleSpiderPlugin as unknown as GamePlugin,
  quadrillePlugin as unknown as GamePlugin,
  rankAndFilePlugin as unknown as GamePlugin,
  royalCotillionPlugin as unknown as GamePlugin,
  senetPlugin as unknown as GamePlugin,
  royalGameOfUrPlugin as unknown as GamePlugin,
  morabarabaPlugin as unknown as GamePlugin,
  picariaPlugin as unknown as GamePlugin,
  seegaPlugin as unknown as GamePlugin,
  frisianDraughtsPlugin as unknown as GamePlugin,
  russianDraughtsPlugin as unknown as GamePlugin,
  poolCheckersPlugin as unknown as GamePlugin,
  eggCatcherPlugin as unknown as GamePlugin,
  fishFeederPlugin as unknown as GamePlugin,
  ninjaHopPlugin as unknown as GamePlugin,
  samuraiSlicePlugin as unknown as GamePlugin,
  caveFlyerPlugin as unknown as GamePlugin,
  dodgeCarsPlugin as unknown as GamePlugin,
  parachuteDropPlugin as unknown as GamePlugin,
  swarmShootPlugin as unknown as GamePlugin,
  moviesTriviaPlugin as unknown as GamePlugin,
  musicTriviaPlugin as unknown as GamePlugin,
  sportsTriviaPlugin as unknown as GamePlugin,
  scienceTriviaPlugin as unknown as GamePlugin,
  historyTriviaPlugin as unknown as GamePlugin,
  mythologyQuizPlugin as unknown as GamePlugin,
  spaceQuizPlugin as unknown as GamePlugin,
  foodQuizPlugin as unknown as GamePlugin,
  animalQuizPlugin as unknown as GamePlugin,
  phrazlePlugin as unknown as GamePlugin,
  connectionsPlugin as unknown as GamePlugin,
  compoundWordPlugin as unknown as GamePlugin,
  wordPyramidPlugin as unknown as GamePlugin,
  panagramPlugin as unknown as GamePlugin,
  lastLetterPlugin as unknown as GamePlugin,
  phrasePuzzlePlugin as unknown as GamePlugin,
  wordHuntPlugin as unknown as GamePlugin,
  restaurantTycoonPlugin as unknown as GamePlugin,
  coffeeShopPlugin as unknown as GamePlugin,
  hotelTycoonPlugin as unknown as GamePlugin,
  airlineSimPlugin as unknown as GamePlugin,
  bakeryShopPlugin as unknown as GamePlugin,
  oilTycoonPlugin as unknown as GamePlugin,
  factoryLinePlugin as unknown as GamePlugin,
  gameDevStudioPlugin as unknown as GamePlugin,
  idleFarmerPlugin as unknown as GamePlugin,
  idleWizardPlugin as unknown as GamePlugin,
  idleBlacksmithPlugin as unknown as GamePlugin,
  idleWarriorPlugin as unknown as GamePlugin,
  idleBakerPlugin as unknown as GamePlugin,
  gemClickerPlugin as unknown as GamePlugin,
  goldRushIdlePlugin as unknown as GamePlugin,
  prestigeClickerPlugin as unknown as GamePlugin,
  klondikeDicePlugin as unknown as GamePlugin,
  goingToBostonPlugin as unknown as GamePlugin,
  cosmicWimpoutPlugin as unknown as GamePlugin,
  cragPlugin as unknown as GamePlugin,
  crownAndAnchorPlugin as unknown as GamePlugin,
  fourFiveSixPlugin as unknown as GamePlugin,
  streetCrapsPlugin as unknown as GamePlugin,
  pirateDicePlugin as unknown as GamePlugin,
  napoleonCardPlugin as unknown as GamePlugin,
  ecartePlugin as unknown as GamePlugin,
  tarockPlugin as unknown as GamePlugin,
  pidroPlugin as unknown as GamePlugin,
  hokmPlugin as unknown as GamePlugin,
  ultiPlugin as unknown as GamePlugin,
  klopPlugin as unknown as GamePlugin,
  sjavsPlugin as unknown as GamePlugin,
  cubeRollPlugin as unknown as GamePlugin,
  tiltMazePlugin as unknown as GamePlugin,
  tubeColorPlugin as unknown as GamePlugin,
  wireConnectPlugin as unknown as GamePlugin,
  mirrorMazePlugin as unknown as GamePlugin,
  gearPuzzlePlugin as unknown as GamePlugin,
  pentominoPuzzlePlugin as unknown as GamePlugin,
  parkingPuzzlePlugin as unknown as GamePlugin,
  classicMazePlugin as unknown as GamePlugin,
  fogMazePlugin as unknown as GamePlugin,
  keyMazePlugin as unknown as GamePlugin,
  iceSlideMazePlugin as unknown as GamePlugin,
  teleportMazePlugin as unknown as GamePlugin,
  ghostMazePlugin as unknown as GamePlugin,
  gravityMazePlugin as unknown as GamePlugin,
  coloredTileMazePlugin as unknown as GamePlugin,
  wishPlugin as unknown as GamePlugin,
  royalMarriagePlugin as unknown as GamePlugin,
  jubileePlugin as unknown as GamePlugin,
  intelligencePlugin as unknown as GamePlugin,
  eagleWingPlugin as unknown as GamePlugin,
  demonPlugin as unknown as GamePlugin,
  coloradoPlugin as unknown as GamePlugin,
  algerianPatiencePlugin as unknown as GamePlugin,
  interregnumPlugin as unknown as GamePlugin,
  boxerKnockoutPlugin as unknown as GamePlugin,
  tankBattlePlugin as unknown as GamePlugin,
  pixelRunnerPlugin as unknown as GamePlugin,
  castleDefenderPlugin as unknown as GamePlugin,
  submarineHuntPlugin as unknown as GamePlugin,
  pinballMiniPlugin as unknown as GamePlugin,
  ufoRescuePlugin as unknown as GamePlugin,
  motorcycleJumpPlugin as unknown as GamePlugin,
  einsteinPuzzlePlugin as unknown as GamePlugin,
  weighingPuzzlePlugin as unknown as GamePlugin,
  prisonerHatPlugin as unknown as GamePlugin,
  montyHallPlugin as unknown as GamePlugin,
  seatingPuzzlePlugin as unknown as GamePlugin,
  safeCrackerPlugin as unknown as GamePlugin,
  riddleMachinePlugin as unknown as GamePlugin,
  digitDeducePlugin as unknown as GamePlugin,
  spoonsPlugin as unknown as GamePlugin,
  palacePlugin as unknown as GamePlugin,
  parliamentPlugin as unknown as GamePlugin,
  karmaCardPlugin as unknown as GamePlugin,
  garbageCardPlugin as unknown as GamePlugin,
  pigCardPlugin as unknown as GamePlugin,
  playOrPayPlugin as unknown as GamePlugin,
  snipSnapSnoremPlugin as unknown as GamePlugin,
  christmasCookiePlugin as unknown as GamePlugin,
  easterEggHuntPlugin as unknown as GamePlugin,
  halloweenPumpkinPlugin as unknown as GamePlugin,
  valentineMatchPlugin as unknown as GamePlugin,
  wizardSpellCastPlugin as unknown as GamePlugin,
  dragonEggHatchPlugin as unknown as GamePlugin,
  robotArenaPlugin as unknown as GamePlugin,
  marsColonyPlugin as unknown as GamePlugin,
  antFarmPlugin as unknown as GamePlugin,
  auctionGamePlugin as unknown as GamePlugin,
  pizzaRushPlugin as unknown as GamePlugin,
  stockDayTraderPlugin as unknown as GamePlugin,
  taxiDriverPlugin as unknown as GamePlugin,
  foragerGamePlugin as unknown as GamePlugin,
  spaceTraderPlugin as unknown as GamePlugin,
  bountyHunterPlugin as unknown as GamePlugin,
  boggleProPlugin as unknown as GamePlugin,
  slotMachineProPlugin as unknown as GamePlugin,
  diceStackPlugin as unknown as GamePlugin,
  towerBuilderPlugin as unknown as GamePlugin,
  bottleFlipPlugin as unknown as GamePlugin,
  paperAirplanePlugin as unknown as GamePlugin,
  frisbeeTossPlugin as unknown as GamePlugin,
  boomerangThrowPlugin as unknown as GamePlugin,
  targetShooterPlugin as unknown as GamePlugin,
  marbleRollPlugin as unknown as GamePlugin,
  cupFlipPlugin as unknown as GamePlugin,
  slingshotLaunchPlugin as unknown as GamePlugin,
  australianPatiencePlugin as unknown as GamePlugin,
  betsyRossPlugin as unknown as GamePlugin,
  florentinePlugin as unknown as GamePlugin,
  fourLeafCloverPlugin as unknown as GamePlugin,
  kingsRowPlugin as unknown as GamePlugin,
  precedencePlugin as unknown as GamePlugin,
  tripletsPlugin as unknown as GamePlugin,
  paganiniPlugin as unknown as GamePlugin,
  danceArrowsPlugin as unknown as GamePlugin,
  melodyRepeaterPlugin as unknown as GamePlugin,
  morseTapPlugin as unknown as GamePlugin,
  sequenceFlashPlugin as unknown as GamePlugin,
  drumPadPlugin as unknown as GamePlugin,
  mosaicCopyPlugin as unknown as GamePlugin,
  repeatAfterMePlugin as unknown as GamePlugin,
  rhythmLadderPlugin as unknown as GamePlugin,
  cosmicDicePlugin as unknown as GamePlugin,
  vikingDicePlugin as unknown as GamePlugin,
  medievalDicePlugin as unknown as GamePlugin,
  cowboyDicePlugin as unknown as GamePlugin,
  samuraiDicePlugin as unknown as GamePlugin,
  diceBaseballPlugin as unknown as GamePlugin,
  diceGolfPlugin as unknown as GamePlugin,
  straightOrBustPlugin as unknown as GamePlugin,
  mateIn1Plugin as unknown as GamePlugin,
  mateIn2Plugin as unknown as GamePlugin,
  mateIn3Plugin as unknown as GamePlugin,
  chessTacticsPlugin as unknown as GamePlugin,
  chessEndgameKrPlugin as unknown as GamePlugin,
  chessEndgameKqkPlugin as unknown as GamePlugin,
  pawnPromotionPuzzlePlugin as unknown as GamePlugin,
  chessBackRankPlugin as unknown as GamePlugin,
  textAdventureMiniPlugin as unknown as GamePlugin,
  cyoaFantasyPlugin as unknown as GamePlugin,
  cyoaHorrorPlugin as unknown as GamePlugin,
  questTavernPlugin as unknown as GamePlugin,
  monsterSlayerPlugin as unknown as GamePlugin,
  lootGoblinPlugin as unknown as GamePlugin,
  arenaChampionPlugin as unknown as GamePlugin,
  tombOfKingsPlugin as unknown as GamePlugin,
  acronymQuizPlugin as unknown as GamePlugin,
  idiomQuizPlugin as unknown as GamePlugin,
  homophoneMatchPlugin as unknown as GamePlugin,
  silentLettersPlugin as unknown as GamePlugin,
  prefixSuffixPlugin as unknown as GamePlugin,
  grammarFixPlugin as unknown as GamePlugin,
  anagramPairPlugin as unknown as GamePlugin,
  rhymeFinderPlugin as unknown as GamePlugin,
  kalahPlugin as unknown as GamePlugin,
  brandubPlugin as unknown as GamePlugin,
  tawlbwrddPlugin as unknown as GamePlugin,
  connect6Plugin as unknown as GamePlugin,
  havannahPlugin as unknown as GamePlugin,
  hareAndHoundsPlugin as unknown as GamePlugin,
  wolfAndSheepPlugin as unknown as GamePlugin,
  cathedralGamePlugin as unknown as GamePlugin,
  safeDriverPlugin as unknown as GamePlugin,
  submarineSonarPlugin as unknown as GamePlugin,
  nimMultiPlugin as unknown as GamePlugin,
  tripleDicePlugin as unknown as GamePlugin,
  rollAndWriteProPlugin as unknown as GamePlugin,
  solitaireMarathonPlugin as unknown as GamePlugin,
  towerOfHanoi7Plugin as unknown as GamePlugin,
  swarmDefensePlugin as unknown as GamePlugin,
];

import type { GamePlugin } from "../platform/game-plugin/types.js";
import { travelersPatiencePlugin } from "./travelers-patience/index.js";
import { towerLondonSoliPlugin } from "./tower-london-soli/index.js";
import { vegasKlondikePlugin } from "./vegas-klondike/index.js";
import { batsfordPatPlugin } from "./batsford-pat/index.js";
import { duchessPatPlugin } from "./duchess-pat/index.js";
import { moosehideYukonPlugin } from "./moosehide-yukon/index.js";
import { eagleWingPatPlugin } from "./eagle-wing-pat/index.js";
import { aboveAndBelowPatPlugin } from "./above-and-below-pat/index.js";
import { headsTailsPatPlugin } from "./heads-tails-pat/index.js";
import { kingsQueensPatPlugin } from "./kings-queens-pat/index.js";
import { florentineSoliPlugin } from "./florentine-soli/index.js";
import { carltonSoliPlugin } from "./carlton-soli/index.js";
import { quiltPatPlugin } from "./quilt-pat/index.js";
import { midnightOilPatPlugin } from "./midnight-oil-pat/index.js";
import { bisleyKingPlugin } from "./bisley-king/index.js";
import { kingAlbertPatPlugin } from "./king-albert-pat/index.js";
import { quadrupleAlliancePatPlugin } from "./quadruple-alliance-pat/index.js";
import { fourteenOutPatPlugin } from "./fourteen-out-pat/index.js";
import { doubletsPatPlugin } from "./doublets-pat/index.js";
import { carpetSoliPlugin } from "./carpet-soli/index.js";
import { spitOceanCasPlugin } from "./spit-ocean-cas/index.js";
import { crazyPineappleCasPlugin } from "./crazy-pineapple-cas/index.js";
import { lazyPineappleCasPlugin } from "./lazy-pineapple-cas/index.js";
import { courchevelCasPlugin } from "./courchevel-cas/index.js";
import { omahaSixCardHiPlugin } from "./omaha-six-card-hi/index.js";
import { sevenCardStudHiLoCasPlugin } from "./seven-card-stud-hi-lo-cas/index.js";
import { mississippiStudCasPlugin } from "./mississippi-stud-cas/index.js";
import { jackpotsPokerPlugin } from "./jackpots-poker/index.js";
import { anacondaCasPlugin } from "./anaconda-cas/index.js";
import { badeuceyCasPlugin } from "./badeucey-cas/index.js";
import { badaceyCasPlugin } from "./badacey-cas/index.js";
import { horseCasPlugin } from "./horse-cas/index.js";
import { hoseCasPlugin } from "./hose-cas/index.js";
import { ofcPineappleCasPlugin } from "./ofc-pineapple-cas/index.js";
import { headsUpBjPlugin } from "./heads-up-bj/index.js";
import { multiHandVpThreePlugin } from "./multi-hand-vp-three/index.js";
import { fortunePaiGowCasPlugin } from "./fortune-pai-gow-cas/index.js";
import { paiGowTilesCasPlugin } from "./pai-gow-tiles-cas/index.js";
import { casinoFaroCasPlugin } from "./casino-faro-cas/index.js";
import { flushPokerCasPlugin } from "./flush-poker-cas/index.js";
import { cribbageCrashPlugin } from "./cribbage-crash/index.js";
import { cribbageLurchPlugin } from "./cribbage-lurch/index.js";
import { cribbageSkunkPlugin } from "./cribbage-skunk/index.js";
import { cribbageDoubleSkunkPlugin } from "./cribbage-double-skunk/index.js";
import { cribbageShotgunPlugin } from "./cribbage-shotgun/index.js";
import { cribbageSkunkedRubberPlugin } from "./cribbage-skunked-rubber/index.js";
import { cribbageMugginsVarPlugin } from "./cribbage-muggins-var/index.js";
import { nineMensMorrisPubPlugin } from "./nine-mens-morris-pub/index.js";
import { shuffleboardTablePlugin } from "./shuffleboard-table/index.js";
import { skittlesEnglishPlugin } from "./skittles-english/index.js";
import { skittlesRubberPlugin } from "./skittles-rubber/index.js";
import { skittlesLongAlleyPlugin } from "./skittles-long-alley/index.js";
import { skittlesWestCountryPlugin } from "./skittles-west-country/index.js";
import { ninepinsClassicPlugin } from "./ninepins-classic/index.js";
import { quoitsEnglishPlugin } from "./quoits-english/index.js";
import { quoitsScotsPlugin } from "./quoits-scots/index.js";
import { napWellingtonPlugin } from "./nap-wellington/index.js";
import { napBlucherPlugin } from "./nap-blucher/index.js";
import { bragThreeCardPlugin } from "./brag-three-card/index.js";
import { popeJoanPlugin } from "./pope-joan/index.js";
import { yinshRingsPlugin } from "./yinsh-rings/index.js";
import { zertzMarblesPlugin } from "./zertz-marbles/index.js";
import { tamskTimedPlugin } from "./tamsk-timed/index.js";
import { punctLinePlugin } from "./punct-line/index.js";
import { tzaarStackPlugin } from "./tzaar-stack/index.js";
import { onitamaCardsPlugin } from "./onitama-cards/index.js";
import { martianChessPyramidsPlugin } from "./martian-chess-pyramids/index.js";
import { icehouseStacksPlugin } from "./icehouse-stacks/index.js";
import { zendoKoanPlugin } from "./zendo-koan/index.js";
import { carromFlickPlugin } from "./carrom-flick/index.js";
import { brusselsSproutsPlugin } from "./brussels-sprouts/index.js";
import { sproutsClassicPlugin } from "./sprouts-classic/index.js";
import { hackenbushEdgesPlugin } from "./hackenbush-edges/index.js";
import { oukChatrangPlugin } from "./ouk-chatrang/index.js";
import { shatarMongolianPlugin } from "./shatar-mongolian/index.js";
import { banqiDarkPlugin } from "./banqi-dark/index.js";
import { miniXiangqiPlugin } from "./mini-xiangqi/index.js";
import { ayoayoPlugin } from "./ayoayo/index.js";
import { bohnenspielPlugin } from "./bohnenspiel/index.js";
import { mangalaArabianPlugin } from "./mangala-arabian/index.js";
import { marryBoffKillPlugin } from "./marry-boff-kill/index.js";
import { cardAdventureMiniPlugin } from "./card-adventure-mini/index.js";
import { lewdleCleanPlugin } from "./lewdle-clean/index.js";
import { taylordleSwiftPlugin } from "./taylordle-swift/index.js";
import { weeklyChess960Plugin } from "./weekly-chess960/index.js";
import { fluxxRotatingPlugin } from "./fluxx-rotating/index.js";
import { fluxxOriginalMiniPlugin } from "./fluxx-original-mini/index.js";
import { fluxxStarPlugin } from "./fluxx-star/index.js";
import { fluxxZombiePlugin } from "./fluxx-zombie/index.js";
import { fluxxPiratePlugin } from "./fluxx-pirate/index.js";
import { fluxxCthulhuPlugin } from "./fluxx-cthulhu/index.js";
import { fluxxMontyPythonPlugin } from "./fluxx-monty-python/index.js";
import { parodyOpolyPlugin } from "./parody-opoly/index.js";
import { cheatingMothCardPlugin } from "./cheating-moth-card/index.js";
import { jokingHazardCardPlugin } from "./joking-hazard-card/index.js";
import { drunkStonedStupidPlugin } from "./drunk-stoned-stupid/index.js";
import { dilemmaDeckPlugin } from "./dilemma-deck/index.js";
import { cockroachBluffPlugin } from "./cockroach-bluff/index.js";
import { unstableUnicornsMiniPlugin } from "./unstable-unicorns-mini/index.js";
import { tacoBurritoCardPlugin } from "./taco-burrito-card/index.js";
import { stratBaseballPlugin } from "./strat-baseball/index.js";
import { stratFootballPlugin } from "./strat-football/index.js";
import { stratHockeyPlugin } from "./strat-hockey/index.js";
import { stratBasketballPlugin } from "./strat-basketball/index.js";
import { apbaBaseballPlugin } from "./apba-baseball/index.js";
import { apbaFootballPlugin } from "./apba-football/index.js";
import { replayBaseballPlugin } from "./replay-baseball/index.js";
import { pursuePennantPlugin } from "./pursue-pennant/index.js";
import { negamcoBaseballPlugin } from "./negamco-baseball/index.js";
import { diceFormulaDePlugin } from "./dice-formula-de/index.js";
import { diceRallymanDirtPlugin } from "./dice-rallyman-dirt/index.js";
import { diceThunderPitPlugin } from "./dice-thunder-pit/index.js";
import { diceGrandPrixF1Plugin } from "./dice-grand-prix-f1/index.js";
import { dice301DartsPlugin } from "./dice-301-darts/index.js";
import { diceFatBoyDartsPlugin } from "./dice-fat-boy-darts/index.js";
import { diceGulfDartsPlugin } from "./dice-gulf-darts/index.js";
import { diceFlyFishingPlugin } from "./dice-fly-fishing/index.js";
import { diceDeepSeaFishingPlugin } from "./dice-deep-sea-fishing/index.js";
import { diceIceFishingPlugin } from "./dice-ice-fishing/index.js";
import { diceMmaPlugin } from "./dice-mma/index.js";
import { followQueenRankPlugin } from "./follow-queen-rank/index.js";
import { anacondaPassPlugin } from "./anaconda-pass/index.js";
import { crissCrossBoardPlugin } from "./criss-cross-board/index.js";
import { ironCrossRevealPlugin } from "./iron-cross-reveal/index.js";
import { ticTacToeCardsPlugin } from "./tic-tac-toe-cards/index.js";
import { spitOceanWildPlugin } from "./spit-ocean-wild/index.js";
import { cincinnatiLamebrainsPlugin } from "./cincinnati-lamebrains/index.js";
import { drPepperWildPlugin } from "./dr-pepper-wild/index.js";
import { doubleBonusVpPlugin } from "./double-bonus-vp/index.js";
import { doubleDoubleBonusVpPlugin } from "./double-double-bonus-vp/index.js";
import { bonusDeluxeVpPlugin } from "./bonus-deluxe-vp/index.js";
import { ultimateXPokerPlugin } from "./ultimate-x-poker/index.js";
import { superTimesPayPlugin } from "./super-times-pay/index.js";
import { qwixxMixxerPlugin } from "./qwixx-mixxer/index.js";
import { qwixxConnectedPlugin } from "./qwixx-connected/index.js";
import { ganzCleverPlugin } from "./ganz-clever/index.js";
import { twiceAsCleverPlugin } from "./twice-as-clever/index.js";
import { cleverCubedPlugin } from "./clever-cubed/index.js";
import { fleetDicePlugin } from "./fleet-dice/index.js";
import { rajasDiceCharmersPlugin } from "./rajas-dice-charmers/index.js";
import { rollingRealmsMiniPlugin } from "./rolling-realms-mini/index.js";
import { wingspanDiceGamePlugin } from "./wingspan-dice-game/index.js";
import { panicWallStreetPlugin } from "./panic-wall-street/index.js";
import { coasterParkDicePlugin } from "./coaster-park-dice/index.js";
import { diceHospitalAdmitPlugin } from "./dice-hospital-admit/index.js";
import { starshipCaptainsRollPlugin } from "./starship-captains-roll/index.js";
import { deckscapeSoloRollPlugin } from "./deckscape-solo-roll/index.js";
import { orchardSoloPlugin } from "./orchard-solo/index.js";
import { cantaloopSoloPlugin } from "./cantaloop-solo/index.js";
import { voyagersSoloPlugin } from "./voyagers-solo/index.js";
import { imperialSettlersRwPlugin } from "./imperial-settlers-rw/index.js";
import { underwaterCitiesRwPlugin } from "./underwater-cities-rw/index.js";
import { secondChanceCardsPlugin } from "./second-chance-cards/index.js";
import { kokoroKodamaPlugin } from "./kokoro-kodama/index.js";
import { tigrisEuphratesMiniPlugin } from "./tigris-euphrates-mini/index.js";
import { babyloniaTilesPlugin } from "./babylonia-tiles/index.js";
import { ingeniousHexMiniPlugin } from "./ingenious-hex-mini/index.js";
import { blokusTrigonMiniPlugin } from "./blokus-trigon-mini/index.js";
import { draftosaurusMiniPlugin } from "./draftosaurus-mini/index.js";
import { verdantHouseplantPlugin } from "./verdant-houseplant/index.js";
import { ukiyoTilePlugin } from "./ukiyo-tile/index.js";
import { springMeadowMiniPlugin } from "./spring-meadow-mini/index.js";
import { indianSummerMiniPlugin } from "./indian-summer-mini/index.js";
import { dragonDiceArenaPlugin } from "./dragon-dice-arena/index.js";
import { quarmageddonDicePlugin } from "./quarmageddon-dice/index.js";
import { tinyEpicGalaxyRollPlugin } from "./tiny-epic-galaxy-roll/index.js";
import { valeriaDiceBuildPlugin } from "./valeria-dice-build/index.js";
import { happySalmonMiniPlugin } from "./happy-salmon-mini/index.js";
import { throwThrowBurritoQuizPlugin } from "./throw-throw-burrito-quiz/index.js";
import { tacoCatGoatQuizPlugin } from "./taco-cat-goat-quiz/index.js";
import { trialTrolleyQuizPlugin } from "./trial-trolley-quiz/index.js";
import { fakeArtistQuizPlugin } from "./fake-artist-quiz/index.js";
import { geekOutQuizPlugin } from "./geek-out-quiz/index.js";
import { patentlyStupidQuizPlugin } from "./patently-stupid-quiz/index.js";
import { drawful2QuizPlugin } from "./drawful-2-quiz/index.js";
import { insectsQuizPlugin } from "./insects-quiz/index.js";
import { fishQuizPlugin } from "./fish-quiz/index.js";
import { mammalsQuizPlugin } from "./mammals-quiz/index.js";
import { reptilesQuizPlugin } from "./reptiles-quiz/index.js";
import { oceansQuizPlugin } from "./oceans-quiz/index.js";
import { desertsQuizPlugin } from "./deserts-quiz/index.js";
import { mountainsQuizPlugin } from "./mountains-quiz/index.js";
import { riversQuizPlugin } from "./rivers-quiz/index.js";
import { citiesQuizPlugin } from "./cities-quiz/index.js";
import { monumentsQuizPlugin } from "./monuments-quiz/index.js";
import { cardBidFlipPlugin } from "./card-bid-flip/index.js";
import { cardPyramidGrabPlugin } from "./card-pyramid-grab/index.js";
import { cardSnap3Plugin } from "./card-snap-3/index.js";
import { cardStackBetPlugin } from "./card-stack-bet/index.js";
import { cardSpinPickPlugin } from "./card-spin-pick/index.js";
import { diceCoinBetPlugin } from "./dice-coin-bet/index.js";
import { diceTarget25Plugin } from "./dice-target-25/index.js";
import { dicePyramidRollPlugin } from "./dice-pyramid-roll/index.js";
import { diceStreak9Plugin } from "./dice-streak-9/index.js";
import { diceBingoMiniPlugin } from "./dice-bingo-mini/index.js";
import { arrowHitPlugin } from "./arrow-hit/index.js";
import { balloonBurstPlugin } from "./balloon-burst/index.js";
import { fishingCastPlugin } from "./fishing-cast/index.js";
import { ladderClimbPlugin } from "./ladder-climb/index.js";
import { lavaLeapPlugin } from "./lava-leap/index.js";
import { molePopPlugin } from "./mole-pop/index.js";
import { ringerCoinPlugin } from "./ringer-coin/index.js";
import { snowballThrowPlugin } from "./snowball-throw/index.js";
import { sockTossPlugin } from "./sock-toss/index.js";
import { pickleJarPlugin } from "./pickle-jar/index.js";
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
import { beersQuizPlugin } from "./beers-quiz/index.js";
import { cardBidStreakPlugin } from "./card-bid-streak/index.js";
import { cardFlipStreakPlugin } from "./card-flip-streak/index.js";
import { cardHigh3Plugin } from "./card-high-3/index.js";
import { cardLow3Plugin } from "./card-low-3/index.js";
import { cardPickStreakPlugin } from "./card-pick-streak/index.js";
import { cidersQuizPlugin } from "./ciders-quiz/index.js";
import { cocktailsQuizPlugin } from "./cocktails-quiz/index.js";
import { danceStylesQuizPlugin } from "./dance-styles-quiz/index.js";
import { drinksTypesQuizPlugin } from "./drinks-types-quiz/index.js";
import { fashionErasQuizPlugin } from "./fashion-eras-quiz/index.js";
import { hairstylesQuizPlugin } from "./hairstyles-quiz/index.js";
import { philosopherViewsQuizPlugin } from "./philosopher-views-quiz/index.js";
import { religionsSymbolsQuizPlugin } from "./religions-symbols-quiz/index.js";
import { winesQuizPlugin } from "./wines-quiz/index.js";
import { arcticSurvivalPlugin } from "./arctic-survival/index.js";
import { jungleExplorerPlugin } from "./jungle-explorer/index.js";
import { rocketLaunchArcadePlugin } from "./rocket-launch-arcade/index.js";
import { dotToDotPlugin } from "./dot-to-dot/index.js";
import { letterPaintPlugin } from "./letter-paint/index.js";
import { infiniteTicTacToePlugin } from "./infinite-tic-tac-toe/index.js";
import { cardBingoProPlugin } from "./card-bingo-pro/index.js";
import { walkingTheDogPlugin } from "./walking-the-dog/index.js";
import { kitchenChaosPlugin } from "./kitchen-chaos/index.js";
import { baristaRushPlugin } from "./barista-rush/index.js";
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
import { spaceArenaPlugin } from "./space-arena/index.js";
import { gladiatorArenaPlugin } from "./gladiator-arena/index.js";
import { slimeDefensePlugin } from "./slime-defense/index.js";
import { zombieSurvivalPlugin } from "./zombie-survival/index.js";
import { wizardCardDuelPlugin } from "./wizard-card-duel/index.js";
import { alienCardBattlePlugin } from "./alien-card-battle/index.js";
import { dotGridPuzzlePlugin } from "./dot-grid-puzzle/index.js";
import { foodTruckTycoonPlugin } from "./food-truck-tycoon/index.js";
import { forestTrekPlugin } from "./forest-trek/index.js";
import { mountainClimbPlugin } from "./mountain-climb/index.js";
import { frozenRiverPlugin } from "./frozen-river/index.js";
import { cardBlastPlugin } from "./card-blast/index.js";
import { volcanoEscapePlugin } from "./volcano-escape/index.js";
import { coralReefPlugin } from "./coral-reef/index.js";
import { circusJugglePlugin } from "./circus-juggle/index.js";
import { magicianTrickPlugin } from "./magician-trick/index.js";
import { clownTossPlugin } from "./clown-toss/index.js";
import { acrobatFlipPlugin } from "./acrobat-flip/index.js";
import { desertTrekPlugin } from "./desert-trek/index.js";
import { archwayPlugin } from "./archway/index.js";
import { babettePlugin } from "./babette/index.js";
import { frogSolitairePlugin } from "./frog-solitaire/index.js";
import { lastMonarchPlugin } from "./last-monarch/index.js";
import { peekPlugin } from "./peek/index.js";
import { salicLawPlugin } from "./salic-law/index.js";
import { sevenUpPlugin } from "./seven-up/index.js";
import { tournamentPlugin } from "./tournament/index.js";
import { connectPipesProPlugin } from "./connect-pipes-pro/index.js";
import { tileFlipPlugin } from "./tile-flip/index.js";
import { colorFlowPlugin } from "./flowfree-clone/index.js";
import { crosswordProPlugin } from "./crossword-pro/index.js";
import { ultimateTicTacToePlugin } from "./ultimate-tic-tac-toe/index.js";
import { diceFootballPlugin } from "./dice-football/index.js";
import { diceBasketballPlugin } from "./dice-basketball/index.js";
import { kartTournamentPlugin } from "./kart-tournament/index.js";
import { racingStuntsPlugin } from "./racing-stunts/index.js";
import { bikeRacePlugin } from "./bike-race/index.js";
import { timeTrialPlugin } from "./time-trial/index.js";
import { pirateShipCannonPlugin } from "./pirate-ship-cannon/index.js";
import { ufoShooterPlugin } from "./ufo-shooter/index.js";
import { diceSoccerPlugin } from "./dice-soccer/index.js";
import { diceTennisPlugin } from "./dice-tennis/index.js";
import { diceHockeyPlugin } from "./dice-hockey/index.js";
import { superTicTacToePlugin } from "./super-tic-tac-toe/index.js";
import { feedTheCatPlugin } from "./feed-the-cat/index.js";
import { petShopMiniPlugin } from "./pet-shop-mini/index.js";
import { aquariumKeeperPlugin } from "./aquarium-keeper/index.js";
import { iceCreamStandPlugin } from "./ice-cream-stand/index.js";
import { fireworkShowPlugin } from "./firework-show/index.js";
import { swimmingLapsPlugin } from "./swimming-laps/index.js";
import { kiteFightPlugin } from "./kite-fight/index.js";
import { tacoTruckPlugin } from "./taco-truck/index.js";
import { pastaShopPlugin } from "./pasta-shop/index.js";
import { donutShopPlugin } from "./donut-shop/index.js";
import { bridgeBuilderPuzzlePlugin } from "./bridge-builder-puzzle/index.js";
import { paintingPuzzlePlugin } from "./painting-puzzle/index.js";
import { triathlonMiniPlugin } from "./triathlon-mini/index.js";
import { marathonPacerPlugin } from "./marathon-pacer/index.js";
import { poleClimbingPlugin } from "./pole-climbing/index.js";
import { trampolineBouncePlugin } from "./trampoline-bounce/index.js";
import { seesawBalancePlugin } from "./seesaw-balance/index.js";
import { boomerangTossPlugin } from "./boomerang-toss/index.js";
import { bottleSpinPlugin } from "./bottle-spin/index.js";
import { diceRunnerPlugin } from "./dice-runner/index.js";
import { rollAndAddPlugin } from "./roll-and-add/index.js";
import { cardSharkPlugin } from "./card-shark/index.js";
import { matchThreeSagaPlugin } from "./match-three-saga/index.js";
import { wallBouncePlugin } from "./wall-bounce/index.js";
import { diceArcheryPlugin } from "./dice-archery/index.js";
import { diceDartsPlugin } from "./dice-darts/index.js";
import { dicePoolMatchPlugin } from "./dice-pool-match/index.js";
import { rollingThunderDicePlugin } from "./rolling-thunder-dice/index.js";
import { bingoCallPlugin } from "./bingo-call/index.js";
import { cardFlipPuzzlePlugin } from "./card-flip-puzzle/index.js";
import { solitaireClockTournamentPlugin } from "./solitaire-clock-tournament/index.js";
import { ticTacToeToroidalPlugin } from "./tic-tac-toe-toroidal/index.js";
import { numericTicTacToePlugin } from "./numeric-tic-tac-toe/index.js";
import { chessPuzzleForkPlugin } from "./chess-puzzle-fork/index.js";
import { gomokuTacticPlugin } from "./gomoku-tactic/index.js";
import { weatherQuizPlugin } from "./weather-quiz/index.js";
import { musicDecadeQuizPlugin } from "./music-decade-quiz/index.js";
import { tvShowQuizPlugin } from "./tv-show-quiz/index.js";
import { videoGameQuizPlugin } from "./video-game-quiz/index.js";
import { countryFlagQuizPlugin } from "./country-flag-quiz/index.js";
import { capitalsQuizPlugin } from "./capitals-quiz/index.js";
import { instrumentsQuizPlugin } from "./instruments-quiz/index.js";
import { planetsQuizPlugin } from "./planets-quiz/index.js";
import { highestCardBetPlugin } from "./highest-card-bet/index.js";
import { lowestCardBetPlugin } from "./lowest-card-bet/index.js";
import { cardColorGuessPlugin } from "./card-color-guess/index.js";
import { cardSuitGuessPlugin } from "./card-suit-guess/index.js";
import { evensOrOddsDicePlugin } from "./evens-or-odds-dice/index.js";
import { total7OrNotPlugin } from "./total-7-or-not/index.js";
import { diceFlushPlugin } from "./dice-flush/index.js";
import { threeOfAKindRollPlugin } from "./three-of-a-kind-roll/index.js";
import { ticTacToeLargePlugin } from "./tic-tac-toe-large/index.js";
import { ticTacToeCornersWinPlugin } from "./tic-tac-toe-corners-win/index.js";
import { ticTacToe3InRowPlugin } from "./tic-tac-toe-3-in-row/index.js";
import { gomokuMiniPlugin } from "./gomoku-mini/index.js";
import { targetGrabPlugin } from "./target-grab/index.js";
import { flySwatterPlugin } from "./fly-swatter/index.js";
import { balloonDartsPlugin } from "./balloon-darts/index.js";
import { dunkTankPlugin } from "./dunk-tank/index.js";
import { ringTossProPlugin } from "./ring-toss-pro/index.js";
import { basketTossPlugin } from "./basket-toss/index.js";
import { paperArrowPlugin } from "./paper-arrow/index.js";
import { waterPistolPlugin } from "./water-pistol/index.js";
import { colorRecallPlugin } from "./color-recall/index.js";
import { shapeRecallPlugin } from "./shape-recall/index.js";
import { numberRecallPlugin } from "./number-recall/index.js";
import { positionRecallPlugin } from "./position-recall/index.js";
import { birdsQuizPlugin } from "./birds-quiz/index.js";
import { plantsQuizPlugin } from "./plants-quiz/index.js";
import { gemstonesQuizPlugin } from "./gemstones-quiz/index.js";
import { occupationsQuizPlugin } from "./occupations-quiz/index.js";
import { cardUpDownPlugin } from "./card-up-down/index.js";
import { redOrBlackPlugin } from "./red-or-black/index.js";
import { aceFinderPlugin } from "./ace-finder/index.js";
import { doubleOrNothingDicePlugin } from "./double-or-nothing-dice/index.js";
import { climbTheLadderDicePlugin } from "./climb-the-ladder-dice/index.js";
import { sumTargetDicePlugin } from "./sum-target-dice/index.js";
import { swordSlicePlugin } from "./sword-slice/index.js";
import { magicWandCastPlugin } from "./magic-wand-cast/index.js";
import { frogLeapPlugin } from "./frog-leap/index.js";
import { monkeyBananaPlugin } from "./monkey-banana/index.js";
import { cribbageSquarePlugin } from "./cribbage-square/index.js";
import { decadeSolitairePlugin } from "./decade-solitaire/index.js";
import { treesQuizPlugin } from "./trees-quiz/index.js";
import { herbsQuizPlugin } from "./herbs-quiz/index.js";
import { fruitsQuizPlugin } from "./fruits-quiz/index.js";
import { vegetablesQuizPlugin } from "./vegetables-quiz/index.js";
import { danceQuizPlugin } from "./dance-quiz/index.js";
import { paintersQuizPlugin } from "./painters-quiz/index.js";
import { composersQuizPlugin } from "./composers-quiz/index.js";
import { philosophersQuizPlugin } from "./philosophers-quiz/index.js";
import { warsQuizPlugin } from "./wars-quiz/index.js";
import { treatiesQuizPlugin } from "./treaties-quiz/index.js";
import { cardRankGuessPlugin } from "./card-rank-guess/index.js";
import { cardPairPickPlugin } from "./card-pair-pick/index.js";
import { cardPileBetPlugin } from "./card-pile-bet/index.js";
import { cardShuffleBetPlugin } from "./card-shuffle-bet/index.js";
import { cardLowHigh3Plugin } from "./card-low-high-3/index.js";
import { diceTwinBetPlugin } from "./dice-twin-bet/index.js";
import { dice100TargetPlugin } from "./dice-100-target/index.js";
import { diceDoubleTroublePlugin } from "./dice-double-trouble/index.js";
import { dicePipAddPlugin } from "./dice-pip-add/index.js";
import { diceMirrorRollPlugin } from "./dice-mirror-roll/index.js";
import { appleTossPlugin } from "./apple-toss/index.js";
import { bananaPeelPlugin } from "./banana-peel/index.js";
import { birdShootPlugin } from "./bird-shoot/index.js";
import { candyGrabPlugin } from "./candy-grab/index.js";
import { coinPopPlugin } from "./coin-pop/index.js";
import { donutGrabPlugin } from "./donut-grab/index.js";
import { eggDropPlugin } from "./egg-drop/index.js";
import { gemGrabPlugin } from "./gem-grab/index.js";
import { hatTossPlugin } from "./hat-toss/index.js";
import { hulaHoopPlugin } from "./hula-hoop/index.js";
import { spicesQuizPlugin } from "./spices-quiz/index.js";
import { drinksQuizPlugin } from "./drinks-quiz/index.js";
import { snacksQuizPlugin } from "./snacks-quiz/index.js";
import { festivalsQuizPlugin } from "./festivals-quiz/index.js";
import { religionsQuizPlugin } from "./religions-quiz/index.js";
import { sportsRulesQuizPlugin } from "./sports-rules-quiz/index.js";
import { olympicEventsQuizPlugin } from "./olympic-events-quiz/index.js";
import { transportationQuizPlugin } from "./transportation-quiz/index.js";
import { architectureQuizPlugin } from "./architecture-quiz/index.js";
import { dictatorsQuizPlugin } from "./dictators-quiz/index.js";
import { cardFlipThreePlugin } from "./card-flip-three/index.js";
import { cardPickBetPlugin } from "./card-pick-bet/index.js";
import { cardColorStreakPlugin } from "./card-color-streak/index.js";
import { cardPileStackPlugin } from "./card-pile-stack/index.js";
import { cardHotColdPlugin } from "./card-hot-cold/index.js";
import { dicePyramidStackPlugin } from "./dice-pyramid-stack/index.js";
import { diceBullseyeRollPlugin } from "./dice-bullseye-roll/index.js";
import { diceSequence3Plugin } from "./dice-sequence-3/index.js";
import { diceFlushRollPlugin } from "./dice-flush-roll/index.js";
import { diceUpDownGamePlugin } from "./dice-up-down-game/index.js";
import { iceSkaterPlugin } from "./ice-skater/index.js";
import { kiteRunnerPlugin } from "./kite-runner/index.js";
import { knightChargePlugin } from "./knight-charge/index.js";
import { leafRakePlugin } from "./leaf-rake/index.js";
import { lemonSqueezePlugin } from "./lemon-squeeze/index.js";
import { melonSmashPlugin } from "./melon-smash/index.js";
import { nailHammerPlugin } from "./nail-hammer/index.js";
import { oilPumpPlugin } from "./oil-pump/index.js";
import { pencilSharpenPlugin } from "./pencil-sharpen/index.js";
import { pizzaCutPlugin } from "./pizza-cut/index.js";
import { literatureGenresQuizPlugin } from "./literature-genres-quiz/index.js";
import { artMovementsQuizPlugin } from "./art-movements-quiz/index.js";
import { militaryLeadersQuizPlugin } from "./military-leaders-quiz/index.js";
import { scientistsQuizPlugin } from "./scientists-quiz/index.js";
import { mathematiciansQuizPlugin } from "./mathematicians-quiz/index.js";
import { explorersQuizPlugin } from "./explorers-quiz/index.js";
import { queensQuizPlugin } from "./queens-quiz/index.js";
import { kingsQuizPlugin } from "./kings-quiz/index.js";
import { popesQuizPlugin } from "./popes-quiz/index.js";
import { primeMinistersQuizPlugin } from "./prime-ministers-quiz/index.js";
import { cardThreeFlipPlugin } from "./card-three-flip/index.js";
import { cardDiscardBetPlugin } from "./card-discard-bet/index.js";
import { cardPickThreePlugin } from "./card-pick-three/index.js";
import { cardFoldThreePlugin } from "./card-fold-three/index.js";
import { cardDrawUpPlugin } from "./card-draw-up/index.js";
import { dicePairRollPlugin } from "./dice-pair-roll/index.js";
import { diceAddBetPlugin } from "./dice-add-bet/index.js";
import { diceColorBetPlugin } from "./dice-color-bet/index.js";
import { diceSkipBetPlugin } from "./dice-skip-bet/index.js";
import { diceStepBetPlugin } from "./dice-step-bet/index.js";
import { springJumpPlugin } from "./spring-jump/index.js";
import { stickyBunPlugin } from "./sticky-bun/index.js";
import { sushiRollTossPlugin } from "./sushi-roll-toss/index.js";
import { swingBatPlugin } from "./swing-bat/index.js";
import { tacoTossPlugin } from "./taco-toss/index.js";
import { tennisVolleyPlugin } from "./tennis-volley/index.js";
import { tileFlipArcadePlugin } from "./tile-flip-arcade/index.js";
import { tinCanTossPlugin } from "./tin-can-toss/index.js";
import { topSpinPlugin } from "./top-spin/index.js";
import { vaseBalancePlugin } from "./vase-balance/index.js";
import { asianCuisineQuizPlugin } from "./asian-cuisine-quiz/index.js";
import { europeanCuisineQuizPlugin } from "./european-cuisine-quiz/index.js";
import { africanCuisineQuizPlugin } from "./african-cuisine-quiz/index.js";
import { americanCuisineQuizPlugin } from "./american-cuisine-quiz/index.js";
import { italianCuisineQuizPlugin } from "./italian-cuisine-quiz/index.js";
import { frenchCuisineQuizPlugin } from "./french-cuisine-quiz/index.js";
import { mexicanCuisineQuizPlugin } from "./mexican-cuisine-quiz/index.js";
import { indianCuisineQuizPlugin } from "./indian-cuisine-quiz/index.js";
import { chineseCuisineQuizPlugin } from "./chinese-cuisine-quiz/index.js";
import { japaneseCuisineQuizPlugin } from "./japanese-cuisine-quiz/index.js";
import { thaiCuisineQuizPlugin } from "./thai-cuisine-quiz/index.js";
import { greekCuisineQuizPlugin } from "./greek-cuisine-quiz/index.js";
import { spanishCuisineQuizPlugin } from "./spanish-cuisine-quiz/index.js";
import { koreanCuisineQuizPlugin } from "./korean-cuisine-quiz/index.js";
import { brazilianCuisineQuizPlugin } from "./brazilian-cuisine-quiz/index.js";
import { cardPopBetPlugin } from "./card-pop-bet/index.js";
import { cardStackFlipPlugin } from "./card-stack-flip/index.js";
import { cardSnapPairPlugin } from "./card-snap-pair/index.js";
import { cardPileTossPlugin } from "./card-pile-toss/index.js";
import { cardThrowBetPlugin } from "./card-throw-bet/index.js";
import { cardLowPickPlugin } from "./card-low-pick/index.js";
import { cardHighPickPlugin } from "./card-high-pick/index.js";
import { cardMidPickPlugin } from "./card-mid-pick/index.js";
import { diceToss3Plugin } from "./dice-toss-3/index.js";
import { diceLowRollPlugin } from "./dice-low-roll/index.js";
import { diceHighRollPlugin } from "./dice-high-roll/index.js";
import { diceSpinRollPlugin } from "./dice-spin-roll/index.js";
import { diceClutchRollPlugin } from "./dice-clutch-roll/index.js";
import { diceSpikeRollPlugin } from "./dice-spike-roll/index.js";
import { diceLadderRollPlugin } from "./dice-ladder-roll/index.js";
import { applePieStackPlugin } from "./apple-pie-stack/index.js";
import { bananaSplitPlugin } from "./banana-split/index.js";
import { blueberryPopPlugin } from "./blueberry-pop/index.js";
import { candyCaneGrabPlugin } from "./candy-cane-grab/index.js";
import { cherryTossPlugin } from "./cherry-toss/index.js";
import { donutStackArcPlugin } from "./donut-stack-arc/index.js";
import { eclairGrabPlugin } from "./eclair-grab/index.js";
import { fruitBasketTossPlugin } from "./fruit-basket-toss/index.js";
import { gummyGrabPlugin } from "./gummy-grab/index.js";
import { jellyJarTossPlugin } from "./jelly-jar-toss/index.js";
import { ancientRomeQuizPlugin } from "./ancient-rome-quiz/index.js";
import { ancientEgyptQuizPlugin } from "./ancient-egypt-quiz/index.js";
import { ancientGreeceQuizPlugin } from "./ancient-greece-quiz/index.js";
import { vikingsQuizPlugin } from "./vikings-quiz/index.js";
import { samuraiQuizPlugin } from "./samurai-quiz/index.js";
import { knightsQuizPlugin } from "./knights-quiz/index.js";
import { pharaohsQuizPlugin } from "./pharaohs-quiz/index.js";
import { emperorsQuizPlugin } from "./emperors-quiz/index.js";
import { civilWarQuizPlugin } from "./civil-war-quiz/index.js";
import { ww1QuizPlugin } from "./ww1-quiz/index.js";
import { ww2QuizPlugin } from "./ww2-quiz/index.js";
import { coldWarQuizPlugin } from "./cold-war-quiz/index.js";
import { renaissanceQuizPlugin } from "./renaissance-quiz/index.js";
import { enlightenmentQuizPlugin } from "./enlightenment-quiz/index.js";
import { industrialRevolutionQuizPlugin } from "./industrial-revolution-quiz/index.js";
import { cardBid2Plugin } from "./card-bid-2/index.js";
import { cardBid4Plugin } from "./card-bid-4/index.js";
import { cardStreakFlipPlugin } from "./card-streak-flip/index.js";
import { cardDeckBetPlugin } from "./card-deck-bet/index.js";
import { cardPullBetPlugin } from "./card-pull-bet/index.js";
import { cardPileBet2Plugin } from "./card-pile-bet-2/index.js";
import { cardStackBet2Plugin } from "./card-stack-bet-2/index.js";
import { cardSnapBetPlugin } from "./card-snap-bet/index.js";
import { diceFlushBetPlugin } from "./dice-flush-bet/index.js";
import { diceTripBetPlugin } from "./dice-trip-bet/index.js";
import { diceQuadBetPlugin } from "./dice-quad-bet/index.js";
import { diceStreakBetPlugin } from "./dice-streak-bet/index.js";
import { diceQuickRollPlugin } from "./dice-quick-roll/index.js";
import { diceSlowRollPlugin } from "./dice-slow-roll/index.js";
import { dicePopRollPlugin } from "./dice-pop-roll/index.js";
import { kebabStackPlugin } from "./kebab-stack/index.js";
import { lasagnaLayerPlugin } from "./lasagna-layer/index.js";
import { lemonPopPlugin } from "./lemon-pop/index.js";
import { lobsterGrabPlugin } from "./lobster-grab/index.js";
import { mangoTossPlugin } from "./mango-toss/index.js";
import { marshmallowGrabPlugin } from "./marshmallow-grab/index.js";
import { milkshakeMixPlugin } from "./milkshake-mix/index.js";
import { muffinPopPlugin } from "./muffin-pop/index.js";
import { noodleGrabPlugin } from "./noodle-grab/index.js";
import { oliveGrabPlugin } from "./olive-grab/index.js";
import { classicalMusicQuizPlugin } from "./classical-music-quiz/index.js";
import { modernArtQuizPlugin } from "./modern-art-quiz/index.js";
import { jazzQuizPlugin } from "./jazz-quiz/index.js";
import { rockMusicQuizPlugin } from "./rock-music-quiz/index.js";
import { popMusicQuizPlugin } from "./pop-music-quiz/index.js";
import { hipHopQuizPlugin } from "./hip-hop-quiz/index.js";
import { countryMusicQuizPlugin } from "./country-music-quiz/index.js";
import { electronicMusicQuizPlugin } from "./electronic-music-quiz/index.js";
import { folkMusicQuizPlugin } from "./folk-music-quiz/index.js";
import { bluesQuizPlugin } from "./blues-quiz/index.js";
import { reggaeQuizPlugin } from "./reggae-quiz/index.js";
import { gospelMusicQuizPlugin } from "./gospel-music-quiz/index.js";
import { operaQuizPlugin } from "./opera-quiz/index.js";
import { broadwayQuizPlugin } from "./broadway-quiz/index.js";
import { balletQuizPlugin } from "./ballet-quiz/index.js";
import { streetArtQuizPlugin } from "./street-art-quiz/index.js";
import { sculptureQuizPlugin } from "./sculpture-quiz/index.js";
import { quartetMatchPlugin } from "./quartet-match/index.js";
import { evenEvensPlugin } from "./even-evens/index.js";
import { oddOddsPlugin } from "./odd-odds/index.js";
import { faceFeastPlugin } from "./face-feast/index.js";
import { pipPursePlugin } from "./pip-purse/index.js";
import { redRoulettePlugin } from "./red-roulette/index.js";
import { blackBidderPlugin } from "./black-bidder/index.js";
import { suitStackPlugin } from "./suit-stack/index.js";
import { pairPursuitPlugin } from "./pair-pursuit/index.js";
import { overUnderPlugin } from "./over-under/index.js";
import { straightShotPlugin } from "./straight-shot/index.js";
import { doubleDownPlugin } from "./double-down/index.js";
import { tripleTossPlugin } from "./triple-toss/index.js";
import { centipedeRollPlugin } from "./centipede-roll/index.js";
import { parityPopPlugin } from "./parity-pop/index.js";
import { peachPopPlugin } from "./peach-pop/index.js";
import { pretzelPluckPlugin } from "./pretzel-pluck/index.js";
import { radishRushPlugin } from "./radish-rush/index.js";
import { salamiSlicePlugin } from "./salami-slice/index.js";
import { tangerineTossPlugin } from "./tangerine-toss/index.js";
import { greekMythQuizPlugin } from "./greek-myth-quiz/index.js";
import { norseMythQuizPlugin } from "./norse-myth-quiz/index.js";
import { egyptianMythQuizPlugin } from "./egyptian-myth-quiz/index.js";
import { celticMythQuizPlugin } from "./celtic-myth-quiz/index.js";
import { hinduMythQuizPlugin } from "./hindu-myth-quiz/index.js";
import { buddhismQuizPlugin } from "./buddhism-quiz/index.js";
import { worldReligionsQuizPlugin } from "./world-religions-quiz/index.js";
import { easternPhilosophyQuizPlugin } from "./eastern-philosophy-quiz/index.js";
import { westernPhilosophyQuizPlugin } from "./western-philosophy-quiz/index.js";
import { ethicsQuizPlugin } from "./ethics-quiz/index.js";
import { nbaLegendsQuizPlugin } from "./nba-legends-quiz/index.js";
import { nflLegendsQuizPlugin } from "./nfl-legends-quiz/index.js";
import { mlbLegendsQuizPlugin } from "./mlb-legends-quiz/index.js";
import { soccerStarsQuizPlugin } from "./soccer-stars-quiz/index.js";
import { tennisGreatsQuizPlugin } from "./tennis-greats-quiz/index.js";
import { boxingLegendsQuizPlugin } from "./boxing-legends-quiz/index.js";
import { olympicQuizPlugin } from "./olympic-quiz/index.js";
import { golfGreatsQuizPlugin } from "./golf-greats-quiz/index.js";
import { triadTowerPlugin } from "./triad-tower/index.js";
import { royalRumblePlugin } from "./royal-rumble/index.js";
import { aceAlleyPlugin } from "./ace-alley/index.js";
import { sevenStreakPlugin } from "./seven-streak/index.js";
import { pipPyramidPlugin } from "./pip-pyramid/index.js";
import { redRiverPlugin } from "./red-river/index.js";
import { blackBridgePlugin } from "./black-bridge/index.js";
import { luckySixPlugin } from "./lucky-six/index.js";
import { crapsLightPlugin } from "./craps-light/index.js";
import { yahtzeeMiniPlugin } from "./yahtzee-mini/index.js";
import { diceDuelPlugin } from "./dice-duel/index.js";
import { snakeEyesHuntPlugin } from "./snake-eyes-hunt/index.js";
import { juiceJamboreePlugin } from "./juice-jamboree/index.js";
import { cocoaCascadePlugin } from "./cocoa-cascade/index.js";
import { frappeFlipPlugin } from "./frappe-flip/index.js";
import { latteLeapPlugin } from "./latte-leap/index.js";
import { mochaMarchPlugin } from "./mocha-march/index.js";
import { astronomyQuizPlugin } from "./astronomy-quiz/index.js";
import { chemistryLabQuizPlugin } from "./chemistry-lab-quiz/index.js";
import { physicsQuizPlugin } from "./physics-quiz/index.js";
import { biologyQuizPlugin } from "./biology-quiz/index.js";
import { anatomyQuizPlugin } from "./anatomy-quiz/index.js";
import { botanyQuizPlugin } from "./botany-quiz/index.js";
import { zoologyQuizPlugin } from "./zoology-quiz/index.js";
import { marineBioQuizPlugin } from "./marine-bio-quiz/index.js";
import { geologyQuizPlugin } from "./geology-quiz/index.js";
import { meteorologyQuizPlugin } from "./meteorology-quiz/index.js";
import { computerHistoryQuizPlugin } from "./computer-history-quiz/index.js";
import { programmingLangsQuizPlugin } from "./programming-langs-quiz/index.js";
import { internetHistoryQuizPlugin } from "./internet-history-quiz/index.js";
import { gamingHistoryQuizPlugin } from "./gaming-history-quiz/index.js";
import { cybersecQuizPlugin } from "./cybersec-quiz/index.js";
import { osQuizPlugin } from "./os-quiz/index.js";
import { aiHistoryQuizPlugin } from "./ai-history-quiz/index.js";
import { siliconValleyQuizPlugin } from "./silicon-valley-quiz/index.js";
import { straightSearchPlugin } from "./straight-search/index.js";
import { flushFinderPlugin } from "./flush-finder/index.js";
import { pairPickupPlugin } from "./pair-pickup/index.js";
import { kingsCourtPlugin } from "./kings-court/index.js";
import { queensQuestPlugin } from "./queens-quest/index.js";
import { jacksJamboreePlugin } from "./jacks-jamboree/index.js";
import { tensTallyPlugin } from "./tens-tally/index.js";
import { diceHandPokerPlugin } from "./dice-hand-poker/index.js";
import { farkleMiniPlugin } from "./farkle-mini/index.js";
import { pigClassicPlugin } from "./pig-classic/index.js";
import { dice21Plugin } from "./dice-21/index.js";
import { mexicanDicePlugin } from "./mexican-dice/index.js";
import { lollipopLiftPlugin } from "./lollipop-lift/index.js";
import { gumballGrabPlugin } from "./gumball-grab/index.js";
import { taffyTapPlugin } from "./taffy-tap/index.js";
import { nougatNetPlugin } from "./nougat-net/index.js";
import { caramelCatchPlugin } from "./caramel-catch/index.js";
import { worldCapitalsQuizPlugin } from "./world-capitals-quiz/index.js";
import { usStatesQuizPlugin } from "./us-states-quiz/index.js";
import { europeanCitiesQuizPlugin } from "./european-cities-quiz/index.js";
import { africanGeographyQuizPlugin } from "./african-geography-quiz/index.js";
import { asianGeographyQuizPlugin } from "./asian-geography-quiz/index.js";
import { southAmericaQuizPlugin } from "./south-america-quiz/index.js";
import { oceaniaQuizPlugin } from "./oceania-quiz/index.js";
import { caribbeanQuizPlugin } from "./caribbean-quiz/index.js";
import { worldFlagsQuizPlugin } from "./world-flags-quiz/index.js";
import { worldRiversQuizPlugin } from "./world-rivers-quiz/index.js";
import { shakespeareQuizPlugin } from "./shakespeare-quiz/index.js";
import { classicNovelsQuizPlugin } from "./classic-novels-quiz/index.js";
import { americanLitQuizPlugin } from "./american-lit-quiz/index.js";
import { britishLitQuizPlugin } from "./british-lit-quiz/index.js";
import { russianLitQuizPlugin } from "./russian-lit-quiz/index.js";
import { mysteryNovelsQuizPlugin } from "./mystery-novels-quiz/index.js";
import { sciFiNovelsQuizPlugin } from "./sci-fi-novels-quiz/index.js";
import { fantasyNovelsQuizPlugin } from "./fantasy-novels-quiz/index.js";
import { nineNinePlugin } from "./nine-nine/index.js";
import { eightEatersPlugin } from "./eight-eaters/index.js";
import { lowTidePlugin } from "./low-tide/index.js";
import { highTidePlugin } from "./high-tide/index.js";
import { colorClashPlugin } from "./color-clash/index.js";
import { suitShufflePlugin } from "./suit-shuffle/index.js";
import { rankRumblePlugin } from "./rank-rumble/index.js";
import { rollAndWritePlugin } from "./roll-and-write/index.js";
import { diceBingoPlugin } from "./dice-bingo/index.js";
import { buncoMiniPlugin } from "./bunco-mini/index.js";
import { diceKingPlugin } from "./dice-king/index.js";
import { diceClutchPlugin } from "./dice-clutch/index.js";
import { cucumberCatchPlugin } from "./cucumber-catch/index.js";
import { tomatoTossPlugin } from "./tomato-toss/index.js";
import { pepperPopPlugin } from "./pepper-pop/index.js";
import { spinachSpinPlugin } from "./spinach-spin/index.js";
import { kaleKombatPlugin } from "./kale-kombat/index.js";
import { oscarFilmsQuizPlugin } from "./oscar-films-quiz/index.js";
import { marvelMcuQuizPlugin } from "./marvel-mcu-quiz/index.js";
import { dcComicsFilmsQuizPlugin } from "./dc-comics-films-quiz/index.js";
import { pixarFilmsQuizPlugin } from "./pixar-films-quiz/index.js";
import { disneyClassicsQuizPlugin } from "./disney-classics-quiz/index.js";
import { horrorFilmsQuizPlugin } from "./horror-films-quiz/index.js";
import { sciFiFilmsQuizPlugin } from "./sci-fi-films-quiz/index.js";
import { tvSitcomsQuizPlugin } from "./tv-sitcoms-quiz/index.js";
import { tvDramasQuizPlugin } from "./tv-dramas-quiz/index.js";
import { cartoonsQuizPlugin } from "./cartoons-quiz/index.js";
import { beatlesQuizPlugin } from "./beatles-quiz/index.js";
import { elvisQuizPlugin } from "./elvis-quiz/index.js";
import { bowieQuizPlugin } from "./bowie-quiz/index.js";
import { princeQuizPlugin } from "./prince-quiz/index.js";
import { madonnaQuizPlugin } from "./madonna-quiz/index.js";
import { rollingStonesQuizPlugin } from "./rolling-stones-quiz/index.js";
import { ledZeppelinQuizPlugin } from "./led-zeppelin-quiz/index.js";
import { pinkFloydQuizPlugin } from "./pink-floyd-quiz/index.js";
import { tripleTroublePlugin } from "./triple-trouble/index.js";
import { quartetQuestPlugin } from "./quartet-quest/index.js";
import { flushFivePlugin } from "./flush-five/index.js";
import { lowFivePlugin } from "./low-five/index.js";
import { highFiveCardsPlugin } from "./high-five-cards/index.js";
import { faceFlipPlugin } from "./face-flip/index.js";
import { pipPulsePlugin } from "./pip-pulse/index.js";
import { tripleThreePlugin } from "./triple-three/index.js";
import { diceDerbyPlugin } from "./dice-derby/index.js";
import { diceDominoPlugin } from "./dice-domino/index.js";
import { diceSpinPlugin } from "./dice-spin/index.js";
import { superSixPlugin } from "./super-six/index.js";
import { teaTimeTapPlugin } from "./tea-time-tap/index.js";
import { chaiChasePlugin } from "./chai-chase/index.js";
import { coffeeCollectPlugin } from "./coffee-collect/index.js";
import { bobaBouncePlugin } from "./boba-bounce/index.js";
import { smoothieSwipePlugin } from "./smoothie-swipe/index.js";
import { friendsShowQuizPlugin } from "./friends-show-quiz/index.js";
import { officeShowQuizPlugin } from "./office-show-quiz/index.js";
import { seinfeldQuizPlugin } from "./seinfeld-quiz/index.js";
import { simpsonsQuizPlugin } from "./simpsons-quiz/index.js";
import { familyGuyQuizPlugin } from "./family-guy-quiz/index.js";
import { southParkQuizPlugin } from "./south-park-quiz/index.js";
import { gotQuizPlugin } from "./got-quiz/index.js";
import { breakingBadQuizPlugin } from "./breaking-bad-quiz/index.js";
import { strangerThingsQuizPlugin } from "./stranger-things-quiz/index.js";
import { lostShowQuizPlugin } from "./lost-show-quiz/index.js";
import { marioQuizPlugin } from "./mario-quiz/index.js";
import { zeldaQuizPlugin } from "./zelda-quiz/index.js";
import { pokemonQuizPlugin } from "./pokemon-quiz/index.js";
import { sonicQuizPlugin } from "./sonic-quiz/index.js";
import { finalFantasyQuizPlugin } from "./final-fantasy-quiz/index.js";
import { mortalKombatQuizPlugin } from "./mortal-kombat-quiz/index.js";
import { streetfighterQuizPlugin } from "./streetfighter-quiz/index.js";
import { metalGearQuizPlugin } from "./metal-gear-quiz/index.js";
import { acesUpMiniPlugin } from "./aces-up-mini/index.js";
import { fourFoursPlugin } from "./four-fours/index.js";
import { redRallyPlugin } from "./red-rally/index.js";
import { blackBashPlugin } from "./black-bash/index.js";
import { evenEddyPlugin } from "./even-eddy/index.js";
import { oddOlliePlugin } from "./odd-ollie/index.js";
import { cardClockPlugin } from "./card-clock/index.js";
import { diceTargetPlugin } from "./dice-target/index.js";
import { diceFlushMiniPlugin } from "./dice-flush-mini/index.js";
import { diceStackMiniPlugin } from "./dice-stack-mini/index.js";
import { dicePyramidPlugin } from "./dice-pyramid/index.js";
import { diceArrowPlugin } from "./dice-arrow/index.js";
import { chipsChompPlugin } from "./chips-chomp/index.js";
import { popcornPopPlugin } from "./popcorn-pop/index.js";
import { pretzelPinchPlugin } from "./pretzel-pinch/index.js";
import { nachosNowPlugin } from "./nachos-now/index.js";
import { crackerCrunchPlugin } from "./cracker-crunch/index.js";
import { narutoQuizPlugin } from "./naruto-quiz/index.js";
import { dragonballQuizPlugin } from "./dragonball-quiz/index.js";
import { onepieceQuizPlugin } from "./onepiece-quiz/index.js";
import { attackTitanQuizPlugin } from "./attack-titan-quiz/index.js";
import { bleachQuizPlugin } from "./bleach-quiz/index.js";
import { studioGhibliQuizPlugin } from "./studio-ghibli-quiz/index.js";
import { sailorMoonQuizPlugin } from "./sailor-moon-quiz/index.js";
import { evangelionQuizPlugin } from "./evangelion-quiz/index.js";
import { cowboyBebopQuizPlugin } from "./cowboy-bebop-quiz/index.js";
import { myHeroQuizPlugin } from "./my-hero-quiz/index.js";
import { batmanQuizPlugin } from "./batman-quiz/index.js";
import { supermanQuizPlugin } from "./superman-quiz/index.js";
import { xmenQuizPlugin } from "./xmen-quiz/index.js";
import { spidermanQuizPlugin } from "./spiderman-quiz/index.js";
import { wonderWomanQuizPlugin } from "./wonder-woman-quiz/index.js";
import { flashQuizPlugin } from "./flash-quiz/index.js";
import { greenLanternQuizPlugin } from "./green-lantern-quiz/index.js";
import { comicVillainsQuizPlugin } from "./comic-villains-quiz/index.js";
import { lowPairPlugin } from "./low-pair/index.js";
import { highPairPlugin } from "./high-pair/index.js";
import { rainbowRunPlugin } from "./rainbow-run/index.js";
import { monochromeRunPlugin } from "./monochrome-run/index.js";
import { swapStackPlugin } from "./swap-stack/index.js";
import { cutTheDeckPlugin } from "./cut-the-deck/index.js";
import { mirrorMatchPlugin } from "./mirror-match/index.js";
import { diceFrenzyPlugin } from "./dice-frenzy/index.js";
import { diceBowlPlugin } from "./dice-bowl/index.js";
import { diceSpellPlugin } from "./dice-spell/index.js";
import { diceShippingPlugin } from "./dice-shipping/index.js";
import { diceVortexPlugin } from "./dice-vortex/index.js";
import { cookieClutchPlugin } from "./cookie-clutch/index.js";
import { piePopPlugin } from "./pie-pop/index.js";
import { croissantCatchPlugin } from "./croissant-catch/index.js";
import { bagelBashPlugin } from "./bagel-bash/index.js";
import { donutDashPlugin } from "./donut-dash/index.js";
import { pizzaQuizPlugin } from "./pizza-quiz/index.js";
import { sushiQuizPlugin } from "./sushi-quiz/index.js";
import { pastaQuizPlugin } from "./pasta-quiz/index.js";
import { bbqQuizPlugin } from "./bbq-quiz/index.js";
import { tacosQuizPlugin } from "./tacos-quiz/index.js";
import { dimSumQuizPlugin } from "./dim-sum-quiz/index.js";
import { curryQuizPlugin } from "./curry-quiz/index.js";
import { cheeseQuizPlugin } from "./cheese-quiz/index.js";
import { breadQuizPlugin } from "./bread-quiz/index.js";
import { dessertQuizPlugin } from "./dessert-quiz/index.js";
import { dogsBreedsQuizPlugin } from "./dogs-breeds-quiz/index.js";
import { catsBreedsQuizPlugin } from "./cats-breeds-quiz/index.js";
import { birdsWorldQuizPlugin } from "./birds-world-quiz/index.js";
import { reptilesWorldQuizPlugin } from "./reptiles-world-quiz/index.js";
import { insectsWorldQuizPlugin } from "./insects-world-quiz/index.js";
import { dinosaursQuizPlugin } from "./dinosaurs-quiz/index.js";
import { horsesQuizPlugin } from "./horses-quiz/index.js";
import { endangeredSpeciesQuizPlugin } from "./endangered-species-quiz/index.js";
import { pipFivePlugin } from "./pip-five/index.js";
import { pipTenPlugin } from "./pip-ten/index.js";
import { faceFlushPlugin } from "./face-flush/index.js";
import { pipFlushPlugin } from "./pip-flush/index.js";
import { dualDealPlugin } from "./dual-deal/index.js";
import { tripleDealPlugin } from "./triple-deal/index.js";
import { quintDealPlugin } from "./quint-deal/index.js";
import { diceRoulettePlugin } from "./dice-roulette/index.js";
import { diceBlackjackPlugin } from "./dice-blackjack/index.js";
import { diceBaccaratPlugin } from "./dice-baccarat/index.js";
import { diceKenoPlugin } from "./dice-keno/index.js";
import { diceCrapsMiniPlugin } from "./dice-craps-mini/index.js";
import { dumplingDancePlugin } from "./dumpling-dance/index.js";
import { ramenRushPlugin } from "./ramen-rush/index.js";
import { tempuraTapPlugin } from "./tempura-tap/index.js";
import { baoBashPlugin } from "./bao-bash/index.js";
import { mochiMashPlugin } from "./mochi-mash/index.js";
import { chessHistoryQuizPlugin } from "./chess-history-quiz/index.js";
import { pokerHistoryQuizPlugin } from "./poker-history-quiz/index.js";
import { cardMagicQuizPlugin } from "./card-magic-quiz/index.js";
import { gardeningQuizPlugin } from "./gardening-quiz/index.js";
import { cookingTechniquesQuizPlugin } from "./cooking-techniques-quiz/index.js";
import { winePairingQuizPlugin } from "./wine-pairing-quiz/index.js";
import { coffeeBrewingQuizPlugin } from "./coffee-brewing-quiz/index.js";
import { photographyQuizPlugin } from "./photography-quiz/index.js";
import { paintingTechniquesQuizPlugin } from "./painting-techniques-quiz/index.js";
import { potteryQuizPlugin } from "./pottery-quiz/index.js";
import { parisQuizPlugin } from "./paris-quiz/index.js";
import { tokyoQuizPlugin } from "./tokyo-quiz/index.js";
import { nycQuizPlugin } from "./nyc-quiz/index.js";
import { londonQuizPlugin } from "./london-quiz/index.js";
import { romeQuizPlugin } from "./rome-quiz/index.js";
import { dubaiQuizPlugin } from "./dubai-quiz/index.js";
import { sydneyQuizPlugin } from "./sydney-quiz/index.js";
import { rioQuizPlugin } from "./rio-quiz/index.js";
import { sevenSevensPlugin } from "./seven-sevens/index.js";
import { sixShootPlugin } from "./six-shoot/index.js";
import { fiveFingersPlugin } from "./five-fingers/index.js";
import { fourFaceoffPlugin } from "./four-faceoff/index.js";
import { twoTwosomePlugin } from "./two-twosome/index.js";
import { threeTriosPlugin } from "./three-trios/index.js";
import { cardCascadePlugin } from "./card-cascade/index.js";
import { diceBingoLinePlugin } from "./dice-bingo-line/index.js";
import { diceMarathonPlugin } from "./dice-marathon/index.js";
import { diceTallyPlugin } from "./dice-tally/index.js";
import { diceCricketPlugin } from "./dice-cricket/index.js";
import { diceShootoutPlugin } from "./dice-shootout/index.js";
import { flowerPluckPlugin } from "./flower-pluck/index.js";
import { weedWhackPlugin } from "./weed-whack/index.js";
import { seedSprinklePlugin } from "./seed-sprinkle/index.js";
import { beeBuzzPlugin } from "./bee-buzz/index.js";
import { butterflyNetPlugin } from "./butterfly-net/index.js";
import { carBrandsQuizPlugin } from "./car-brands-quiz/index.js";
import { techBrandsQuizPlugin } from "./tech-brands-quiz/index.js";
import { fashionBrandsQuizPlugin } from "./fashion-brands-quiz/index.js";
import { sodaBrandsQuizPlugin } from "./soda-brands-quiz/index.js";
import { sneakerBrandsQuizPlugin } from "./sneaker-brands-quiz/index.js";
import { airlineBrandsQuizPlugin } from "./airline-brands-quiz/index.js";
import { bankBrandsQuizPlugin } from "./bank-brands-quiz/index.js";
import { cerealBrandsQuizPlugin } from "./cereal-brands-quiz/index.js";
import { fastFoodBrandsQuizPlugin } from "./fast-food-brands-quiz/index.js";
import { cosmeticBrandsQuizPlugin } from "./cosmetic-brands-quiz/index.js";
import { usPresidentsQuizPlugin } from "./us-presidents-quiz/index.js";
import { britishMonarchsQuizPlugin } from "./british-monarchs-quiz/index.js";
import { worldDictatorsQuizPlugin } from "./world-dictators-quiz/index.js";
import { nobelLaureatesQuizPlugin } from "./nobel-laureates-quiz/index.js";
import { inventorsQuizPlugin } from "./inventors-quiz/index.js";
import { nasaAstronautsQuizPlugin } from "./nasa-astronauts-quiz/index.js";
import { entrepreneursQuizPlugin } from "./entrepreneurs-quiz/index.js";
import { civilRightsQuizPlugin } from "./civil-rights-quiz/index.js";
import { redKingPlugin } from "./red-king/index.js";
import { blackKingPlugin } from "./black-king/index.js";
import { redQueenPlugin } from "./red-queen/index.js";
import { blackQueenPlugin } from "./black-queen/index.js";
import { fourColorFlushPlugin } from "./four-color-flush/index.js";
import { cardSnakePlugin } from "./card-snake/index.js";
import { cardLadderPlugin } from "./card-ladder/index.js";
import { diceShootPlugin } from "./dice-shoot/index.js";
import { diceMirrorPlugin } from "./dice-mirror/index.js";
import { diceStairPlugin } from "./dice-stair/index.js";
import { diceRainbowPlugin } from "./dice-rainbow/index.js";
import { diceFortunePlugin } from "./dice-fortune/index.js";
import { frogFlickPlugin } from "./frog-flick/index.js";
import { antAttackPlugin } from "./ant-attack/index.js";
import { mouseMashPlugin } from "./mouse-mash/index.js";
import { bunnyBouncePlugin } from "./bunny-bounce/index.js";
import { chickChasePlugin } from "./chick-chase/index.js";
import { nineteen20sQuizPlugin } from "./1920s-quiz/index.js";
import { nineteen30sQuizPlugin } from "./1930s-quiz/index.js";
import { nineteen40sQuizPlugin } from "./1940s-quiz/index.js";
import { nineteen50sQuizPlugin } from "./1950s-quiz/index.js";
import { nineteen60sQuizPlugin } from "./1960s-quiz/index.js";
import { nineteen70sQuizPlugin } from "./1970s-quiz/index.js";
import { nineteen80sQuizPlugin } from "./1980s-quiz/index.js";
import { nineteen90sQuizPlugin } from "./1990s-quiz/index.js";
import { twoThousandsQuizPlugin } from "./2000s-quiz/index.js";
import { twentyTensQuizPlugin } from "./2010s-quiz/index.js";
import { basketballRulesQuizPlugin } from "./basketball-rules-quiz/index.js";
import { footballRulesQuizPlugin } from "./football-rules-quiz/index.js";
import { baseballRulesQuizPlugin } from "./baseball-rules-quiz/index.js";
import { hockeyRulesQuizPlugin } from "./hockey-rules-quiz/index.js";
import { soccerRulesQuizPlugin } from "./soccer-rules-quiz/index.js";
import { tennisRulesQuizPlugin } from "./tennis-rules-quiz/index.js";
import { cricketRulesQuizPlugin } from "./cricket-rules-quiz/index.js";
import { rugbyRulesQuizPlugin } from "./rugby-rules-quiz/index.js";
import { cardCallPlugin } from "./card-call/index.js";
import { cardPilePlugin } from "./card-pile/index.js";
import { cardPyramidBuildPlugin } from "./card-pyramid-build/index.js";
import { pipPinchPlugin } from "./pip-pinch/index.js";
import { cardCollectorPlugin } from "./card-collector/index.js";
import { faceCollectorPlugin } from "./face-collector/index.js";
import { rankCollectorPlugin } from "./rank-collector/index.js";
import { dicePickupPlugin } from "./dice-pickup/index.js";
import { diceRelayPlugin } from "./dice-relay/index.js";
import { diceStreakPlugin } from "./dice-streak/index.js";
import { diceSpinnerPlugin } from "./dice-spinner/index.js";
import { diceStadiumPlugin } from "./dice-stadium/index.js";
import { crabCatchPlugin } from "./crab-catch/index.js";
import { octopusTapPlugin } from "./octopus-tap/index.js";
import { jellyfishJabPlugin } from "./jellyfish-jab/index.js";
import { sharkSwatPlugin } from "./shark-swat/index.js";
import { whaleWavePlugin } from "./whale-wave/index.js";
import { japanCultureQuizPlugin } from "./japan-culture-quiz/index.js";
import { chinaHistoryQuizPlugin } from "./china-history-quiz/index.js";
import { indiaCultureQuizPlugin } from "./india-culture-quiz/index.js";
import { franceCultureQuizPlugin } from "./france-culture-quiz/index.js";
import { italyCultureQuizPlugin } from "./italy-culture-quiz/index.js";
import { spainCultureQuizPlugin } from "./spain-culture-quiz/index.js";
import { germanyCultureQuizPlugin } from "./germany-culture-quiz/index.js";
import { mexicoCultureQuizPlugin } from "./mexico-culture-quiz/index.js";
import { brazilCultureQuizPlugin } from "./brazil-culture-quiz/index.js";
import { australiaCultureQuizPlugin } from "./australia-culture-quiz/index.js";
import { mentalMathQuizPlugin } from "./mental-math-quiz/index.js";
import { geometryQuizPlugin } from "./geometry-quiz/index.js";
import { algebraQuizPlugin } from "./algebra-quiz/index.js";
import { logicPuzzlesQuizPlugin } from "./logic-puzzles-quiz/index.js";
import { statisticsQuizPlugin } from "./statistics-quiz/index.js";
import { probabilityQuizPlugin } from "./probability-quiz/index.js";
import { numberTheoryQuizPlugin } from "./number-theory-quiz/index.js";
import { puzzleMindQuizPlugin } from "./puzzle-mind-quiz/index.js";
import { miniPokerPlugin } from "./mini-poker/index.js";
import { cardTargetSumPlugin } from "./card-target-sum/index.js";
import { miniBlackjackPlugin } from "./mini-blackjack/index.js";
import { cardClockBuildPlugin } from "./card-clock-build/index.js";
import { miniWarPlugin } from "./mini-war/index.js";
import { miniRummyPlugin } from "./mini-rummy/index.js";
import { miniSpitPlugin } from "./mini-spit/index.js";
import { miniYahtzeePlugin } from "./mini-yahtzee/index.js";
import { miniTenziPlugin } from "./mini-tenzi/index.js";
import { miniMexicanPlugin } from "./mini-mexican/index.js";
import { miniShutBoxPlugin } from "./mini-shut-box/index.js";
import { miniCeeLoPlugin } from "./mini-cee-lo/index.js";
import { acornGrabPlugin } from "./acorn-grab/index.js";
import { mushroomMashPlugin } from "./mushroom-mash/index.js";
import { pineconePopPlugin } from "./pinecone-pop/index.js";
import { squirrelSpotPlugin } from "./squirrel-spot/index.js";
import { owlHootPlugin } from "./owl-hoot/index.js";
import { christmasQuizPlugin } from "./christmas-quiz/index.js";
import { halloweenQuizPlugin } from "./halloween-quiz/index.js";
import { easterQuizPlugin } from "./easter-quiz/index.js";
import { thanksgivingQuizPlugin } from "./thanksgiving-quiz/index.js";
import { valentinesQuizPlugin } from "./valentines-quiz/index.js";
import { newYearQuizPlugin } from "./new-year-quiz/index.js";
import { hanukkahQuizPlugin } from "./hanukkah-quiz/index.js";
import { diwaliQuizPlugin } from "./diwali-quiz/index.js";
import { chineseNewYearQuizPlugin } from "./chinese-new-year-quiz/index.js";
import { mardiGrasQuizPlugin } from "./mardi-gras-quiz/index.js";
import { carsHistoryQuizPlugin } from "./cars-history-quiz/index.js";
import { motorcyclesQuizPlugin } from "./motorcycles-quiz/index.js";
import { aircraftQuizPlugin } from "./aircraft-quiz/index.js";
import { shipsQuizPlugin } from "./ships-quiz/index.js";
import { trainsQuizPlugin } from "./trains-quiz/index.js";
import { spaceVehiclesQuizPlugin } from "./space-vehicles-quiz/index.js";
import { formula1QuizPlugin } from "./formula1-quiz/index.js";
import { nASCARQuizPlugin } from "./nascar-quiz/index.js";
import { cardTossPlugin } from "./card-toss/index.js";
import { cardStormPlugin } from "./card-storm/index.js";
import { cardCollectFlushPlugin } from "./card-collect-flush/index.js";
import { cardPairQuestPlugin } from "./card-pair-quest/index.js";
import { cardTrioQuestPlugin } from "./card-trio-quest/index.js";
import { cardQuadQuestPlugin } from "./card-quad-quest/index.js";
import { cardCouponPlugin } from "./card-coupon/index.js";
import { diceRelayMiniPlugin } from "./dice-relay-mini/index.js";
import { diceCoinFlipPlugin } from "./dice-coin-flip/index.js";
import { diceSnakeLadderPlugin } from "./dice-snake-ladder/index.js";
import { diceCheckersPlugin } from "./dice-checkers/index.js";
import { diceMonopolyPlugin } from "./dice-monopoly/index.js";
import { seahorseSpinPlugin } from "./seahorse-spin/index.js";
import { starfishSnapPlugin } from "./starfish-snap/index.js";
import { clamClapPlugin } from "./clam-clap/index.js";
import { lobsterLeapPlugin } from "./lobster-leap/index.js";
import { coralClickPlugin } from "./coral-click/index.js";
import { miniPyramidSolitairePlugin } from "./mini-pyramid-solitaire/index.js";
import { miniTripeaksPlugin } from "./mini-tripeaks/index.js";
import { miniSpider1suitPlugin } from "./mini-spider-1suit/index.js";
import { miniCanfieldPlugin } from "./mini-canfield/index.js";
import { miniYukonPlugin } from "./mini-yukon/index.js";
import { miniBakerDozenPlugin } from "./mini-baker-dozen/index.js";
import { miniEightOffPlugin } from "./mini-eight-off/index.js";
import { miniEmperorPlugin } from "./mini-emperor/index.js";
import { miniRussianBankPlugin } from "./mini-russian-bank/index.js";
import { miniPokerSquarePlugin } from "./mini-poker-square/index.js";
import { animalTracksQuizPlugin } from "./animal-tracks-quiz/index.js";
import { birdSongsQuizPlugin } from "./bird-songs-quiz/index.js";
import { wildCatsQuizPlugin } from "./wild-cats-quiz/index.js";
import { whalesDolphinsQuizPlugin } from "./whales-dolphins-quiz/index.js";
import { bearSpeciesQuizPlugin } from "./bear-species-quiz/index.js";
import { primatesQuizPlugin } from "./primates-quiz/index.js";
import { snakesQuizPlugin } from "./snakes-quiz/index.js";
import { spidersQuizPlugin } from "./spiders-quiz/index.js";
import { redPairPickupPlugin } from "./red-pair-pickup/index.js";
import { blackPairPickupPlugin } from "./black-pair-pickup/index.js";
import { cardStairwayPlugin } from "./card-stairway/index.js";
import { cardDownstairsPlugin } from "./card-downstairs/index.js";
import { cardEqualityPlugin } from "./card-equality/index.js";
import { cardMixmatchPlugin } from "./card-mixmatch/index.js";
import { cardHourglassPlugin } from "./card-hourglass/index.js";
import { diceGridPlugin } from "./dice-grid/index.js";
import { diceSpinwheelPlugin } from "./dice-spinwheel/index.js";
import { diceAimPlugin } from "./dice-aim/index.js";
import { diceBowlingPlugin } from "./dice-bowling/index.js";
import { diceGridironPlugin } from "./dice-gridiron/index.js";
import { diceTenpinBowlPlugin } from "./dice-tenpin-bowl/index.js";
import { diceNinepinBowlPlugin } from "./dice-ninepin-bowl/index.js";
import { diceCandlepinPlugin } from "./dice-candlepin/index.js";
import { diceDuckpinPlugin } from "./dice-duckpin/index.js";
import { diceFivePinPlugin } from "./dice-five-pin/index.js";
import { diceSkittlesPlugin } from "./dice-skittles/index.js";
import { diceKegelnPlugin } from "./dice-kegeln/index.js";
import { dice301Plugin } from "./dice-301/index.js";
import { dice701Plugin } from "./dice-701/index.js";
import { diceShanghaiDartsPlugin } from "./dice-shanghai-darts/index.js";
import { diceHalveItPlugin } from "./dice-halve-it/index.js";
import { diceKillerDartsPlugin } from "./dice-killer-darts/index.js";
import { diceAroundClockPlugin } from "./dice-around-clock/index.js";
import { diceCricketDartsPlugin } from "./dice-cricket-darts/index.js";
import { diceBoccePlugin } from "./dice-bocce/index.js";
import { dicePetanquePlugin } from "./dice-petanque/index.js";
import { diceBocciaPlugin } from "./dice-boccia/index.js";
import { diceKubbPlugin } from "./dice-kubb/index.js";
import { diceMolkkyPlugin } from "./dice-molkky/index.js";
import { diceCornholePlugin } from "./dice-cornhole/index.js";
import { diceWasherTossPlugin } from "./dice-washer-toss/index.js";
import { diceKanjamPlugin } from "./dice-kanjam/index.js";
import { diceSpikeballPlugin } from "./dice-spikeball/index.js";
import { diceCrokinolePlugin } from "./dice-crokinole/index.js";
import { diceCarromPlugin } from "./dice-carrom/index.js";
import { diceEisstockPlugin } from "./dice-eisstock/index.js";
import { diceSjoelbakPlugin } from "./dice-sjoelbak/index.js";
import { diceNovussPlugin } from "./dice-novuss/index.js";
import { diceDiscGolfPlugin } from "./dice-disc-golf/index.js";
import { diceAirhockeyPlugin } from "./dice-airhockey/index.js";
import { diceFoosballPlugin } from "./dice-foosball/index.js";
import { diceTableTennisPlugin } from "./dice-table-tennis/index.js";
import { diceVolleyballPlugin } from "./dice-volleyball/index.js";
import { diceSquashPlugin } from "./dice-squash/index.js";
import { diceBadmintonPlugin } from "./dice-badminton/index.js";
import { beeBashPlugin } from "./bee-bash/index.js";
import { waspWhipPlugin } from "./wasp-whip/index.js";
import { caterpillarCatchPlugin } from "./caterpillar-catch/index.js";
import { fireflyFlashPlugin } from "./firefly-flash/index.js";
import { dragonflyDartPlugin } from "./dragonfly-dart/index.js";
import { numlinksPlugin } from "./numlinks/index.js";
import { gridmagicPlugin } from "./gridmagic/index.js";
import { additionRacePlugin } from "./addition-race/index.js";
import { subtractionRacePlugin } from "./subtraction-race/index.js";
import { multiplicationRacePlugin } from "./multiplication-race/index.js";
import { divisionRacePlugin } from "./division-race/index.js";
import { findPrimePlugin } from "./find-prime/index.js";
import { findCompositePlugin } from "./find-composite/index.js";
import { numwordMatchPlugin } from "./numword-match/index.js";
import { romanNumeralsMiniPlugin } from "./roman-numerals-mini/index.js";
import { stateCapitalsMiniPlugin } from "./state-capitals-mini/index.js";
import { countryCapitalsMiniPlugin } from "./country-capitals-mini/index.js";
import { mountainQuizPlugin } from "./mountain-quiz/index.js";
import { desertQuizPlugin } from "./desert-quiz/index.js";
import { lakeQuizPlugin } from "./lake-quiz/index.js";
import { islandQuizPlugin } from "./island-quiz/index.js";
import { volcanoQuizPlugin } from "./volcano-quiz/index.js";
import { nationalParksQuizPlugin } from "./national-parks-quiz/index.js";
import { cardStackStressPlugin } from "./card-stack-stress/index.js";
import { cardCleanSweepPlugin } from "./card-clean-sweep/index.js";
import { cardTradeUpPlugin } from "./card-trade-up/index.js";
import { cardHoldEmPlugin } from "./card-hold-em/index.js";
import { cardDiscardDownPlugin } from "./card-discard-down/index.js";
import { cardBouncerPlugin } from "./card-bouncer/index.js";
import { cardClutchPlugin } from "./card-clutch/index.js";
import { diceFrenzyMiniPlugin } from "./dice-frenzy-mini/index.js";
import { diceFrenzyTallPlugin } from "./dice-frenzy-tall/index.js";
import { dicePaddlePlugin } from "./dice-paddle/index.js";
import { diceLeapPlugin } from "./dice-leap/index.js";
import { diceBridgePlugin } from "./dice-bridge/index.js";
import { fireworkTapPlugin } from "./firework-tap/index.js";
import { pumpkinPopPlugin } from "./pumpkin-pop/index.js";
import { sparklerSnagPlugin } from "./sparkler-snag/index.js";
import { confettiCatchPlugin } from "./confetti-catch/index.js";
import { lanternLiftPlugin } from "./lantern-lift/index.js";
import { ticTacToeBlitzPlugin } from "./tic-tac-toe-blitz/index.js";
import { connectFourMiniPlugin } from "./connect-four-mini/index.js";
import { nimGamePlugin } from "./nim-game/index.js";
import { eightQueensMiniPlugin } from "./eight-queens-mini/index.js";
import { worldCupQuizPlugin } from "./world-cup-quiz/index.js";
import { superBowlQuizPlugin } from "./super-bowl-quiz/index.js";
import { ncaaBasketballQuizPlugin } from "./ncaa-basketball-quiz/index.js";
import { worldSeriesQuizPlugin } from "./world-series-quiz/index.js";
import { stanleyCupQuizPlugin } from "./stanley-cup-quiz/index.js";
import { wimbledonQuizPlugin } from "./wimbledon-quiz/index.js";
import { kentuckyDerbyQuizPlugin } from "./kentucky-derby-quiz/index.js";
import { daytona500QuizPlugin } from "./daytona-500-quiz/index.js";
import { cardBingoPlugin } from "./card-bingo/index.js";
import { cardTracePlugin } from "./card-trace/index.js";
import { cardRoulettePlugin } from "./card-roulette/index.js";
import { cardPaddlePlugin } from "./card-paddle/index.js";
import { cardTowerFallPlugin } from "./card-tower-fall/index.js";
import { cardFishingPlugin } from "./card-fishing/index.js";
import { cardShootoutPlugin } from "./card-shootout/index.js";
import { diceShrinePlugin } from "./dice-shrine/index.js";
import { diceStormPlugin } from "./dice-storm/index.js";
import { diceQuestPlugin } from "./dice-quest/index.js";
import { diceBullseyePlugin } from "./dice-bullseye/index.js";
import { diceTournamentPlugin } from "./dice-tournament/index.js";
import { ufoUplinkPlugin } from "./ufo-uplink/index.js";
import { asteroidAimPlugin } from "./asteroid-aim/index.js";
import { robotRescuePlugin } from "./robot-rescue/index.js";
import { rocketRumblePlugin } from "./rocket-rumble/index.js";
import { laserLockPlugin } from "./laser-lock/index.js";
import { slidePuzzle3x3Plugin } from "./slide-puzzle-3x3/index.js";
import { lightsOutMiniPlugin } from "./lights-out-mini/index.js";
import { nonogram3x3Plugin } from "./nonogram-3x3/index.js";
import { magicSquare3Plugin } from "./magic-square-3/index.js";
import { crosswordMini3x3Plugin } from "./crossword-mini-3x3/index.js";
import { thaiCuisineQuiz2Plugin } from "./thai-cuisine-quiz-2/index.js";
import { vietnameseCuisineQuizPlugin } from "./vietnamese-cuisine-quiz/index.js";
import { koreanCuisineQuiz2Plugin } from "./korean-cuisine-quiz-2/index.js";
import { chineseRegionalCuisineQuizPlugin } from "./chinese-regional-cuisine-quiz/index.js";
import { mexicanCuisineQuiz2Plugin } from "./mexican-cuisine-quiz-2/index.js";
import { peruvianCuisineQuizPlugin } from "./peruvian-cuisine-quiz/index.js";
import { moroccanCuisineQuizPlugin } from "./moroccan-cuisine-quiz/index.js";
import { lebaneseCuisineQuizPlugin } from "./lebanese-cuisine-quiz/index.js";
import { ethiopianCuisineQuizPlugin } from "./ethiopian-cuisine-quiz/index.js";
import { nordicCuisineQuizPlugin } from "./nordic-cuisine-quiz/index.js";
import { cardShovelPlugin } from "./card-shovel/index.js";
import { cardSpiralPlugin } from "./card-spiral/index.js";
import { cardDominoPlugin } from "./card-domino/index.js";
import { cardFlipPlugin } from "./card-flip/index.js";
import { cardTrioBuildPlugin } from "./card-trio-build/index.js";
import { dicePinballPlugin } from "./dice-pinball/index.js";
import { diceRocketPlugin } from "./dice-rocket/index.js";
import { diceShootMiniPlugin } from "./dice-shoot-mini/index.js";
import { diceRollCallPlugin } from "./dice-roll-call/index.js";
import { diceHotDicePlugin } from "./dice-hot-dice/index.js";
import { puppyTapPlugin } from "./puppy-tap/index.js";
import { kittenClickPlugin } from "./kitten-click/index.js";
import { goldfishGrabPlugin } from "./goldfish-grab/index.js";
import { parrotPopPlugin } from "./parrot-pop/index.js";
import { hamsterHopPlugin } from "./hamster-hop/index.js";
import { gameOfLifeClassicPlugin } from "./game-of-life-classic/index.js";
import { gameOfLifeConwayPlugin } from "./game-of-life-conway/index.js";
import { careersMiniPlugin } from "./careers-mini/index.js";
import { paydayMiniPlugin } from "./payday-mini/index.js";
import { pursuitMiniPlugin } from "./pursuit-mini/index.js";
import { mallManiaMiniPlugin } from "./mall-mania-mini/index.js";
import { startupLifeMiniPlugin } from "./startup-life-mini/index.js";
import { langtonsAntMiniPlugin } from "./langtons-ant-mini/index.js";
import { life1dPlugin } from "./life-1d/index.js";
import { brainOfBrianPlugin } from "./brain-of-brian/index.js";
import { monopolyMiniPlugin } from "./monopoly-mini/index.js";
import { riskMiniPlugin } from "./risk-mini/index.js";
import { americanCivilWarQuizPlugin } from "./american-civil-war-quiz/index.js";
import { revolutionaryWarQuizPlugin } from "./revolutionary-war-quiz/index.js";
import { napoleonicWarsQuizPlugin } from "./napoleonic-wars-quiz/index.js";
import { vietnamWarQuizPlugin } from "./vietnam-war-quiz/index.js";
import { koreanWarQuizPlugin } from "./korean-war-quiz/index.js";
import { pacificWarQuizPlugin } from "./pacific-war-quiz/index.js";
import { easternFrontQuizPlugin } from "./eastern-front-quiz/index.js";
import { gulfWarQuizPlugin } from "./gulf-war-quiz/index.js";
import { crusadesQuizPlugin } from "./crusades-quiz/index.js";
import { q100YearsWarQuizPlugin } from "./100-years-war-quiz/index.js";
import { discoEraQuizPlugin } from "./disco-era-quiz/index.js";
import { grungeEraQuizPlugin } from "./grunge-era-quiz/index.js";
import { raveEraQuizPlugin } from "./rave-era-quiz/index.js";
import { mtvEraQuizPlugin } from "./mtv-era-quiz/index.js";
import { streamingEraQuizPlugin } from "./streaming-era-quiz/index.js";
import { memeEraQuizPlugin } from "./meme-era-quiz/index.js";
import { boyBandsQuizPlugin } from "./boy-bands-quiz/index.js";
import { girlGroupsQuizPlugin } from "./girl-groups-quiz/index.js";
import { cardMashPlugin } from "./card-mash/index.js";
import { cardCupPlugin } from "./card-cup/index.js";
import { cardJamPlugin } from "./card-jam/index.js";
import { cardSpikePlugin } from "./card-spike/index.js";
import { cardYankPlugin } from "./card-yank/index.js";
import { cardZipPlugin } from "./card-zip/index.js";
import { cardFanPlugin } from "./card-fan/index.js";
import { diceClutterPlugin } from "./dice-clutter/index.js";
import { diceTrailPlugin } from "./dice-trail/index.js";
import { diceBakePlugin } from "./dice-bake/index.js";
import { diceBlockadePlugin } from "./dice-blockade/index.js";
import { diceMysticPlugin } from "./dice-mystic/index.js";
import { roboSnapPlugin } from "./robo-snap/index.js";
import { mechMashPlugin } from "./mech-mash/index.js";
import { cogClickPlugin } from "./cog-click/index.js";
import { gearGrabPlugin } from "./gear-grab/index.js";
import { circuitCapPlugin } from "./circuit-cap/index.js";
import { medievalLifeQuizPlugin } from "./medieval-life-quiz/index.js";
import { feudalJapanQuizPlugin } from "./feudal-japan-quiz/index.js";
import { ottomanEmpireQuizPlugin } from "./ottoman-empire-quiz/index.js";
import { byzantineQuizPlugin } from "./byzantine-quiz/index.js";
import { mongolEmpireQuizPlugin } from "./mongol-empire-quiz/index.js";
import { mayanQuizPlugin } from "./mayan-quiz/index.js";
import { incanQuizPlugin } from "./incan-quiz/index.js";
import { aztecQuizPlugin } from "./aztec-quiz/index.js";
import { vikingQuizPlugin } from "./viking-quiz/index.js";
import { prehistoricQuizPlugin } from "./prehistoric-quiz/index.js";
import { medicalDiscoveriesQuizPlugin } from "./medical-discoveries-quiz/index.js";
import { physicsDiscoveriesQuizPlugin } from "./physics-discoveries-quiz/index.js";
import { spaceDiscoveriesQuizPlugin } from "./space-discoveries-quiz/index.js";
import { inventorsToolsQuizPlugin } from "./inventors-tools-quiz/index.js";
import { transportInventionsQuizPlugin } from "./transport-inventions-quiz/index.js";
import { communicationInventionsQuizPlugin } from "./communication-inventions-quiz/index.js";
import { foodInventionsQuizPlugin } from "./food-inventions-quiz/index.js";
import { weaponInventionsQuizPlugin } from "./weapon-inventions-quiz/index.js";
import { cardCliffPlugin } from "./card-cliff/index.js";
import { cardJunglePlugin } from "./card-jungle/index.js";
import { cardOceanPlugin } from "./card-ocean/index.js";
import { cardVolcanoPlugin } from "./card-volcano/index.js";
import { cardGlacierPlugin } from "./card-glacier/index.js";
import { cardTemplePlugin } from "./card-temple/index.js";
import { cardSavannaPlugin } from "./card-savanna/index.js";
import { diceQuestMiniPlugin } from "./dice-quest-mini/index.js";
import { dicePortalPlugin } from "./dice-portal/index.js";
import { diceTreasurePlugin } from "./dice-treasure/index.js";
import { diceMountainPlugin } from "./dice-mountain/index.js";
import { diceCavePlugin } from "./dice-cave/index.js";
import { golfBallTapPlugin } from "./golf-ball-tap/index.js";
import { tennisBallTapPlugin } from "./tennis-ball-tap/index.js";
import { baseballTapPlugin } from "./baseball-tap/index.js";
import { soccerBallTapPlugin } from "./soccer-ball-tap/index.js";
import { bowlingPinTapPlugin } from "./bowling-pin-tap/index.js";

import { eurovisionQuizPlugin } from "./eurovision-quiz/index.js";
import { grammyAwardsQuizPlugin } from "./grammy-awards-quiz/index.js";
import { billboardHitsQuizPlugin } from "./billboard-hits-quiz/index.js";
import { mtvMusicAwardsQuizPlugin } from "./mtv-music-awards-quiz/index.js";
import { americanIdolQuizPlugin } from "./american-idol-quiz/index.js";
import { voiceShowQuizPlugin } from "./voice-show-quiz/index.js";
import { xfactorQuizPlugin } from "./xfactor-quiz/index.js";
import { karaokeClassicsQuizPlugin } from "./karaoke-classics-quiz/index.js";
import { oneHitWondersQuizPlugin } from "./one-hit-wonders-quiz/index.js";
import { summerHitsQuizPlugin } from "./summer-hits-quiz/index.js";
import { appleHistoryQuizPlugin } from "./apple-history-quiz/index.js";
import { microsoftHistoryQuizPlugin } from "./microsoft-history-quiz/index.js";
import { googleHistoryQuizPlugin } from "./google-history-quiz/index.js";
import { facebookHistoryQuizPlugin } from "./facebook-history-quiz/index.js";
import { amazonHistoryQuizPlugin } from "./amazon-history-quiz/index.js";
import { netflixHistoryQuizPlugin } from "./netflix-history-quiz/index.js";
import { teslaHistoryQuizPlugin } from "./tesla-history-quiz/index.js";
import { spacexHistoryQuizPlugin } from "./spacex-history-quiz/index.js";
import { cardTornadoPlugin } from "./card-tornado/index.js";
import { cardFloodPlugin } from "./card-flood/index.js";
import { cardMeteorPlugin } from "./card-meteor/index.js";
import { cardEclipsePlugin } from "./card-eclipse/index.js";
import { cardAuroraPlugin } from "./card-aurora/index.js";
import { cardMiragePlugin } from "./card-mirage/index.js";
import { cardLighthousePlugin } from "./card-lighthouse/index.js";
import { diceTemplePlugin } from "./dice-temple/index.js";
import { diceCastlePlugin } from "./dice-castle/index.js";
import { diceTowerMiniPlugin } from "./dice-tower-mini/index.js";
import { diceGalaxyPlugin } from "./dice-galaxy/index.js";
import { diceTyphoonPlugin } from "./dice-typhoon/index.js";
import { coconutCrackPlugin } from "./coconut-crack/index.js";
import { mangoTapPlugin } from "./mango-tap/index.js";
import { pineapplePopPlugin } from "./pineapple-pop/index.js";
import { palmFrondPlugin } from "./palm-frond/index.js";
import { surfSpikePlugin } from "./surf-spike/index.js";
import { snlQuizPlugin } from "./snl-quiz/index.js";
import { montyPythonQuizPlugin } from "./monty-python-quiz/index.js";
import { melBrooksQuizPlugin } from "./mel-brooks-quiz/index.js";
import { mrBeanQuizPlugin } from "./mr-bean-quiz/index.js";
import { jimCarreyQuizPlugin } from "./jim-carrey-quiz/index.js";
import { adamSandlerQuizPlugin } from "./adam-sandler-quiz/index.js";
import { willFerrellQuizPlugin } from "./will-ferrell-quiz/index.js";
import { comedyCentralQuizPlugin } from "./comedy-central-quiz/index.js";
import { britishComedyQuizPlugin } from "./british-comedy-quiz/index.js";
import { standUpComedyQuizPlugin } from "./stand-up-comedy-quiz/index.js";
import { kubrickQuizPlugin } from "./kubrick-quiz/index.js";
import { tarantinoQuizPlugin } from "./tarantino-quiz/index.js";
import { nolanQuizPlugin } from "./nolan-quiz/index.js";
import { scorseseQuizPlugin } from "./scorsese-quiz/index.js";
import { coppolaQuizPlugin } from "./coppola-quiz/index.js";
import { spielbergQuizPlugin } from "./spielberg-quiz/index.js";
import { hitchcockQuizPlugin } from "./hitchcock-quiz/index.js";
import { kurosawaQuizPlugin } from "./kurosawa-quiz/index.js";
import { cardMountainPlugin } from "./card-mountain/index.js";
import { cardRiverPlugin } from "./card-river/index.js";
import { cardIslandPlugin } from "./card-island/index.js";
import { cardStormMiniPlugin } from "./card-storm-mini/index.js";
import { cardCanyonPlugin } from "./card-canyon/index.js";
import { cardBridgeBuildPlugin } from "./card-bridge-build/index.js";
import { cardCastleBuildPlugin } from "./card-castle-build/index.js";
import { diceBazaarPlugin } from "./dice-bazaar/index.js";
import { diceMuseumPlugin } from "./dice-museum/index.js";
import { diceCourtroomPlugin } from "./dice-courtroom/index.js";
import { diceLaboratoryPlugin } from "./dice-laboratory/index.js";
import { diceArenaPlugin } from "./dice-arena/index.js";
import { starSnapPlugin } from "./star-snap/index.js";
import { cometCatchPlugin } from "./comet-catch/index.js";
import { nebulaNudgePlugin } from "./nebula-nudge/index.js";
import { planetPopPlugin } from "./planet-pop/index.js";
import { meteorBashPlugin } from "./meteor-bash/index.js";
import { musicTheoryQuizPlugin } from "./music-theory-quiz/index.js";
import { musicNotationQuizPlugin } from "./music-notation-quiz/index.js";
import { musicalInstrumentsQuizPlugin } from "./musical-instruments-quiz/index.js";
import { keysAndModesQuizPlugin } from "./keys-and-modes-quiz/index.js";
import { chordProgressionsQuizPlugin } from "./chord-progressions-quiz/index.js";
import { composersClassicalQuizPlugin } from "./composers-classical-quiz/index.js";
import { composersRomanticQuizPlugin } from "./composers-romantic-quiz/index.js";
import { composersModernQuizPlugin } from "./composers-modern-quiz/index.js";
import { recordingTechQuizPlugin } from "./recording-tech-quiz/index.js";
import { synthesizersQuizPlugin } from "./synthesizers-quiz/index.js";
import { salemTrialsQuizPlugin } from "./salem-trials-quiz/index.js";
import { nurembergTrialsQuizPlugin } from "./nuremberg-trials-quiz/index.js";
import { ojTrialQuizPlugin } from "./oj-trial-quiz/index.js";
import { assassinationsQuizPlugin } from "./assassinations-quiz/index.js";
import { unsolvedMysteriesQuizPlugin } from "./unsolved-mysteries-quiz/index.js";
import { mafiaQuizPlugin } from "./mafia-quiz/index.js";
import { piratesQuizPlugin } from "./pirates-quiz/index.js";
import { outlawsQuizPlugin } from "./outlaws-quiz/index.js";
import { cardCliffJumpPlugin } from "./card-cliff-jump/index.js";
import { cardLeapFrogPlugin } from "./card-leap-frog/index.js";
import { cardPuzzlePlugin } from "./card-puzzle/index.js";
import { cardSnakeLinePlugin } from "./card-snake-line/index.js";
import { cardSweepPlugin } from "./card-sweep/index.js";
import { cardCastleDefensePlugin } from "./card-castle-defense/index.js";
import { cardTreasureHuntPlugin } from "./card-treasure-hunt/index.js";
import { diceVillagePlugin } from "./dice-village/index.js";
import { diceTradeRoutePlugin } from "./dice-trade-route/index.js";
import { diceHarvestPlugin } from "./dice-harvest/index.js";
import { diceRailroadPlugin } from "./dice-railroad/index.js";
import { dicePiratePlugin } from "./dice-pirate/index.js";
import { brickBashPlugin } from "./brick-bash/index.js";
import { nailTapPlugin } from "./nail-tap/index.js";
import { woodWhackPlugin } from "./wood-whack/index.js";
import { concreteCrunchPlugin } from "./concrete-crunch/index.js";
import { craneClickPlugin } from "./crane-click/index.js";
import { titanicQuizPlugin } from "./titanic-quiz/index.js";
import { hindenburgQuizPlugin } from "./hindenburg-quiz/index.js";
import { chernobylQuizPlugin } from "./chernobyl-quiz/index.js";
import { pompeiiQuizPlugin } from "./pompeii-quiz/index.js";
import { sanFranciscoQuakeQuizPlugin } from "./san-francisco-quake-quiz/index.js";
import { mtStHelensQuizPlugin } from "./mt-st-helens-quiz/index.js";
import { katrinaQuizPlugin } from "./katrina-quiz/index.js";
import { bhopalQuizPlugin } from "./bhopal-quiz/index.js";
import { fukushimaQuizPlugin } from "./fukushima-quiz/index.js";
import { apollo1QuizPlugin } from "./apollo-1-quiz/index.js";
import { everestQuizPlugin } from "./everest-quiz/index.js";
import { sevenSummitsQuizPlugin } from "./seven-summits-quiz/index.js";
import { polarQuizPlugin } from "./polar-quiz/index.js";
import { desertTrekQuizPlugin } from "./desert-trek-quiz/index.js";
import { caveExploreQuizPlugin } from "./cave-explore-quiz/index.js";
import { deepSeaQuizPlugin } from "./deep-sea-quiz/index.js";
import { extremeSportsQuizPlugin } from "./extreme-sports-quiz/index.js";
import { survivalQuizPlugin } from "./survival-quiz/index.js";
import { cardTunnelPlugin } from "./card-tunnel/index.js";
import { cardBridgeCrossPlugin } from "./card-bridge-cross/index.js";
import { cardTowerStackPlugin } from "./card-tower-stack/index.js";
import { cardFountainPlugin } from "./card-fountain/index.js";
import { cardStatuePlugin } from "./card-statue/index.js";
import { cardTrainTrackPlugin } from "./card-train-track/index.js";
import { cardLanternLightPlugin } from "./card-lantern-light/index.js";
import { diceBlacksmithPlugin } from "./dice-blacksmith/index.js";
import { diceBakeryPlugin } from "./dice-bakery/index.js";
import { diceFarmPlugin } from "./dice-farm/index.js";
import { diceFisheryPlugin } from "./dice-fishery/index.js";
import { diceMinePlugin } from "./dice-mine/index.js";
import { hammerTapPlugin } from "./hammer-tap/index.js";
import { screwGrabPlugin } from "./screw-grab/index.js";
import { wrenchWhackPlugin } from "./wrench-whack/index.js";
import { sawSnapPlugin } from "./saw-snap/index.js";
import { paintPopPlugin } from "./paint-pop/index.js";
import { summerOlympicsQuizPlugin } from "./summer-olympics-quiz/index.js";
import { winterOlympicsQuizPlugin } from "./winter-olympics-quiz/index.js";
import { paralympicsQuizPlugin } from "./paralympics-quiz/index.js";
import { trackFieldQuizPlugin } from "./track-field-quiz/index.js";
import { swimmingEventsQuizPlugin } from "./swimming-events-quiz/index.js";
import { gymnasticsQuizPlugin } from "./gymnastics-quiz/index.js";
import { figureSkatingQuizPlugin } from "./figure-skating-quiz/index.js";
import { bobsledQuizPlugin } from "./bobsled-quiz/index.js";
import { boxingRulesQuizPlugin } from "./boxing-rules-quiz/index.js";
import { wrestlingRulesQuizPlugin } from "./wrestling-rules-quiz/index.js";
import { eiffelTowerQuizPlugin } from "./eiffel-tower-quiz/index.js";
import { pyramidsQuizPlugin } from "./pyramids-quiz/index.js";
import { greatWallQuizPlugin } from "./great-wall-quiz/index.js";
import { colosseumQuizPlugin } from "./colosseum-quiz/index.js";
import { tajMahalQuizPlugin } from "./taj-mahal-quiz/index.js";
import { parthenonQuizPlugin } from "./parthenon-quiz/index.js";
import { statueLibertyQuizPlugin } from "./statue-liberty-quiz/index.js";
import { christRedeemerQuizPlugin } from "./christ-redeemer-quiz/index.js";
import { cardFlagPolePlugin } from "./card-flag-pole/index.js";
import { cardMountainClimbPlugin } from "./card-mountain-climb/index.js";
import { cardStadiumPlugin } from "./card-stadium/index.js";
import { cardArenaMiniPlugin } from "./card-arena-mini/index.js";
import { cardParkPlugin } from "./card-park/index.js";
import { cardZooPlugin } from "./card-zoo/index.js";
import { cardMuseumPlugin } from "./card-museum/index.js";
import { diceCookingPlugin } from "./dice-cooking/index.js";
import { dicePaintingPlugin } from "./dice-painting/index.js";
import { diceMusicMiniPlugin } from "./dice-music-mini/index.js";
import { dicePhotographyPlugin } from "./dice-photography/index.js";
import { diceArcheologyPlugin } from "./dice-archeology/index.js";
import { carChasePlugin } from "./car-chase/index.js";
import { bikeBashPlugin } from "./bike-bash/index.js";
import { truckTapPlugin } from "./truck-tap/index.js";
import { busBashPlugin } from "./bus-bash/index.js";
import { trainTapPlugin } from "./train-tap/index.js";
import { vintageCarsQuizPlugin } from "./vintage-cars-quiz/index.js";
import { muscleCarsQuizPlugin } from "./muscle-cars-quiz/index.js";
import { supercarsQuizPlugin } from "./supercars-quiz/index.js";
import { trucksHistoryQuizPlugin } from "./trucks-history-quiz/index.js";
import { schoolBusesQuizPlugin } from "./school-buses-quiz/index.js";
import { subwaysQuizPlugin } from "./subways-quiz/index.js";
import { bulletTrainsQuizPlugin } from "./bullet-trains-quiz/index.js";
import { helicoptersQuizPlugin } from "./helicopters-quiz/index.js";
import { submarinesQuizPlugin } from "./submarines-quiz/index.js";
import { cruiseShipsQuizPlugin } from "./cruise-ships-quiz/index.js";
import { dogCareQuizPlugin } from "./dog-care-quiz/index.js";
import { catCareQuizPlugin } from "./cat-care-quiz/index.js";
import { aquariumQuizPlugin } from "./aquarium-quiz/index.js";
import { birdCareQuizPlugin } from "./bird-care-quiz/index.js";
import { reptileCareQuizPlugin } from "./reptile-care-quiz/index.js";
import { horseCareQuizPlugin } from "./horse-care-quiz/index.js";
import { farmAnimalQuizPlugin } from "./farm-animal-quiz/index.js";
import { wildlifeQuizPlugin } from "./wildlife-quiz/index.js";
import { cardGroceryPlugin } from "./card-grocery/index.js";
import { cardPharmacyPlugin } from "./card-pharmacy/index.js";
import { cardRestaurantPlugin } from "./card-restaurant/index.js";
import { cardCoffeePlugin } from "./card-coffee/index.js";
import { cardBakeryPlugin } from "./card-bakery/index.js";
import { cardFlowerShopPlugin } from "./card-flower-shop/index.js";
import { cardBookshopPlugin } from "./card-bookshop/index.js";
import { diceTrapezePlugin } from "./dice-trapeze/index.js";
import { diceCircusPlugin } from "./dice-circus/index.js";
import { diceMagicPlugin } from "./dice-magic/index.js";
import { diceOrchestraPlugin } from "./dice-orchestra/index.js";
import { diceBallroomPlugin } from "./dice-ballroom/index.js";
import { pencilPopPlugin } from "./pencil-pop/index.js";
import { eraserTapPlugin } from "./eraser-tap/index.js";
import { staplerSnapPlugin } from "./stapler-snap/index.js";
import { paperclipPinchPlugin } from "./paperclip-pinch/index.js";
import { rulerRumblePlugin } from "./ruler-rumble/index.js";
import { greatTrainRobberyQuizPlugin } from "./great-train-robbery-quiz/index.js";
import { coldWarSpiesQuizPlugin } from "./cold-war-spies-quiz/index.js";
import { ciaQuizPlugin } from "./cia-quiz/index.js";
import { kgbQuizPlugin } from "./kgb-quiz/index.js";
import { mi6QuizPlugin } from "./mi6-quiz/index.js";
import { bonnieClydeQuizPlugin } from "./bonnie-clyde-quiz/index.js";
import { dillingerQuizPlugin } from "./dillinger-quiz/index.js";
import { alCaponeQuizPlugin } from "./al-capone-quiz/index.js";
import { artHeistsQuizPlugin } from "./art-heists-quiz/index.js";
import { bankHeistsQuizPlugin } from "./bank-heists-quiz/index.js";
import { nobelPeaceQuizPlugin } from "./nobel-peace-quiz/index.js";
import { academyAwardsQuizPlugin } from "./academy-awards-quiz/index.js";
import { tonyAwardsQuizPlugin } from "./tony-awards-quiz/index.js";
import { emmyAwardsQuizPlugin } from "./emmy-awards-quiz/index.js";
import { cannesQuizPlugin } from "./cannes-quiz/index.js";
import { pulitzerQuizPlugin } from "./pulitzer-quiz/index.js";
import { manBookerQuizPlugin } from "./man-booker-quiz/index.js";
import { palmeDorQuizPlugin } from "./palme-dor-quiz/index.js";
import { cardStadiumFansPlugin } from "./card-stadium-fans/index.js";
import { cardPetShopPlugin } from "./card-pet-shop/index.js";
import { cardToyStorePlugin } from "./card-toy-store/index.js";
import { cardCandyShopPlugin } from "./card-candy-shop/index.js";
import { cardMusicShopPlugin } from "./card-music-shop/index.js";
import { cardPharmacyMiniPlugin } from "./card-pharmacy-mini/index.js";
import { cardShoeStorePlugin } from "./card-shoe-store/index.js";
import { cardElectronicsPlugin } from "./card-electronics/index.js";
import { cardJewelryPlugin } from "./card-jewelry/index.js";
import { cardFlowerPickupPlugin } from "./card-flower-pickup/index.js";
import { diceSpaceshipPlugin } from "./dice-spaceship/index.js";
import { diceTreasureMapPlugin } from "./dice-treasure-map/index.js";
import { diceIslandHopPlugin } from "./dice-island-hop/index.js";
import { diceMonsterMashPlugin } from "./dice-monster-mash/index.js";
import { diceKnightQuestPlugin } from "./dice-knight-quest/index.js";
import { diceWizardSpellPlugin } from "./dice-wizard-spell/index.js";
import { diceDragonFightPlugin } from "./dice-dragon-fight/index.js";
import { diceCastleSiegePlugin } from "./dice-castle-siege/index.js";
import { balloonPopMiniPlugin } from "./balloon-pop-mini/index.js";
import { bubbleBurstMiniPlugin } from "./bubble-burst-mini/index.js";
import { confettiShowerPlugin } from "./confetti-shower/index.js";
import { streamerTossPlugin } from "./streamer-toss/index.js";
import { giftGrabPlugin } from "./gift-grab/index.js";
import { cakeClutchPlugin } from "./cake-clutch/index.js";
import { candleCapPlugin } from "./candle-cap/index.js";
import { maskMashPlugin } from "./mask-mash/index.js";
import { holdemNoLimitPlugin } from "./holdem-no-limit/index.js";
import { holdemPotLimitPlugin } from "./holdem-pot-limit/index.js";
import { holdemFixedLimitPlugin } from "./holdem-fixed-limit/index.js";
import { holdemSpreadLimitPlugin } from "./holdem-spread-limit/index.js";
import { omahaHiPlugin } from "./omaha-hi/index.js";
import { omahaHiLoPlugin } from "./omaha-hi-lo/index.js";
import { omahaFiveCardHiPlugin } from "./omaha-five-card-hi/index.js";
import { omahaFiveCardHiLoPlugin } from "./omaha-five-card-hi-lo/index.js";
import { courchevelPokerPlugin } from "./courchevel-poker/index.js";
import { courchevelHiLoPlugin } from "./courchevel-hi-lo/index.js";
import { sevenStudHiLoPlugin } from "./seven-stud-hi-lo/index.js";
import { fiveStudPokerPlugin } from "./five-stud-poker/index.js";
import { twoSevenTripleDrawPlugin } from "./two-seven-triple-draw/index.js";
import { twoSevenSingleDrawPlugin } from "./two-seven-single-draw/index.js";
import { aceFiveTripleDrawPlugin } from "./ace-five-triple-draw/index.js";
import { badeucyPokerPlugin } from "./badeucy-poker/index.js";
import { badaceyPokerPlugin } from "./badacey-poker/index.js";
import { pineapplePokerPlugin } from "./pineapple-poker/index.js";
import { crazyPineapplePlugin } from "./crazy-pineapple/index.js";
import { lazyPineapplePlugin } from "./lazy-pineapple/index.js";
import { superHoldemPlugin } from "./super-holdem/index.js";
import { doubleFlopHoldemPlugin } from "./double-flop-holdem/index.js";
import { doubleBoardBombPotPlugin } from "./double-board-bomb-pot/index.js";
import { svitenSpecialPlugin } from "./sviten-special/index.js";
import { horseMixPlugin } from "./horse-mix/index.js";
import { hoseMixPlugin } from "./hose-mix/index.js";
import { eightGameMixPlugin } from "./eight-game-mix/index.js";
import { tenGameMixPlugin } from "./ten-game-mix/index.js";
import { dealersChoicePokerPlugin } from "./dealers-choice-poker/index.js";
import { headsUpSngPlugin } from "./heads-up-sng/index.js";
import { shortDeckHoldemPlugin } from "./short-deck-holdem/index.js";
import { openFaceChinesePlugin } from "./open-face-chinese/index.js";
import { pineappleOfcPlugin } from "./pineapple-ofc/index.js";
import { fantasylandOfcPlugin } from "./fantasyland-ofc/index.js";
import { closedChinesePokerPlugin } from "./closed-chinese-poker/index.js";
import { mahjongSpiderLayoutPlugin } from "./mahjong-spider-layout/index.js";
import { mahjongWheelLayoutPlugin } from "./mahjong-wheel-layout/index.js";
import { mahjongTheatreLayoutPlugin } from "./mahjong-theatre-layout/index.js";
import { mahjongButterflyLayoutPlugin } from "./mahjong-butterfly-layout/index.js";
import { mahjongLadybugLayoutPlugin } from "./mahjong-ladybug-layout/index.js";
import { mahjongArenaLayoutPlugin } from "./mahjong-arena-layout/index.js";
import { mahjongFourWindsPlugin } from "./mahjong-four-winds/index.js";
import { mahjongCathedralPlugin } from "./mahjong-cathedral/index.js";
import { mahjongBridgePlugin } from "./mahjong-bridge/index.js";
import { mahjongCrabPlugin } from "./mahjong-crab/index.js";
import { mahjongImperialPlugin } from "./mahjong-imperial/index.js";
import { mahjongFortressPlugin } from "./mahjong-fortress/index.js";
import { mahjongPagodaPlugin } from "./mahjong-pagoda/index.js";
import { mahjongFishPlugin } from "./mahjong-fish/index.js";
import { mahjongCherryBlossomPlugin } from "./mahjong-cherry-blossom/index.js";
import { mahjongSnakePlugin } from "./mahjong-snake/index.js";
import { mahjongRabbitPlugin } from "./mahjong-rabbit/index.js";
import { mahjongChristmasTreePlugin } from "./mahjong-christmas-tree/index.js";
import { mahjongHeartPlugin } from "./mahjong-heart/index.js";
import { mahjongScorpionLayoutPlugin } from "./mahjong-scorpion-layout/index.js";
import { mahjongMeteorPlugin } from "./mahjong-meteor/index.js";
import { mahjongAncientPlugin } from "./mahjong-ancient/index.js";
import { mahjongDynastyPlugin } from "./mahjong-dynasty/index.js";
import { mahjongSeasonsCyclePlugin } from "./mahjong-seasons-cycle/index.js";
import { mahjongTimeAttackPlugin } from "./mahjong-time-attack/index.js";
import { mahjongChallengeModePlugin } from "./mahjong-challenge-mode/index.js";
import { mahjongConnectPlugin } from "./mahjong-connect/index.js";
import { onetConnectClassicPlugin } from "./onet-connect-classic/index.js";
import { shisenShoGravityPlugin } from "./shisen-sho-gravity/index.js";
import { shisenShoExtendedPlugin } from "./shisen-sho-extended/index.js";
import { shanghaiMahjongPlugin } from "./shanghai-mahjong/index.js";
import { shanghaiDynastyPlugin } from "./shanghai-dynasty/index.js";
import { mahjongTrailsPlugin } from "./mahjong-trails/index.js";
import { mahjongQuestPlugin } from "./mahjong-quest/index.js";
import { butterflyPuzzleTilesPlugin } from "./butterfly-puzzle-tiles/index.js";
import { mahjongTurtle3dLayoutPlugin } from "./mahjong-turtle-3d-layout/index.js";
import { mahjongIshidoLayoutPlugin } from "./mahjong-ishido-layout/index.js";
import { mahjongShanghaiDynastyLayoutPlugin } from "./mahjong-shanghai-dynasty-layout/index.js";
import { mahjongDimensionsLayoutPlugin } from "./mahjong-dimensions-layout/index.js";
import { mahjongEpicLayoutPlugin } from "./mahjong-epic-layout/index.js";
import { mahjongEastRoundLayoutPlugin } from "./mahjong-east-round-layout/index.js";
import { mahjongSouthRoundLayoutPlugin } from "./mahjong-south-round-layout/index.js";
import { mahjongFullGameLayoutPlugin } from "./mahjong-full-game-layout/index.js";
import { mahjongTenhouLayoutPlugin } from "./mahjong-tenhou-layout/index.js";
import { mahjongSoulLayoutPlugin } from "./mahjong-soul-layout/index.js";
import { mahjongQuadLayoutPlugin } from "./mahjong-quad-layout/index.js";
import { mahjongTsumogiriLayoutPlugin } from "./mahjong-tsumogiri-layout/index.js";
import { mahjongSichuanLayoutPlugin } from "./mahjong-sichuan-layout/index.js";
import { mahjongGuangdongLayoutPlugin } from "./mahjong-guangdong-layout/index.js";
import { mahjongShanghaineseLayoutPlugin } from "./mahjong-shanghainese-layout/index.js";
import { mahjongOnlineFfaLayoutPlugin } from "./mahjong-online-ffa-layout/index.js";
import { mahjongVietnameseLayoutPlugin } from "./mahjong-vietnamese-layout/index.js";
import { mahjongKoreanHwatooLayoutPlugin } from "./mahjong-korean-hwatoo-layout/index.js";
import { mahjongEuropeanClassicalLayoutPlugin } from "./mahjong-european-classical-layout/index.js";
import { mahjongRiichiMinefieldLayoutPlugin } from "./mahjong-riichi-minefield-layout/index.js";
import { mahjongSanmaLayoutPlugin } from "./mahjong-sanma-layout/index.js";
import { mahjongAmericanNmjlLayoutPlugin } from "./mahjong-american-nmjl-layout/index.js";
import { mahjongHongKongLayoutPlugin } from "./mahjong-hong-kong-layout/index.js";
import { mahjongStandardChineseLayoutPlugin } from "./mahjong-standard-chinese-layout/index.js";
import { mahjongRiichiJapaneseLayoutPlugin } from "./mahjong-riichi-japanese-layout/index.js";
import { mahjongTaiwaneseLayoutPlugin } from "./mahjong-taiwanese-layout/index.js";
import { mahjongSingaporeanLayoutPlugin } from "./mahjong-singaporean-layout/index.js";
import { mahjongHonorTilesLayoutPlugin } from "./mahjong-honor-tiles-layout/index.js";
import { mahjongJokersFlowersLayoutPlugin } from "./mahjong-jokers-flowers-layout/index.js";
import { mahjongTileTowerLayoutPlugin } from "./mahjong-tile-tower-layout/index.js";
import { mahjongFlowerBonusLayoutPlugin } from "./mahjong-flower-bonus-layout/index.js";
import { mahjongDoublePyramidLayoutPlugin } from "./mahjong-double-pyramid-layout/index.js";
import { mahjongCrossLayoutPlugin } from "./mahjong-cross-layout/index.js";
import { mahjongDiamondLayoutPlugin } from "./mahjong-diamond-layout/index.js";
import { mahjongRectangleLayoutPlugin } from "./mahjong-rectangle-layout/index.js";
import { bughousePlugin } from "./bughouse/index.js";
import { losingChessPlugin } from "./losing-chess/index.js";
import { threeCheckChessPlugin } from "./three-check-chess/index.js";
import { fogOfWarChessPlugin } from "./fog-of-war-chess/index.js";
import { fourPlayerChessTeamsPlugin } from "./four-player-chess-teams/index.js";
import { fourPlayerChessFfaPlugin } from "./four-player-chess-ffa/index.js";
import { threePlayerChessPlugin } from "./three-player-chess/index.js";
import { fischerCrazyhousePlugin } from "./fischer-crazyhouse/index.js";
import { hexChessMccooeyPlugin } from "./hex-chess-mccooey/index.js";
import { hexChessGlinskiPlugin } from "./hex-chess-glinski/index.js";
import { hexChessShafranPlugin } from "./hex-chess-shafran/index.js";
import { circularChessPlugin } from "./circular-chess/index.js";
import { aliceChessPlugin } from "./alice-chess/index.js";
import { knightmateChessPlugin } from "./knightmate-chess/index.js";
import { losAlamosChessPlugin } from "./los-alamos-chess/index.js";
import { microchessPlugin } from "./microchess/index.js";
import { minichess5x5Plugin } from "./minichess-5x5/index.js";
import { cylinderChessPlugin } from "./cylinder-chess/index.js";
import { toroidalChessPlugin } from "./toroidal-chess/index.js";
import { darkChessPlugin } from "./dark-chess/index.js";
import { scottishProgressivePlugin } from "./scottish-progressive/index.js";
import { rifleChessPlugin } from "./rifle-chess/index.js";
import { leganChessPlugin } from "./legan-chess/index.js";
import { preChessPlugin } from "./pre-chess/index.js";
import { marseillaisChessPlugin } from "./marseillais-chess/index.js";
import { transcendentalChessPlugin } from "./transcendental-chess/index.js";
import { pocketKnightChessPlugin } from "./pocket-knight-chess/index.js";
import { spartanChessPlugin } from "./spartan-chess/index.js";
import { almostChessPlugin } from "./almost-chess/index.js";
import { embassyChessPlugin } from "./embassy-chess/index.js";
import { grandChessPlugin } from "./grand-chess/index.js";
import { capablancaChessPlugin } from "./capablanca-chess/index.js";
import { gothicChessPlugin } from "./gothic-chess/index.js";
import { omegaChessPlugin } from "./omega-chess/index.js";
import { seirawanChessPlugin } from "./seirawan-chess/index.js";
import { dianaChessPlugin } from "./diana-chess/index.js";
import { randomChessPlugin } from "./random-chess/index.js";
import { maharajahSepoysPlugin } from "./maharajah-sepoys/index.js";
import { peasantsRevoltPlugin } from "./peasants-revolt/index.js";
import { asymmetricChessPlugin } from "./asymmetric-chess/index.js";
import { betzaArmiesPlugin } from "./betza-armies/index.js";
import { courierChessPlugin } from "./courier-chess/index.js";
import { chaturangaPlugin } from "./chaturanga/index.js";
import { microShogiPlugin } from "./micro-shogi/index.js";
import { daiShogiPlugin } from "./dai-shogi/index.js";
import { toriShogiPlugin } from "./tori-shogi/index.js";
import { annanShogiPlugin } from "./annan-shogi/index.js";
import { waShogiPlugin } from "./wa-shogi/index.js";
import { heianShogiPlugin } from "./heian-shogi/index.js";
import { xiangqiBlindPlugin } from "./xiangqi-blind/index.js";
import { canadianCheckersPlugin } from "./canadian-checkers/index.js";
import { giveawayCheckersPlugin } from "./giveaway-checkers/index.js";
import { gothicCheckersPlugin } from "./gothic-checkers/index.js";
import { vertexCheckersPlugin } from "./vertex-checkers/index.js";
import { reversiTimedPlugin } from "./reversi-timed/index.js";
import { antiOthelloPlugin } from "./anti-othello/index.js";
import { reversiRandomStartPlugin } from "./reversi-random-start/index.js";
import { camelotPlugin } from "./camelot/index.js";
import { chineseCheckers2pPlugin } from "./chinese-checkers-2p/index.js";
import { saltaPlugin } from "./salta/index.js";
import { go19x19Plugin } from "./go-19x19/index.js";
import { go13x13Plugin } from "./go-13x13/index.js";
import { toroidalGoPlugin } from "./toroidal-go/index.js";
import { phantomGoPlugin } from "./phantom-go/index.js";
import { pairGoPlugin } from "./pair-go/index.js";
import { rengoPlugin } from "./rengo/index.js";
import { oneColorGoPlugin } from "./one-color-go/index.js";
import { keryoPentePlugin } from "./keryo-pente/index.js";
import { twixtPlugin } from "./twixt/index.js";
import { hexGamePlugin } from "./hex-game/index.js";
import { klondikeDealOnePlugin } from "./klondike-deal-one/index.js";
import { agnesSorelPlugin } from "./agnes-sorel/index.js";
import { athenaPlugin } from "./athena/index.js";
import { blindHookeyPlugin } from "./blind-hookey/index.js";
import { westhavenPlugin } from "./westhaven/index.js";
import { demonPatiencePlugin } from "./demon-patience/index.js";
import { doubleKlondikePlugin } from "./double-klondike/index.js";
import { tripleKlondikePlugin } from "./triple-klondike/index.js";
import { freecellClassicPlugin } from "./freecell-classic/index.js";
import { seahavenTowersPlugin } from "./seahaven-towers/index.js";
import { stalactitesPlugin } from "./stalactites/index.js";
import { goodMeasurePlugin } from "./good-measure/index.js";
import { spanishPatiencePlugin } from "./spanish-patience/index.js";
import { spiderOneSuitPlugin } from "./spider-one-suit/index.js";
import { spiderTwoSuitsPlugin } from "./spider-two-suits/index.js";
import { waspPlugin } from "./wasp/index.js";
import { spidikePlugin } from "./spidike/index.js";
import { blackWidowPlugin } from "./black-widow/index.js";
import { willOWispPlugin } from "./will-o-wisp/index.js";
import { tutTombPlugin } from "./tut-tomb/index.js";
import { gizaPyramidPlugin } from "./giza-pyramid/index.js";
import { apophisPlugin } from "./apophis/index.js";
import { triPeaksContinuousPlugin } from "./tri-peaks-continuous/index.js";
import { golfParPlugin } from "./golf-par/index.js";
import { allInARowPlugin } from "./all-in-a-row/index.js";
import { clockPatiencePlugin } from "./clock-patience/index.js";
import { montanaGapsPlugin } from "./montana-gaps/index.js";
import { canfieldChameleonPlugin } from "./canfield-chameleon/index.js";
import { storehouseCanfieldPlugin } from "./storehouse-canfield/index.js";
import { methuselahPlugin } from "./methuselah/index.js";
import { towerOfLondonPlugin } from "./tower-of-london/index.js";
import { chessboardPlugin } from "./chessboard/index.js";
import { napoleonStHelenaPlugin } from "./napoleon-st-helena/index.js";
import { napoleonsSquarePlugin } from "./napoleons-square/index.js";
import { napoleonsShoulderPlugin } from "./napoleons-shoulder/index.js";
import { duchessLuynesPlugin } from "./duchess-luynes/index.js";
import { propellerPlugin } from "./propeller/index.js";
import { sundialPlugin } from "./sundial/index.js";
import { trefoilPlugin } from "./trefoil/index.js";
import { moosehidePlugin } from "./moosehide/index.js";
import { chineseKlondikePlugin } from "./chinese-klondike/index.js";
import { uskPatiencePlugin } from "./usk-patience/index.js";
import { superiorCanfieldPlugin } from "./superior-canfield/index.js";
import { rainbowCanfieldPlugin } from "./rainbow-canfield/index.js";
import { selectiveCanfieldPlugin } from "./selective-canfield/index.js";
import { toadHolePlugin } from "./toad-hole/index.js";
import { glenwoodPatiencePlugin } from "./glenwood-patience/index.js";
import { hopscotchSolitairePlugin } from "./hopscotch-solitaire/index.js";
import { tutsTombPlugin } from "./tuts-tomb/index.js";
import { simplePairsPlugin } from "./simple-pairs/index.js";
import { idiotsDelightPlugin } from "./idiots-delight/index.js";
import { carltonPatiencePlugin } from "./carlton-patience/index.js";
import { kingsQueensPlugin } from "./kings-queens/index.js";
import { nineAcrossPlugin } from "./nine-across/index.js";
import { matrimonyPatiencePlugin } from "./matrimony-patience/index.js";
import { gargantuaPlugin } from "./gargantua/index.js";
import { harpPatiencePlugin } from "./harp-patience/index.js";
import { bigHarpPlugin } from "./big-harp/index.js";
import { raglanPatiencePlugin } from "./raglan-patience/index.js";
import { baronessPatiencePlugin } from "./baroness-patience/index.js";
import { legionPatiencePlugin } from "./legion-patience/index.js";
import { bigBenPlugin } from "./big-ben/index.js";
import { labyrinthPatiencePlugin } from "./labyrinth-patience/index.js";
import { zodiacPatiencePlugin } from "./zodiac-patience/index.js";
import { sirTommyPlugin } from "./sir-tommy/index.js";
import { fortressPlugin } from "./fortress/index.js";
import { bouquetPlugin } from "./bouquet/index.js";
import { accordionSolitairePlugin } from "./accordion-solitaire/index.js";
import { alaskaSolitairePlugin } from "./alaska-solitaire/index.js";
import { stonewallPlugin } from "./stonewall/index.js";
import { nackgammonPlugin } from "./nackgammon/index.js";
import { hypergammonPlugin } from "./hypergammon/index.js";
import { longGammonPlugin } from "./long-gammon/index.js";
import { chouettePlugin } from "./chouette/index.js";
import { portesPlugin } from "./portes/index.js";
import { plakotoPlugin } from "./plakoto/index.js";
import { fevgaPlugin } from "./fevga/index.js";
import { aceyDeuceyPlugin } from "./acey-deucey/index.js";
import { blastPointBackgammonPlugin } from "./blast-point-backgammon/index.js";
import { mahbusaPlugin } from "./mahbusa/index.js";
import { gulBaraPlugin } from "./gul-bara/index.js";
import { gioulPlugin } from "./gioul/index.js";
import { longNardiPlugin } from "./long-nardi/index.js";
import { duelingDiceBackgammonPlugin } from "./dueling-dice-backgammon/index.js";
import { jacobyRulePlugin } from "./jacoby-rule/index.js";
import { crawfordRulePlugin } from "./crawford-rule/index.js";
import { menschArgerePlugin } from "./mensch-argere/index.js";
import { aggravationPlugin } from "./aggravation/index.js";
import { frustrationPopPlugin } from "./frustration-pop/index.js";
import { fiaScandiPlugin } from "./fia-scandi/index.js";
import { connectFivePlugin } from "./connect-five/index.js";
import { connectSixPlugin } from "./connect-six/index.js";
import { connectFourPopoutPlugin } from "./connect-four-popout/index.js";
import { connectFour3dPlugin } from "./connect-four-3d/index.js";
import { kakugoPlugin } from "./kakugo/index.js";
import { swap2OpeningPlugin } from "./swap2-opening/index.js";
import { notaktoPlugin } from "./notakto/index.js";
import { wildTicTacToePlugin } from "./wild-tic-tac-toe/index.js";
import { ticTacToe4x4Plugin } from "./tic-tac-toe-4x4/index.js";
import { qubicPlugin } from "./qubic/index.js";
import { threeDTicTacToePlugin } from "./3d-tic-tac-toe-3/index.js";
import { scoreFourPlugin } from "./score-four/index.js";
import { gobbletMiniPlugin } from "./gobblet-mini/index.js";
import { tapatanPlugin } from "./tapatan/index.js";
import { shisimaPlugin } from "./shisima/index.js";
import { miracleSudokuMiniPlugin } from "./miracle-sudoku-mini/index.js";
import { thermoSudokuMiniPlugin } from "./thermo-sudoku-mini/index.js";
import { jigsawSudokuMiniPlugin } from "./jigsaw-sudoku-mini/index.js";
import { hyperSudokuMiniPlugin } from "./hyper-sudoku-mini/index.js";
import { antiKnightSudokuMiniPlugin } from "./anti-knight-sudoku-mini/index.js";
import { antiKingSudokuMiniPlugin } from "./anti-king-sudoku-mini/index.js";
import { nonConsecutiveSudokuPlugin } from "./non-consecutive-sudoku/index.js";
import { consecutivePairsSudokuPlugin } from "./consecutive-pairs-sudoku/index.js";
import { germanWhispersSudokuPlugin } from "./german-whispers-sudoku/index.js";
import { dutchWhispersSudokuPlugin } from "./dutch-whispers-sudoku/index.js";
import { renbanSudokuPlugin } from "./renban-sudoku/index.js";
import { oddEvenSudokuPlugin } from "./odd-even-sudoku/index.js";
import { littleKillerSudokuPlugin } from "./little-killer-sudoku/index.js";
import { palindromeSudokuPlugin } from "./palindrome-sudoku/index.js";
import { sandwichSudokuPlugin } from "./sandwich-sudoku/index.js";
import { xSudokuMiniPlugin } from "./x-sudoku-mini/index.js";
import { asteriskSudokuPlugin } from "./asterisk-sudoku/index.js";
import { centerDotSudokuPlugin } from "./center-dot-sudoku/index.js";
import { sudokuMini4x4Plugin } from "./sudoku-mini-4x4/index.js";
import { sudokuMini6x6Plugin } from "./sudoku-mini-6x6/index.js";
import { suguruMiniPlugin } from "./suguru-mini/index.js";
import { numbrixMiniPlugin } from "./numbrix-mini/index.js";
import { rippleEffectPlugin } from "./ripple-effect/index.js";
import { str8tsMiniPlugin } from "./str8ts-mini/index.js";
import { numberLinkMiniPlugin } from "./number-link-mini/index.js";
import { magnetsPuzzlePlugin } from "./magnets-puzzle/index.js";
import { litsPuzzlePlugin } from "./lits-puzzle/index.js";
import { binairoMiniPlugin } from "./binairo-mini/index.js";
import { takuzuMiniPlugin } from "./takuzu-mini/index.js";
import { yinYangPuzzlePlugin } from "./yin-yang-puzzle/index.js";
import { magicSquareQuizPlugin } from "./magic-square-quiz/index.js";
import { latinSquareMiniPlugin } from "./latin-square-mini/index.js";
import { kurodokoPlugin } from "./kurodoko/index.js";
import { sashiganePlugin } from "./sashigane/index.js";
import { fobidoshiPlugin } from "./fobidoshi/index.js";
import { koiKoiPlugin } from "./koi-koi-quiz/index.js";
import { hachiHachiPlugin } from "./hachi-hachi-quiz/index.js";
import { hanaAwasePlugin } from "./hana-awase-quiz/index.js";
import { mushifudaPlugin } from "./mushifuda-quiz/index.js";
import { sakuraPlugin } from "./sakura-quiz/index.js";
import { goStopPlugin } from "./go-stop-quiz/index.js";
import { hwatuPlugin } from "./hwatu-quiz/index.js";
import { irohaKarutaPlugin } from "./iroha-karuta-quiz/index.js";
import { hyakuninIsshuPlugin } from "./hyakunin-isshu-quiz/index.js";
import { utaGarutaPlugin } from "./uta-garuta-quiz/index.js";
import { obakeKarutaPlugin } from "./obake-karuta-quiz/index.js";
import { kyogiKarutaPlugin } from "./kyogi-karuta-quiz/index.js";
import { captureGoPlugin } from "./capture-go-quiz/index.js";
import { ponnukiGoPlugin } from "./ponnuki-go-quiz/index.js";
import { tozanGoPlugin } from "./tozan-go-quiz/index.js";
import { badukPlugin } from "./baduk-quiz/index.js";
import { renjuPlugin } from "./renju-quiz/index.js";
import { omokPlugin } from "./omok-quiz/index.js";
import { ninukiRenjuPlugin } from "./ninuki-renju-quiz/index.js";
import { gonuPlugin } from "./gonu-quiz/index.js";
import { yutNoriPlugin } from "./yut-nori-quiz/index.js";
import { ddakjiPlugin } from "./ddakji-quiz/index.js";
import { tamCucPlugin } from "./tam-cuc-quiz/index.js";
import { phanPlugin } from "./phan-quiz/index.js";
import { riichiMahjongPlugin } from "./riichi-mahjong-quiz/index.js";
import { taiwaneseMahjongPlugin } from "./taiwanese-mahjong-quiz/index.js";
import { cantoneseMahjongPlugin } from "./cantonese-mahjong-quiz/index.js";
import { singaporeMahjongPlugin } from "./singapore-mahjong-quiz/index.js";
import { mcrMahjongPlugin } from "./mcr-mahjong-quiz/index.js";
import { hasamiShogiPlugin } from "./hasami-shogi-quiz/index.js";
import { chuShogiPlugin } from "./chu-shogi-quiz/index.js";
import { douDiZhuPlugin } from "./dou-di-zhu-quiz/index.js";
import { seotdaPlugin } from "./seotda-quiz/index.js";
import { sutdaPlugin } from "./sutda-quiz/index.js";
import { hanamikojiPlugin } from "./hanamikoji-quiz/index.js";
import { dominionDeckPlugin } from "./dominion-deck/index.js";
import { ascensionGodslayerPlugin } from "./ascension-godslayer/index.js";
import { starRealmsDuelPlugin } from "./star-realms-duel/index.js";
import { heroRealmsQuestPlugin } from "./hero-realms-quest/index.js";
import { clankDungeonLootPlugin } from "./clank-dungeon-loot/index.js";
import { fridayIslandSurvivalPlugin } from "./friday-island-survival/index.js";
import { paperbackLettersPlugin } from "./paperback-letters/index.js";
import { hardbackNovelPlugin } from "./hardback-novel/index.js";
import { valeriaCardKingdomsPlugin } from "./valeria-card-kingdoms/index.js";
import { tinyEpicDungeonMiniPlugin } from "./tiny-epic-dungeon-mini/index.js";
import { mysticValeCraftPlugin } from "./mystic-vale-craft/index.js";
import { legendaryHeroesPlugin } from "./legendary-heroes/index.js";
import { munchkinMiniPlugin } from "./munchkin-mini/index.js";
import { fluxxFantasyRulesPlugin } from "./fluxx-fantasy-rules/index.js";
import { valleyOfKingsTombPlugin } from "./valley-of-kings-tomb/index.js";
import { doomlingsCatastrophePlugin } from "./doomlings-catastrophe/index.js";
import { bargainQuestShopPlugin } from "./bargain-quest-shop/index.js";
import { welcomeToDungeonPlugin } from "./welcome-to-dungeon/index.js";
import { resArcanaEssencePlugin } from "./res-arcana-essence/index.js";
import { cartographerHeroesPlugin } from "./cartographer-heroes/index.js";
import { everdellWoodlandPlugin } from "./everdell-woodland/index.js";
import { wingspanAviaryPlugin } from "./wingspan-aviary/index.js";
import { questElDoradoPlugin } from "./quest-el-dorado/index.js";
import { dungeonRollDelvePlugin } from "./dungeon-roll-delve/index.js";
import { quarriorsDiceDeckbuildPlugin } from "./quarriors-dice-deckbuild/index.js";
import { tinyEpicGalaxiesMiniPlugin } from "./tiny-epic-galaxies-mini/index.js";
import { dragonwoodCapturePlugin } from "./dragonwood-capture/index.js";
import { rollPlayerCharacterPlugin } from "./roll-player-character/index.js";
import { rollForGalaxyMiniPlugin } from "./roll-for-galaxy-mini/index.js";
import { oneDeckDungeonMiniPlugin } from "./one-deck-dungeon-mini/index.js";
import { ashesPhoenixbornPlugin } from "./ashes-phoenixborn/index.js";
import { diceThroneBattlePlugin } from "./dice-throne-battle/index.js";
import { dungeonFighterThrowPlugin } from "./dungeon-fighter-throw/index.js";
import { seasonsElementalPlugin } from "./seasons-elemental/index.js";
import { sagradaWindowPlugin } from "./sagrada-window/index.js";
import { carcassonneBasePlugin } from "./carcassonne-base/index.js";
import { kingdominoBasePlugin } from "./kingdomino-base/index.js";
import { queendominoBasePlugin } from "./queendomino-base/index.js";
import { kingdominoOriginsPlugin } from "./kingdomino-origins/index.js";
import { isleOfSkyePlugin } from "./isle-of-skye/index.js";
import { honshuBasePlugin } from "./honshu/index.js";
import { patchworkBasePlugin } from "./patchwork-base/index.js";
import { barenparkBasePlugin } from "./barenpark-base/index.js";
import { azulBasePlugin } from "./azul-base/index.js";
import { azulSummerPavilionPlugin } from "./azul-summer-pavilion/index.js";
import { tokaidoBasePlugin } from "./tokaido-base/index.js";
import { nmbr9StackPlugin } from "./nmbr9-stack/index.js";
import { tinyTownsGridPlugin } from "./tiny-towns-grid/index.js";
import { cascadiaHabitatPlugin } from "./cascadia-habitat/index.js";
import { calicoQuiltPlugin } from "./calico-quilt/index.js";
import { karubaExplorerPlugin } from "./karuba-explorer/index.js";
import { hiveQueenPlugin } from "./hive-queen/index.js";
import { qwixxDeluxePlugin } from "./qwixx-deluxe/index.js";
import { qwixxGemixxtPlugin } from "./qwixx-gemixxt/index.js";
import { railroadInkBluePlugin } from "./railroad-ink-blue/index.js";
import { railroadInkRedPlugin } from "./railroad-ink-red/index.js";
import { welcomeToSuburbPlugin } from "./welcome-to-suburb/index.js";
import { cartographersBasePlugin } from "./cartographers-base/index.js";
import { rollingAmericaPlugin } from "./rolling-america/index.js";
import { silverAndGoldPlugin } from "./silver-and-gold/index.js";
import { cleverDicePlugin } from "./clever-dice/index.js";
import { onTourRoadsPlugin } from "./on-tour-roads/index.js";
import { corinthMarketPlugin } from "./corinth-market/index.js";
import { threeSistersGardenPlugin } from "./three-sisters-garden/index.js";
import { hadriansWallRomanPlugin } from "./hadrians-wall-roman/index.js";
import { trek12HimalayaPlugin } from "./trek-12-himalaya/index.js";
import { harvestDiceGardenPlugin } from "./harvest-dice-garden/index.js";
import { secondChanceGridPlugin } from "./second-chance-grid/index.js";
import { nochMalCrossPlugin } from "./noch-mal-cross/index.js";
import { pointsSaladRollPlugin } from "./points-salad-roll/index.js";
import { wordleMiniPlugin } from "./wordle-mini/index.js";
import { dordleMiniPlugin } from "./dordle-mini/index.js";
import { octordleMiniPlugin } from "./octordle-mini/index.js";
import { sedecordleMiniPlugin } from "./sedecordle-mini/index.js";
import { duotrigordlePlugin } from "./duotrigordle/index.js";
import { waffleSwapPlugin } from "./waffle-swap/index.js";
import { nerdleEquationPlugin } from "./nerdle-equation/index.js";
import { worldleCountryPlugin } from "./worldle-country/index.js";
import { globleCountryPlugin } from "./globle-country/index.js";
import { semantleCluePlugin } from "./semantle-clue/index.js";
import { contextoCluePlugin } from "./contexto-clue/index.js";
import { absurdleMiniPlugin } from "./absurdle-mini/index.js";
import { squardleMiniPlugin } from "./squardle-mini/index.js";
import { crosswordleMiniPlugin } from "./crosswordle-mini/index.js";
import { typeshiftMiniPlugin } from "./typeshift-mini/index.js";
import { spelltowerMiniPlugin } from "./spelltower-mini/index.js";
import { alphabearMiniPlugin } from "./alphabear-mini/index.js";
import { wordamentMiniPlugin } from "./wordament-mini/index.js";
import { ruzzleMiniPlugin } from "./ruzzle-mini/index.js";
import { wordCookiesPlugin } from "./word-cookies/index.js";
import { wordscapesMiniPlugin } from "./wordscapes-mini/index.js";
import { bonzaJigsawPlugin } from "./bonza-jigsaw/index.js";
import { shiritoriChainPlugin } from "./shiritori-chain/index.js";
import { kelimelikMiniPlugin } from "./kelimelik-mini/index.js";
import { eruditMiniPlugin } from "./erudit-mini/index.js";
import { quiddlerMiniPlugin } from "./quiddler-mini/index.js";
import { dabbleWordsPlugin } from "./dabble-words/index.js";
import { tappleLettersPlugin } from "./tapple-letters/index.js";
import { blurbleShoutPlugin } from "./blurble-shout/index.js";
import { lastLetterChainPlugin } from "./last-letter-chain/index.js";
import { wordBingoMiniPlugin } from "./word-bingo-mini/index.js";
import { tribondCluePlugin } from "./tribond-clue/index.js";
import { catchphraseCluePlugin } from "./catchphrase-clue/index.js";
import { textTwistMiniPlugin } from "./text-twist-mini/index.js";
import { anagramMagicPlugin } from "./anagram-magic/index.js";
import { blackLadyPlugin } from "./black-lady/index.js";
import { omnibusHeartsPlugin } from "./omnibus-hearts/index.js";
import { spotHeartsPlugin } from "./spot-hearts/index.js";
import { cancellationHeartsPlugin } from "./cancellation-hearts/index.js";
import { cutthroatSpadesPlugin } from "./cutthroat-spades/index.js";
import { mirrorSpadesPlugin } from "./mirror-spades/index.js";
import { whizSpadesPlugin } from "./whiz-spades/index.js";
import { bidWhistPlugin } from "./bid-whist/index.js";
import { knockoutWhistPlugin } from "./knockout-whist/index.js";
import { bidEuchrePlugin } from "./bid-euchre/index.js";
import { pepperPlugin } from "./pepper/index.js";
import { fourHundredPlugin } from "./four-hundred/index.js";
import { doubleDeckPinochlePlugin } from "./double-deck-pinochle/index.js";
import { cutthroatPinochlePlugin } from "./cutthroat-pinochle/index.js";
import { preferencePlugin } from "./preference/index.js";
import { coinchePlugin } from "./coinche/index.js";
import { briscolaChiamataPlugin } from "./briscola-chiamata/index.js";
import { scoponePlugin } from "./scopone/index.js";
import { madrassoPlugin } from "./madrasso/index.js";
import { marafonePlugin } from "./marafone/index.js";
import { sedmaPlugin } from "./sedma/index.js";
import { schieberJassPlugin } from "./schieber-jass/index.js";
import { differenzlerJassPlugin } from "./differenzler-jass/index.js";
import { chibrePlugin } from "./chibre/index.js";
import { spoilFivePlugin } from "./spoil-five/index.js";
import { fortyFivePlugin } from "./forty-five/index.js";
import { foxInForestPlugin } from "./fox-in-forest/index.js";
import { sixtySixPlugin } from "./sixty-six/index.js";
import { rookPlugin } from "./rook/index.js";
import { bowerPlugin } from "./bower/index.js";
import { mendikotPlugin } from "./mendikot/index.js";
import { courtPiecePlugin } from "./court-piece/index.js";
import { seepPlugin } from "./seep/index.js";
import { goStopCardPlugin } from "./go-stop/index.js";
import { wattenPlugin } from "./watten/index.js";
import { mauMauPlugin } from "./mau-mau/index.js";
import { switchSheddingPlugin } from "./switch-shedding/index.js";
import { lastCallSheddingPlugin } from "./last-call-shedding/index.js";
import { shitheadSheddingPlugin } from "./shithead-shedding/index.js";
import { tycoonShedPlugin } from "./tycoon-shed/index.js";
import { scumShedPlugin } from "./scum-shed/index.js";
import { capitalismShedPlugin } from "./capitalism-shed/index.js";
import { chineseTenShedPlugin } from "./chinese-ten-shed/index.js";
import { happyFamiliesShedPlugin } from "./happy-families-shed/index.js";
import { phaseTenShedPlugin } from "./phase-ten-shed/index.js";
import { skipBoShedPlugin } from "./skip-bo-shed/index.js";
import { golfSixShedPlugin } from "./golf-six-shed/index.js";
import { doubleExposureBjPlugin } from "./double-exposure-bj/index.js";
import { superFun21BjPlugin } from "./super-fun-21-bj/index.js";
import { freeBetBjPlugin } from "./free-bet-bj/index.js";
import { perfectPairsBjPlugin } from "./perfect-pairs-bj/index.js";
import { vegasStripBjPlugin } from "./vegas-strip-bj/index.js";
import { chineseBjPlugin } from "./chinese-bj/index.js";
import { miniBaccaratCasPlugin } from "./mini-baccarat-cas/index.js";
import { ezBaccaratCasPlugin } from "./ez-baccarat-cas/index.js";
import { inBetweenCasPlugin } from "./in-between-cas/index.js";
import { andarBaharCasPlugin } from "./andar-bahar-cas/index.js";
import { teenPattiCasPlugin } from "./teen-patti-cas/index.js";
import { aceyDeuceyCasPlugin } from "./acey-deucey-cas/index.js";
import { oklahomaGinRPlugin } from "./oklahoma-gin-r/index.js";
import { straightGinRPlugin } from "./straight-gin-r/index.js";
import { kalukiRPlugin } from "./kaluki-r/index.js";
import { shanghaiRPlugin } from "./shanghai-r/index.js";
import { liverpoolRPlugin } from "./liverpool-r/index.js";
import { indianRPlugin } from "./indian-r/index.js";
import { poolRummyRPlugin } from "./pool-rummy-r/index.js";
import { knockRummyRPlugin } from "./knock-rummy-r/index.js";
import { threeThirteenRPlugin } from "./three-thirteen-r/index.js";
import { boathouseRPlugin } from "./boathouse-r/index.js";
import { scalaFortyRPlugin } from "./scala-forty-r/index.js";
import { generalaServidaPlugin } from "./generala-servida/index.js";
import { generalaDoblePlugin } from "./generala-doble/index.js";
import { yambDicePlugin } from "./yamb-dice/index.js";
import { tripleYahtzeePlugin } from "./triple-yahtzee/index.js";
import { battleYahtzeePlugin } from "./battle-yahtzee/index.js";
import { jumboYahtzeePlugin } from "./jumbo-yahtzee/index.js";
import { maxiYatzyPlugin } from "./maxi-yatzy/index.js";
import { kniffelPlugin } from "./kniffel/index.js";
import { pigTwoDicePlugin } from "./pig-two-dice/index.js";
import { hogDicePlugin } from "./hog-dice/index.js";
import { skunkDicePlugin } from "./skunk-dice/index.js";
import { dice10000Plugin } from "./dice-10000/index.js";
import { dinoHuntDicePlugin } from "./dino-hunt-dice/index.js";
import { cthulhuDicePlugin } from "./cthulhu-dice/index.js";
import { buncoDicePlugin } from "./bunco-dice/index.js";
import { helpingNeighborPlugin } from "./helping-neighbor/index.js";
import { passeDixPlugin } from "./passe-dix/index.js";
import { zanzibarDicePlugin } from "./zanzibar-dice/index.js";
import { barboothPlugin } from "./barbooth/index.js";
import { hooliganDicePlugin } from "./hooligan-dice/index.js";
import { glucksshausPlugin } from "./glucksshaus/index.js";
import { dice421Plugin } from "./dice-421/index.js";
import { craplessCrapsPlugin } from "./crapless-craps/index.js";
import { highPointCrapsPlugin } from "./high-point-craps/index.js";
import { bankCrapsPlugin } from "./bank-craps/index.js";
import { brandubhPlugin } from "./brandubh/index.js";
import { ardRiPlugin } from "./ard-ri/index.js";
import { magpieTaflPlugin } from "./magpie-tafl/index.js";
import { zammaPlugin } from "./zamma/index.js";
import { dameoPlugin } from "./dameo/index.js";
import { yavalathPlugin } from "./yavalath/index.js";
import { ponnukiPlugin } from "./ponnuki/index.js";
import { tablanPlugin } from "./tablan/index.js";
import { daldosPlugin } from "./daldos/index.js";
import { pallanguzhiPlugin } from "./pallanguzhi/index.js";
import { cheatBsPlugin } from "./cheat-bs/index.js";
import { palificoPlugin } from "./palifico/index.js";
import { skullBluffPlugin } from "./skull-bluff/index.js";
import { coupBluffPlugin } from "./coup-bluff/index.js";
import { loveLetterMiniPlugin } from "./love-letter-mini/index.js";
import { resistanceQuizPlugin } from "./resistance-quiz/index.js";
import { avalonQuizPlugin } from "./avalon-quiz/index.js";
import { secretHitlerQuizPlugin } from "./secret-hitler-quiz/index.js";
import { werewolfQuizPlugin } from "./werewolf-quiz/index.js";
import { saboteurMiniPlugin } from "./saboteur-mini/index.js";
import { thirteenCluesPlugin } from "./thirteen-clues/index.js";
import { cryptidMiniPlugin } from "./cryptid-mini/index.js";
import { deceptionHkPlugin } from "./deception-hk/index.js";
import { turingMachinePuzzlePlugin } from "./turing-machine-puzzle/index.js";
import { tempelDeductionPlugin } from "./tempel-deduction/index.js";
import { sleuthMiniPlugin } from "./sleuth-mini/index.js";
import { code777MiniPlugin } from "./code-777-mini/index.js";
import { clueMiniPlugin } from "./clue-mini/index.js";
import { lingoDeductionPlugin } from "./lingo-deduction/index.js";
import { chameleonBluffPlugin } from "./chameleon-bluff/index.js";
import { insiderQuizPlugin } from "./insider-quiz/index.js";
import { superMastermindPlugin } from "./super-mastermind/index.js";
import { jottoPlugin } from "./jotto/index.js";
import { blackBoxMiniPlugin } from "./black-box-mini/index.js";
import { chineseRingsPlugin } from "./chinese-rings/index.js";
import { fifteenTilesLogicPlugin } from "./fifteen-tiles-logic/index.js";
import { eightPuzzlePlugin } from "./eight-puzzle/index.js";
import { huaRongDaoPlugin } from "./hua-rong-dao/index.js";
import { lightsOut5x5Plugin } from "./lights-out-5x5/index.js";
import { hashiwokakeroMiniPlugin } from "./hashiwokakero-mini/index.js";
import { colorPicrossMiniPlugin } from "./color-picross-mini/index.js";
import { cloneSudokuMiniPlugin } from "./clone-sudoku-mini/index.js";
import { windokuMiniPlugin } from "./windoku-mini/index.js";
import { chaosSudokuMiniPlugin } from "./chaos-sudoku-mini/index.js";
import { towerOfHanoiMiniPlugin } from "./tower-of-hanoi-mini/index.js";
import { bejeweledBlitzPlugin } from "./bejeweled-blitz/index.js";
import { bejeweledTwistPlugin } from "./bejeweled-twist/index.js";
import { sharikiPlugin } from "./shariki/index.js";
import { jewelQuestArcadePlugin } from "./jewel-quest-arcade/index.js";
import { columnsMiniPlugin } from "./columns-mini/index.js";
import { pillDropMiniPlugin } from "./pill-drop-mini/index.js";
import { magicalDropMiniPlugin } from "./magical-drop-mini/index.js";
import { moneyIdolMiniPlugin } from "./money-idol-mini/index.js";
import { threesPuzzlePlugin } from "./threes-puzzle/index.js";
import { game2048Plugin } from "./game-2048/index.js";
import { game1024Plugin } from "./game-1024/index.js";
import { tripleTownMiniPlugin } from "./triple-town-mini/index.js";
import { luminesMiniPlugin } from "./lumines-mini/index.js";
import { samegameMiniPlugin } from "./samegame-mini/index.js";
import { clickomaniaMiniPlugin } from "./clickomania-mini/index.js";
import { spikeDodgerPlugin } from "./spike-dodger/index.js";
import { canabaltMiniPlugin } from "./canabalt-mini/index.js";
import { caveRunnerPlugin } from "./cave-runner/index.js";
import { helicopterFlyerPlugin } from "./helicopter-flyer/index.js";
import { paperPlaneMiniPlugin } from "./paper-plane-mini/index.js";
import { batFlyerPlugin } from "./bat-flyer/index.js";
import { ufoFlyerPlugin } from "./ufo-flyer/index.js";
import { ninjaWallMiniPlugin } from "./ninja-wall-mini/index.js";
import { circleRushPlugin } from "./circle-rush/index.js";
import { orbitArcadePlugin } from "./orbit-arcade/index.js";
import { towerStackerMiniPlugin } from "./tower-stacker-mini/index.js";
import { colorBallDropPlugin } from "./color-ball-drop/index.js";
import { colorReactionPlugin } from "./color-reaction/index.js";
import { circleTrackerPlugin } from "./circle-tracker/index.js";
import { reactionTestProPlugin } from "./reaction-test-pro/index.js";
import { simonPatternPlugin } from "./simon-pattern/index.js";
import { endlessWhackMolePlugin } from "./endless-whack-mole/index.js";
import { endlessCatchPlugin } from "./endless-catch/index.js";
import { endlessTapCountPlugin } from "./endless-tap-count/index.js";
import { laneDefenderMiniPlugin } from "./lane-defender-mini/index.js";
import { telestrationsQuizPlugin } from "./telestrations-quiz/index.js";
import { reverseCharadesQuizPlugin } from "./reverse-charades-quiz/index.js";
import { trivialPursuitEightiesQuizPlugin } from "./trivial-pursuit-eighties-quiz/index.js";
import { applesToApplesQuizPlugin } from "./apples-to-apples-quiz/index.js";
import { monikersQuizPlugin } from "./monikers-quiz/index.js";
import { fibbageQuizPlugin } from "./fibbage-quiz/index.js";
import { drawfulQuizPlugin } from "./drawful-quiz/index.js";
import { quiplashQuizPlugin } from "./quiplash-quiz/index.js";
import { dixitQuizPlugin } from "./dixit-quiz/index.js";
import { witsWagersQuizPlugin } from "./wits-wagers-quiz/index.js";
import { crewDeepSeaCoopPlugin } from "./crew-deep-sea-coop/index.js";
import { forbiddenIslandCoopPlugin } from "./forbidden-island-coop/index.js";
import { forbiddenDesertCoopPlugin } from "./forbidden-desert-coop/index.js";
import { forbiddenSkyCoopPlugin } from "./forbidden-sky-coop/index.js";
import { spiritIslandCoopPlugin } from "./spirit-island-coop/index.js";
import { arkhamLcgCoopPlugin } from "./arkham-lcg-coop/index.js";
import { lotrLcgCoopPlugin } from "./lotr-lcg-coop/index.js";
import { marvelChampionsCoopPlugin } from "./marvel-champions-coop/index.js";
import { hogwartsBattleCoopPlugin } from "./hogwarts-battle-coop/index.js";
import { aeonsEndCoopPlugin } from "./aeons-end-coop/index.js";
import { sentinelsMultiverseCoopPlugin } from "./sentinels-multiverse-coop/index.js";
import { magicMazeCoopPlugin } from "./magic-maze-coop/index.js";
import { flashpointRescueCoopPlugin } from "./flashpoint-rescue-coop/index.js";
import { ironswornVowsPlugin } from "./ironsworn-vows/index.js";
import { starforgedSagaPlugin } from "./starforged-saga/index.js";
import { thousandYearVampirePlugin } from "./thousand-year-vampire/index.js";
import { forTheQueenSagaPlugin } from "./for-the-queen-saga/index.js";
import { wretchedLogPlugin } from "./wretched-log/index.js";
import { aloneAmongStarsTalePlugin } from "./alone-among-stars-tale/index.js";
import { notoriousBountyPlugin } from "./notorious-bounty/index.js";
import { apothecariaWitchPlugin } from "./apothecaria-witch/index.js";
import { wanderhomeJourneyPlugin } from "./wanderhome-journey/index.js";
import { quillLettersPlugin } from "./quill-letters/index.js";
import { sigilWizardPlugin } from "./sigil-wizard/index.js";
import { cartaExplorerPlugin } from "./carta-explorer/index.js";
import { stockpileSharesPlugin } from "./stockpile-shares/index.js";
import { bullBearMarketPlugin } from "./bull-bear-market/index.js";
import { acquireHotelsPlugin } from "./acquire-hotels/index.js";
import { farmageddonCropsPlugin } from "./farmageddon-crops/index.js";
import { coffeeTradersMiniPlugin } from "./coffee-traders-mini/index.js";
import { baronsEnginePlugin } from "./barons-engine/index.js";
import { splendorGemsPlugin } from "./splendor-gems/index.js";
import { spiceRoadTraderPlugin } from "./spice-road-trader/index.js";
import { brassCanalsPlugin } from "./brass-canals/index.js";
import { monopolyDealMiniPlugin } from "./monopoly-deal-mini/index.js";
import { ponziCollapsePlugin } from "./ponzi-collapse/index.js";
import { alturienMarketPlugin } from "./alturien-market/index.js";
import { scovillePeppersPlugin } from "./scoville-peppers/index.js";
import { charteredCompaniesPlugin } from "./chartered-companies/index.js";
import { tinyEpicWesternPlugin } from "./tiny-epic-western-mini/index.js";
import { shoveHapennyPlugin } from "./shove-hapenny/index.js";
import { barDiceShipCaptainPlugin } from "./bar-dice-ship-captain/index.js";
import { midnightBarDicePlugin } from "./bar-dice-midnight/index.js";
import { threesBarDicePlugin } from "./bar-dice-threes/index.js";
import { coinDribblePlugin } from "./coin-dribble-pub/index.js";
import { shuffleQuarterPlugin } from "./shuffle-quarter-pub/index.js";
import { ringboardTossPlugin } from "./ringboard-toss/index.js";
import { ringTheBullPlugin } from "./ring-the-bull-toss/index.js";
import { quoitsTossPlugin } from "./quoits-toss/index.js";
import { spoofBiddingPlugin } from "./spoof-bidding/index.js";
import { sushiGoConveyorPlugin } from "./sushi-go-conveyor/index.js";
import { sevenWondersDraftPlugin } from "./seven-wonders-draft/index.js";
import { bibliosTomesPlugin } from "./biblios-tomes/index.js";
import { ethnosAlliesPlugin } from "./ethnos-allies/index.js";
import { fairyTaleDraftPlugin } from "./fairy-tale-draft/index.js";
import { betweenTwoCitiesPlugin } from "./between-two-cities/index.js";
import { pointSaladVegPlugin } from "./point-salad-veg/index.js";
import { tidesOfTimePlugin } from "./tides-of-time-draft/index.js";
import { bunnyKingdomPlugin } from "./bunny-kingdom-draft/index.js";
import { innovationAgesPlugin } from "./innovation-ages/index.js";
import { presidentsMemoryPlugin } from "./presidents-memory/index.js";
import { monetMemoryPlugin } from "./monet-memory/index.js";
import { flagsMemoryPlugin } from "./flags-memory/index.js";
import { spotItClassicPlugin } from "./spot-it-classic/index.js";
import { setShapesPlugin } from "./set-shapes/index.js";
import { speedPairsPlugin } from "./speed-pairs/index.js";
import { zenMatchingPlugin } from "./zen-matching/index.js";
import { blinkMatchPlugin } from "./blink-match/index.js";
import { warObservePlugin } from "./war-observe/index.js";
import { kimsGamePlugin } from "./kims-game/index.js";
import { trayMemoryPlugin } from "./tray-memory/index.js";
import { observerCardPlugin } from "./observer-card/index.js";
import { wheresWaldoCardPlugin } from "./wheres-waldo-card/index.js";
import { iSpyCardPlugin } from "./i-spy-card/index.js";
import { brainbowPlugin } from "./brainbow/index.js";
import { swishCardsPlugin } from "./swish-cards/index.js";
import { colorBrainPlugin } from "./color-brain/index.js";
import { mapMemoryPlugin } from "./map-memory/index.js";
import { sherlookDiffPlugin } from "./sherlook-diff/index.js";
import { halliGalliPlugin } from "./halli-galli/index.js";
import { framedFilmPlugin } from "./framed-film/index.js";
import { cinematrixYrPlugin } from "./cinematrix-yr/index.js";
import { bandleAudioPlugin } from "./bandle-audio/index.js";
import { gamedlePixelPlugin } from "./gamedle-pixel/index.js";
import { poeltlNbaPlugin } from "./poeltl-nba/index.js";
import { squirdlePokePlugin } from "./squirdle-poke/index.js";
import { taylordleTsPlugin } from "./taylordle-ts/index.js";
import { fluxxRulesPlugin } from "./fluxx-rules/index.js";
import { guillotineHeadsPlugin } from "./guillotine-heads/index.js";
import { abandonArtichokesPlugin } from "./abandon-artichokes/index.js";
import { kakerlakenPokerPlugin } from "./kakerlaken-poker/index.js";
import { faceToFacePlugin } from "./face-to-face/index.js";
import { klaskMagneticPlugin } from "./klask-magnetic/index.js";
import { spitSpeedPlugin } from "./spit-speed/index.js";
import { spoonsGrabPlugin } from "./spoons-grab/index.js";
import { wordLadderMiniPlugin } from "./word-ladder-mini/index.js";
import { wordSearchMiniPlugin } from "./word-search-mini/index.js";
import { miniCrosswordPlugin } from "./mini-crossword/index.js";
import { acrosticPuzzlePlugin } from "./acrostic-puzzle/index.js";
import { codewordsMiniPlugin } from "./codewords-mini/index.js";
import { arrowwordPlugin } from "./arrowword/index.js";
import { crossnumbersPlugin } from "./crossnumbers/index.js";
import { fillInKakuroPlugin } from "./fill-in-kakuro/index.js";
import { wordHuntMiniPlugin } from "./word-hunt-mini/index.js";
import { boggle4x4Plugin } from "./boggle-4x4/index.js";
import { boggle5x5Plugin } from "./boggle-5x5/index.js";
import { ghostWordPlugin } from "./ghost-word/index.js";
import { shiritoriPlugin } from "./shiritori/index.js";
import { categoriesLetterPlugin } from "./categories-letter/index.js";
import { wordWheelPlugin } from "./word-wheel/index.js";
import { wordFlowerPlugin } from "./word-flower/index.js";
import { wordChainsPlugin } from "./word-chains/index.js";
import { secretMessagePlugin } from "./secret-message/index.js";
import { caesarCipherPlugin } from "./caesar-cipher/index.js";
import { vowelLessPlugin } from "./vowel-less/index.js";
import { missingVowelsPlugin } from "./missing-vowels/index.js";
import { connectionsMiniPlugin } from "./connections-mini/index.js";
import { strandsMiniPlugin } from "./strands-mini/index.js";
import { wouldYouRatherPickPlugin } from "./would-you-rather-pick/index.js";
import { truthOrDarePickPlugin } from "./truth-or-dare-pick/index.js";
import { neverHaveIEverPickPlugin } from "./never-have-i-ever-pick/index.js";
import { twoTruthsLiePickPlugin } from "./two-truths-lie-pick/index.js";
import { spyfallMiniPlugin } from "./spyfall-mini/index.js";
import { coconutShyTossPlugin } from "./coconut-shy-toss/index.js";
import { carnivalDuckShootPlugin } from "./carnival-duck-shoot/index.js";
import { carnivalBallTossPlugin } from "./carnival-ball-toss/index.js";
import { carnivalBalloonDartPlugin } from "./carnival-balloon-dart/index.js";
import { paperFootballFlickPlugin } from "./paper-football-flick/index.js";
import { coinFlickingPlugin } from "./coin-flicking/index.js";
import { tiddlywinksFlickPlugin } from "./tiddlywinks-flick/index.js";
import { misereTicTacToePlugin } from "./misere-tic-tac-toe/index.js";
import { orderAndChaosPlugin } from "./order-and-chaos/index.js";
import { fiveInARowPlugin } from "./five-in-a-row/index.js";
import { penteCapturePlugin } from "./pente-capture/index.js";
import { renjuGamePlugin } from "./renju-game/index.js";
import { brazilianDraughtsPlugin } from "./brazilian-draughts/index.js";
import { italianDraughtsPlugin } from "./italian-draughts/index.js";
import { spanishDraughtsPlugin } from "./spanish-draughts/index.js";
import { losingCheckersPlugin } from "./losing-checkers/index.js";
import { damaTurkishPlugin } from "./dama-turkish/index.js";
import { sternhalmaGamePlugin } from "./sternhalma-game/index.js";
import { minichess4x4Plugin } from "./minichess-4x4/index.js";
import { minichess6x6Plugin } from "./minichess-6x6/index.js";
import { minishogi5x5Plugin } from "./minishogi-5x5/index.js";
import { kyotoShogiPlugin } from "./kyoto-shogi/index.js";
import { animalShogiPlugin } from "./animal-shogi/index.js";
import { shatranjArabicPlugin } from "./shatranj-arabic/index.js";
import { grandOthelloMiniPlugin } from "./grand-othello-mini/index.js";
import { twelveMensMorrisPlugin } from "./twelve-mens-morris/index.js";
import { sixMensMorrisPlugin } from "./six-mens-morris/index.js";
import { threeMensMorrisPlugin } from "./three-mens-morris/index.js";
import { lascaStackPlugin } from "./lasca-stack/index.js";
import { toguzKorgoolPlugin } from "./toguz-korgool/index.js";
import { congkakGamePlugin } from "./congkak-game/index.js";
import { bantumiGamePlugin } from "./bantumi-game/index.js";
import { ayoMancalaPlugin } from "./ayo-mancala/index.js";
import { gonnectGamePlugin } from "./gonnect-game/index.js";
import { yGamePlugin } from "./y-game/index.js";
import { pylosPyramidPlugin } from "./pylos-pyramid/index.js";
import { tumblingBlocksPlugin } from "./tumbling-blocks/index.js";
import { nardeRussianPlugin } from "./narde-russian/index.js";
import { hyperBackgammonPlugin } from "./hyper-backgammon/index.js";
import { wythoffsGamePlugin } from "./wythoffs-game/index.js";
import { chompGamePlugin } from "./chomp-game/index.js";
import { simEdgesPlugin } from "./sim-edges/index.js";
import { cribbageMiniPlugin } from "./cribbage-mini/index.js";
import { threeHandCribbagePlugin } from "./three-hand-cribbage/index.js";
import { fourHandCribbagePlugin } from "./four-hand-cribbage/index.js";
import { fiveCardCribbagePlugin } from "./five-card-cribbage/index.js";
import { sevenCardCribbagePlugin } from "./seven-card-cribbage/index.js";
import { cribbageSquaresSoliPlugin } from "./cribbage-squares-soli/index.js";
import { speedCribbagePlugin } from "./speed-cribbage/index.js";
import { mugginsPlugin } from "./muggins/index.js";
import { peaceCardsPlugin } from "./peace-cards/index.js";
import { beggarMyNeighbourPlugin } from "./beggar-my-neighbour/index.js";
import { menagerieCardsPlugin } from "./menagerie-cards/index.js";
import { bsCheatPlugin } from "./bs-cheat/index.js";
import { iDoubtItPlugin } from "./i-doubt-it/index.js";
import { bluffCardsPlugin } from "./bluff-cards/index.js";
import { kittyWhistPlugin } from "./kitty-whist/index.js";
import { concentrationCardsPlugin } from "./concentration-cards/index.js";
import { pelmanismPlugin } from "./pelmanism/index.js";
import { hymnCountPlugin } from "./hymn-count/index.js";
import { goBoomPlugin } from "./go-boom/index.js";
import { royalCasinoPlugin } from "./royal-casino/index.js";
import { drawCasinoPlugin } from "./draw-casino/index.js";
import { spadeCasinoPlugin } from "./spade-casino/index.js";
import { zwickerPlugin } from "./zwicker/index.js";
import { tablanettePlugin } from "./tablanette/index.js";
import { scopaDi15Plugin } from "./scopa-di-15/index.js";
import { scopaDAssiPlugin } from "./scopa-d-assi/index.js";
import { escobaMiniPlugin } from "./escoba-mini/index.js";
import { ciceraPlugin } from "./cicera/index.js";
import { hanafudaKoiKoiPlugin } from "./hanafuda-koi-koi/index.js";
import { hachiHachiPlugin } from "./hachi-hachi/index.js";
import { mattatakPlugin } from "./mattatak/index.js";
import { pokerPatiencePlugin } from "./poker-patience/index.js";
import { quiddlerCardsPlugin } from "./quiddler-cards/index.js";
import { milleBornesPlugin } from "./mille-bornes/index.js";
import { eleusisPlugin } from "./eleusis/index.js";
import { anacondaPokerPlugin } from "./anaconda/index.js";
import { followTheQueenPlugin } from "./follow-the-queen/index.js";
import { chicagoHighPokerPlugin } from "./chicago-high-poker/index.js";
import { chicagoLowPokerPlugin } from "./chicago-low-poker/index.js";
import { baseballPokerPlugin } from "./baseball-poker/index.js";
import { nightBaseballPlugin } from "./night-baseball/index.js";
import { crissCrossPokerPlugin } from "./criss-cross-poker/index.js";
import { ironCrossPokerPlugin } from "./iron-cross-poker/index.js";
import { ticTacToePokerPlugin } from "./tic-tac-toe-poker/index.js";
import { spitInTheOceanPlugin } from "./spit-in-the-ocean/index.js";
import { cincinnatiPokerPlugin } from "./cincinnati-poker/index.js";
import { drPepperPokerPlugin } from "./dr-pepper-poker/index.js";
import { acesAndFacesPlugin } from "./aces-and-faces/index.js";
import { jacksOrBetterPlugin } from "./jacks-or-better/index.js";
import { jokerPokerVpPlugin } from "./joker-poker-vp/index.js";
import { bonusPokerDeluxePlugin } from "./bonus-poker-deluxe/index.js";
import { doubleDoubleBonusPlugin } from "./double-double-bonus/index.js";
import { sevensWildPlugin } from "./sevens-wild/index.js";
import { tensOrBetterPlugin } from "./tens-or-better/index.js";
import { looseDeucesWildPlugin } from "./loose-deuces-wild/index.js";
import { fourCardPokerPlugin } from "./four-card-poker/index.js";
import { ultimateHoldemPlugin } from "./ultimate-holdem/index.js";
import { headsUpHoldemCasPlugin } from "./heads-up-holdem-cas/index.js";
import { ezBaccaratPokerPlugin } from "./ez-baccarat-poker/index.js";
import { bigOPloPlugin } from "./big-o-plo/index.js";
import { plo6PokerPlugin } from "./plo6-poker/index.js";
import { potLimitOmahaPlugin } from "./pot-limit-omaha/index.js";
import { royalHoldemPlugin } from "./royal-holdem/index.js";
import { drawmahaPokerPlugin } from "./drawmaha/index.js";
import { fusionPokerPlugin } from "./fusion-poker/index.js";
import { manilaPokerPlugin } from "./manila-poker/index.js";
import { sokoPokerPlugin } from "./soko-poker/index.js";
import { mexicanPokerPlugin } from "./mexican-poker/index.js";
import { potLimitBadugiPlugin } from "./pot-limit-badugi/index.js";
import { kuhnPokerPlugin } from "./kuhn-poker/index.js";
import { klondikeThreesStandardPlugin } from "./klondike-threes-standard/index.js";
import { klondikeThreesNoRedealPlugin } from "./klondike-threes-no-redeal/index.js";
import { klondikeDealOneNoRedealPlugin } from "./klondike-deal-one-no-redeal/index.js";
import { cassetteAgnesBernauerPlugin } from "./cassette-agnes-bernauer/index.js";
import { spadesSolitairePlugin } from "./spades-solitaire/index.js";
import { blindHookeySolitairePlugin } from "./blind-hookey-solitaire/index.js";
import { bakersKlondikePlugin } from "./bakers-klondike/index.js";
import { fascinationPatiencePlugin } from "./fascination-patience/index.js";
import { freecellTwoDeckPlugin } from "./freecell-two-deck/index.js";
import { tripleFreecellPlugin } from "./triple-freecell/index.js";
import { spiderFourSuitsPlugin } from "./spider-four-suits/index.js";
import { willOTheWispPlugin } from "./will-o-the-wisp/index.js";
import { pyramidSolitaireClassicPlugin } from "./pyramid-solitaire-classic/index.js";
import { pyramidNoRedealPlugin } from "./pyramid-no-redeal/index.js";
import { pharaohsPyramidPlugin } from "./pharaohs-pyramid/index.js";
import { triPeaksSolitairePlugin } from "./tri-peaks-solitaire/index.js";
import { golfSolitairePlugin } from "./golf-solitaire/index.js";
import { golfParVariantPlugin } from "./golf-par-variant/index.js";
import { blackHoleSolPlugin } from "./black-hole/index.js";
import { clockDoubleDeckPlugin } from "./clock-double-deck/index.js";
import { gapsTwoDeckPlugin } from "./gaps-two-deck/index.js";
import { labyrinthSolPlugin } from "./labyrinth/index.js";
import { americanToadPlugin } from "./american-toad/index.js";
import { rainbowSolitairePlugin } from "./rainbow-solitaire/index.js";
import { ladyOfTheManorPlugin } from "./lady-of-the-manor/index.js";
import { fortressCastellanPlugin } from "./fortress-castellan/index.js";
import { laBelleLucieFanPlugin } from "./la-belle-lucie-fan/index.js";
import { threeShufflesAndADrawPlugin } from "./three-shuffles-and-a-draw/index.js";
import { crescentSolitairePlugin } from "./crescent-solitaire/index.js";
import { acesUpFiringSquadPlugin } from "./aces-up-firing-squad/index.js";
import { doubleDeckFreecellPlugin } from "./double-deck-freecell/index.js";
import { parallelsSolPlugin } from "./parallels/index.js";
import { addictionSolPlugin } from "./addiction-solitaire/index.js";
import { alaskaSolPlugin } from "./alaska/index.js";
import { somersetSolPlugin } from "./somerset/index.js";
import { bountyTournamentPlugin } from "./bounty-tournament/index.js";
import { progressiveKnockoutPlugin } from "./progressive-knockout/index.js";
import { freezeoutTournamentPlugin } from "./freezeout-tournament/index.js";
import { rebuyTournamentPlugin } from "./rebuy-tournament/index.js";
import { reentryTournamentPlugin } from "./reentry-tournament/index.js";
import { shootoutTournamentPlugin } from "./shootout-tournament/index.js";
import { turboTournamentPlugin } from "./turbo-tournament/index.js";
import { hyperTurboTournamentPlugin } from "./hyper-turbo-tournament/index.js";
import { satelliteTournamentPlugin } from "./satellite-tournament/index.js";
import { stepTournamentPlugin } from "./step-tournament/index.js";
import { freerollTournamentPlugin } from "./freeroll-tournament/index.js";
import { sixMaxCashPlugin } from "./six-max-cash/index.js";
import { headsUpCashPlugin } from "./heads-up-cash/index.js";
import { deepStackCashPlugin } from "./deep-stack-cash/index.js";
import { shortStackCashPlugin } from "./short-stack-cash/index.js";
import { mttTournamentPlugin } from "./mtt-tournament/index.js";
import { sitAndGoPlugin } from "./sit-and-go/index.js";
import { gtoDrillsPlugin } from "./gto-drills/index.js";
import { killGamePlugin } from "./kill-game/index.js";
import { anteOnlyGamePlugin } from "./ante-only-game/index.js";
import { straddleGamePlugin } from "./straddle-game/index.js";
import { bombPotPlugin } from "./bomb-pot/index.js";
import { runItTwicePlugin } from "./run-it-twice/index.js";
import { runItThricePlugin } from "./run-it-thrice/index.js";
import { kansasCityLowballPlugin } from "./kansas-city-lowball/index.js";
import { calLowballPlugin } from "./cal-lowball/index.js";
import { deucesWildVpPlugin } from "./deuces-wild-vp/index.js";
import { gutsPokerPlugin } from "./guts-poker/index.js";
import { triplePlayDrawPlugin } from "./triple-play-draw/index.js";
import { fivePlayDrawPlugin } from "./five-play-draw/index.js";
import { tenPlayDrawPlugin } from "./ten-play-draw/index.js";
import { chowahaPokerPlugin } from "./chowaha-poker/index.js";
import { mangoPokerPlugin } from "./mango-poker/index.js";
import { studMahaPlugin } from "./stud-maha/index.js";
import { rotoPokerPlugin } from "./roto-poker/index.js";
import { sohePokerPlugin } from "./sohe-poker/index.js";
import { flopPokerCasPlugin } from "./flop-poker-cas/index.js";
import { pokerRoulettePlugin } from "./poker-roulette/index.js";
import { fiveOPokerPlugin } from "./five-o-poker/index.js";
import { burnCardPokerPlugin } from "./burn-card-poker/index.js";
import { rainbowSolPlugin } from "./rainbow/index.js";
import { exiledKingsPlugin } from "./exiled-kings/index.js";
import { citadelPlugin } from "./citadel/index.js";
import { pegSolitaireCardPlugin } from "./peg-solitaire-card-version/index.js";
import { redAndBlackPlugin } from "./red-and-black/index.js";
import { castlesInSpainPlugin } from "./castles-in-spain/index.js";
import { napoleonAtStHelenaPlugin } from "./napoleon-at-st-helena/index.js";
import { limitedFortyThievesPlugin } from "./limited-forty-thieves/index.js";
import { lucasPlugin } from "./lucas/index.js";
import { mariaPlugin } from "./maria/index.js";
import { numberTenPlugin } from "./number-ten/index.js";
import { streetsPlugin } from "./streets/index.js";
import { indianPlugin } from "./indian/index.js";
import { bigFortyPlugin } from "./big-forty/index.js";
import { josephinePlugin } from "./josephine/index.js";
import { blockadePlugin } from "./blockade/index.js";
import { busyAcesPlugin } from "./busy-aces/index.js";
import { giganticPlugin } from "./gigantic/index.js";
import { presidentsCabinetPlugin } from "./presidents-cabinet/index.js";
import { bearRiverPlugin } from "./bear-river/index.js";
import { diavoloPlugin } from "./diavolo/index.js";
import { sultanSolitairePlugin } from "./sultan-solitaire/index.js";
import { mrsMopPlugin } from "./mrs-mop/index.js";
import { bristolPlugin } from "./bristol/index.js";
import { patienceRoyalCotillionPlugin } from "./patience-royal-cotillion/index.js";
import { captiveQueensPlugin } from "./captive-queens/index.js";
import { calculationSolitairePlugin } from "./calculation-solitaire/index.js";
import { fourteenOutPlugin } from "./fourteen-out/index.js";
import { midnightOilPlugin } from "./midnight-oil/index.js";
import { quiltPlugin } from "./quilt/index.js";
import { royalRendezvousPlugin } from "./royal-rendezvous/index.js";
import { eightByEightPlugin } from "./eight-by-eight/index.js";
import { doubleRailPlugin } from "./double-rail/index.js";
import { herringBonePlugin } from "./herring-bone/index.js";
import { zodiacPlugin } from "./zodiac/index.js";
import { deucesPlugin } from "./deuces/index.js";
import { glenwoodPlugin } from "./glenwood/index.js";
import { doubletsPlugin } from "./doublets/index.js";
import { quadrupleAlliancePlugin } from "./quadruple-alliance/index.js";
import { tamOShanterPlugin } from "./tam-o-shanter/index.js";
import { chess960QuizPlugin } from "./chess960-quiz/index.js";
import { crazyhousePuzzlePlugin } from "./crazyhouse-puzzle/index.js";
import { bughousePuzzlePlugin } from "./bughouse-puzzle/index.js";
import { losingChessQuizPlugin } from "./losing-chess-quiz/index.js";
import { atomicChessQuizPlugin } from "./atomic-chess-quiz/index.js";
import { hordeChessQuizPlugin } from "./horde-chess-quiz/index.js";
import { threeCheckQuizPlugin } from "./three-check-quiz/index.js";
import { racingKingsQuizPlugin } from "./racing-kings-quiz/index.js";
import { fogOfWarQuizPlugin } from "./fog-of-war-quiz/index.js";
import { fourPlayerChessQuizPlugin } from "./four-player-chess-quiz/index.js";
import { aliceChessPuzzlePlugin } from "./alice-chess-puzzle/index.js";
import { knightmateQuizPlugin } from "./knightmate-quiz/index.js";
import { losAlamosQuizPlugin } from "./los-alamos-quiz/index.js";
import { cylinderChessQuizPlugin } from "./cylinder-chess-quiz/index.js";
import { toroidalChessQuizPlugin } from "./toroidal-chess-quiz/index.js";
import { darkChessQuizPlugin } from "./dark-chess-quiz/index.js";
import { progressiveChessQuizPlugin } from "./progressive-chess-quiz/index.js";
import { rifleChessQuizPlugin } from "./rifle-chess-quiz/index.js";
import { leganChessQuizPlugin } from "./legan-chess-quiz/index.js";
import { marseillaisQuizPlugin } from "./marseillais-quiz/index.js";
import { spartanChessQuizPlugin } from "./spartan-chess-quiz/index.js";
import { capablancaChessQuizPlugin } from "./capablanca-chess-quiz/index.js";
import { omegaChessQuizPlugin } from "./omega-chess-quiz/index.js";
import { seirawanChessQuizPlugin } from "./seirawan-chess-quiz/index.js";
import { annanShogiQuizPlugin } from "./annan-shogi-quiz/index.js";
import { makrukQuizPlugin } from "./makruk-quiz/index.js";
import { sittuyinQuizPlugin } from "./sittuyin-quiz/index.js";
import { shatranjQuizPlugin } from "./shatranj-quiz/index.js";
import { shogiQuizPlugin } from "./shogi-quiz/index.js";
import { miniShogiQuizPlugin } from "./mini-shogi-quiz/index.js";
import { waShogiQuizPlugin } from "./wa-shogi-quiz/index.js";
import { heianShogiQuizPlugin } from "./heian-shogi-quiz/index.js";
import { toriShogiQuizPlugin } from "./tori-shogi-quiz/index.js";
import { kyotoShogiQuizPlugin } from "./kyoto-shogi-quiz/index.js";
import { microShogiQuizPlugin } from "./micro-shogi-quiz/index.js";
import { xiangqiQuizPlugin } from "./xiangqi-quiz/index.js";
import { janggiQuizPlugin } from "./janggi-quiz/index.js";
import { hnefataflMiniPlugin } from "./hnefatafl-mini/index.js";
import { owareQuizPlugin } from "./oware-quiz/index.js";
import { kalahQuizPlugin } from "./kalah-quiz/index.js";
import { cheerioYachtPlugin } from "./cheerio-yacht/index.js";
import { challengeYachtPlugin } from "./challenge-yacht/index.js";
import { meyerDicePlugin } from "./meyer-dice/index.js";
import { sequencesDicePlugin } from "./sequences-dice/index.js";
import { sevensDicePlugin } from "./sevens-dice/index.js";
import { grandSicBoPlugin } from "./grand-sic-bo/index.js";
import { bankaFrancescaPlugin } from "./banka-francesca/index.js";
import { taiSaiBoPlugin } from "./tai-sai-bo/index.js";
import { schockenPubPlugin } from "./schocken-pub/index.js";
import { dicelandRoulettePlugin } from "./diceland-roulette/index.js";
import { dudakDicePlugin } from "./dudak-dice/index.js";
import { knochelDicePlugin } from "./knochel-dice/index.js";
import { catchDicePlugin } from "./catch-dice/index.js";
import { grabDicePlugin } from "./grab-dice/index.js";
import { spinDicePlugin } from "./spin-dice/index.js";
import { horseRaceDicePlugin } from "./horse-race-dice/index.js";
import { countdown321Plugin } from "./countdown-321/index.js";
import { pokerDiceFivePlugin } from "./poker-dice-five/index.js";
import { mexenPubPlugin } from "./mexen-pub/index.js";
import { bidouDicePlugin } from "./bidou-dice/index.js";
import { chronogramPuzzlePlugin } from "./chronogram-puzzle/index.js";
import { alphameticsMiniPlugin } from "./alphametics-mini/index.js";
import { crossNumberPlugin } from "./cross-number/index.js";
import { kakurasuMiniPlugin } from "./kakurasu-mini/index.js";
import { fobidoshiMiniPlugin } from "./fobidoshi-mini/index.js";
import { sashiganeMiniPlugin } from "./sashigane-mini/index.js";
import { kurodokoMiniPlugin } from "./kurodoko-mini/index.js";
import { hamleMiniPlugin } from "./hamle-mini/index.js";
import { countryRoadMiniPlugin } from "./country-road-mini/index.js";
import { corralMiniPlugin } from "./corral-mini/index.js";
import { tapaMiniPlugin } from "./tapa-mini/index.js";
import { litsMiniPlugin } from "./lits-mini/index.js";
import { caveShadingPlugin } from "./cave-shading/index.js";
import { nononoMiniPlugin } from "./nonono-mini/index.js";
import { grecoLatinPlugin } from "./greco-latin/index.js";
import { hashiMiniPlugin } from "./hashi-mini/index.js";
import { akariMiniPlugin } from "./akari-mini/index.js";
import { galaxiesMiniPlugin } from "./galaxies-mini/index.js";
import { snakeLogicPlugin } from "./snake-logic/index.js";
import { queensPuzzlePlugin } from "./queens-puzzle/index.js";
import { appleTapPlugin } from "./apple-tap/index.js";
import { cherryBurstPlugin } from "./cherry-burst/index.js";
import { grapePopPlugin } from "./grape-pop/index.js";
import { melonMashPlugin } from "./melon-mash/index.js";
import { lemonZapPlugin } from "./lemon-zap/index.js";
import { kiwiClickerPlugin } from "./kiwi-clicker/index.js";
import { pumpkinSmashPlugin } from "./pumpkin-smash/index.js";
import { bubbleBurstArcadePlugin } from "./bubble-burst-arcade/index.js";
import { starTapperPlugin } from "./star-tapper/index.js";
import { meteorTapPlugin } from "./meteor-tap/index.js";
import { cometClickerPlugin } from "./comet-clicker/index.js";
import { lightningTapPlugin } from "./lightning-tap/index.js";
import { snowflakeSnapPlugin } from "./snowflake-snap/index.js";
import { acornTapPlugin } from "./acorn-tap/index.js";
import { bananaBashPlugin } from "./banana-bash/index.js";
import { papayaPopPlugin } from "./papaya-pop/index.js";
import { blueberryBurstPlugin } from "./blueberry-burst/index.js";
import { orangeTapPlugin } from "./orange-tap/index.js";
import { limeTapPlugin } from "./lime-tap/index.js";
import { moonTapPlugin } from "./moon-tap/index.js";
import { synonymQuizPlugin } from "./synonym-quiz/index.js";
import { antonymQuizPlugin } from "./antonym-quiz/index.js";
import { homonymQuizPlugin } from "./homonym-quiz/index.js";
import { rhymeQuizPlugin } from "./rhyme-quiz/index.js";
import { prefixQuizPlugin } from "./prefix-quiz/index.js";
import { suffixQuizPlugin } from "./suffix-quiz/index.js";
import { vocabularyBuilderPlugin } from "./vocabulary-builder/index.js";
import { wordRootsQuizPlugin } from "./word-roots-quiz/index.js";
import { proverbQuizPlugin } from "./proverb-quiz/index.js";
import { palindromeQuizPlugin } from "./palindrome-quiz/index.js";
import { portmanteauQuizPlugin } from "./portmanteau-quiz/index.js";
import { onomatopoeiaQuizPlugin } from "./onomatopoeia-quiz/index.js";
import { alliterationQuizPlugin } from "./alliteration-quiz/index.js";
import { oxymoronQuizPlugin } from "./oxymoron-quiz/index.js";
import { metaphorQuizPlugin } from "./metaphor-quiz/index.js";
import { simileQuizPlugin } from "./simile-quiz/index.js";
import { hyperboleQuizPlugin } from "./hyperbole-quiz/index.js";
import { abbreviationQuizPlugin } from "./abbreviation-quiz/index.js";
import { acronymDefineQuizPlugin } from "./acronym-define-quiz/index.js";
import { spellingQuizPlugin } from "./spelling-quiz/index.js";
import { suicideSpadesPlugin } from "./suicide-spades/index.js";
import { game500Plugin } from "./game-500/index.js";
import { rubiconBeziquePlugin } from "./rubicon-bezique/index.js";
import { trucPlugin } from "./truc/index.js";
import { klaverjassenPlugin } from "./klaverjassen/index.js";
import { jassPlugin } from "./jass/index.js";
import { frenchTarotPlugin } from "./french-tarot/index.js";
import { tarocchiPlugin } from "./tarocchi/index.js";
import { konigrufenPlugin } from "./konigrufen/index.js";
import { napoleonNapPlugin } from "./napoleon-nap/index.js";
import { bridgeContractPlugin } from "./bridge-contract/index.js";
import { minibridgePlugin } from "./minibridge/index.js";
import { honeymoonBridgePlugin } from "./honeymoon-bridge/index.js";
import { pitchCardPlugin } from "./pitch-card/index.js";
import { foxInTheForestPlugin } from "./fox-in-the-forest/index.js";
import { barbuPlugin } from "./barbu/index.js";
import { courtPieceRangPlugin } from "./court-piece-rang/index.js";
import { mightyPlugin } from "./mighty/index.js";
import { duplicateBridgePlugin } from "./duplicate-bridge/index.js";
import { rubberBridgePlugin } from "./rubber-bridge/index.js";
import { switchPlugin } from "./switch/index.js";
import { oneCardPlugin } from "./one-card/index.js";
import { shitheadPlugin } from "./shithead/index.js";
import { tycoonPlugin } from "./tycoon/index.js";
import { scumPlugin } from "./scum/index.js";
import { capitalismPlugin } from "./capitalism/index.js";
import { douDizhuPlugin } from "./dou-dizhu/index.js";
import { tractorPlugin } from "./tractor/index.js";
import { thirteenTienLenPlugin } from "./thirteen-tien-len/index.js";
import { chineseTenPlugin } from "./chinese-ten/index.js";
import { authorsPlugin } from "./authors/index.js";
import { happyFamiliesPlugin } from "./happy-families/index.js";
import { blackPeterPlugin } from "./black-peter/index.js";
import { donkeyPlugin } from "./donkey/index.js";
import { unoStackoPlugin } from "./uno-stacko/index.js";
import { phase10Plugin } from "./phase-10/index.js";
import { skipBoPlugin } from "./skip-bo/index.js";
import { michiganNewmarketPlugin } from "./michigan-newmarket/index.js";
import { sevensFanTanPlugin } from "./sevens-fan-tan/index.js";
import { golf6CardPlugin } from "./golf-6-card/index.js";
import { hollywoodGinRPlugin } from "./hollywood-gin-r/index.js";
import { roundCornerGinRPlugin } from "./round-corner-gin-r/index.js";
import { persianRummyRPlugin } from "./persian-rummy-r/index.js";
import { rummy500ClassicRPlugin } from "./rummy-500-classic-r/index.js";
import { michiganRumRPlugin } from "./michigan-rum-r/index.js";
import { sambaCanastaRPlugin } from "./samba-canasta-r/index.js";
import { boliviaCanastaRPlugin } from "./bolivia-canasta-r/index.js";
import { brazilianCanastaRPlugin } from "./brazilian-canasta-r/index.js";
import { italianCanastaRPlugin } from "./italian-canasta-r/index.js";
import { uruguayCanastaRPlugin } from "./uruguay-canasta-r/index.js";
import { penniesHeavenRPlugin } from "./pennies-heaven-r/index.js";
import { cubanCanastaRPlugin } from "./cuban-canasta-r/index.js";
import { mexicanaCanastaRPlugin } from "./mexicana-canasta-r/index.js";
import { handFootRPlugin } from "./hand-foot-r/index.js";
import { biribaRPlugin } from "./biriba-r/index.js";
import { buracoRPlugin } from "./buraco-r/index.js";
import { lobaRPlugin } from "./loba-r/index.js";
import { tonkRPlugin } from "./tonk-r/index.js";
import { conquianRPlugin } from "./conquian-r/index.js";
import { raminoRPlugin } from "./ramino-r/index.js";
import { atlanticCityBjPlugin } from "./atlantic-city-bj/index.js";
import { europeanBjPlugin } from "./european-bj/index.js";
import { multiHandBjPlugin } from "./multi-hand-bj/index.js";
import { doubleAttackBjPlugin } from "./double-attack-bj/index.js";
import { twentyOneThreeBjPlugin } from "./twenty-one-three-bj/index.js";
import { fiveCardStudCasPlugin } from "./five-card-stud-cas/index.js";
import { sixCardStudCasPlugin } from "./six-card-stud-cas/index.js";
import { jackpotsDrawPlugin } from "./jackpots-draw/index.js";
import { deucesWildDrawPlugin } from "./deuces-wild-draw/index.js";
import { badeuceyDrawPlugin } from "./badeucey-draw/index.js";
import { closedChinesePokerCasPlugin } from "./closed-chinese-poker-cas/index.js";
import { pineappleOfcCasPlugin } from "./pineapple-ofc-cas/index.js";
import { cheminDeFerCasPlugin } from "./chemin-de-fer-cas/index.js";
import { banqueCasPlugin } from "./banque-cas/index.js";
import { dragonTigerCasPlugin } from "./dragon-tiger-cas/index.js";
import { videoPokerJacksPlugin } from "./video-poker-jacks/index.js";
import { allAmericanVpPlugin } from "./all-american-vp/index.js";
import { tensOrBetterVpPlugin } from "./tens-or-better-vp/index.js";
import { multiHandVpFivePlugin } from "./multi-hand-vp-five/index.js";
import { redDogProgressiveCasPlugin } from "./red-dog-progressive-cas/index.js";
import { backgammonStandardRacePlugin } from "./backgammon-standard-race/index.js";
import { tavliGreekRacePlugin } from "./tavli-greek-race/index.js";
import { parcheesiTeamRacePlugin } from "./parcheesi-team-race/index.js";
import { ludoQuickPlayPlugin } from "./ludo-quick-play/index.js";
import { parchisSpanishPlugin } from "./parchis-spanish/index.js";
import { uckersRacePlugin } from "./uckers-race/index.js";
import { nyoutYutRacePlugin } from "./nyout-yut-race/index.js";
import { patolliRacePlugin } from "./patolli-race/index.js";
import { chutesAndLaddersClassicPlugin } from "./chutes-and-ladders-classic/index.js";
import { gameOfLifeRacePlugin } from "./game-of-life-race/index.js";
import { camelUpRacePlugin } from "./camel-up-race/index.js";
import { formulaDRacePlugin } from "./formula-d-race/index.js";
import { rallymanGtRacePlugin } from "./rallyman-gt-race/index.js";
import { downforceRacePlugin } from "./downforce-race/index.js";
import { thunderAlleyRacePlugin } from "./thunder-alley-race/index.js";
import { aveCaesarRacePlugin } from "./ave-caesar-race/index.js";
import { pitchcarRacePlugin } from "./pitchcar-race/index.js";
import { flammeRougeRacePlugin } from "./flamme-rouge-race/index.js";
import { magnetRacingPlugin } from "./magnet-racing/index.js";
import { hollandRuleRacePlugin } from "./holland-rule-race/index.js";
import { connectFourClassicClPlugin } from "./connect-four-classic-cl/index.js";
import { connectFourPop10Plugin } from "./connect-four-pop10/index.js";
import { connectFourPowerCheckerPlugin } from "./connect-four-power-checker/index.js";
import { connectFourGravityFlipPlugin } from "./connect-four-gravity-flip/index.js";
import { fiveInARowFreePlugin } from "./five-in-a-row-free/index.js";
import { proOpeningGomokuPlugin } from "./pro-opening-gomoku/index.js";
import { longProOpeningGomokuPlugin } from "./long-pro-opening-gomoku/index.js";
import { yamaguchiOpeningPlugin } from "./yamaguchi-opening/index.js";
import { soosyrvOpeningPlugin } from "./soosyrv-opening/index.js";
import { taraguchiOpeningPlugin } from "./taraguchi-opening/index.js";
import { ticTacToe3x3ClassicPlugin } from "./tic-tac-toe-3x3-classic/index.js";
import { wildTicTacToeClPlugin } from "./wild-tic-tac-toe-cl/index.js";
import { ticTacToe4x4ClPlugin } from "./tic-tac-toe-4x4-cl/index.js";
import { tic3d3x3x3Plugin } from "./3d-tic-tac-toe-3x3x3/index.js";
import { noughtsCrossesInfinitePlugin } from "./noughts-crosses-infinite-board/index.js";
import { gobbletClPlugin } from "./gobblet-cl/index.js";
import { twelveMensMorrisClPlugin } from "./twelve-mens-morris-cl/index.js";
import { picariaClPlugin } from "./picaria-cl/index.js";
import { shisimaClPlugin } from "./shisima-cl/index.js";
import { daraClPlugin } from "./dara-cl/index.js";
import { mahjongCastleKeepPlugin } from "./mahjong-castle-keep/index.js";
import { mahjongLotusBloomPlugin } from "./mahjong-lotus-bloom/index.js";
import { mahjongKoiFishPlugin } from "./mahjong-koi-fish/index.js";
import { mahjongBambooGrovePlugin } from "./mahjong-bamboo-grove/index.js";
import { mahjongZenGardenPlugin } from "./mahjong-zen-garden/index.js";
import { mahjongSakuraFallPlugin } from "./mahjong-sakura-fall/index.js";
import { mahjongTsunamiWavePlugin } from "./mahjong-tsunami-wave/index.js";
import { mahjongMtFujiPlugin } from "./mahjong-mt-fuji/index.js";
import { mahjongTempleBellPlugin } from "./mahjong-temple-bell/index.js";
import { mahjongPaperCranePlugin } from "./mahjong-paper-crane/index.js";
import { mahjongTeaHousePlugin } from "./mahjong-tea-house/index.js";
import { mahjongJadeMountainPlugin } from "./mahjong-jade-mountain/index.js";
import { mahjongPhoenixFeatherPlugin } from "./mahjong-phoenix-feather/index.js";
import { mahjongTigerClawPlugin } from "./mahjong-tiger-claw/index.js";
import { mahjongDragonTailPlugin } from "./mahjong-dragon-tail/index.js";
import { mahjongEmperorThronePlugin } from "./mahjong-emperor-throne/index.js";
import { mahjongStoneLanternPlugin } from "./mahjong-stone-lantern/index.js";
import { mahjongToriiGatePlugin } from "./mahjong-torii-gate/index.js";
import { mahjongPavilionRoofPlugin } from "./mahjong-pavilion-roof/index.js";
import { mahjongPlumBlossomPlugin } from "./mahjong-plum-blossom/index.js";
import { mahjongRiverStreamPlugin } from "./mahjong-river-stream/index.js";
import { mahjongCloudNinePlugin } from "./mahjong-cloud-nine/index.js";
import { mahjongForbiddenCityPlugin } from "./mahjong-forbidden-city/index.js";
import { mahjongSilkRoadPlugin } from "./mahjong-silk-road/index.js";
import { mahjongGalaxySpiralPlugin } from "./mahjong-galaxy-spiral/index.js";
import { tienLenQuizPlugin } from "./tien-len-quiz/index.js";
import { douDizhuQuizPlugin } from "./dou-dizhu-quiz/index.js";
import { shengJiQuizPlugin } from "./sheng-ji-quiz/index.js";
import { zhengShangyouQuizPlugin } from "./zheng-shangyou-quiz/index.js";
import { ganjifaQuizPlugin } from "./ganjifa-quiz/index.js";
import { tongitsQuizPlugin } from "./tongits-quiz/index.js";
import { pusoyPokerQuizPlugin } from "./pusoy-poker-quiz/index.js";
import { menkoQuizPlugin } from "./menko-quiz/index.js";
import { sashimiQuizPlugin } from "./sashimi-quiz/index.js";
import { takenokoQuizPlugin } from "./takenoko-quiz/index.js";
import { tsuroQuizPlugin } from "./tsuro-quiz/index.js";
import { ceeLoQuizPlugin } from "./cee-lo-quiz/index.js";
import { oichoKabuQuizPlugin } from "./oicho-kabu-quiz/index.js";
import { tansanQuizPlugin } from "./tansan-quiz/index.js";
import { haikuDiceQuizPlugin } from "./haiku-dice-quiz/index.js";
import { carcassonneInnsCathedralsPlugin } from "./carcassonne-inns-cathedrals/index.js";
import { carcassonneRiverPlugin } from "./carcassonne-river/index.js";
import { carcassonneTowerBuildPlugin } from "./carcassonne-tower-build/index.js";
import { carcassonnePrincessDragonPlugin } from "./carcassonne-princess-dragon/index.js";
import { carcassonneTradersBuildersPlugin } from "./carcassonne-traders-builders/index.js";
import { carcassonneAbbeyMayorPlugin } from "./carcassonne-abbey-mayor/index.js";
import { carcassonneHillsSheepPlugin } from "./carcassonne-hills-sheep/index.js";
import { queendominoTaxPlugin } from "./queendomino-tax/index.js";
import { kingdominoDuelPlugin } from "./kingdomino-duel/index.js";
import { kingdominoGiantsPlugin } from "./kingdomino-giants/index.js";
import { azulSintraPlugin } from "./azul-sintra/index.js";
import { azulQueensGardenPlugin } from "./azul-queens-garden/index.js";
import { sagradaLifePlugin } from "./sagrada-life/index.js";
import { patchworkExpressGamePlugin } from "./patchwork-express-game/index.js";
import { patchworkDoodleQuiltPlugin } from "./patchwork-doodle-quilt/index.js";
import { tokaidoCrossroadsPlugin } from "./tokaido-crossroads/index.js";
import { blokusClassicPlugin } from "./blokus-classic/index.js";
import { quadropolisCityPlugin } from "./quadropolis-city/index.js";
import { meadowPathsPlugin } from "./meadow-paths/index.js";
import { fjordsClaimPlugin } from "./fjords-claim/index.js";
import { railroadInkYellowPlugin } from "./railroad-ink-yellow/index.js";
import { railroadInkGreenPlugin } from "./railroad-ink-green/index.js";
import { railroadInkChallengePlugin } from "./railroad-ink-challenge/index.js";
import { railroadInkNeonPlugin } from "./railroad-ink-neon/index.js";
import { welcomeToClassicPlugin } from "./welcome-to-classic/index.js";
import { welcomeDinolandPlugin } from "./welcome-dinoland/index.js";
import { welcomeLasVegasPlugin } from "./welcome-las-vegas/index.js";
import { welcomeMoonPlugin } from "./welcome-moon/index.js";
import { cartographersHeroesPlugin } from "./cartographers-heroes/index.js";
import { cartographersMonstersPlugin } from "./cartographers-monsters/index.js";
import { doppeltCleverPlugin } from "./doppelt-clever/index.js";
import { cleverHochVierPlugin } from "./clever-hoch-vier/index.js";
import { fleetEnginePlugin } from "./fleet-engine/index.js";
import { rajasCharmersPlugin } from "./rajas-charmers/index.js";
import { trekAmericasPlugin } from "./trek-americas/index.js";
import { yokohamaDicePlugin } from "./yokohama-dice/index.js";
import { wingspanDiceRollPlugin } from "./wingspan-dice-roll/index.js";
import { laGranjaSiestaPlugin } from "./la-granja-siesta/index.js";
import { ageOfSteamRwPlugin } from "./age-of-steam-rw/index.js";
import { miniRailsRwPlugin } from "./mini-rails-rw/index.js";
import { dominionIntriguePlugin } from "./dominion-intrigue/index.js";
import { dominionSeasidePlugin } from "./dominion-seaside/index.js";
import { dominionProsperityPlugin } from "./dominion-prosperity/index.js";
import { dominionAdventuresPlugin } from "./dominion-adventures/index.js";
import { clankInSpacePlugin } from "./clank-in-space/index.js";
import { aeonsEndLegacyPlugin } from "./aeons-end-legacy/index.js";
import { mageKnightCardPlugin } from "./mage-knight-card/index.js";
import { thunderstoneQuestPlugin } from "./thunderstone-quest/index.js";
import { legendaryMarvelPlugin } from "./legendary-marvel/index.js";
import { tashKalarArenaPlugin } from "./tash-kalar-arena/index.js";
import { sorcererCityBuildPlugin } from "./sorcerer-city-build/index.js";
import { keyforgeArchonsPlugin } from "./keyforge-archons/index.js";
import { summonerWarsGridPlugin } from "./summoner-wars-grid/index.js";
import { battleconIndinesPlugin } from "./battlecon-indines/index.js";
import { oneDeckGalaxyPlugin } from "./one-deck-galaxy/index.js";
import { tantoCuoreMaidsPlugin } from "./tanto-cuore-maids/index.js";
import { dungeonLordsTrapPlugin } from "./dungeon-lords-trap/index.js";
import { fourSoulsIsaacPlugin } from "./four-souls-isaac/index.js";
import { undauntedNormandyPlugin } from "./undaunted-normandy/index.js";
import { undauntedNorthAfricaPlugin } from "./undaunted-north-africa/index.js";
import { pandemicBasePlugin } from "./pandemic-base/index.js";
import { pandemicHotZoneNaPlugin } from "./pandemic-hot-zone-na/index.js";
import { pandemicFallOfRomePlugin } from "./pandemic-fall-of-rome/index.js";
import { pandemicIberiaPlugin } from "./pandemic-iberia/index.js";
import { pandemicInTheLabPlugin } from "./pandemic-in-the-lab/index.js";
import { pandemicLegacyS1Plugin } from "./pandemic-legacy-s1/index.js";
import { pandemicLegacyS2Plugin } from "./pandemic-legacy-s2/index.js";
import { forbiddenJungleCoopPlugin } from "./forbidden-jungle-coop/index.js";
import { spiritIslandJaggedPlugin } from "./spirit-island-jagged/index.js";
import { spiritIslandNaturePlugin } from "./spirit-island-nature/index.js";
import { lordOfRingsLcgPlugin } from "./lord-of-rings-lcg/index.js";
import { grizzledCoopPlugin } from "./grizzled-coop/index.js";
import { grizzledOrdersPlugin } from "./grizzled-orders/index.js";
import { aeonsEndWarEternalPlugin } from "./aeons-end-war-eternal/index.js";
import { sentinelsDefinitivePlugin } from "./sentinels-definitive/index.js";
import { spaceAlertCoopPlugin } from "./space-alert-coop/index.js";
import { robinsonCrusoeCoopPlugin } from "./robinson-crusoe-coop/index.js";
import { magicMazeMaxSecurityPlugin } from "./magic-maze-max-security/index.js";
import { letterJamCoopPlugin } from "./letter-jam-coop/index.js";
import { burgleBrosHeistPlugin } from "./burgle-bros-heist/index.js";
import { pictionaryManiaQuizPlugin } from "./pictionary-mania-quiz/index.js";
import { pictionaryCardGameQuizPlugin } from "./pictionary-card-game-quiz/index.js";
import { pictionaryManQuizPlugin } from "./pictionary-man-quiz/index.js";
import { telestrationsAfterDarkQuizPlugin } from "./telestrations-after-dark-quiz/index.js";
import { telestrationsUpsideQuizPlugin } from "./telestrations-upside-quiz/index.js";
import { classicCharadesQuizPlugin } from "./classic-charades-quiz/index.js";
import { trivialPursuitGenusQuizPlugin } from "./trivial-pursuit-genus-quiz/index.js";
import { trivialPursuitNinetiesQuizPlugin } from "./trivial-pursuit-nineties-quiz/index.js";
import { trivialPursuitDisneyQuizPlugin } from "./trivial-pursuit-disney-quiz/index.js";
import { trivialPursuitStarwarsQuizPlugin } from "./trivial-pursuit-starwars-quiz/index.js";
import { trivialPursuitPotterQuizPlugin } from "./trivial-pursuit-potter-quiz/index.js";
import { trivialPursuitOfficeQuizPlugin } from "./trivial-pursuit-office-quiz/index.js";
import { trivialPursuitFriendsQuizPlugin } from "./trivial-pursuit-friends-quiz/index.js";
import { trivialPursuitTeamQuizPlugin } from "./trivial-pursuit-team-quiz/index.js";
import { applesToApplesKidsQuizPlugin } from "./apples-to-apples-kids-quiz/index.js";
import { applesBigPictureQuizPlugin } from "./apples-big-picture-quiz/index.js";
import { monikersSeriousQuizPlugin } from "./monikers-serious-quiz/index.js";
import { thingAboutThingsQuizPlugin } from "./thing-about-things-quiz/index.js";
import { loadedQuestionsQuizPlugin } from "./loaded-questions-quiz/index.js";
import { fibbage2QuizPlugin } from "./fibbage-2-quiz/index.js";
import { fibbage3QuizPlugin } from "./fibbage-3-quiz/index.js";
import { fibbageXlQuizPlugin } from "./fibbage-xl-quiz/index.js";
import { teeKoQuizPlugin } from "./tee-ko-quiz/index.js";
import { jackboxPack1QuizPlugin } from "./jackbox-pack-1-quiz/index.js";
import { jackboxPack7QuizPlugin } from "./jackbox-pack-7-quiz/index.js";
import { stockpileCorruptionPlugin } from "./stockpile-corruption/index.js";
import { agricolaCreaturesPlugin } from "./agricola-creatures/index.js";
import { agricolaCardOnlyPlugin } from "./agricola-card-only/index.js";
import { foodChainMagnatePlugin } from "./food-chain-magnate/index.js";
import { powerGridCardPlugin } from "./power-grid-card/index.js";
import { splendorMarvelPlugin } from "./splendor-marvel/index.js";
import { splendorDunePlugin } from "./splendor-dune/index.js";
import { centurySpiceRoadPlugin } from "./century-spice-road/index.js";
import { centuryEasternWondersPlugin } from "./century-eastern-wonders/index.js";
import { centuryGolemEditionPlugin } from "./century-golem-edition/index.js";
import { brassLancashirePlugin } from "./brass-lancashire/index.js";
import { suburbiaIncPlugin } from "./suburbia-inc/index.js";
import { paleoSurvivalPlugin } from "./paleo-survival/index.js";
import { architectsWestPlugin } from "./architects-west/index.js";
import { viticultureWinePlugin } from "./viticulture-wine/index.js";
import { mastermind5peg8colorPlugin } from "./mastermind-5peg-8color/index.js";
import { mastermind6peg10colorPlugin } from "./mastermind-6peg-10color/index.js";
import { mastermindNoRepeatsPlugin } from "./mastermind-no-repeats/index.js";
import { tempelTrapPlugin } from "./tempel-trap/index.js";
import { clueMasterDetectivePlugin } from "./clue-master-detective/index.js";
import { clueSuspectPlugin } from "./clue-suspect/index.js";
import { mysteryAbbeyPlugin } from "./mystery-abbey/index.js";
import { cryptidDeductionPlugin } from "./cryptid-deduction/index.js";
import { mysteriumVisionsPlugin } from "./mysterium-visions/index.js";
import { dixitCluePlugin } from "./dixit-clue/index.js";
import { theMindCoopPlugin } from "./the-mind-coop/index.js";
import { kabulSpielcafePlugin } from "./kabul-spielcafe/index.js";
import { conceptDeductionPlugin } from "./concept-deduction/index.js";
import { decryptoCodesPlugin } from "./decrypto-codes/index.js";
import { codenamesPicturesPlugin } from "./codenames-pictures/index.js";
import { codenamesXxlPlugin } from "./codenames-xxl/index.js";
import { spyfallTimeTravelPlugin } from "./spyfall-time-travel/index.js";
import { chroniclesOfCrimePlugin } from "./chronicles-of-crime/index.js";
import { awkwardGuestsPlugin } from "./awkward-guests/index.js";
import { deadlyDowagersPlugin } from "./deadly-dowagers/index.js";
import { disneyMemoryPlugin } from "./disney-memory/index.js";
import { animalsMemoryPlugin } from "./animals-memory/index.js";
import { spotItJrPlugin } from "./spot-it-jr/index.js";
import { spotItSplashPlugin } from "./spot-it-splash/index.js";
import { spotItDinoPlugin } from "./spot-it-dino/index.js";
import { spotItHarryPotterPlugin } from "./spot-it-harry-potter/index.js";
import { spotIt50PlusPlugin } from "./spot-it-50-plus/index.js";
import { dobbleEuropeanPlugin } from "./dobble-european/index.js";
import { dobbleKidsPlugin } from "./dobble-kids/index.js";
import { dobbleCampingPlugin } from "./dobble-camping/index.js";
import { setJuniorPlugin } from "./set-junior/index.js";
import { supersetGamePlugin } from "./superset-game/index.js";
import { concentrationSpeedPlugin } from "./concentration-speed/index.js";
import { cortexChallengePlugin } from "./cortex-challenge/index.js";
import { cortexChallenge2Plugin } from "./cortex-challenge-2/index.js";
import { simonSwipePlugin } from "./simon-swipe/index.js";
import { simonAirPlugin } from "./simon-air/index.js";
import { blinkSpeedPlugin } from "./blink-speed/index.js";
import { egyptianRatScrewPlugin } from "./egyptian-rat-screw/index.js";
import { zickeZackePlugin } from "./zicke-zacke/index.js";
import { bejeweledClassicMiniPlugin } from "./bejeweled-classic-mini/index.js";
import { bejeweledStarsMiniPlugin } from "./bejeweled-stars-mini/index.js";
import { candyCrushMiniPlugin } from "./candy-crush-mini/index.js";
import { candySodaMiniPlugin } from "./candy-soda-mini/index.js";
import { candyJellyMiniPlugin } from "./candy-jelly-mini/index.js";
import { candyFriendsMiniPlugin } from "./candy-friends-mini/index.js";
import { match3HexMiniPlugin } from "./match3-hex-mini/index.js";
import { match3TriangleMiniPlugin } from "./match3-triangle-mini/index.js";
import { puzzleDragonsMiniPlugin } from "./puzzle-dragons-mini/index.js";
import { puzzleQuestMiniPlugin } from "./puzzle-quest-mini/index.js";
import { superColumnsMiniPlugin } from "./super-columns-mini/index.js";
import { puyoTsuMiniPlugin } from "./puyo-tsu-mini/index.js";
import { puyoSunMiniPlugin } from "./puyo-sun-mini/index.js";
import { puyoFeverMiniPlugin } from "./puyo-fever-mini/index.js";
import { wariosWoodsMiniPlugin } from "./warios-woods-mini/index.js";
import { pokepuzzleLeagueMiniPlugin } from "./pokepuzzle-league-mini/index.js";
import { moneyIdolExchangerPlugin } from "./money-idol-exchanger/index.js";
import { tripleTownMergePlugin } from "./triple-town-merge/index.js";
import { mergeDragonsMiniPlugin } from "./merge-dragons-mini/index.js";
import { mergeMansionMiniPlugin } from "./merge-mansion-mini/index.js";
import { darts301ClassicPlugin } from "./darts-301-classic/index.js";
import { darts701ClassicPlugin } from "./darts-701-classic/index.js";
import { dartsCricketClassicPlugin } from "./darts-cricket-classic/index.js";
import { dartsAroundClockPlugin } from "./darts-around-clock/index.js";
import { dartsHalveItPlugin } from "./darts-halve-it/index.js";
import { dartsBaseballClassicPlugin } from "./darts-baseball-classic/index.js";
import { dartsKillerClassicPlugin } from "./darts-killer-classic/index.js";
import { dartsGolfClassicPlugin } from "./darts-golf-classic/index.js";
import { pool9ballPlugin } from "./pool-9ball/index.js";
import { pool10ballPlugin } from "./pool-10ball/index.js";
import { poolStraight141Plugin } from "./pool-straight-141/index.js";
import { poolBankPlugin } from "./pool-bank/index.js";
import { poolCutthroatPlugin } from "./pool-cutthroat/index.js";
import { snookerSkillPlugin } from "./snooker-skill/index.js";
import { snookerSixRedPlugin } from "./snooker-six-red/index.js";
import { bowling9pinPlugin } from "./bowling-9pin/index.js";
import { bowlingCandlepinPlugin } from "./bowling-candlepin/index.js";
import { bowlingDuckpinPlugin } from "./bowling-duckpin/index.js";
import { bocceSkillPlugin } from "./bocce-skill/index.js";
import { miniGolf18Plugin } from "./mini-golf-18/index.js";
import { starforgedVowsPlugin } from "./starforged-vows/index.js";
import { sunderedIslesSagaPlugin } from "./sundered-isles-saga/index.js";
import { forTheDramaPlugin } from "./for-the-drama/index.js";
import { forTheCrownSagaPlugin } from "./for-the-crown-saga/index.js";
import { aloneAmongStarsCardPlugin } from "./alone-among-stars-card/index.js";
import { wretchedSwordPlugin } from "./wretched-sword/index.js";
import { wretchedForestPlugin } from "./wretched-forest/index.js";
import { wretchedZombiePlugin } from "./wretched-zombie/index.js";
import { wretchedMagusPlugin } from "./wretched-magus/index.js";
import { artefactHistoryPlugin } from "./artefact-history/index.js";
import { apothecariaSeasonsPlugin } from "./apothecaria-seasons/index.js";
import { tslSoloQuestPlugin } from "./tsl-solo-quest/index.js";
import { ironswornDelveQuestPlugin } from "./ironsworn-delve-quest/index.js";
import { deadAreComingLogPlugin } from "./dead-are-coming-log/index.js";
import { dungeonHeroCardsPlugin } from "./dungeon-hero-cards/index.js";
import { mythicEmulatorOraclePlugin } from "./mythic-emulator-oracle/index.js";
import { scarletHeroesQuestPlugin } from "./scarlet-heroes-quest/index.js";
import { quillGothicLettersPlugin } from "./quill-gothic-letters/index.js";
import { exNovoMapmakerPlugin } from "./ex-novo-mapmaker/index.js";
import { remnantsFragmentsPlugin } from "./remnants-fragments/index.js";
import { sushiGoPartyMenuPlugin } from "./sushi-go-party-menu/index.js";
import { sevenWondersLeadersPlugin } from "./seven-wonders-leaders/index.js";
import { sevenWondersCitiesPlugin } from "./seven-wonders-cities/index.js";
import { sevenWondersBabelPlugin } from "./seven-wonders-babel/index.js";
import { sevenWondersEdificePlugin } from "./seven-wonders-edifice/index.js";
import { sevenWondersArmadaPlugin } from "./seven-wonders-armada/index.js";
import { sevenWondersDuelPyramidPlugin } from "./seven-wonders-duel-pyramid/index.js";
import { duelPantheonGodsPlugin } from "./duel-pantheon-gods/index.js";
import { duelAgoraSenatePlugin } from "./duel-agora-senate/index.js";
import { sevenWondersArchitectsDraftPlugin } from "./seven-wonders-architects-draft/index.js";
import { wonderfulWorldDraftPlugin } from "./wonderful-world-draft/index.js";
import { wonderfulWorldCorruptionPlugin } from "./wonderful-world-corruption/index.js";
import { wonderfulWorldWarPlugin } from "./wonderful-world-war/index.js";
import { amongStarsStationPlugin } from "./among-stars-station/index.js";
import { bibliosDiceDraftPlugin } from "./biblios-dice-draft/index.js";
import { bloodRageVikingsPlugin } from "./blood-rage-vikings/index.js";
import { tidesOfMadnessDraftPlugin } from "./tides-of-madness-draft/index.js";
import { seasonsMagesDraftPlugin } from "./seasons-mages-draft/index.js";
import { wingspanEuropeanDraftPlugin } from "./wingspan-european-draft/index.js";
import { wingspanOceaniaDraftPlugin } from "./wingspan-oceania-draft/index.js";
import { classicCanastaRPlugin } from "./classic-canasta-r/index.js";
import { canastaCalienteRPlugin } from "./canasta-caliente-r/index.js";
import { canastaMexicanaRPlugin } from "./canasta-mexicana-r/index.js";
import { canastaJuniorRPlugin } from "./canasta-junior-r/index.js";
import { canastaSpeedRPlugin } from "./canasta-speed-r/index.js";
import { pinochleRummyRPlugin } from "./pinochle-rummy-r/index.js";
import { wildCardRummyRPlugin } from "./wild-card-rummy-r/index.js";
import { skarneyRPlugin } from "./skarney-r/index.js";
import { shedRummyRPlugin } from "./shed-rummy-r/index.js";
import { progressiveRummyRPlugin } from "./progressive-rummy-r/index.js";
import { quickRummyRPlugin } from "./quick-rummy-r/index.js";
import { rummyRoyaleRPlugin } from "./rummy-royale-r/index.js";
import { nineFiveTwoRPlugin } from "./nine-five-two-r/index.js";
import { papluRPlugin } from "./paplu-r/index.js";
import { scala40RPlugin } from "./scala-40-r/index.js";
import { dealsRummyRPlugin } from "./deals-rummy-r/index.js";
import { pointsRummyRPlugin } from "./points-rummy-r/index.js";
import { indianMarriageRPlugin } from "./indian-marriage-r/index.js";
import { rummyTilesRPlugin } from "./rummy-tiles-r/index.js";
import { michiganRumStopsRPlugin } from "./michigan-rum-stops-r/index.js";
import { briscolonePlugin } from "./briscolone/index.js";
import { cirullaPlugin } from "./cirulla/index.js";
import { scopaDiQuindiciPlugin } from "./scopa-di-quindici/index.js";
import { tressetteNonPrenderePlugin } from "./tressette-non-prendere/index.js";
import { tressetteMortoPlugin } from "./tressette-morto/index.js";
import { calabresellaPlugin } from "./calabresella/index.js";
import { terziglioPlugin } from "./terziglio/index.js";
import { madrassoTrickPlugin } from "./madrasso-trick/index.js";
import { marafoneBeccaccinoPlugin } from "./marafone-beccaccino/index.js";
import { mariashPlugin } from "./mariash/index.js";
import { licitovanyMariasPlugin } from "./licitovany-marias/index.js";
import { voliMariasPlugin } from "./voli-marias/index.js";
import { ramschSkatPlugin } from "./ramsch-skat/index.js";
import { bauernskatPlugin } from "./bauernskat/index.js";
import { officersSkatPlugin } from "./officers-skat/index.js";
import { wenzPlugin } from "./wenz/index.js";
import { geierPlugin } from "./geier/index.js";
import { soloSchafkopfPlugin } from "./solo-schafkopf/index.js";
import { ultiHungarianPlugin } from "./ulti-hungarian/index.js";
import { tarokyPlugin } from "./taroky/index.js";
import { yahtzeeBossDicePlugin } from "./yahtzee-boss-dice/index.js";
import { yahtzeeFreeForAllPlugin } from "./yahtzee-free-for-all/index.js";
import { openFaceYahtzeePlugin } from "./open-face-yahtzee/index.js";
import { tabulaGamePlugin } from "./tabula-game/index.js";
import { ludus12Plugin } from "./ludus-12/index.js";
import { trictracPlugin } from "./trictrac/index.js";
import { glucksradPlugin } from "./glucksrad/index.js";
import { strikeArenaPlugin } from "./strike-arena/index.js";
import { buttonMenDuelPlugin } from "./button-men-duel/index.js";
import { rhinoDicePlugin } from "./rhino-dice/index.js";
import { tumblinFlickPlugin } from "./tumblin-flick/index.js";
import { grabDiceGamePlugin } from "./grab-dice-game/index.js";
import { horseRace2d6Plugin } from "./horse-race-2d6/index.js";
import { heartsLetterDicePlugin } from "./hearts-letter-dice/index.js";
import { threeTwoOneDownPlugin } from "./three-two-one-down/index.js";
import { sequenceSixPlugin } from "./sequence-six/index.js";
import { mexicanPubDicePlugin } from "./mexican-pub-dice/index.js";
import { meyerBluffPlugin } from "./meyer-bluff/index.js";
import { schummelnBluffPlugin } from "./schummeln-bluff/index.js";
import { dudakTavernPlugin } from "./dudak-tavern/index.js";
import { canadianCheckers12Plugin } from "./canadian-checkers-12/index.js";
import { poolCheckersAmPlugin } from "./pool-checkers-am/index.js";
import { thaiDraughtsPlugin } from "./thai-draughts/index.js";
import { russianCheckersFlyingPlugin } from "./russian-checkers-flying/index.js";
import { crodaItalianPlugin } from "./croda-italian/index.js";
import { dameoFreelingPlugin } from "./dameo-freeling/index.js";
import { tawlbwrddWelshPlugin } from "./tawlbwrdd-welsh/index.js";
import { seaBattleTaflPlugin } from "./sea-battle-tafl/index.js";
import { omwesoUgandaPlugin } from "./omweso-uganda/index.js";
import { toguzKumalak92Plugin } from "./toguz-kumalak-92/index.js";
import { pallanguzhiTamilPlugin } from "./pallanguzhi-tamil/index.js";
import { dvonnStackPlugin } from "./dvonn-stack/index.js";
import { tzaarStonesPlugin } from "./tzaar-stones/index.js";
import { gipfOriginalPlugin } from "./gipf-original/index.js";
import { tamskSandPlugin } from "./tamsk-sand/index.js";
import { qawaleStackPlugin } from "./qawale-stack/index.js";
import { fanoronaMalagasyPlugin } from "./fanorona-malagasy/index.js";
import { zammaAfricanPlugin } from "./zamma-african/index.js";
import { yoteWestPlugin } from "./yote-west/index.js";
import { yavalath3Plugin } from "./yavalath-3/index.js";
import { samuraiSudokuMiniPlugin } from "./samurai-sudoku-mini/index.js";
import { tridokuMiniPlugin } from "./tridoku-mini/index.js";
import { hexadokuMiniPlugin } from "./hexadoku-mini/index.js";
import { sudoku25Plugin } from "./sudoku-25/index.js";
import { sudoku16Plugin } from "./sudoku-16/index.js";
import { offsetSudokuMiniPlugin } from "./offset-sudoku-mini/index.js";
import { tripodSudokuMiniPlugin } from "./tripod-sudoku-mini/index.js";
import { crossSudokuMiniPlugin } from "./cross-sudoku-mini/index.js";
import { flowerSudokuMiniPlugin } from "./flower-sudoku-mini/index.js";
import { windokuPlusMiniPlugin } from "./windoku-plus-mini/index.js";
import { quadrupleClueSudokuPlugin } from "./quadruple-clue-sudoku/index.js";
import { sudoku159Plugin } from "./sudoku-159/index.js";
import { crypticSudokuPlugin } from "./cryptic-sudoku/index.js";
import { girandolaSudokuPlugin } from "./girandola-sudoku/index.js";
import { skyscraperSudokuPlugin } from "./skyscraper-sudoku/index.js";
import { tetrominoSudokuPlugin } from "./tetromino-sudoku/index.js";
import { offsetKillerSudokuPlugin } from "./offset-killer-sudoku/index.js";
import { diagonalKillerPlugin } from "./diagonal-killer/index.js";
import { surplusSudokuPlugin } from "./surplus-sudoku/index.js";
import { kakuroCrossSumsPlugin } from "./kakuro-cross-sums/index.js";
import { diceStratFootballPlugin } from "./dice-strat-football/index.js";
import { diceStratHockeyPlugin } from "./dice-strat-hockey/index.js";
import { diceStratBasketballPlugin } from "./dice-strat-basketball/index.js";
import { diceStratArenaPlugin } from "./dice-strat-arena/index.js";
import { diceApbaBasketballPlugin } from "./dice-apba-basketball/index.js";
import { diceReplayBaseballDetailPlugin } from "./dice-replay-baseball-detail/index.js";
import { dicePursuePennantPlugin } from "./dice-pursue-pennant/index.js";
import { diceBaseballHighlightsPlugin } from "./dice-baseball-highlights/index.js";
import { diceFantasyFootballDraftPlugin } from "./dice-fantasy-football-draft/index.js";
import { diceFantasyBaseballDraftPlugin } from "./dice-fantasy-baseball-draft/index.js";
import { diceFantasyBasketballDraftPlugin } from "./dice-fantasy-basketball-draft/index.js";
import { diceSnookerMatchPlugin } from "./dice-snooker-match/index.js";
import { diceRussianPyramidPlugin } from "./dice-russian-pyramid/index.js";
import { diceKaisaPlugin } from "./dice-kaisa/index.js";
import { diceCurlingStonesPlugin } from "./dice-curling-stones/index.js";
import { diceBicycleVelodromePlugin } from "./dice-bicycle-velodrome/index.js";
import { diceTourDeFrancePlugin } from "./dice-tour-de-france/index.js";
import { diceBoxingKoPlugin } from "./dice-boxing-ko/index.js";
import { diceHorseRacingCardPlugin } from "./dice-horse-racing-card/index.js";
import { diceBelmontStakesPlugin } from "./dice-belmont-stakes/index.js";
import { spikeTapPlugin } from "./spike-tap/index.js";
import { moleMashPlugin } from "./mole-mash/index.js";
import { pixelPopPlugin } from "./pixel-pop/index.js";
import { starShootPlugin } from "./star-shoot/index.js";
import { rocketPopPlugin } from "./rocket-pop/index.js";
import { laserZapPlugin } from "./laser-zap/index.js";
import { candyTapPlugin } from "./candy-tap/index.js";
import { eggCatchPlugin } from "./egg-catch/index.js";
import { bugSquashPlugin } from "./bug-squash/index.js";
import { birdTapPlugin } from "./bird-tap/index.js";
import { cloudPopPlugin } from "./cloud-pop/index.js";
import { heartPopPlugin } from "./heart-pop/index.js";
import { coinGrabPlugin } from "./coin-grab/index.js";
import { leafFallPlugin } from "./leaf-fall/index.js";
import { waveTapPlugin } from "./wave-tap/index.js";
import { snowflakeTapPlugin } from "./snowflake-tap/index.js";
import { sparkTapPlugin } from "./spark-tap/index.js";
import { honeyTapPlugin } from "./honey-tap/index.js";
import { slimeSplatPlugin } from "./slime-splat/index.js";
import { ufoZapPlugin } from "./ufo-zap/index.js";
import { vowelQuizPlugin } from "./vowel-quiz/index.js";
import { consonantQuizPlugin } from "./consonant-quiz/index.js";
import { silentLetterQuizPlugin } from "./silent-letter-quiz/index.js";
import { hyphenQuizPlugin } from "./hyphen-quiz/index.js";
import { prepositionQuizPlugin } from "./preposition-quiz/index.js";
import { pronounQuizPlugin } from "./pronoun-quiz/index.js";
import { adverbQuizPlugin } from "./adverb-quiz/index.js";
import { adjectiveQuizPlugin } from "./adjective-quiz/index.js";
import { verbQuizPlugin } from "./verb-quiz/index.js";
import { nounQuizPlugin } from "./noun-quiz/index.js";
import { acronymMiniPlugin } from "./acronym-mini/index.js";
import { contractionQuizPlugin } from "./contraction-quiz/index.js";
import { alliterationPickPlugin } from "./alliteration-pick/index.js";
import { onomatopoeiaPickPlugin } from "./onomatopoeia-pick/index.js";
import { synonymPickPlugin } from "./synonym-pick/index.js";
import { antonymPickPlugin } from "./antonym-pick/index.js";
import { homonymPickPlugin } from "./homonym-pick/index.js";
import { homophonePickPlugin } from "./homophone-pick/index.js";
import { eponymQuizPlugin } from "./eponym-quiz/index.js";
import { neologismQuizPlugin } from "./neologism-quiz/index.js";
import { toponymQuizPlugin } from "./toponym-quiz/index.js";
import { clicheQuizPlugin } from "./cliche-quiz/index.js";
import { tautologyQuizPlugin } from "./tautology-quiz/index.js";
import { collocationQuizPlugin } from "./collocation-quiz/index.js";
import { spoonerismQuizPlugin } from "./spoonerism-quiz/index.js";
import { mondegreenQuizPlugin } from "./mondegreen-quiz/index.js";
import { malapropismQuizPlugin } from "./malapropism-quiz/index.js";
import { pluralsQuizPlugin } from "./plurals-quiz/index.js";
import { tensesQuizPlugin } from "./tenses-quiz/index.js";
import { comparativeQuizPlugin } from "./comparative-quiz/index.js";
import { superlativeQuizPlugin } from "./superlative-quiz/index.js";
import { articleQuizPlugin } from "./article-quiz/index.js";
import { doubleLetterQuizPlugin } from "./double-letter-quiz/index.js";
import { silentEQuizPlugin } from "./silent-e-quiz/index.js";
import { heteronymQuizPlugin } from "./heteronym-quiz/index.js";
import { capitonymQuizPlugin } from "./capitonym-quiz/index.js";
import { zhengShangyouShedPlugin } from "./zheng-shangyou-shed/index.js";
import { tractorShengJiPlugin } from "./tractor-sheng-ji/index.js";
import { authorsShedPlugin } from "./authors-shed/index.js";
import { spoonsShedPlugin } from "./spoons-shed/index.js";
import { pitShedPlugin } from "./pit-shed/index.js";
import { snipSnapShedPlugin } from "./snip-snap-shed/index.js";
import { bSCheatShedPlugin } from "./b-s-cheat-shed/index.js";
import { golfFourShedPlugin } from "./golf-four-shed/index.js";
import { golfNineShedPlugin } from "./golf-nine-shed/index.js";
import { beggarNeighbourShedPlugin } from "./beggar-neighbour-shed/index.js";
import { beatNeighbourShedPlugin } from "./beat-neighbour-shed/index.js";
import { doubleWarShedPlugin } from "./double-war-shed/index.js";
import { persianWarShedPlugin } from "./persian-war-shed/index.js";
import { blitzThirtyOneShedPlugin } from "./blitz-thirty-one-shed/index.js";
import { sevenTwentySevenShedPlugin } from "./seven-twenty-seven-shed/index.js";
import { ristiklappiShedPlugin } from "./ristiklappi-shed/index.js";
import { svoyiKoziriShedPlugin } from "./svoyi-koziri-shed/index.js";
import { podkidnoyDurakShedPlugin } from "./podkidnoy-durak-shed/index.js";
import { perevodnoyDurakShedPlugin } from "./perevodnoy-durak-shed/index.js";
import { sviyiShedPlugin } from "./sviyi-shed/index.js";
import { spanish21CasPlugin } from "./spanish-21-cas/index.js";
import { pontoonCasPlugin } from "./pontoon-cas/index.js";
import { blackjackSwitchCasPlugin } from "./blackjack-switch-cas/index.js";
import { europeanBjCasPlugin } from "./european-bj-cas/index.js";
import { atlanticCityBjCasPlugin } from "./atlantic-city-bj-cas/index.js";
import { chineseBlackjackCasPlugin } from "./chinese-blackjack-cas/index.js";
import { multiHandVpTenPlugin } from "./multi-hand-vp-ten/index.js";
import { superTimesPayCasPlugin } from "./super-times-pay-cas/index.js";
import { doubleDoubleBonusCasPlugin } from "./double-double-bonus-cas/index.js";
import { allAmericanVpCasPlugin } from "./all-american-vp-cas/index.js";
import { jokerPokerCasPlugin } from "./joker-poker-cas/index.js";
import { tensOrBetterCasPlugin } from "./tens-or-better-cas/index.js";
import { redDogCasPlugin } from "./red-dog-cas/index.js";
import { threeCardPokerCasPlugin } from "./three-card-poker-cas/index.js";
import { fourCardPokerCasPlugin } from "./four-card-poker-cas/index.js";
import { letItRideCasPlugin } from "./let-it-ride-cas/index.js";
import { ultimateTexasCasPlugin } from "./ultimate-texas-cas/index.js";
import { casinoHoldemCasPlugin } from "./casino-holdem-cas/index.js";
import { miniBaccaratMiniPlugin } from "./mini-baccarat-mini/index.js";
import { ezBaccaratMiniPlugin } from "./ez-baccarat-mini/index.js";
import { doubleDoubleBonusPokerPlugin } from "./double-double-bonus-poker/index.js";
import { progressiveKnockoutTournamentPlugin } from "./progressive-knockout-tournament/index.js";
import { reEntryTournamentPlugin } from "./re-entry-tournament/index.js";
import { runItThreeTimesPlugin } from "./run-it-three-times/index.js";
import { highLowChicagoPlugin } from "./high-low-chicago/index.js";
import { aceyDeuceyInBetweenPlugin } from "./acey-deucey-in-between/index.js";
import { redDogCardPlugin } from "./red-dog-card/index.js";
import { screwYourNeighborCardPlugin } from "./screw-your-neighbor-card/index.js";
import { passTheTrashCardPlugin } from "./pass-the-trash-card/index.js";
import { countdownPokerPlugin } from "./countdown-poker/index.js";
import { woolworthPokerPlugin } from "./woolworth-poker/index.js";
import { fieryCrossPokerPlugin } from "./fiery-cross-poker/index.js";
import { drawmahaHiPokerPlugin } from "./drawmaha-hi-poker/index.js";
import { turboDealersChoicePlugin } from "./turbo-dealers-choice/index.js";
import { fusionPokerClPlugin } from "./fusion-poker-cl/index.js";
import { spitOceanClPlugin } from "./spit-ocean-cl/index.js";
import { anacondaPassPokerPlugin } from "./anaconda-pass-poker/index.js";
import { fiveCardStudClassicPlugin } from "./five-card-stud-classic/index.js";
import { spitInOceanPlugin } from "./spit-in-ocean/index.js";
import { threeCardGutsPlugin } from "./three-card-guts/index.js";
import { carcassonneTowerPlugin } from "./carcassonne-tower/index.js";
import { carcassonneBigTopPlugin } from "./carcassonne-big-top/index.js";
import { carcassonneGermanCastlesPlugin } from "./carcassonne-german-castles/index.js";
import { carcassonneSafariPlugin } from "./carcassonne-safari/index.js";
import { carcassonneAmazonasPlugin } from "./carcassonne-amazonas/index.js";
import { carcassonneSouthSeasPlugin } from "./carcassonne-south-seas/index.js";
import { carcassonneStarWarsPlugin } from "./carcassonne-star-wars/index.js";
import { kingdominoPlugin } from "./kingdomino/index.js";
import { queendominoPlugin } from "./queendomino/index.js";
import { patchworkPlugin } from "./patchwork/index.js";
import { patchworkDoodlePlugin } from "./patchwork-doodle/index.js";
import { barenparkPlugin } from "./barenpark/index.js";
import { azulStainedGlassPlugin } from "./azul-stained-glass/index.js";
import { sagradaPlugin } from "./sagrada/index.js";
import { tokaidoPlugin } from "./tokaido/index.js";
import { ingeniousPlugin } from "./ingenious/index.js";
import { blokusPlugin } from "./blokus/index.js";
import { nmbr9Plugin } from "./nmbr9/index.js";
import { tinyTownsPlugin } from "./tiny-towns/index.js";
import { calicoPlugin } from "./calico/index.js";
import { thumbPouchPlugin } from "./thumb-pouch/index.js";
import { cassettePlugin } from "./cassette/index.js";
import { agnesBernauerPlugin } from "./agnes-bernauer/index.js";
import { blindHookeySoliPlugin } from "./blind-hookey-soli/index.js";
import { russianSoliPlugin } from "./russian-soli/index.js";
import { penguinSoliPlugin } from "./penguin-soli/index.js";
import { scorpionSoliPlugin } from "./scorpion-soli/index.js";
import { waspSoliPlugin } from "./wasp-soli/index.js";
import { blackWidowSpiderPlugin } from "./black-widow-spider/index.js";
import { blackHoleSoliPlugin } from "./black-hole-soli/index.js";
import { allInRowPlugin } from "./all-in-row/index.js";
import { ladyManorPlugin } from "./lady-manor/index.js";
import { sultanSoliPlugin } from "./sultan-soli/index.js";
import { threeShufflesPlugin } from "./three-shuffles/index.js";
import { midnightOilSoliPlugin } from "./midnight-oil-soli/index.js";
import { quiltSoliPlugin } from "./quilt-soli/index.js";
import { zodiacSoliPlugin } from "./zodiac-soli/index.js";
import { coloradoSoliPlugin } from "./colorado-soli/index.js";
import { deucesSoliPlugin } from "./deuces-soli/index.js";
import { rainbowSoliPlugin } from "./rainbow-soli/index.js";
import { chess960CrazyhouseQuizPlugin } from "./chess960-crazyhouse-quiz/index.js";
import { minichess5x5QuizPlugin } from "./minichess-5x5-quiz/index.js";
import { chuShogiBoardQuizPlugin } from "./chu-shogi-board-quiz/index.js";
import { xiangqiClassicQuizPlugin } from "./xiangqi-classic-quiz/index.js";
import { suicideCheckersQuizPlugin } from "./suicide-checkers-quiz/index.js";
import { reversiAntiQuizPlugin } from "./reversi-anti-quiz/index.js";
import { reversiRandomQuizPlugin } from "./reversi-random-quiz/index.js";
import { abaloneQuizPlugin } from "./abalone-quiz/index.js";
import { halmaQuizPlugin } from "./halma-quiz/index.js";
import { go9QuizPlugin } from "./go-9-quiz/index.js";
import { go13QuizPlugin } from "./go-13-quiz/index.js";
import { go19QuizPlugin } from "./go-19-quiz/index.js";
import { badukBoardQuizPlugin } from "./baduk-board-quiz/index.js";
import { yConnectionQuizPlugin } from "./y-connection-quiz/index.js";
import { ataxxQuizPlugin } from "./ataxx-quiz/index.js";
import { arimaaQuizPlugin } from "./arimaa-quiz/index.js";
import { breakthroughCheckersQuizPlugin } from "./breakthrough-checkers-quiz/index.js";
import { owareMancalaQuizPlugin } from "./oware-mancala-quiz/index.js";
import { baoMancalaQuizPlugin } from "./bao-mancala-quiz/index.js";
import { shatranjBoardQuizPlugin } from "./shatranj-board-quiz/index.js";
import { klondikeNoRedealPlugin } from "./klondike-no-redeal/index.js";
import { cassetteBernauerPlugin } from "./cassette-bernauer/index.js";
import { athenaPatPlugin } from "./athena-pat/index.js";
import { penguinPatPlugin } from "./penguin-pat/index.js";
import { stalactitesPatPlugin } from "./stalactites-pat/index.js";
import { scorpionPatPlugin } from "./scorpion-pat/index.js";
import { waspPatPlugin } from "./wasp-pat/index.js";
import { apophisSoliPlugin } from "./apophis-soli/index.js";
import { addictionSoliPlugin } from "./addiction-soli/index.js";
import { alaskaPatPlugin } from "./alaska-pat/index.js";
import { somersetPatPlugin } from "./somerset-pat/index.js";
import { citadelPatPlugin } from "./citadel-pat/index.js";
import { doubleKlondikePatPlugin } from "./double-klondike-pat/index.js";
import { windmillPatPlugin } from "./windmill-pat/index.js";
import { indianFtyPlugin } from "./indian-fty/index.js";
import { zodiacPatPlugin } from "./zodiac-pat/index.js";
import { sequentialPatPlugin } from "./sequential-pat/index.js";
import { ladyOfManorPlugin } from "./lady-of-manor/index.js";
import { virginiaReelPlugin } from "./virginia-reel/index.js";
import { nertsSoliPlugin } from "./nerts-soli/index.js";
import { kingOfHillChessPlugin } from "./king-of-hill-chess/index.js";
import { racingKingsChessPlugin } from "./racing-kings-chess/index.js";
import { fourPlayerChessTeamPlugin } from "./four-player-chess-team/index.js";
import { fogOfWarPlugin } from "./fog-of-war/index.js";
import { aliceChess2Plugin } from "./alice-chess-2/index.js";
import { crazyhouseChessPlugin } from "./crazyhouse-chess/index.js";
import { preChessPositionsPlugin } from "./pre-chess-positions/index.js";
import { sittuyinChessPlugin } from "./sittuyin-chess/index.js";
import { janggiChessPlugin } from "./janggi-chess/index.js";
import { xiangqiChessPlugin } from "./xiangqi-chess/index.js";
import { shatranjChessPlugin } from "./shatranj-chess/index.js";
import { chuShogiBoardPlugin } from "./chu-shogi-board/index.js";
import { miniShogi5Plugin } from "./mini-shogi-5/index.js";
import { microShogi4Plugin } from "./micro-shogi-4/index.js";
import { canadianDraughtsPlugin } from "./canadian-draughts/index.js";
import { dameoPosPlugin } from "./dameo-pos/index.js";
import { go9Plugin } from "./go-9/index.js";
import { renjuClassicPlugin } from "./renju/index.js";
import { ninukiRenjuClassicPlugin } from "./ninuki-renju/index.js";
import { pentePlugin } from "./pente/index.js";
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
  spaceArenaPlugin as unknown as GamePlugin,
  gladiatorArenaPlugin as unknown as GamePlugin,
  slimeDefensePlugin as unknown as GamePlugin,
  zombieSurvivalPlugin as unknown as GamePlugin,
  wizardCardDuelPlugin as unknown as GamePlugin,
  alienCardBattlePlugin as unknown as GamePlugin,
  dotGridPuzzlePlugin as unknown as GamePlugin,
  foodTruckTycoonPlugin as unknown as GamePlugin,
  forestTrekPlugin as unknown as GamePlugin,
  mountainClimbPlugin as unknown as GamePlugin,
  frozenRiverPlugin as unknown as GamePlugin,
  cardBlastPlugin as unknown as GamePlugin,
  volcanoEscapePlugin as unknown as GamePlugin,
  coralReefPlugin as unknown as GamePlugin,
  circusJugglePlugin as unknown as GamePlugin,
  magicianTrickPlugin as unknown as GamePlugin,
  clownTossPlugin as unknown as GamePlugin,
  acrobatFlipPlugin as unknown as GamePlugin,
  desertTrekPlugin as unknown as GamePlugin,
  archwayPlugin as unknown as GamePlugin,
  babettePlugin as unknown as GamePlugin,
  frogSolitairePlugin as unknown as GamePlugin,
  lastMonarchPlugin as unknown as GamePlugin,
  peekPlugin as unknown as GamePlugin,
  salicLawPlugin as unknown as GamePlugin,
  sevenUpPlugin as unknown as GamePlugin,
  tournamentPlugin as unknown as GamePlugin,
  connectPipesProPlugin as unknown as GamePlugin,
  tileFlipPlugin as unknown as GamePlugin,
  colorFlowPlugin as unknown as GamePlugin,
  crosswordProPlugin as unknown as GamePlugin,
  ultimateTicTacToePlugin as unknown as GamePlugin,
  diceFootballPlugin as unknown as GamePlugin,
  diceBasketballPlugin as unknown as GamePlugin,
  kartTournamentPlugin as unknown as GamePlugin,
  racingStuntsPlugin as unknown as GamePlugin,
  bikeRacePlugin as unknown as GamePlugin,
  timeTrialPlugin as unknown as GamePlugin,
  pirateShipCannonPlugin as unknown as GamePlugin,
  ufoShooterPlugin as unknown as GamePlugin,
  diceSoccerPlugin as unknown as GamePlugin,
  diceTennisPlugin as unknown as GamePlugin,
  diceHockeyPlugin as unknown as GamePlugin,
  arcticSurvivalPlugin as unknown as GamePlugin,
  jungleExplorerPlugin as unknown as GamePlugin,
  rocketLaunchArcadePlugin as unknown as GamePlugin,
  dotToDotPlugin as unknown as GamePlugin,
  letterPaintPlugin as unknown as GamePlugin,
  infiniteTicTacToePlugin as unknown as GamePlugin,
  cardBingoProPlugin as unknown as GamePlugin,
  walkingTheDogPlugin as unknown as GamePlugin,
  kitchenChaosPlugin as unknown as GamePlugin,
  baristaRushPlugin as unknown as GamePlugin,
  superTicTacToePlugin as unknown as GamePlugin,
  feedTheCatPlugin as unknown as GamePlugin,
  petShopMiniPlugin as unknown as GamePlugin,
  aquariumKeeperPlugin as unknown as GamePlugin,
  iceCreamStandPlugin as unknown as GamePlugin,
  fireworkShowPlugin as unknown as GamePlugin,
  swimmingLapsPlugin as unknown as GamePlugin,
  kiteFightPlugin as unknown as GamePlugin,
  tacoTruckPlugin as unknown as GamePlugin,
  pastaShopPlugin as unknown as GamePlugin,
  donutShopPlugin as unknown as GamePlugin,
  bridgeBuilderPuzzlePlugin as unknown as GamePlugin,
  paintingPuzzlePlugin as unknown as GamePlugin,
  triathlonMiniPlugin as unknown as GamePlugin,
  marathonPacerPlugin as unknown as GamePlugin,
  poleClimbingPlugin as unknown as GamePlugin,
  trampolineBouncePlugin as unknown as GamePlugin,
  seesawBalancePlugin as unknown as GamePlugin,
  boomerangTossPlugin as unknown as GamePlugin,
  bottleSpinPlugin as unknown as GamePlugin,
  diceRunnerPlugin as unknown as GamePlugin,
  rollAndAddPlugin as unknown as GamePlugin,
  cardSharkPlugin as unknown as GamePlugin,
  matchThreeSagaPlugin as unknown as GamePlugin,
  wallBouncePlugin as unknown as GamePlugin,
  diceArcheryPlugin as unknown as GamePlugin,
  diceDartsPlugin as unknown as GamePlugin,
  dicePoolMatchPlugin as unknown as GamePlugin,
  rollingThunderDicePlugin as unknown as GamePlugin,
  bingoCallPlugin as unknown as GamePlugin,
  cardFlipPuzzlePlugin as unknown as GamePlugin,
  solitaireClockTournamentPlugin as unknown as GamePlugin,
  ticTacToeToroidalPlugin as unknown as GamePlugin,
  numericTicTacToePlugin as unknown as GamePlugin,
  chessPuzzleForkPlugin as unknown as GamePlugin,
  gomokuTacticPlugin as unknown as GamePlugin,
  weatherQuizPlugin as unknown as GamePlugin,
  musicDecadeQuizPlugin as unknown as GamePlugin,
  tvShowQuizPlugin as unknown as GamePlugin,
  videoGameQuizPlugin as unknown as GamePlugin,
  countryFlagQuizPlugin as unknown as GamePlugin,
  capitalsQuizPlugin as unknown as GamePlugin,
  instrumentsQuizPlugin as unknown as GamePlugin,
  planetsQuizPlugin as unknown as GamePlugin,
  highestCardBetPlugin as unknown as GamePlugin,
  lowestCardBetPlugin as unknown as GamePlugin,
  cardColorGuessPlugin as unknown as GamePlugin,
  cardSuitGuessPlugin as unknown as GamePlugin,
  evensOrOddsDicePlugin as unknown as GamePlugin,
  total7OrNotPlugin as unknown as GamePlugin,
  diceFlushPlugin as unknown as GamePlugin,
  threeOfAKindRollPlugin as unknown as GamePlugin,
  ticTacToeLargePlugin as unknown as GamePlugin,
  ticTacToeCornersWinPlugin as unknown as GamePlugin,
  ticTacToe3InRowPlugin as unknown as GamePlugin,
  gomokuMiniPlugin as unknown as GamePlugin,
  targetGrabPlugin as unknown as GamePlugin,
  flySwatterPlugin as unknown as GamePlugin,
  balloonDartsPlugin as unknown as GamePlugin,
  dunkTankPlugin as unknown as GamePlugin,
  ringTossProPlugin as unknown as GamePlugin,
  basketTossPlugin as unknown as GamePlugin,
  paperArrowPlugin as unknown as GamePlugin,
  waterPistolPlugin as unknown as GamePlugin,
  colorRecallPlugin as unknown as GamePlugin,
  shapeRecallPlugin as unknown as GamePlugin,
  numberRecallPlugin as unknown as GamePlugin,
  positionRecallPlugin as unknown as GamePlugin,
  birdsQuizPlugin as unknown as GamePlugin,
  plantsQuizPlugin as unknown as GamePlugin,
  gemstonesQuizPlugin as unknown as GamePlugin,
  occupationsQuizPlugin as unknown as GamePlugin,
  cardUpDownPlugin as unknown as GamePlugin,
  redOrBlackPlugin as unknown as GamePlugin,
  aceFinderPlugin as unknown as GamePlugin,
  doubleOrNothingDicePlugin as unknown as GamePlugin,
  climbTheLadderDicePlugin as unknown as GamePlugin,
  sumTargetDicePlugin as unknown as GamePlugin,
  swordSlicePlugin as unknown as GamePlugin,
  magicWandCastPlugin as unknown as GamePlugin,
  frogLeapPlugin as unknown as GamePlugin,
  monkeyBananaPlugin as unknown as GamePlugin,
  cribbageSquarePlugin as unknown as GamePlugin,
  decadeSolitairePlugin as unknown as GamePlugin,
  insectsQuizPlugin as unknown as GamePlugin,
  fishQuizPlugin as unknown as GamePlugin,
  mammalsQuizPlugin as unknown as GamePlugin,
  reptilesQuizPlugin as unknown as GamePlugin,
  oceansQuizPlugin as unknown as GamePlugin,
  desertsQuizPlugin as unknown as GamePlugin,
  mountainsQuizPlugin as unknown as GamePlugin,
  riversQuizPlugin as unknown as GamePlugin,
  citiesQuizPlugin as unknown as GamePlugin,
  monumentsQuizPlugin as unknown as GamePlugin,
  cardBidFlipPlugin as unknown as GamePlugin,
  cardPyramidGrabPlugin as unknown as GamePlugin,
  cardSnap3Plugin as unknown as GamePlugin,
  cardStackBetPlugin as unknown as GamePlugin,
  cardSpinPickPlugin as unknown as GamePlugin,
  diceCoinBetPlugin as unknown as GamePlugin,
  diceTarget25Plugin as unknown as GamePlugin,
  dicePyramidRollPlugin as unknown as GamePlugin,
  diceStreak9Plugin as unknown as GamePlugin,
  diceBingoMiniPlugin as unknown as GamePlugin,
  arrowHitPlugin as unknown as GamePlugin,
  balloonBurstPlugin as unknown as GamePlugin,
  fishingCastPlugin as unknown as GamePlugin,
  ladderClimbPlugin as unknown as GamePlugin,
  lavaLeapPlugin as unknown as GamePlugin,
  molePopPlugin as unknown as GamePlugin,
  pickleJarPlugin as unknown as GamePlugin,
  ringerCoinPlugin as unknown as GamePlugin,
  snowballThrowPlugin as unknown as GamePlugin,
  sockTossPlugin as unknown as GamePlugin,
  treesQuizPlugin as unknown as GamePlugin,
  herbsQuizPlugin as unknown as GamePlugin,
  fruitsQuizPlugin as unknown as GamePlugin,
  vegetablesQuizPlugin as unknown as GamePlugin,
  danceQuizPlugin as unknown as GamePlugin,
  paintersQuizPlugin as unknown as GamePlugin,
  composersQuizPlugin as unknown as GamePlugin,
  philosophersQuizPlugin as unknown as GamePlugin,
  warsQuizPlugin as unknown as GamePlugin,
  treatiesQuizPlugin as unknown as GamePlugin,
  cardRankGuessPlugin as unknown as GamePlugin,
  cardPairPickPlugin as unknown as GamePlugin,
  cardPileBetPlugin as unknown as GamePlugin,
  cardShuffleBetPlugin as unknown as GamePlugin,
  cardLowHigh3Plugin as unknown as GamePlugin,
  diceTwinBetPlugin as unknown as GamePlugin,
  dice100TargetPlugin as unknown as GamePlugin,
  diceDoubleTroublePlugin as unknown as GamePlugin,
  dicePipAddPlugin as unknown as GamePlugin,
  diceMirrorRollPlugin as unknown as GamePlugin,
  appleTossPlugin as unknown as GamePlugin,
  bananaPeelPlugin as unknown as GamePlugin,
  birdShootPlugin as unknown as GamePlugin,
  candyGrabPlugin as unknown as GamePlugin,
  coinPopPlugin as unknown as GamePlugin,
  donutGrabPlugin as unknown as GamePlugin,
  eggDropPlugin as unknown as GamePlugin,
  gemGrabPlugin as unknown as GamePlugin,
  hatTossPlugin as unknown as GamePlugin,
  hulaHoopPlugin as unknown as GamePlugin,
  spicesQuizPlugin as unknown as GamePlugin,
  drinksQuizPlugin as unknown as GamePlugin,
  snacksQuizPlugin as unknown as GamePlugin,
  festivalsQuizPlugin as unknown as GamePlugin,
  religionsQuizPlugin as unknown as GamePlugin,
  sportsRulesQuizPlugin as unknown as GamePlugin,
  olympicEventsQuizPlugin as unknown as GamePlugin,
  transportationQuizPlugin as unknown as GamePlugin,
  architectureQuizPlugin as unknown as GamePlugin,
  dictatorsQuizPlugin as unknown as GamePlugin,
  cardFlipThreePlugin as unknown as GamePlugin,
  cardPickBetPlugin as unknown as GamePlugin,
  cardColorStreakPlugin as unknown as GamePlugin,
  cardPileStackPlugin as unknown as GamePlugin,
  cardHotColdPlugin as unknown as GamePlugin,
  dicePyramidStackPlugin as unknown as GamePlugin,
  diceBullseyeRollPlugin as unknown as GamePlugin,
  diceSequence3Plugin as unknown as GamePlugin,
  diceFlushRollPlugin as unknown as GamePlugin,
  diceUpDownGamePlugin as unknown as GamePlugin,
  iceSkaterPlugin as unknown as GamePlugin,
  kiteRunnerPlugin as unknown as GamePlugin,
  knightChargePlugin as unknown as GamePlugin,
  leafRakePlugin as unknown as GamePlugin,
  lemonSqueezePlugin as unknown as GamePlugin,
  melonSmashPlugin as unknown as GamePlugin,
  nailHammerPlugin as unknown as GamePlugin,
  oilPumpPlugin as unknown as GamePlugin,
  pencilSharpenPlugin as unknown as GamePlugin,
  pizzaCutPlugin as unknown as GamePlugin,
  beersQuizPlugin as unknown as GamePlugin,
  cardBidStreakPlugin as unknown as GamePlugin,
  cardFlipStreakPlugin as unknown as GamePlugin,
  cardHigh3Plugin as unknown as GamePlugin,
  cardLow3Plugin as unknown as GamePlugin,
  cardPickStreakPlugin as unknown as GamePlugin,
  cidersQuizPlugin as unknown as GamePlugin,
  cocktailsQuizPlugin as unknown as GamePlugin,
  danceStylesQuizPlugin as unknown as GamePlugin,
  drinksTypesQuizPlugin as unknown as GamePlugin,
  fashionErasQuizPlugin as unknown as GamePlugin,
  hairstylesQuizPlugin as unknown as GamePlugin,
  philosopherViewsQuizPlugin as unknown as GamePlugin,
  religionsSymbolsQuizPlugin as unknown as GamePlugin,
  winesQuizPlugin as unknown as GamePlugin,
  literatureGenresQuizPlugin as unknown as GamePlugin,
  artMovementsQuizPlugin as unknown as GamePlugin,
  militaryLeadersQuizPlugin as unknown as GamePlugin,
  scientistsQuizPlugin as unknown as GamePlugin,
  mathematiciansQuizPlugin as unknown as GamePlugin,
  explorersQuizPlugin as unknown as GamePlugin,
  queensQuizPlugin as unknown as GamePlugin,
  kingsQuizPlugin as unknown as GamePlugin,
  popesQuizPlugin as unknown as GamePlugin,
  primeMinistersQuizPlugin as unknown as GamePlugin,
  cardThreeFlipPlugin as unknown as GamePlugin,
  cardDiscardBetPlugin as unknown as GamePlugin,
  cardPickThreePlugin as unknown as GamePlugin,
  cardFoldThreePlugin as unknown as GamePlugin,
  cardDrawUpPlugin as unknown as GamePlugin,
  dicePairRollPlugin as unknown as GamePlugin,
  diceAddBetPlugin as unknown as GamePlugin,
  diceColorBetPlugin as unknown as GamePlugin,
  diceSkipBetPlugin as unknown as GamePlugin,
  diceStepBetPlugin as unknown as GamePlugin,
  springJumpPlugin as unknown as GamePlugin,
  stickyBunPlugin as unknown as GamePlugin,
  sushiRollTossPlugin as unknown as GamePlugin,
  swingBatPlugin as unknown as GamePlugin,
  tacoTossPlugin as unknown as GamePlugin,
  tennisVolleyPlugin as unknown as GamePlugin,
  tileFlipArcadePlugin as unknown as GamePlugin,
  tinCanTossPlugin as unknown as GamePlugin,
  topSpinPlugin as unknown as GamePlugin,
  vaseBalancePlugin as unknown as GamePlugin,
  asianCuisineQuizPlugin as unknown as GamePlugin,
  europeanCuisineQuizPlugin as unknown as GamePlugin,
  africanCuisineQuizPlugin as unknown as GamePlugin,
  americanCuisineQuizPlugin as unknown as GamePlugin,
  italianCuisineQuizPlugin as unknown as GamePlugin,
  frenchCuisineQuizPlugin as unknown as GamePlugin,
  mexicanCuisineQuizPlugin as unknown as GamePlugin,
  indianCuisineQuizPlugin as unknown as GamePlugin,
  chineseCuisineQuizPlugin as unknown as GamePlugin,
  japaneseCuisineQuizPlugin as unknown as GamePlugin,
  thaiCuisineQuizPlugin as unknown as GamePlugin,
  greekCuisineQuizPlugin as unknown as GamePlugin,
  spanishCuisineQuizPlugin as unknown as GamePlugin,
  koreanCuisineQuizPlugin as unknown as GamePlugin,
  brazilianCuisineQuizPlugin as unknown as GamePlugin,
  cardPopBetPlugin as unknown as GamePlugin,
  cardStackFlipPlugin as unknown as GamePlugin,
  cardSnapPairPlugin as unknown as GamePlugin,
  cardPileTossPlugin as unknown as GamePlugin,
  cardThrowBetPlugin as unknown as GamePlugin,
  cardLowPickPlugin as unknown as GamePlugin,
  cardHighPickPlugin as unknown as GamePlugin,
  cardMidPickPlugin as unknown as GamePlugin,
  diceToss3Plugin as unknown as GamePlugin,
  diceLowRollPlugin as unknown as GamePlugin,
  diceHighRollPlugin as unknown as GamePlugin,
  diceSpinRollPlugin as unknown as GamePlugin,
  diceClutchRollPlugin as unknown as GamePlugin,
  diceSpikeRollPlugin as unknown as GamePlugin,
  diceLadderRollPlugin as unknown as GamePlugin,
  applePieStackPlugin as unknown as GamePlugin,
  bananaSplitPlugin as unknown as GamePlugin,
  blueberryPopPlugin as unknown as GamePlugin,
  candyCaneGrabPlugin as unknown as GamePlugin,
  cherryTossPlugin as unknown as GamePlugin,
  donutStackArcPlugin as unknown as GamePlugin,
  eclairGrabPlugin as unknown as GamePlugin,
  fruitBasketTossPlugin as unknown as GamePlugin,
  gummyGrabPlugin as unknown as GamePlugin,
  jellyJarTossPlugin as unknown as GamePlugin,
  ancientRomeQuizPlugin as unknown as GamePlugin,
  ancientEgyptQuizPlugin as unknown as GamePlugin,
  ancientGreeceQuizPlugin as unknown as GamePlugin,
  vikingsQuizPlugin as unknown as GamePlugin,
  samuraiQuizPlugin as unknown as GamePlugin,
  knightsQuizPlugin as unknown as GamePlugin,
  pharaohsQuizPlugin as unknown as GamePlugin,
  emperorsQuizPlugin as unknown as GamePlugin,
  civilWarQuizPlugin as unknown as GamePlugin,
  ww1QuizPlugin as unknown as GamePlugin,
  ww2QuizPlugin as unknown as GamePlugin,
  coldWarQuizPlugin as unknown as GamePlugin,
  renaissanceQuizPlugin as unknown as GamePlugin,
  enlightenmentQuizPlugin as unknown as GamePlugin,
  industrialRevolutionQuizPlugin as unknown as GamePlugin,
  cardBid2Plugin as unknown as GamePlugin,
  cardBid4Plugin as unknown as GamePlugin,
  cardStreakFlipPlugin as unknown as GamePlugin,
  cardDeckBetPlugin as unknown as GamePlugin,
  cardPullBetPlugin as unknown as GamePlugin,
  cardPileBet2Plugin as unknown as GamePlugin,
  cardStackBet2Plugin as unknown as GamePlugin,
  cardSnapBetPlugin as unknown as GamePlugin,
  diceFlushBetPlugin as unknown as GamePlugin,
  diceTripBetPlugin as unknown as GamePlugin,
  diceQuadBetPlugin as unknown as GamePlugin,
  diceStreakBetPlugin as unknown as GamePlugin,
  diceQuickRollPlugin as unknown as GamePlugin,
  diceSlowRollPlugin as unknown as GamePlugin,
  dicePopRollPlugin as unknown as GamePlugin,
  kebabStackPlugin as unknown as GamePlugin,
  lasagnaLayerPlugin as unknown as GamePlugin,
  lemonPopPlugin as unknown as GamePlugin,
  lobsterGrabPlugin as unknown as GamePlugin,
  mangoTossPlugin as unknown as GamePlugin,
  marshmallowGrabPlugin as unknown as GamePlugin,
  milkshakeMixPlugin as unknown as GamePlugin,
  muffinPopPlugin as unknown as GamePlugin,
  noodleGrabPlugin as unknown as GamePlugin,
  oliveGrabPlugin as unknown as GamePlugin,
  classicalMusicQuizPlugin as unknown as GamePlugin,
  modernArtQuizPlugin as unknown as GamePlugin,
  jazzQuizPlugin as unknown as GamePlugin,
  rockMusicQuizPlugin as unknown as GamePlugin,
  popMusicQuizPlugin as unknown as GamePlugin,
  hipHopQuizPlugin as unknown as GamePlugin,
  countryMusicQuizPlugin as unknown as GamePlugin,
  electronicMusicQuizPlugin as unknown as GamePlugin,
  folkMusicQuizPlugin as unknown as GamePlugin,
  bluesQuizPlugin as unknown as GamePlugin,
  reggaeQuizPlugin as unknown as GamePlugin,
  gospelMusicQuizPlugin as unknown as GamePlugin,
  operaQuizPlugin as unknown as GamePlugin,
  broadwayQuizPlugin as unknown as GamePlugin,
  balletQuizPlugin as unknown as GamePlugin,
  streetArtQuizPlugin as unknown as GamePlugin,
  sculptureQuizPlugin as unknown as GamePlugin,
  quartetMatchPlugin as unknown as GamePlugin,
  evenEvensPlugin as unknown as GamePlugin,
  oddOddsPlugin as unknown as GamePlugin,
  faceFeastPlugin as unknown as GamePlugin,
  pipPursePlugin as unknown as GamePlugin,
  redRoulettePlugin as unknown as GamePlugin,
  blackBidderPlugin as unknown as GamePlugin,
  suitStackPlugin as unknown as GamePlugin,
  pairPursuitPlugin as unknown as GamePlugin,
  overUnderPlugin as unknown as GamePlugin,
  straightShotPlugin as unknown as GamePlugin,
  doubleDownPlugin as unknown as GamePlugin,
  tripleTossPlugin as unknown as GamePlugin,
  centipedeRollPlugin as unknown as GamePlugin,
  parityPopPlugin as unknown as GamePlugin,
  peachPopPlugin as unknown as GamePlugin,
  pretzelPluckPlugin as unknown as GamePlugin,
  radishRushPlugin as unknown as GamePlugin,
  salamiSlicePlugin as unknown as GamePlugin,
  tangerineTossPlugin as unknown as GamePlugin,
  greekMythQuizPlugin as unknown as GamePlugin,
  norseMythQuizPlugin as unknown as GamePlugin,
  egyptianMythQuizPlugin as unknown as GamePlugin,
  celticMythQuizPlugin as unknown as GamePlugin,
  hinduMythQuizPlugin as unknown as GamePlugin,
  buddhismQuizPlugin as unknown as GamePlugin,
  worldReligionsQuizPlugin as unknown as GamePlugin,
  easternPhilosophyQuizPlugin as unknown as GamePlugin,
  westernPhilosophyQuizPlugin as unknown as GamePlugin,
  ethicsQuizPlugin as unknown as GamePlugin,
  nbaLegendsQuizPlugin as unknown as GamePlugin,
  nflLegendsQuizPlugin as unknown as GamePlugin,
  mlbLegendsQuizPlugin as unknown as GamePlugin,
  soccerStarsQuizPlugin as unknown as GamePlugin,
  tennisGreatsQuizPlugin as unknown as GamePlugin,
  boxingLegendsQuizPlugin as unknown as GamePlugin,
  olympicQuizPlugin as unknown as GamePlugin,
  golfGreatsQuizPlugin as unknown as GamePlugin,
  triadTowerPlugin as unknown as GamePlugin,
  royalRumblePlugin as unknown as GamePlugin,
  aceAlleyPlugin as unknown as GamePlugin,
  sevenStreakPlugin as unknown as GamePlugin,
  pipPyramidPlugin as unknown as GamePlugin,
  redRiverPlugin as unknown as GamePlugin,
  blackBridgePlugin as unknown as GamePlugin,
  luckySixPlugin as unknown as GamePlugin,
  crapsLightPlugin as unknown as GamePlugin,
  yahtzeeMiniPlugin as unknown as GamePlugin,
  diceDuelPlugin as unknown as GamePlugin,
  snakeEyesHuntPlugin as unknown as GamePlugin,
  juiceJamboreePlugin as unknown as GamePlugin,
  cocoaCascadePlugin as unknown as GamePlugin,
  frappeFlipPlugin as unknown as GamePlugin,
  latteLeapPlugin as unknown as GamePlugin,
  mochaMarchPlugin as unknown as GamePlugin,
  astronomyQuizPlugin as unknown as GamePlugin,
  chemistryLabQuizPlugin as unknown as GamePlugin,
  physicsQuizPlugin as unknown as GamePlugin,
  biologyQuizPlugin as unknown as GamePlugin,
  anatomyQuizPlugin as unknown as GamePlugin,
  botanyQuizPlugin as unknown as GamePlugin,
  zoologyQuizPlugin as unknown as GamePlugin,
  marineBioQuizPlugin as unknown as GamePlugin,
  geologyQuizPlugin as unknown as GamePlugin,
  meteorologyQuizPlugin as unknown as GamePlugin,
  computerHistoryQuizPlugin as unknown as GamePlugin,
  programmingLangsQuizPlugin as unknown as GamePlugin,
  internetHistoryQuizPlugin as unknown as GamePlugin,
  gamingHistoryQuizPlugin as unknown as GamePlugin,
  cybersecQuizPlugin as unknown as GamePlugin,
  osQuizPlugin as unknown as GamePlugin,
  aiHistoryQuizPlugin as unknown as GamePlugin,
  siliconValleyQuizPlugin as unknown as GamePlugin,
  straightSearchPlugin as unknown as GamePlugin,
  flushFinderPlugin as unknown as GamePlugin,
  pairPickupPlugin as unknown as GamePlugin,
  kingsCourtPlugin as unknown as GamePlugin,
  queensQuestPlugin as unknown as GamePlugin,
  jacksJamboreePlugin as unknown as GamePlugin,
  tensTallyPlugin as unknown as GamePlugin,
  diceHandPokerPlugin as unknown as GamePlugin,
  farkleMiniPlugin as unknown as GamePlugin,
  pigClassicPlugin as unknown as GamePlugin,
  dice21Plugin as unknown as GamePlugin,
  mexicanDicePlugin as unknown as GamePlugin,
  lollipopLiftPlugin as unknown as GamePlugin,
  gumballGrabPlugin as unknown as GamePlugin,
  taffyTapPlugin as unknown as GamePlugin,
  nougatNetPlugin as unknown as GamePlugin,
  caramelCatchPlugin as unknown as GamePlugin,
  worldCapitalsQuizPlugin as unknown as GamePlugin,
  usStatesQuizPlugin as unknown as GamePlugin,
  europeanCitiesQuizPlugin as unknown as GamePlugin,
  africanGeographyQuizPlugin as unknown as GamePlugin,
  asianGeographyQuizPlugin as unknown as GamePlugin,
  southAmericaQuizPlugin as unknown as GamePlugin,
  oceaniaQuizPlugin as unknown as GamePlugin,
  caribbeanQuizPlugin as unknown as GamePlugin,
  worldFlagsQuizPlugin as unknown as GamePlugin,
  worldRiversQuizPlugin as unknown as GamePlugin,
  shakespeareQuizPlugin as unknown as GamePlugin,
  classicNovelsQuizPlugin as unknown as GamePlugin,
  americanLitQuizPlugin as unknown as GamePlugin,
  britishLitQuizPlugin as unknown as GamePlugin,
  russianLitQuizPlugin as unknown as GamePlugin,
  mysteryNovelsQuizPlugin as unknown as GamePlugin,
  sciFiNovelsQuizPlugin as unknown as GamePlugin,
  fantasyNovelsQuizPlugin as unknown as GamePlugin,
  nineNinePlugin as unknown as GamePlugin,
  eightEatersPlugin as unknown as GamePlugin,
  lowTidePlugin as unknown as GamePlugin,
  highTidePlugin as unknown as GamePlugin,
  colorClashPlugin as unknown as GamePlugin,
  suitShufflePlugin as unknown as GamePlugin,
  rankRumblePlugin as unknown as GamePlugin,
  rollAndWritePlugin as unknown as GamePlugin,
  diceBingoPlugin as unknown as GamePlugin,
  buncoMiniPlugin as unknown as GamePlugin,
  diceKingPlugin as unknown as GamePlugin,
  diceClutchPlugin as unknown as GamePlugin,
  cucumberCatchPlugin as unknown as GamePlugin,
  tomatoTossPlugin as unknown as GamePlugin,
  pepperPopPlugin as unknown as GamePlugin,
  spinachSpinPlugin as unknown as GamePlugin,
  kaleKombatPlugin as unknown as GamePlugin,
  oscarFilmsQuizPlugin as unknown as GamePlugin,
  marvelMcuQuizPlugin as unknown as GamePlugin,
  dcComicsFilmsQuizPlugin as unknown as GamePlugin,
  pixarFilmsQuizPlugin as unknown as GamePlugin,
  disneyClassicsQuizPlugin as unknown as GamePlugin,
  horrorFilmsQuizPlugin as unknown as GamePlugin,
  sciFiFilmsQuizPlugin as unknown as GamePlugin,
  tvSitcomsQuizPlugin as unknown as GamePlugin,
  tvDramasQuizPlugin as unknown as GamePlugin,
  cartoonsQuizPlugin as unknown as GamePlugin,
  beatlesQuizPlugin as unknown as GamePlugin,
  elvisQuizPlugin as unknown as GamePlugin,
  bowieQuizPlugin as unknown as GamePlugin,
  princeQuizPlugin as unknown as GamePlugin,
  madonnaQuizPlugin as unknown as GamePlugin,
  rollingStonesQuizPlugin as unknown as GamePlugin,
  ledZeppelinQuizPlugin as unknown as GamePlugin,
  pinkFloydQuizPlugin as unknown as GamePlugin,
  tripleTroublePlugin as unknown as GamePlugin,
  quartetQuestPlugin as unknown as GamePlugin,
  flushFivePlugin as unknown as GamePlugin,
  lowFivePlugin as unknown as GamePlugin,
  highFiveCardsPlugin as unknown as GamePlugin,
  faceFlipPlugin as unknown as GamePlugin,
  pipPulsePlugin as unknown as GamePlugin,
  tripleThreePlugin as unknown as GamePlugin,
  diceDerbyPlugin as unknown as GamePlugin,
  diceDominoPlugin as unknown as GamePlugin,
  diceSpinPlugin as unknown as GamePlugin,
  superSixPlugin as unknown as GamePlugin,
  teaTimeTapPlugin as unknown as GamePlugin,
  chaiChasePlugin as unknown as GamePlugin,
  coffeeCollectPlugin as unknown as GamePlugin,
  bobaBouncePlugin as unknown as GamePlugin,
  smoothieSwipePlugin as unknown as GamePlugin,
  friendsShowQuizPlugin as unknown as GamePlugin,
  officeShowQuizPlugin as unknown as GamePlugin,
  seinfeldQuizPlugin as unknown as GamePlugin,
  simpsonsQuizPlugin as unknown as GamePlugin,
  familyGuyQuizPlugin as unknown as GamePlugin,
  southParkQuizPlugin as unknown as GamePlugin,
  gotQuizPlugin as unknown as GamePlugin,
  breakingBadQuizPlugin as unknown as GamePlugin,
  strangerThingsQuizPlugin as unknown as GamePlugin,
  lostShowQuizPlugin as unknown as GamePlugin,
  marioQuizPlugin as unknown as GamePlugin,
  zeldaQuizPlugin as unknown as GamePlugin,
  pokemonQuizPlugin as unknown as GamePlugin,
  sonicQuizPlugin as unknown as GamePlugin,
  finalFantasyQuizPlugin as unknown as GamePlugin,
  mortalKombatQuizPlugin as unknown as GamePlugin,
  streetfighterQuizPlugin as unknown as GamePlugin,
  metalGearQuizPlugin as unknown as GamePlugin,
  acesUpMiniPlugin as unknown as GamePlugin,
  fourFoursPlugin as unknown as GamePlugin,
  redRallyPlugin as unknown as GamePlugin,
  blackBashPlugin as unknown as GamePlugin,
  evenEddyPlugin as unknown as GamePlugin,
  oddOlliePlugin as unknown as GamePlugin,
  cardClockPlugin as unknown as GamePlugin,
  diceTargetPlugin as unknown as GamePlugin,
  diceFlushMiniPlugin as unknown as GamePlugin,
  diceStackMiniPlugin as unknown as GamePlugin,
  dicePyramidPlugin as unknown as GamePlugin,
  diceArrowPlugin as unknown as GamePlugin,
  chipsChompPlugin as unknown as GamePlugin,
  popcornPopPlugin as unknown as GamePlugin,
  pretzelPinchPlugin as unknown as GamePlugin,
  nachosNowPlugin as unknown as GamePlugin,
  crackerCrunchPlugin as unknown as GamePlugin,
  narutoQuizPlugin as unknown as GamePlugin,
  dragonballQuizPlugin as unknown as GamePlugin,
  onepieceQuizPlugin as unknown as GamePlugin,
  attackTitanQuizPlugin as unknown as GamePlugin,
  bleachQuizPlugin as unknown as GamePlugin,
  studioGhibliQuizPlugin as unknown as GamePlugin,
  sailorMoonQuizPlugin as unknown as GamePlugin,
  evangelionQuizPlugin as unknown as GamePlugin,
  cowboyBebopQuizPlugin as unknown as GamePlugin,
  myHeroQuizPlugin as unknown as GamePlugin,
  batmanQuizPlugin as unknown as GamePlugin,
  supermanQuizPlugin as unknown as GamePlugin,
  xmenQuizPlugin as unknown as GamePlugin,
  spidermanQuizPlugin as unknown as GamePlugin,
  wonderWomanQuizPlugin as unknown as GamePlugin,
  flashQuizPlugin as unknown as GamePlugin,
  greenLanternQuizPlugin as unknown as GamePlugin,
  comicVillainsQuizPlugin as unknown as GamePlugin,
  lowPairPlugin as unknown as GamePlugin,
  highPairPlugin as unknown as GamePlugin,
  rainbowRunPlugin as unknown as GamePlugin,
  monochromeRunPlugin as unknown as GamePlugin,
  swapStackPlugin as unknown as GamePlugin,
  cutTheDeckPlugin as unknown as GamePlugin,
  mirrorMatchPlugin as unknown as GamePlugin,
  diceFrenzyPlugin as unknown as GamePlugin,
  diceBowlPlugin as unknown as GamePlugin,
  diceSpellPlugin as unknown as GamePlugin,
  diceShippingPlugin as unknown as GamePlugin,
  diceVortexPlugin as unknown as GamePlugin,
  cookieClutchPlugin as unknown as GamePlugin,
  piePopPlugin as unknown as GamePlugin,
  croissantCatchPlugin as unknown as GamePlugin,
  bagelBashPlugin as unknown as GamePlugin,
  donutDashPlugin as unknown as GamePlugin,
  pizzaQuizPlugin as unknown as GamePlugin,
  sushiQuizPlugin as unknown as GamePlugin,
  pastaQuizPlugin as unknown as GamePlugin,
  bbqQuizPlugin as unknown as GamePlugin,
  tacosQuizPlugin as unknown as GamePlugin,
  dimSumQuizPlugin as unknown as GamePlugin,
  curryQuizPlugin as unknown as GamePlugin,
  cheeseQuizPlugin as unknown as GamePlugin,
  breadQuizPlugin as unknown as GamePlugin,
  dessertQuizPlugin as unknown as GamePlugin,
  dogsBreedsQuizPlugin as unknown as GamePlugin,
  catsBreedsQuizPlugin as unknown as GamePlugin,
  birdsWorldQuizPlugin as unknown as GamePlugin,
  reptilesWorldQuizPlugin as unknown as GamePlugin,
  insectsWorldQuizPlugin as unknown as GamePlugin,
  dinosaursQuizPlugin as unknown as GamePlugin,
  horsesQuizPlugin as unknown as GamePlugin,
  endangeredSpeciesQuizPlugin as unknown as GamePlugin,
  pipFivePlugin as unknown as GamePlugin,
  pipTenPlugin as unknown as GamePlugin,
  faceFlushPlugin as unknown as GamePlugin,
  pipFlushPlugin as unknown as GamePlugin,
  dualDealPlugin as unknown as GamePlugin,
  tripleDealPlugin as unknown as GamePlugin,
  quintDealPlugin as unknown as GamePlugin,
  diceRoulettePlugin as unknown as GamePlugin,
  diceBlackjackPlugin as unknown as GamePlugin,
  diceBaccaratPlugin as unknown as GamePlugin,
  diceKenoPlugin as unknown as GamePlugin,
  diceCrapsMiniPlugin as unknown as GamePlugin,
  dumplingDancePlugin as unknown as GamePlugin,
  ramenRushPlugin as unknown as GamePlugin,
  tempuraTapPlugin as unknown as GamePlugin,
  baoBashPlugin as unknown as GamePlugin,
  mochiMashPlugin as unknown as GamePlugin,
  chessHistoryQuizPlugin as unknown as GamePlugin,
  pokerHistoryQuizPlugin as unknown as GamePlugin,
  cardMagicQuizPlugin as unknown as GamePlugin,
  gardeningQuizPlugin as unknown as GamePlugin,
  cookingTechniquesQuizPlugin as unknown as GamePlugin,
  winePairingQuizPlugin as unknown as GamePlugin,
  coffeeBrewingQuizPlugin as unknown as GamePlugin,
  photographyQuizPlugin as unknown as GamePlugin,
  paintingTechniquesQuizPlugin as unknown as GamePlugin,
  potteryQuizPlugin as unknown as GamePlugin,
  parisQuizPlugin as unknown as GamePlugin,
  tokyoQuizPlugin as unknown as GamePlugin,
  nycQuizPlugin as unknown as GamePlugin,
  londonQuizPlugin as unknown as GamePlugin,
  romeQuizPlugin as unknown as GamePlugin,
  dubaiQuizPlugin as unknown as GamePlugin,
  sydneyQuizPlugin as unknown as GamePlugin,
  rioQuizPlugin as unknown as GamePlugin,
  sevenSevensPlugin as unknown as GamePlugin,
  sixShootPlugin as unknown as GamePlugin,
  fiveFingersPlugin as unknown as GamePlugin,
  fourFaceoffPlugin as unknown as GamePlugin,
  twoTwosomePlugin as unknown as GamePlugin,
  threeTriosPlugin as unknown as GamePlugin,
  cardCascadePlugin as unknown as GamePlugin,
  diceBingoLinePlugin as unknown as GamePlugin,
  diceMarathonPlugin as unknown as GamePlugin,
  diceTallyPlugin as unknown as GamePlugin,
  diceCricketPlugin as unknown as GamePlugin,
  diceShootoutPlugin as unknown as GamePlugin,
  flowerPluckPlugin as unknown as GamePlugin,
  weedWhackPlugin as unknown as GamePlugin,
  seedSprinklePlugin as unknown as GamePlugin,
  beeBuzzPlugin as unknown as GamePlugin,
  butterflyNetPlugin as unknown as GamePlugin,
  carBrandsQuizPlugin as unknown as GamePlugin,
  techBrandsQuizPlugin as unknown as GamePlugin,
  fashionBrandsQuizPlugin as unknown as GamePlugin,
  sodaBrandsQuizPlugin as unknown as GamePlugin,
  sneakerBrandsQuizPlugin as unknown as GamePlugin,
  airlineBrandsQuizPlugin as unknown as GamePlugin,
  bankBrandsQuizPlugin as unknown as GamePlugin,
  cerealBrandsQuizPlugin as unknown as GamePlugin,
  fastFoodBrandsQuizPlugin as unknown as GamePlugin,
  cosmeticBrandsQuizPlugin as unknown as GamePlugin,
  usPresidentsQuizPlugin as unknown as GamePlugin,
  britishMonarchsQuizPlugin as unknown as GamePlugin,
  worldDictatorsQuizPlugin as unknown as GamePlugin,
  nobelLaureatesQuizPlugin as unknown as GamePlugin,
  inventorsQuizPlugin as unknown as GamePlugin,
  nasaAstronautsQuizPlugin as unknown as GamePlugin,
  entrepreneursQuizPlugin as unknown as GamePlugin,
  civilRightsQuizPlugin as unknown as GamePlugin,
  redKingPlugin as unknown as GamePlugin,
  blackKingPlugin as unknown as GamePlugin,
  redQueenPlugin as unknown as GamePlugin,
  blackQueenPlugin as unknown as GamePlugin,
  fourColorFlushPlugin as unknown as GamePlugin,
  cardSnakePlugin as unknown as GamePlugin,
  cardLadderPlugin as unknown as GamePlugin,
  diceShootPlugin as unknown as GamePlugin,
  diceMirrorPlugin as unknown as GamePlugin,
  diceStairPlugin as unknown as GamePlugin,
  diceRainbowPlugin as unknown as GamePlugin,
  diceFortunePlugin as unknown as GamePlugin,
  frogFlickPlugin as unknown as GamePlugin,
  antAttackPlugin as unknown as GamePlugin,
  mouseMashPlugin as unknown as GamePlugin,
  bunnyBouncePlugin as unknown as GamePlugin,
  chickChasePlugin as unknown as GamePlugin,
  nineteen20sQuizPlugin as unknown as GamePlugin,
  nineteen30sQuizPlugin as unknown as GamePlugin,
  nineteen40sQuizPlugin as unknown as GamePlugin,
  nineteen50sQuizPlugin as unknown as GamePlugin,
  nineteen60sQuizPlugin as unknown as GamePlugin,
  nineteen70sQuizPlugin as unknown as GamePlugin,
  nineteen80sQuizPlugin as unknown as GamePlugin,
  nineteen90sQuizPlugin as unknown as GamePlugin,
  twoThousandsQuizPlugin as unknown as GamePlugin,
  twentyTensQuizPlugin as unknown as GamePlugin,
  basketballRulesQuizPlugin as unknown as GamePlugin,
  footballRulesQuizPlugin as unknown as GamePlugin,
  baseballRulesQuizPlugin as unknown as GamePlugin,
  hockeyRulesQuizPlugin as unknown as GamePlugin,
  soccerRulesQuizPlugin as unknown as GamePlugin,
  tennisRulesQuizPlugin as unknown as GamePlugin,
  cricketRulesQuizPlugin as unknown as GamePlugin,
  rugbyRulesQuizPlugin as unknown as GamePlugin,
  cardCallPlugin as unknown as GamePlugin,
  cardPilePlugin as unknown as GamePlugin,
  cardPyramidBuildPlugin as unknown as GamePlugin,
  pipPinchPlugin as unknown as GamePlugin,
  cardCollectorPlugin as unknown as GamePlugin,
  faceCollectorPlugin as unknown as GamePlugin,
  rankCollectorPlugin as unknown as GamePlugin,
  dicePickupPlugin as unknown as GamePlugin,
  diceRelayPlugin as unknown as GamePlugin,
  diceStreakPlugin as unknown as GamePlugin,
  diceSpinnerPlugin as unknown as GamePlugin,
  diceStadiumPlugin as unknown as GamePlugin,
  crabCatchPlugin as unknown as GamePlugin,
  octopusTapPlugin as unknown as GamePlugin,
  jellyfishJabPlugin as unknown as GamePlugin,
  sharkSwatPlugin as unknown as GamePlugin,
  whaleWavePlugin as unknown as GamePlugin,
  japanCultureQuizPlugin as unknown as GamePlugin,
  chinaHistoryQuizPlugin as unknown as GamePlugin,
  indiaCultureQuizPlugin as unknown as GamePlugin,
  franceCultureQuizPlugin as unknown as GamePlugin,
  italyCultureQuizPlugin as unknown as GamePlugin,
  spainCultureQuizPlugin as unknown as GamePlugin,
  germanyCultureQuizPlugin as unknown as GamePlugin,
  mexicoCultureQuizPlugin as unknown as GamePlugin,
  brazilCultureQuizPlugin as unknown as GamePlugin,
  australiaCultureQuizPlugin as unknown as GamePlugin,
  mentalMathQuizPlugin as unknown as GamePlugin,
  geometryQuizPlugin as unknown as GamePlugin,
  algebraQuizPlugin as unknown as GamePlugin,
  logicPuzzlesQuizPlugin as unknown as GamePlugin,
  statisticsQuizPlugin as unknown as GamePlugin,
  probabilityQuizPlugin as unknown as GamePlugin,
  numberTheoryQuizPlugin as unknown as GamePlugin,
  puzzleMindQuizPlugin as unknown as GamePlugin,
  miniPokerPlugin as unknown as GamePlugin,
  cardTargetSumPlugin as unknown as GamePlugin,
  miniBlackjackPlugin as unknown as GamePlugin,
  cardClockBuildPlugin as unknown as GamePlugin,
  miniWarPlugin as unknown as GamePlugin,
  miniRummyPlugin as unknown as GamePlugin,
  miniSpitPlugin as unknown as GamePlugin,
  miniYahtzeePlugin as unknown as GamePlugin,
  miniTenziPlugin as unknown as GamePlugin,
  miniMexicanPlugin as unknown as GamePlugin,
  miniShutBoxPlugin as unknown as GamePlugin,
  miniCeeLoPlugin as unknown as GamePlugin,
  acornGrabPlugin as unknown as GamePlugin,
  mushroomMashPlugin as unknown as GamePlugin,
  pineconePopPlugin as unknown as GamePlugin,
  squirrelSpotPlugin as unknown as GamePlugin,
  owlHootPlugin as unknown as GamePlugin,
  christmasQuizPlugin as unknown as GamePlugin,
  halloweenQuizPlugin as unknown as GamePlugin,
  easterQuizPlugin as unknown as GamePlugin,
  thanksgivingQuizPlugin as unknown as GamePlugin,
  valentinesQuizPlugin as unknown as GamePlugin,
  newYearQuizPlugin as unknown as GamePlugin,
  hanukkahQuizPlugin as unknown as GamePlugin,
  diwaliQuizPlugin as unknown as GamePlugin,
  chineseNewYearQuizPlugin as unknown as GamePlugin,
  mardiGrasQuizPlugin as unknown as GamePlugin,
  carsHistoryQuizPlugin as unknown as GamePlugin,
  motorcyclesQuizPlugin as unknown as GamePlugin,
  aircraftQuizPlugin as unknown as GamePlugin,
  shipsQuizPlugin as unknown as GamePlugin,
  trainsQuizPlugin as unknown as GamePlugin,
  spaceVehiclesQuizPlugin as unknown as GamePlugin,
  formula1QuizPlugin as unknown as GamePlugin,
  nASCARQuizPlugin as unknown as GamePlugin,
  cardTossPlugin as unknown as GamePlugin,
  cardStormPlugin as unknown as GamePlugin,
  cardCollectFlushPlugin as unknown as GamePlugin,
  cardPairQuestPlugin as unknown as GamePlugin,
  cardTrioQuestPlugin as unknown as GamePlugin,
  cardQuadQuestPlugin as unknown as GamePlugin,
  cardCouponPlugin as unknown as GamePlugin,
  diceRelayMiniPlugin as unknown as GamePlugin,
  diceCoinFlipPlugin as unknown as GamePlugin,
  diceSnakeLadderPlugin as unknown as GamePlugin,
  diceCheckersPlugin as unknown as GamePlugin,
  diceMonopolyPlugin as unknown as GamePlugin,
  seahorseSpinPlugin as unknown as GamePlugin,
  starfishSnapPlugin as unknown as GamePlugin,
  clamClapPlugin as unknown as GamePlugin,
  lobsterLeapPlugin as unknown as GamePlugin,
  coralClickPlugin as unknown as GamePlugin,
  miniPyramidSolitairePlugin as unknown as GamePlugin,
  miniTripeaksPlugin as unknown as GamePlugin,
  miniSpider1suitPlugin as unknown as GamePlugin,
  miniCanfieldPlugin as unknown as GamePlugin,
  miniYukonPlugin as unknown as GamePlugin,
  miniBakerDozenPlugin as unknown as GamePlugin,
  miniEightOffPlugin as unknown as GamePlugin,
  miniEmperorPlugin as unknown as GamePlugin,
  miniRussianBankPlugin as unknown as GamePlugin,
  miniPokerSquarePlugin as unknown as GamePlugin,
  animalTracksQuizPlugin as unknown as GamePlugin,
  birdSongsQuizPlugin as unknown as GamePlugin,
  wildCatsQuizPlugin as unknown as GamePlugin,
  whalesDolphinsQuizPlugin as unknown as GamePlugin,
  bearSpeciesQuizPlugin as unknown as GamePlugin,
  primatesQuizPlugin as unknown as GamePlugin,
  snakesQuizPlugin as unknown as GamePlugin,
  spidersQuizPlugin as unknown as GamePlugin,
  redPairPickupPlugin as unknown as GamePlugin,
  blackPairPickupPlugin as unknown as GamePlugin,
  cardStairwayPlugin as unknown as GamePlugin,
  cardDownstairsPlugin as unknown as GamePlugin,
  cardEqualityPlugin as unknown as GamePlugin,
  cardMixmatchPlugin as unknown as GamePlugin,
  cardHourglassPlugin as unknown as GamePlugin,
  diceGridPlugin as unknown as GamePlugin,
  diceSpinwheelPlugin as unknown as GamePlugin,
  diceAimPlugin as unknown as GamePlugin,
  diceBowlingPlugin as unknown as GamePlugin,
  diceGridironPlugin as unknown as GamePlugin,
  beeBashPlugin as unknown as GamePlugin,
  waspWhipPlugin as unknown as GamePlugin,
  caterpillarCatchPlugin as unknown as GamePlugin,
  fireflyFlashPlugin as unknown as GamePlugin,
  dragonflyDartPlugin as unknown as GamePlugin,
  numlinksPlugin as unknown as GamePlugin,
  gridmagicPlugin as unknown as GamePlugin,
  additionRacePlugin as unknown as GamePlugin,
  subtractionRacePlugin as unknown as GamePlugin,
  multiplicationRacePlugin as unknown as GamePlugin,
  divisionRacePlugin as unknown as GamePlugin,
  findPrimePlugin as unknown as GamePlugin,
  findCompositePlugin as unknown as GamePlugin,
  numwordMatchPlugin as unknown as GamePlugin,
  romanNumeralsMiniPlugin as unknown as GamePlugin,
  stateCapitalsMiniPlugin as unknown as GamePlugin,
  countryCapitalsMiniPlugin as unknown as GamePlugin,
  mountainQuizPlugin as unknown as GamePlugin,
  desertQuizPlugin as unknown as GamePlugin,
  lakeQuizPlugin as unknown as GamePlugin,
  islandQuizPlugin as unknown as GamePlugin,
  volcanoQuizPlugin as unknown as GamePlugin,
  nationalParksQuizPlugin as unknown as GamePlugin,
  cardStackStressPlugin as unknown as GamePlugin,
  cardCleanSweepPlugin as unknown as GamePlugin,
  cardTradeUpPlugin as unknown as GamePlugin,
  cardHoldEmPlugin as unknown as GamePlugin,
  cardDiscardDownPlugin as unknown as GamePlugin,
  cardBouncerPlugin as unknown as GamePlugin,
  cardClutchPlugin as unknown as GamePlugin,
  diceFrenzyMiniPlugin as unknown as GamePlugin,
  diceFrenzyTallPlugin as unknown as GamePlugin,
  dicePaddlePlugin as unknown as GamePlugin,
  diceLeapPlugin as unknown as GamePlugin,
  diceBridgePlugin as unknown as GamePlugin,
  fireworkTapPlugin as unknown as GamePlugin,
  pumpkinPopPlugin as unknown as GamePlugin,
  sparklerSnagPlugin as unknown as GamePlugin,
  confettiCatchPlugin as unknown as GamePlugin,
  lanternLiftPlugin as unknown as GamePlugin,
  ticTacToeBlitzPlugin as unknown as GamePlugin,
  connectFourMiniPlugin as unknown as GamePlugin,
  nimGamePlugin as unknown as GamePlugin,
  eightQueensMiniPlugin as unknown as GamePlugin,
  worldCupQuizPlugin as unknown as GamePlugin,
  superBowlQuizPlugin as unknown as GamePlugin,
  ncaaBasketballQuizPlugin as unknown as GamePlugin,
  worldSeriesQuizPlugin as unknown as GamePlugin,
  stanleyCupQuizPlugin as unknown as GamePlugin,
  wimbledonQuizPlugin as unknown as GamePlugin,
  kentuckyDerbyQuizPlugin as unknown as GamePlugin,
  daytona500QuizPlugin as unknown as GamePlugin,
  cardBingoPlugin as unknown as GamePlugin,
  cardTracePlugin as unknown as GamePlugin,
  cardRoulettePlugin as unknown as GamePlugin,
  cardPaddlePlugin as unknown as GamePlugin,
  cardTowerFallPlugin as unknown as GamePlugin,
  cardFishingPlugin as unknown as GamePlugin,
  cardShootoutPlugin as unknown as GamePlugin,
  diceShrinePlugin as unknown as GamePlugin,
  diceStormPlugin as unknown as GamePlugin,
  diceQuestPlugin as unknown as GamePlugin,
  diceBullseyePlugin as unknown as GamePlugin,
  diceTournamentPlugin as unknown as GamePlugin,
  ufoUplinkPlugin as unknown as GamePlugin,
  asteroidAimPlugin as unknown as GamePlugin,
  robotRescuePlugin as unknown as GamePlugin,
  rocketRumblePlugin as unknown as GamePlugin,
  laserLockPlugin as unknown as GamePlugin,
  slidePuzzle3x3Plugin as unknown as GamePlugin,
  lightsOutMiniPlugin as unknown as GamePlugin,
  nonogram3x3Plugin as unknown as GamePlugin,
  magicSquare3Plugin as unknown as GamePlugin,
  crosswordMini3x3Plugin as unknown as GamePlugin,
  thaiCuisineQuiz2Plugin as unknown as GamePlugin,
  vietnameseCuisineQuizPlugin as unknown as GamePlugin,
  koreanCuisineQuiz2Plugin as unknown as GamePlugin,
  chineseRegionalCuisineQuizPlugin as unknown as GamePlugin,
  mexicanCuisineQuiz2Plugin as unknown as GamePlugin,
  peruvianCuisineQuizPlugin as unknown as GamePlugin,
  moroccanCuisineQuizPlugin as unknown as GamePlugin,
  lebaneseCuisineQuizPlugin as unknown as GamePlugin,
  ethiopianCuisineQuizPlugin as unknown as GamePlugin,
  nordicCuisineQuizPlugin as unknown as GamePlugin,
  cardShovelPlugin as unknown as GamePlugin,
  cardSpiralPlugin as unknown as GamePlugin,
  cardDominoPlugin as unknown as GamePlugin,
  cardFlipPlugin as unknown as GamePlugin,
  cardTrioBuildPlugin as unknown as GamePlugin,
  dicePinballPlugin as unknown as GamePlugin,
  diceRocketPlugin as unknown as GamePlugin,
  diceShootMiniPlugin as unknown as GamePlugin,
  diceRollCallPlugin as unknown as GamePlugin,
  diceHotDicePlugin as unknown as GamePlugin,
  puppyTapPlugin as unknown as GamePlugin,
  kittenClickPlugin as unknown as GamePlugin,
  goldfishGrabPlugin as unknown as GamePlugin,
  parrotPopPlugin as unknown as GamePlugin,
  hamsterHopPlugin as unknown as GamePlugin,
  gameOfLifeClassicPlugin as unknown as GamePlugin,
  gameOfLifeConwayPlugin as unknown as GamePlugin,
  careersMiniPlugin as unknown as GamePlugin,
  paydayMiniPlugin as unknown as GamePlugin,
  pursuitMiniPlugin as unknown as GamePlugin,
  mallManiaMiniPlugin as unknown as GamePlugin,
  startupLifeMiniPlugin as unknown as GamePlugin,
  langtonsAntMiniPlugin as unknown as GamePlugin,
  life1dPlugin as unknown as GamePlugin,
  brainOfBrianPlugin as unknown as GamePlugin,
  monopolyMiniPlugin as unknown as GamePlugin,
  riskMiniPlugin as unknown as GamePlugin,
  americanCivilWarQuizPlugin as unknown as GamePlugin,
  revolutionaryWarQuizPlugin as unknown as GamePlugin,
  napoleonicWarsQuizPlugin as unknown as GamePlugin,
  vietnamWarQuizPlugin as unknown as GamePlugin,
  koreanWarQuizPlugin as unknown as GamePlugin,
  pacificWarQuizPlugin as unknown as GamePlugin,
  easternFrontQuizPlugin as unknown as GamePlugin,
  gulfWarQuizPlugin as unknown as GamePlugin,
  crusadesQuizPlugin as unknown as GamePlugin,
  q100YearsWarQuizPlugin as unknown as GamePlugin,
  discoEraQuizPlugin as unknown as GamePlugin,
  grungeEraQuizPlugin as unknown as GamePlugin,
  raveEraQuizPlugin as unknown as GamePlugin,
  mtvEraQuizPlugin as unknown as GamePlugin,
  streamingEraQuizPlugin as unknown as GamePlugin,
  memeEraQuizPlugin as unknown as GamePlugin,
  boyBandsQuizPlugin as unknown as GamePlugin,
  girlGroupsQuizPlugin as unknown as GamePlugin,
  cardMashPlugin as unknown as GamePlugin,
  cardCupPlugin as unknown as GamePlugin,
  cardJamPlugin as unknown as GamePlugin,
  cardSpikePlugin as unknown as GamePlugin,
  cardYankPlugin as unknown as GamePlugin,
  cardZipPlugin as unknown as GamePlugin,
  cardFanPlugin as unknown as GamePlugin,
  diceClutterPlugin as unknown as GamePlugin,
  diceTrailPlugin as unknown as GamePlugin,
  diceBakePlugin as unknown as GamePlugin,
  diceBlockadePlugin as unknown as GamePlugin,
  diceMysticPlugin as unknown as GamePlugin,
  roboSnapPlugin as unknown as GamePlugin,
  mechMashPlugin as unknown as GamePlugin,
  cogClickPlugin as unknown as GamePlugin,
  gearGrabPlugin as unknown as GamePlugin,
  circuitCapPlugin as unknown as GamePlugin,
  medievalLifeQuizPlugin as unknown as GamePlugin,
  feudalJapanQuizPlugin as unknown as GamePlugin,
  ottomanEmpireQuizPlugin as unknown as GamePlugin,
  byzantineQuizPlugin as unknown as GamePlugin,
  mongolEmpireQuizPlugin as unknown as GamePlugin,
  mayanQuizPlugin as unknown as GamePlugin,
  incanQuizPlugin as unknown as GamePlugin,
  aztecQuizPlugin as unknown as GamePlugin,
  vikingQuizPlugin as unknown as GamePlugin,
  prehistoricQuizPlugin as unknown as GamePlugin,
  medicalDiscoveriesQuizPlugin as unknown as GamePlugin,
  physicsDiscoveriesQuizPlugin as unknown as GamePlugin,
  spaceDiscoveriesQuizPlugin as unknown as GamePlugin,
  inventorsToolsQuizPlugin as unknown as GamePlugin,
  transportInventionsQuizPlugin as unknown as GamePlugin,
  communicationInventionsQuizPlugin as unknown as GamePlugin,
  foodInventionsQuizPlugin as unknown as GamePlugin,
  weaponInventionsQuizPlugin as unknown as GamePlugin,
  cardCliffPlugin as unknown as GamePlugin,
  cardJunglePlugin as unknown as GamePlugin,
  cardOceanPlugin as unknown as GamePlugin,
  cardVolcanoPlugin as unknown as GamePlugin,
  cardGlacierPlugin as unknown as GamePlugin,
  cardTemplePlugin as unknown as GamePlugin,
  cardSavannaPlugin as unknown as GamePlugin,
  diceQuestMiniPlugin as unknown as GamePlugin,
  dicePortalPlugin as unknown as GamePlugin,
  diceTreasurePlugin as unknown as GamePlugin,
  diceMountainPlugin as unknown as GamePlugin,
  diceCavePlugin as unknown as GamePlugin,
  golfBallTapPlugin as unknown as GamePlugin,
  tennisBallTapPlugin as unknown as GamePlugin,
  baseballTapPlugin as unknown as GamePlugin,
  soccerBallTapPlugin as unknown as GamePlugin,
  bowlingPinTapPlugin as unknown as GamePlugin,
  eurovisionQuizPlugin as unknown as GamePlugin,
  grammyAwardsQuizPlugin as unknown as GamePlugin,
  billboardHitsQuizPlugin as unknown as GamePlugin,
  mtvMusicAwardsQuizPlugin as unknown as GamePlugin,
  americanIdolQuizPlugin as unknown as GamePlugin,
  voiceShowQuizPlugin as unknown as GamePlugin,
  xfactorQuizPlugin as unknown as GamePlugin,
  karaokeClassicsQuizPlugin as unknown as GamePlugin,
  oneHitWondersQuizPlugin as unknown as GamePlugin,
  summerHitsQuizPlugin as unknown as GamePlugin,
  appleHistoryQuizPlugin as unknown as GamePlugin,
  microsoftHistoryQuizPlugin as unknown as GamePlugin,
  googleHistoryQuizPlugin as unknown as GamePlugin,
  facebookHistoryQuizPlugin as unknown as GamePlugin,
  amazonHistoryQuizPlugin as unknown as GamePlugin,
  netflixHistoryQuizPlugin as unknown as GamePlugin,
  teslaHistoryQuizPlugin as unknown as GamePlugin,
  spacexHistoryQuizPlugin as unknown as GamePlugin,
  cardTornadoPlugin as unknown as GamePlugin,
  cardFloodPlugin as unknown as GamePlugin,
  cardMeteorPlugin as unknown as GamePlugin,
  cardEclipsePlugin as unknown as GamePlugin,
  cardAuroraPlugin as unknown as GamePlugin,
  cardMiragePlugin as unknown as GamePlugin,
  cardLighthousePlugin as unknown as GamePlugin,
  diceTemplePlugin as unknown as GamePlugin,
  diceCastlePlugin as unknown as GamePlugin,
  diceTowerMiniPlugin as unknown as GamePlugin,
  diceGalaxyPlugin as unknown as GamePlugin,
  diceTyphoonPlugin as unknown as GamePlugin,
  coconutCrackPlugin as unknown as GamePlugin,
  mangoTapPlugin as unknown as GamePlugin,
  pineapplePopPlugin as unknown as GamePlugin,
  palmFrondPlugin as unknown as GamePlugin,
  surfSpikePlugin as unknown as GamePlugin,
  snlQuizPlugin as unknown as GamePlugin,
  montyPythonQuizPlugin as unknown as GamePlugin,
  melBrooksQuizPlugin as unknown as GamePlugin,
  mrBeanQuizPlugin as unknown as GamePlugin,
  jimCarreyQuizPlugin as unknown as GamePlugin,
  adamSandlerQuizPlugin as unknown as GamePlugin,
  willFerrellQuizPlugin as unknown as GamePlugin,
  comedyCentralQuizPlugin as unknown as GamePlugin,
  britishComedyQuizPlugin as unknown as GamePlugin,
  standUpComedyQuizPlugin as unknown as GamePlugin,
  kubrickQuizPlugin as unknown as GamePlugin,
  tarantinoQuizPlugin as unknown as GamePlugin,
  nolanQuizPlugin as unknown as GamePlugin,
  scorseseQuizPlugin as unknown as GamePlugin,
  coppolaQuizPlugin as unknown as GamePlugin,
  spielbergQuizPlugin as unknown as GamePlugin,
  hitchcockQuizPlugin as unknown as GamePlugin,
  kurosawaQuizPlugin as unknown as GamePlugin,
  cardMountainPlugin as unknown as GamePlugin,
  cardRiverPlugin as unknown as GamePlugin,
  cardIslandPlugin as unknown as GamePlugin,
  cardStormMiniPlugin as unknown as GamePlugin,
  cardCanyonPlugin as unknown as GamePlugin,
  cardBridgeBuildPlugin as unknown as GamePlugin,
  cardCastleBuildPlugin as unknown as GamePlugin,
  diceBazaarPlugin as unknown as GamePlugin,
  diceMuseumPlugin as unknown as GamePlugin,
  diceCourtroomPlugin as unknown as GamePlugin,
  diceLaboratoryPlugin as unknown as GamePlugin,
  diceArenaPlugin as unknown as GamePlugin,
  starSnapPlugin as unknown as GamePlugin,
  cometCatchPlugin as unknown as GamePlugin,
  nebulaNudgePlugin as unknown as GamePlugin,
  planetPopPlugin as unknown as GamePlugin,
  meteorBashPlugin as unknown as GamePlugin,
  musicTheoryQuizPlugin as unknown as GamePlugin,
  musicNotationQuizPlugin as unknown as GamePlugin,
  musicalInstrumentsQuizPlugin as unknown as GamePlugin,
  keysAndModesQuizPlugin as unknown as GamePlugin,
  chordProgressionsQuizPlugin as unknown as GamePlugin,
  composersClassicalQuizPlugin as unknown as GamePlugin,
  composersRomanticQuizPlugin as unknown as GamePlugin,
  composersModernQuizPlugin as unknown as GamePlugin,
  recordingTechQuizPlugin as unknown as GamePlugin,
  synthesizersQuizPlugin as unknown as GamePlugin,
  salemTrialsQuizPlugin as unknown as GamePlugin,
  nurembergTrialsQuizPlugin as unknown as GamePlugin,
  ojTrialQuizPlugin as unknown as GamePlugin,
  assassinationsQuizPlugin as unknown as GamePlugin,
  unsolvedMysteriesQuizPlugin as unknown as GamePlugin,
  mafiaQuizPlugin as unknown as GamePlugin,
  piratesQuizPlugin as unknown as GamePlugin,
  outlawsQuizPlugin as unknown as GamePlugin,
  cardCliffJumpPlugin as unknown as GamePlugin,
  cardLeapFrogPlugin as unknown as GamePlugin,
  cardPuzzlePlugin as unknown as GamePlugin,
  cardSnakeLinePlugin as unknown as GamePlugin,
  cardSweepPlugin as unknown as GamePlugin,
  cardCastleDefensePlugin as unknown as GamePlugin,
  cardTreasureHuntPlugin as unknown as GamePlugin,
  diceVillagePlugin as unknown as GamePlugin,
  diceTradeRoutePlugin as unknown as GamePlugin,
  diceHarvestPlugin as unknown as GamePlugin,
  diceRailroadPlugin as unknown as GamePlugin,
  dicePiratePlugin as unknown as GamePlugin,
  brickBashPlugin as unknown as GamePlugin,
  nailTapPlugin as unknown as GamePlugin,
  woodWhackPlugin as unknown as GamePlugin,
  concreteCrunchPlugin as unknown as GamePlugin,
  craneClickPlugin as unknown as GamePlugin,
  titanicQuizPlugin as unknown as GamePlugin,
  hindenburgQuizPlugin as unknown as GamePlugin,
  chernobylQuizPlugin as unknown as GamePlugin,
  pompeiiQuizPlugin as unknown as GamePlugin,
  sanFranciscoQuakeQuizPlugin as unknown as GamePlugin,
  mtStHelensQuizPlugin as unknown as GamePlugin,
  katrinaQuizPlugin as unknown as GamePlugin,
  bhopalQuizPlugin as unknown as GamePlugin,
  fukushimaQuizPlugin as unknown as GamePlugin,
  apollo1QuizPlugin as unknown as GamePlugin,
  everestQuizPlugin as unknown as GamePlugin,
  sevenSummitsQuizPlugin as unknown as GamePlugin,
  polarQuizPlugin as unknown as GamePlugin,
  desertTrekQuizPlugin as unknown as GamePlugin,
  caveExploreQuizPlugin as unknown as GamePlugin,
  deepSeaQuizPlugin as unknown as GamePlugin,
  extremeSportsQuizPlugin as unknown as GamePlugin,
  survivalQuizPlugin as unknown as GamePlugin,
  cardTunnelPlugin as unknown as GamePlugin,
  cardBridgeCrossPlugin as unknown as GamePlugin,
  cardTowerStackPlugin as unknown as GamePlugin,
  cardFountainPlugin as unknown as GamePlugin,
  cardStatuePlugin as unknown as GamePlugin,
  cardTrainTrackPlugin as unknown as GamePlugin,
  cardLanternLightPlugin as unknown as GamePlugin,
  diceBlacksmithPlugin as unknown as GamePlugin,
  diceBakeryPlugin as unknown as GamePlugin,
  diceFarmPlugin as unknown as GamePlugin,
  diceFisheryPlugin as unknown as GamePlugin,
  diceMinePlugin as unknown as GamePlugin,
  hammerTapPlugin as unknown as GamePlugin,
  screwGrabPlugin as unknown as GamePlugin,
  wrenchWhackPlugin as unknown as GamePlugin,
  sawSnapPlugin as unknown as GamePlugin,
  paintPopPlugin as unknown as GamePlugin,
  summerOlympicsQuizPlugin as unknown as GamePlugin,
  winterOlympicsQuizPlugin as unknown as GamePlugin,
  paralympicsQuizPlugin as unknown as GamePlugin,
  trackFieldQuizPlugin as unknown as GamePlugin,
  swimmingEventsQuizPlugin as unknown as GamePlugin,
  gymnasticsQuizPlugin as unknown as GamePlugin,
  figureSkatingQuizPlugin as unknown as GamePlugin,
  bobsledQuizPlugin as unknown as GamePlugin,
  boxingRulesQuizPlugin as unknown as GamePlugin,
  wrestlingRulesQuizPlugin as unknown as GamePlugin,
  eiffelTowerQuizPlugin as unknown as GamePlugin,
  pyramidsQuizPlugin as unknown as GamePlugin,
  greatWallQuizPlugin as unknown as GamePlugin,
  colosseumQuizPlugin as unknown as GamePlugin,
  tajMahalQuizPlugin as unknown as GamePlugin,
  parthenonQuizPlugin as unknown as GamePlugin,
  statueLibertyQuizPlugin as unknown as GamePlugin,
  christRedeemerQuizPlugin as unknown as GamePlugin,
  cardFlagPolePlugin as unknown as GamePlugin,
  cardMountainClimbPlugin as unknown as GamePlugin,
  cardStadiumPlugin as unknown as GamePlugin,
  cardArenaMiniPlugin as unknown as GamePlugin,
  cardParkPlugin as unknown as GamePlugin,
  cardZooPlugin as unknown as GamePlugin,
  cardMuseumPlugin as unknown as GamePlugin,
  diceCookingPlugin as unknown as GamePlugin,
  dicePaintingPlugin as unknown as GamePlugin,
  diceMusicMiniPlugin as unknown as GamePlugin,
  dicePhotographyPlugin as unknown as GamePlugin,
  diceArcheologyPlugin as unknown as GamePlugin,
  carChasePlugin as unknown as GamePlugin,
  bikeBashPlugin as unknown as GamePlugin,
  truckTapPlugin as unknown as GamePlugin,
  busBashPlugin as unknown as GamePlugin,
  trainTapPlugin as unknown as GamePlugin,
  vintageCarsQuizPlugin as unknown as GamePlugin,
  muscleCarsQuizPlugin as unknown as GamePlugin,
  supercarsQuizPlugin as unknown as GamePlugin,
  trucksHistoryQuizPlugin as unknown as GamePlugin,
  schoolBusesQuizPlugin as unknown as GamePlugin,
  subwaysQuizPlugin as unknown as GamePlugin,
  bulletTrainsQuizPlugin as unknown as GamePlugin,
  helicoptersQuizPlugin as unknown as GamePlugin,
  submarinesQuizPlugin as unknown as GamePlugin,
  cruiseShipsQuizPlugin as unknown as GamePlugin,
  dogCareQuizPlugin as unknown as GamePlugin,
  catCareQuizPlugin as unknown as GamePlugin,
  aquariumQuizPlugin as unknown as GamePlugin,
  birdCareQuizPlugin as unknown as GamePlugin,
  reptileCareQuizPlugin as unknown as GamePlugin,
  horseCareQuizPlugin as unknown as GamePlugin,
  farmAnimalQuizPlugin as unknown as GamePlugin,
  wildlifeQuizPlugin as unknown as GamePlugin,
  cardGroceryPlugin as unknown as GamePlugin,
  cardPharmacyPlugin as unknown as GamePlugin,
  cardRestaurantPlugin as unknown as GamePlugin,
  cardCoffeePlugin as unknown as GamePlugin,
  cardBakeryPlugin as unknown as GamePlugin,
  cardFlowerShopPlugin as unknown as GamePlugin,
  cardBookshopPlugin as unknown as GamePlugin,
  diceTrapezePlugin as unknown as GamePlugin,
  diceCircusPlugin as unknown as GamePlugin,
  diceMagicPlugin as unknown as GamePlugin,
  diceOrchestraPlugin as unknown as GamePlugin,
  diceBallroomPlugin as unknown as GamePlugin,
  pencilPopPlugin as unknown as GamePlugin,
  eraserTapPlugin as unknown as GamePlugin,
  staplerSnapPlugin as unknown as GamePlugin,
  paperclipPinchPlugin as unknown as GamePlugin,
  rulerRumblePlugin as unknown as GamePlugin,
  greatTrainRobberyQuizPlugin as unknown as GamePlugin,
  coldWarSpiesQuizPlugin as unknown as GamePlugin,
  ciaQuizPlugin as unknown as GamePlugin,
  kgbQuizPlugin as unknown as GamePlugin,
  mi6QuizPlugin as unknown as GamePlugin,
  bonnieClydeQuizPlugin as unknown as GamePlugin,
  dillingerQuizPlugin as unknown as GamePlugin,
  alCaponeQuizPlugin as unknown as GamePlugin,
  artHeistsQuizPlugin as unknown as GamePlugin,
  bankHeistsQuizPlugin as unknown as GamePlugin,
  nobelPeaceQuizPlugin as unknown as GamePlugin,
  academyAwardsQuizPlugin as unknown as GamePlugin,
  tonyAwardsQuizPlugin as unknown as GamePlugin,
  emmyAwardsQuizPlugin as unknown as GamePlugin,
  cannesQuizPlugin as unknown as GamePlugin,
  pulitzerQuizPlugin as unknown as GamePlugin,
  manBookerQuizPlugin as unknown as GamePlugin,
  palmeDorQuizPlugin as unknown as GamePlugin,
  cardStadiumFansPlugin as unknown as GamePlugin,
  cardPetShopPlugin as unknown as GamePlugin,
  cardToyStorePlugin as unknown as GamePlugin,
  cardCandyShopPlugin as unknown as GamePlugin,
  cardMusicShopPlugin as unknown as GamePlugin,
  cardPharmacyMiniPlugin as unknown as GamePlugin,
  cardShoeStorePlugin as unknown as GamePlugin,
  cardElectronicsPlugin as unknown as GamePlugin,
  cardJewelryPlugin as unknown as GamePlugin,
  cardFlowerPickupPlugin as unknown as GamePlugin,
  diceSpaceshipPlugin as unknown as GamePlugin,
  diceTreasureMapPlugin as unknown as GamePlugin,
  diceIslandHopPlugin as unknown as GamePlugin,
  diceMonsterMashPlugin as unknown as GamePlugin,
  diceKnightQuestPlugin as unknown as GamePlugin,
  diceWizardSpellPlugin as unknown as GamePlugin,
  diceDragonFightPlugin as unknown as GamePlugin,
  diceCastleSiegePlugin as unknown as GamePlugin,
  balloonPopMiniPlugin as unknown as GamePlugin,
  bubbleBurstMiniPlugin as unknown as GamePlugin,
  confettiShowerPlugin as unknown as GamePlugin,
  streamerTossPlugin as unknown as GamePlugin,
  giftGrabPlugin as unknown as GamePlugin,
  cakeClutchPlugin as unknown as GamePlugin,
  candleCapPlugin as unknown as GamePlugin,
  maskMashPlugin as unknown as GamePlugin,
  holdemNoLimitPlugin as unknown as GamePlugin,
  holdemPotLimitPlugin as unknown as GamePlugin,
  holdemFixedLimitPlugin as unknown as GamePlugin,
  holdemSpreadLimitPlugin as unknown as GamePlugin,
  omahaHiPlugin as unknown as GamePlugin,
  omahaHiLoPlugin as unknown as GamePlugin,
  omahaFiveCardHiPlugin as unknown as GamePlugin,
  omahaFiveCardHiLoPlugin as unknown as GamePlugin,
  courchevelPokerPlugin as unknown as GamePlugin,
  courchevelHiLoPlugin as unknown as GamePlugin,
  sevenStudHiLoPlugin as unknown as GamePlugin,
  fiveStudPokerPlugin as unknown as GamePlugin,
  twoSevenTripleDrawPlugin as unknown as GamePlugin,
  twoSevenSingleDrawPlugin as unknown as GamePlugin,
  aceFiveTripleDrawPlugin as unknown as GamePlugin,
  badeucyPokerPlugin as unknown as GamePlugin,
  badaceyPokerPlugin as unknown as GamePlugin,
  pineapplePokerPlugin as unknown as GamePlugin,
  crazyPineapplePlugin as unknown as GamePlugin,
  lazyPineapplePlugin as unknown as GamePlugin,
  superHoldemPlugin as unknown as GamePlugin,
  doubleFlopHoldemPlugin as unknown as GamePlugin,
  doubleBoardBombPotPlugin as unknown as GamePlugin,
  svitenSpecialPlugin as unknown as GamePlugin,
  horseMixPlugin as unknown as GamePlugin,
  hoseMixPlugin as unknown as GamePlugin,
  eightGameMixPlugin as unknown as GamePlugin,
  tenGameMixPlugin as unknown as GamePlugin,
  dealersChoicePokerPlugin as unknown as GamePlugin,
  headsUpSngPlugin as unknown as GamePlugin,
  shortDeckHoldemPlugin as unknown as GamePlugin,
  openFaceChinesePlugin as unknown as GamePlugin,
  pineappleOfcPlugin as unknown as GamePlugin,
  fantasylandOfcPlugin as unknown as GamePlugin,
  closedChinesePokerPlugin as unknown as GamePlugin,
  mahjongSpiderLayoutPlugin as unknown as GamePlugin,
  mahjongWheelLayoutPlugin as unknown as GamePlugin,
  mahjongTheatreLayoutPlugin as unknown as GamePlugin,
  mahjongButterflyLayoutPlugin as unknown as GamePlugin,
  mahjongLadybugLayoutPlugin as unknown as GamePlugin,
  mahjongArenaLayoutPlugin as unknown as GamePlugin,
  mahjongFourWindsPlugin as unknown as GamePlugin,
  mahjongCathedralPlugin as unknown as GamePlugin,
  mahjongBridgePlugin as unknown as GamePlugin,
  mahjongCrabPlugin as unknown as GamePlugin,
  mahjongImperialPlugin as unknown as GamePlugin,
  mahjongFortressPlugin as unknown as GamePlugin,
  mahjongPagodaPlugin as unknown as GamePlugin,
  mahjongFishPlugin as unknown as GamePlugin,
  mahjongCherryBlossomPlugin as unknown as GamePlugin,
  mahjongSnakePlugin as unknown as GamePlugin,
  mahjongRabbitPlugin as unknown as GamePlugin,
  mahjongChristmasTreePlugin as unknown as GamePlugin,
  mahjongHeartPlugin as unknown as GamePlugin,
  mahjongScorpionLayoutPlugin as unknown as GamePlugin,
  mahjongMeteorPlugin as unknown as GamePlugin,
  mahjongAncientPlugin as unknown as GamePlugin,
  mahjongDynastyPlugin as unknown as GamePlugin,
  mahjongSeasonsCyclePlugin as unknown as GamePlugin,
  mahjongTimeAttackPlugin as unknown as GamePlugin,
  mahjongChallengeModePlugin as unknown as GamePlugin,
  mahjongConnectPlugin as unknown as GamePlugin,
  onetConnectClassicPlugin as unknown as GamePlugin,
  shisenShoGravityPlugin as unknown as GamePlugin,
  shisenShoExtendedPlugin as unknown as GamePlugin,
  shanghaiMahjongPlugin as unknown as GamePlugin,
  shanghaiDynastyPlugin as unknown as GamePlugin,
  mahjongTrailsPlugin as unknown as GamePlugin,
  mahjongQuestPlugin as unknown as GamePlugin,
  butterflyPuzzleTilesPlugin as unknown as GamePlugin,
  mahjongTurtle3dLayoutPlugin as unknown as GamePlugin,
  mahjongIshidoLayoutPlugin as unknown as GamePlugin,
  mahjongShanghaiDynastyLayoutPlugin as unknown as GamePlugin,
  mahjongDimensionsLayoutPlugin as unknown as GamePlugin,
  mahjongEpicLayoutPlugin as unknown as GamePlugin,
  mahjongEastRoundLayoutPlugin as unknown as GamePlugin,
  mahjongSouthRoundLayoutPlugin as unknown as GamePlugin,
  mahjongFullGameLayoutPlugin as unknown as GamePlugin,
  mahjongTenhouLayoutPlugin as unknown as GamePlugin,
  mahjongSoulLayoutPlugin as unknown as GamePlugin,
  mahjongQuadLayoutPlugin as unknown as GamePlugin,
  mahjongTsumogiriLayoutPlugin as unknown as GamePlugin,
  mahjongSichuanLayoutPlugin as unknown as GamePlugin,
  mahjongGuangdongLayoutPlugin as unknown as GamePlugin,
  mahjongShanghaineseLayoutPlugin as unknown as GamePlugin,
  mahjongOnlineFfaLayoutPlugin as unknown as GamePlugin,
  mahjongVietnameseLayoutPlugin as unknown as GamePlugin,
  mahjongKoreanHwatooLayoutPlugin as unknown as GamePlugin,
  mahjongEuropeanClassicalLayoutPlugin as unknown as GamePlugin,
  mahjongRiichiMinefieldLayoutPlugin as unknown as GamePlugin,
  mahjongSanmaLayoutPlugin as unknown as GamePlugin,
  mahjongAmericanNmjlLayoutPlugin as unknown as GamePlugin,
  mahjongHongKongLayoutPlugin as unknown as GamePlugin,
  mahjongStandardChineseLayoutPlugin as unknown as GamePlugin,
  mahjongRiichiJapaneseLayoutPlugin as unknown as GamePlugin,
  mahjongTaiwaneseLayoutPlugin as unknown as GamePlugin,
  mahjongSingaporeanLayoutPlugin as unknown as GamePlugin,
  mahjongHonorTilesLayoutPlugin as unknown as GamePlugin,
  mahjongJokersFlowersLayoutPlugin as unknown as GamePlugin,
  mahjongTileTowerLayoutPlugin as unknown as GamePlugin,
  mahjongFlowerBonusLayoutPlugin as unknown as GamePlugin,
  mahjongDoublePyramidLayoutPlugin as unknown as GamePlugin,
  mahjongCrossLayoutPlugin as unknown as GamePlugin,
  mahjongDiamondLayoutPlugin as unknown as GamePlugin,
  mahjongRectangleLayoutPlugin as unknown as GamePlugin,
  bughousePlugin as unknown as GamePlugin,
  losingChessPlugin as unknown as GamePlugin,
  threeCheckChessPlugin as unknown as GamePlugin,
  fogOfWarChessPlugin as unknown as GamePlugin,
  fourPlayerChessTeamsPlugin as unknown as GamePlugin,
  fourPlayerChessFfaPlugin as unknown as GamePlugin,
  threePlayerChessPlugin as unknown as GamePlugin,
  fischerCrazyhousePlugin as unknown as GamePlugin,
  hexChessMccooeyPlugin as unknown as GamePlugin,
  hexChessGlinskiPlugin as unknown as GamePlugin,
  hexChessShafranPlugin as unknown as GamePlugin,
  circularChessPlugin as unknown as GamePlugin,
  aliceChessPlugin as unknown as GamePlugin,
  knightmateChessPlugin as unknown as GamePlugin,
  losAlamosChessPlugin as unknown as GamePlugin,
  microchessPlugin as unknown as GamePlugin,
  minichess5x5Plugin as unknown as GamePlugin,
  cylinderChessPlugin as unknown as GamePlugin,
  toroidalChessPlugin as unknown as GamePlugin,
  darkChessPlugin as unknown as GamePlugin,
  scottishProgressivePlugin as unknown as GamePlugin,
  rifleChessPlugin as unknown as GamePlugin,
  leganChessPlugin as unknown as GamePlugin,
  preChessPlugin as unknown as GamePlugin,
  marseillaisChessPlugin as unknown as GamePlugin,
  transcendentalChessPlugin as unknown as GamePlugin,
  pocketKnightChessPlugin as unknown as GamePlugin,
  spartanChessPlugin as unknown as GamePlugin,
  almostChessPlugin as unknown as GamePlugin,
  embassyChessPlugin as unknown as GamePlugin,
  grandChessPlugin as unknown as GamePlugin,
  capablancaChessPlugin as unknown as GamePlugin,
  gothicChessPlugin as unknown as GamePlugin,
  omegaChessPlugin as unknown as GamePlugin,
  seirawanChessPlugin as unknown as GamePlugin,
  dianaChessPlugin as unknown as GamePlugin,
  randomChessPlugin as unknown as GamePlugin,
  maharajahSepoysPlugin as unknown as GamePlugin,
  peasantsRevoltPlugin as unknown as GamePlugin,
  asymmetricChessPlugin as unknown as GamePlugin,
  betzaArmiesPlugin as unknown as GamePlugin,
  courierChessPlugin as unknown as GamePlugin,
  chaturangaPlugin as unknown as GamePlugin,
  microShogiPlugin as unknown as GamePlugin,
  daiShogiPlugin as unknown as GamePlugin,
  toriShogiPlugin as unknown as GamePlugin,
  annanShogiPlugin as unknown as GamePlugin,
  waShogiPlugin as unknown as GamePlugin,
  heianShogiPlugin as unknown as GamePlugin,
  xiangqiBlindPlugin as unknown as GamePlugin,
  canadianCheckersPlugin as unknown as GamePlugin,
  giveawayCheckersPlugin as unknown as GamePlugin,
  gothicCheckersPlugin as unknown as GamePlugin,
  vertexCheckersPlugin as unknown as GamePlugin,
  reversiTimedPlugin as unknown as GamePlugin,
  antiOthelloPlugin as unknown as GamePlugin,
  reversiRandomStartPlugin as unknown as GamePlugin,
  camelotPlugin as unknown as GamePlugin,
  chineseCheckers2pPlugin as unknown as GamePlugin,
  saltaPlugin as unknown as GamePlugin,
  go19x19Plugin as unknown as GamePlugin,
  go13x13Plugin as unknown as GamePlugin,
  toroidalGoPlugin as unknown as GamePlugin,
  phantomGoPlugin as unknown as GamePlugin,
  pairGoPlugin as unknown as GamePlugin,
  rengoPlugin as unknown as GamePlugin,
  oneColorGoPlugin as unknown as GamePlugin,
  keryoPentePlugin as unknown as GamePlugin,
  twixtPlugin as unknown as GamePlugin,
  hexGamePlugin as unknown as GamePlugin,
  klondikeDealOnePlugin as unknown as GamePlugin,
  agnesSorelPlugin as unknown as GamePlugin,
  athenaPlugin as unknown as GamePlugin,
  blindHookeyPlugin as unknown as GamePlugin,
  westhavenPlugin as unknown as GamePlugin,
  demonPatiencePlugin as unknown as GamePlugin,
  doubleKlondikePlugin as unknown as GamePlugin,
  tripleKlondikePlugin as unknown as GamePlugin,
  freecellClassicPlugin as unknown as GamePlugin,
  seahavenTowersPlugin as unknown as GamePlugin,
  stalactitesPlugin as unknown as GamePlugin,
  goodMeasurePlugin as unknown as GamePlugin,
  spanishPatiencePlugin as unknown as GamePlugin,
  spiderOneSuitPlugin as unknown as GamePlugin,
  spiderTwoSuitsPlugin as unknown as GamePlugin,
  waspPlugin as unknown as GamePlugin,
  spidikePlugin as unknown as GamePlugin,
  blackWidowPlugin as unknown as GamePlugin,
  willOWispPlugin as unknown as GamePlugin,
  tutTombPlugin as unknown as GamePlugin,
  gizaPyramidPlugin as unknown as GamePlugin,
  apophisPlugin as unknown as GamePlugin,
  triPeaksContinuousPlugin as unknown as GamePlugin,
  golfParPlugin as unknown as GamePlugin,
  allInARowPlugin as unknown as GamePlugin,
  clockPatiencePlugin as unknown as GamePlugin,
  montanaGapsPlugin as unknown as GamePlugin,
  canfieldChameleonPlugin as unknown as GamePlugin,
  storehouseCanfieldPlugin as unknown as GamePlugin,
  sirTommyPlugin as unknown as GamePlugin,
  fortressPlugin as unknown as GamePlugin,
  bouquetPlugin as unknown as GamePlugin,
  accordionSolitairePlugin as unknown as GamePlugin,
  alaskaSolitairePlugin as unknown as GamePlugin,
  stonewallPlugin as unknown as GamePlugin,
  nackgammonPlugin as unknown as GamePlugin,
  hypergammonPlugin as unknown as GamePlugin,
  longGammonPlugin as unknown as GamePlugin,
  chouettePlugin as unknown as GamePlugin,
  portesPlugin as unknown as GamePlugin,
  plakotoPlugin as unknown as GamePlugin,
  fevgaPlugin as unknown as GamePlugin,
  aceyDeuceyPlugin as unknown as GamePlugin,
  blastPointBackgammonPlugin as unknown as GamePlugin,
  mahbusaPlugin as unknown as GamePlugin,
  gulBaraPlugin as unknown as GamePlugin,
  gioulPlugin as unknown as GamePlugin,
  longNardiPlugin as unknown as GamePlugin,
  duelingDiceBackgammonPlugin as unknown as GamePlugin,
  jacobyRulePlugin as unknown as GamePlugin,
  crawfordRulePlugin as unknown as GamePlugin,
  menschArgerePlugin as unknown as GamePlugin,
  aggravationPlugin as unknown as GamePlugin,
  frustrationPopPlugin as unknown as GamePlugin,
  fiaScandiPlugin as unknown as GamePlugin,
  connectFivePlugin as unknown as GamePlugin,
  connectSixPlugin as unknown as GamePlugin,
  connectFourPopoutPlugin as unknown as GamePlugin,
  connectFour3dPlugin as unknown as GamePlugin,
  kakugoPlugin as unknown as GamePlugin,
  swap2OpeningPlugin as unknown as GamePlugin,
  notaktoPlugin as unknown as GamePlugin,
  wildTicTacToePlugin as unknown as GamePlugin,
  ticTacToe4x4Plugin as unknown as GamePlugin,
  qubicPlugin as unknown as GamePlugin,
  threeDTicTacToePlugin as unknown as GamePlugin,
  scoreFourPlugin as unknown as GamePlugin,
  gobbletMiniPlugin as unknown as GamePlugin,
  tapatanPlugin as unknown as GamePlugin,
  shisimaPlugin as unknown as GamePlugin,
  miracleSudokuMiniPlugin as unknown as GamePlugin,
  thermoSudokuMiniPlugin as unknown as GamePlugin,
  jigsawSudokuMiniPlugin as unknown as GamePlugin,
  hyperSudokuMiniPlugin as unknown as GamePlugin,
  antiKnightSudokuMiniPlugin as unknown as GamePlugin,
  antiKingSudokuMiniPlugin as unknown as GamePlugin,
  nonConsecutiveSudokuPlugin as unknown as GamePlugin,
  consecutivePairsSudokuPlugin as unknown as GamePlugin,
  germanWhispersSudokuPlugin as unknown as GamePlugin,
  dutchWhispersSudokuPlugin as unknown as GamePlugin,
  renbanSudokuPlugin as unknown as GamePlugin,
  oddEvenSudokuPlugin as unknown as GamePlugin,
  littleKillerSudokuPlugin as unknown as GamePlugin,
  palindromeSudokuPlugin as unknown as GamePlugin,
  sandwichSudokuPlugin as unknown as GamePlugin,
  xSudokuMiniPlugin as unknown as GamePlugin,
  asteriskSudokuPlugin as unknown as GamePlugin,
  centerDotSudokuPlugin as unknown as GamePlugin,
  sudokuMini4x4Plugin as unknown as GamePlugin,
  sudokuMini6x6Plugin as unknown as GamePlugin,
  suguruMiniPlugin as unknown as GamePlugin,
  numbrixMiniPlugin as unknown as GamePlugin,
  rippleEffectPlugin as unknown as GamePlugin,
  str8tsMiniPlugin as unknown as GamePlugin,
  numberLinkMiniPlugin as unknown as GamePlugin,
  magnetsPuzzlePlugin as unknown as GamePlugin,
  litsPuzzlePlugin as unknown as GamePlugin,
  binairoMiniPlugin as unknown as GamePlugin,
  takuzuMiniPlugin as unknown as GamePlugin,
  yinYangPuzzlePlugin as unknown as GamePlugin,
  magicSquareQuizPlugin as unknown as GamePlugin,
  latinSquareMiniPlugin as unknown as GamePlugin,
  kurodokoPlugin as unknown as GamePlugin,
  sashiganePlugin as unknown as GamePlugin,
  fobidoshiPlugin as unknown as GamePlugin,
  koiKoiPlugin as unknown as GamePlugin,
  hachiHachiPlugin as unknown as GamePlugin,
  hanaAwasePlugin as unknown as GamePlugin,
  mushifudaPlugin as unknown as GamePlugin,
  sakuraPlugin as unknown as GamePlugin,
  goStopPlugin as unknown as GamePlugin,
  hwatuPlugin as unknown as GamePlugin,
  irohaKarutaPlugin as unknown as GamePlugin,
  hyakuninIsshuPlugin as unknown as GamePlugin,
  utaGarutaPlugin as unknown as GamePlugin,
  obakeKarutaPlugin as unknown as GamePlugin,
  kyogiKarutaPlugin as unknown as GamePlugin,
  captureGoPlugin as unknown as GamePlugin,
  ponnukiGoPlugin as unknown as GamePlugin,
  tozanGoPlugin as unknown as GamePlugin,
  badukPlugin as unknown as GamePlugin,
  renjuPlugin as unknown as GamePlugin,
  omokPlugin as unknown as GamePlugin,
  ninukiRenjuPlugin as unknown as GamePlugin,
  gonuPlugin as unknown as GamePlugin,
  yutNoriPlugin as unknown as GamePlugin,
  ddakjiPlugin as unknown as GamePlugin,
  tamCucPlugin as unknown as GamePlugin,
  phanPlugin as unknown as GamePlugin,
  riichiMahjongPlugin as unknown as GamePlugin,
  taiwaneseMahjongPlugin as unknown as GamePlugin,
  cantoneseMahjongPlugin as unknown as GamePlugin,
  singaporeMahjongPlugin as unknown as GamePlugin,
  mcrMahjongPlugin as unknown as GamePlugin,
  hasamiShogiPlugin as unknown as GamePlugin,
  chuShogiPlugin as unknown as GamePlugin,
  douDiZhuPlugin as unknown as GamePlugin,
  seotdaPlugin as unknown as GamePlugin,
  sutdaPlugin as unknown as GamePlugin,
  hanamikojiPlugin as unknown as GamePlugin,
  dominionDeckPlugin as unknown as GamePlugin,
  ascensionGodslayerPlugin as unknown as GamePlugin,
  starRealmsDuelPlugin as unknown as GamePlugin,
  heroRealmsQuestPlugin as unknown as GamePlugin,
  clankDungeonLootPlugin as unknown as GamePlugin,
  fridayIslandSurvivalPlugin as unknown as GamePlugin,
  paperbackLettersPlugin as unknown as GamePlugin,
  hardbackNovelPlugin as unknown as GamePlugin,
  valeriaCardKingdomsPlugin as unknown as GamePlugin,
  tinyEpicDungeonMiniPlugin as unknown as GamePlugin,
  mysticValeCraftPlugin as unknown as GamePlugin,
  legendaryHeroesPlugin as unknown as GamePlugin,
  munchkinMiniPlugin as unknown as GamePlugin,
  fluxxFantasyRulesPlugin as unknown as GamePlugin,
  valleyOfKingsTombPlugin as unknown as GamePlugin,
  doomlingsCatastrophePlugin as unknown as GamePlugin,
  bargainQuestShopPlugin as unknown as GamePlugin,
  welcomeToDungeonPlugin as unknown as GamePlugin,
  resArcanaEssencePlugin as unknown as GamePlugin,
  cartographerHeroesPlugin as unknown as GamePlugin,
  everdellWoodlandPlugin as unknown as GamePlugin,
  wingspanAviaryPlugin as unknown as GamePlugin,
  questElDoradoPlugin as unknown as GamePlugin,
  dungeonRollDelvePlugin as unknown as GamePlugin,
  quarriorsDiceDeckbuildPlugin as unknown as GamePlugin,
  tinyEpicGalaxiesMiniPlugin as unknown as GamePlugin,
  dragonwoodCapturePlugin as unknown as GamePlugin,
  rollPlayerCharacterPlugin as unknown as GamePlugin,
  rollForGalaxyMiniPlugin as unknown as GamePlugin,
  oneDeckDungeonMiniPlugin as unknown as GamePlugin,
  ashesPhoenixbornPlugin as unknown as GamePlugin,
  diceThroneBattlePlugin as unknown as GamePlugin,
  dungeonFighterThrowPlugin as unknown as GamePlugin,
  seasonsElementalPlugin as unknown as GamePlugin,
  sagradaWindowPlugin as unknown as GamePlugin,
  carcassonneBasePlugin as unknown as GamePlugin,
  kingdominoBasePlugin as unknown as GamePlugin,
  queendominoBasePlugin as unknown as GamePlugin,
  kingdominoOriginsPlugin as unknown as GamePlugin,
  isleOfSkyePlugin as unknown as GamePlugin,
  honshuBasePlugin as unknown as GamePlugin,
  patchworkBasePlugin as unknown as GamePlugin,
  barenparkBasePlugin as unknown as GamePlugin,
  azulBasePlugin as unknown as GamePlugin,
  azulSummerPavilionPlugin as unknown as GamePlugin,
  tokaidoBasePlugin as unknown as GamePlugin,
  nmbr9StackPlugin as unknown as GamePlugin,
  tinyTownsGridPlugin as unknown as GamePlugin,
  cascadiaHabitatPlugin as unknown as GamePlugin,
  calicoQuiltPlugin as unknown as GamePlugin,
  karubaExplorerPlugin as unknown as GamePlugin,
  hiveQueenPlugin as unknown as GamePlugin,
  qwixxDeluxePlugin as unknown as GamePlugin,
  qwixxGemixxtPlugin as unknown as GamePlugin,
  railroadInkBluePlugin as unknown as GamePlugin,
  railroadInkRedPlugin as unknown as GamePlugin,
  welcomeToSuburbPlugin as unknown as GamePlugin,
  cartographersBasePlugin as unknown as GamePlugin,
  rollingAmericaPlugin as unknown as GamePlugin,
  silverAndGoldPlugin as unknown as GamePlugin,
  cleverDicePlugin as unknown as GamePlugin,
  onTourRoadsPlugin as unknown as GamePlugin,
  corinthMarketPlugin as unknown as GamePlugin,
  threeSistersGardenPlugin as unknown as GamePlugin,
  hadriansWallRomanPlugin as unknown as GamePlugin,
  trek12HimalayaPlugin as unknown as GamePlugin,
  harvestDiceGardenPlugin as unknown as GamePlugin,
  secondChanceGridPlugin as unknown as GamePlugin,
  nochMalCrossPlugin as unknown as GamePlugin,
  pointsSaladRollPlugin as unknown as GamePlugin,
  wordleMiniPlugin as unknown as GamePlugin,
  dordleMiniPlugin as unknown as GamePlugin,
  octordleMiniPlugin as unknown as GamePlugin,
  sedecordleMiniPlugin as unknown as GamePlugin,
  duotrigordlePlugin as unknown as GamePlugin,
  waffleSwapPlugin as unknown as GamePlugin,
  nerdleEquationPlugin as unknown as GamePlugin,
  worldleCountryPlugin as unknown as GamePlugin,
  globleCountryPlugin as unknown as GamePlugin,
  semantleCluePlugin as unknown as GamePlugin,
  contextoCluePlugin as unknown as GamePlugin,
  absurdleMiniPlugin as unknown as GamePlugin,
  squardleMiniPlugin as unknown as GamePlugin,
  crosswordleMiniPlugin as unknown as GamePlugin,
  typeshiftMiniPlugin as unknown as GamePlugin,
  spelltowerMiniPlugin as unknown as GamePlugin,
  alphabearMiniPlugin as unknown as GamePlugin,
  wordamentMiniPlugin as unknown as GamePlugin,
  ruzzleMiniPlugin as unknown as GamePlugin,
  wordCookiesPlugin as unknown as GamePlugin,
  wordscapesMiniPlugin as unknown as GamePlugin,
  bonzaJigsawPlugin as unknown as GamePlugin,
  shiritoriChainPlugin as unknown as GamePlugin,
  kelimelikMiniPlugin as unknown as GamePlugin,
  eruditMiniPlugin as unknown as GamePlugin,
  quiddlerMiniPlugin as unknown as GamePlugin,
  dabbleWordsPlugin as unknown as GamePlugin,
  tappleLettersPlugin as unknown as GamePlugin,
  blurbleShoutPlugin as unknown as GamePlugin,
  lastLetterChainPlugin as unknown as GamePlugin,
  wordBingoMiniPlugin as unknown as GamePlugin,
  tribondCluePlugin as unknown as GamePlugin,
  catchphraseCluePlugin as unknown as GamePlugin,
  textTwistMiniPlugin as unknown as GamePlugin,
  anagramMagicPlugin as unknown as GamePlugin,
  blackLadyPlugin as unknown as GamePlugin,
  omnibusHeartsPlugin as unknown as GamePlugin,
  spotHeartsPlugin as unknown as GamePlugin,
  cancellationHeartsPlugin as unknown as GamePlugin,
  cutthroatSpadesPlugin as unknown as GamePlugin,
  mirrorSpadesPlugin as unknown as GamePlugin,
  whizSpadesPlugin as unknown as GamePlugin,
  bidWhistPlugin as unknown as GamePlugin,
  knockoutWhistPlugin as unknown as GamePlugin,
  bidEuchrePlugin as unknown as GamePlugin,
  pepperPlugin as unknown as GamePlugin,
  fourHundredPlugin as unknown as GamePlugin,
  doubleDeckPinochlePlugin as unknown as GamePlugin,
  cutthroatPinochlePlugin as unknown as GamePlugin,
  preferencePlugin as unknown as GamePlugin,
  coinchePlugin as unknown as GamePlugin,
  briscolaChiamataPlugin as unknown as GamePlugin,
  scoponePlugin as unknown as GamePlugin,
  madrassoPlugin as unknown as GamePlugin,
  marafonePlugin as unknown as GamePlugin,
  sedmaPlugin as unknown as GamePlugin,
  schieberJassPlugin as unknown as GamePlugin,
  differenzlerJassPlugin as unknown as GamePlugin,
  chibrePlugin as unknown as GamePlugin,
  spoilFivePlugin as unknown as GamePlugin,
  fortyFivePlugin as unknown as GamePlugin,
  foxInForestPlugin as unknown as GamePlugin,
  sixtySixPlugin as unknown as GamePlugin,
  rookPlugin as unknown as GamePlugin,
  bowerPlugin as unknown as GamePlugin,
  mendikotPlugin as unknown as GamePlugin,
  courtPiecePlugin as unknown as GamePlugin,
  seepPlugin as unknown as GamePlugin,
  goStopCardPlugin as unknown as GamePlugin,
  wattenPlugin as unknown as GamePlugin,
  mauMauPlugin as unknown as GamePlugin,
  switchSheddingPlugin as unknown as GamePlugin,
  lastCallSheddingPlugin as unknown as GamePlugin,
  shitheadSheddingPlugin as unknown as GamePlugin,
  tycoonShedPlugin as unknown as GamePlugin,
  scumShedPlugin as unknown as GamePlugin,
  capitalismShedPlugin as unknown as GamePlugin,
  chineseTenShedPlugin as unknown as GamePlugin,
  happyFamiliesShedPlugin as unknown as GamePlugin,
  phaseTenShedPlugin as unknown as GamePlugin,
  skipBoShedPlugin as unknown as GamePlugin,
  golfSixShedPlugin as unknown as GamePlugin,
  doubleExposureBjPlugin as unknown as GamePlugin,
  superFun21BjPlugin as unknown as GamePlugin,
  freeBetBjPlugin as unknown as GamePlugin,
  perfectPairsBjPlugin as unknown as GamePlugin,
  vegasStripBjPlugin as unknown as GamePlugin,
  chineseBjPlugin as unknown as GamePlugin,
  miniBaccaratCasPlugin as unknown as GamePlugin,
  ezBaccaratCasPlugin as unknown as GamePlugin,
  inBetweenCasPlugin as unknown as GamePlugin,
  andarBaharCasPlugin as unknown as GamePlugin,
  teenPattiCasPlugin as unknown as GamePlugin,
  aceyDeuceyCasPlugin as unknown as GamePlugin,
  oklahomaGinRPlugin as unknown as GamePlugin,
  straightGinRPlugin as unknown as GamePlugin,
  kalukiRPlugin as unknown as GamePlugin,
  shanghaiRPlugin as unknown as GamePlugin,
  liverpoolRPlugin as unknown as GamePlugin,
  indianRPlugin as unknown as GamePlugin,
  poolRummyRPlugin as unknown as GamePlugin,
  knockRummyRPlugin as unknown as GamePlugin,
  threeThirteenRPlugin as unknown as GamePlugin,
  boathouseRPlugin as unknown as GamePlugin,
  scalaFortyRPlugin as unknown as GamePlugin,
  generalaServidaPlugin as unknown as GamePlugin,
  generalaDoblePlugin as unknown as GamePlugin,
  yambDicePlugin as unknown as GamePlugin,
  tripleYahtzeePlugin as unknown as GamePlugin,
  battleYahtzeePlugin as unknown as GamePlugin,
  jumboYahtzeePlugin as unknown as GamePlugin,
  maxiYatzyPlugin as unknown as GamePlugin,
  kniffelPlugin as unknown as GamePlugin,
  pigTwoDicePlugin as unknown as GamePlugin,
  hogDicePlugin as unknown as GamePlugin,
  skunkDicePlugin as unknown as GamePlugin,
  dice10000Plugin as unknown as GamePlugin,
  dinoHuntDicePlugin as unknown as GamePlugin,
  cthulhuDicePlugin as unknown as GamePlugin,
  buncoDicePlugin as unknown as GamePlugin,
  helpingNeighborPlugin as unknown as GamePlugin,
  passeDixPlugin as unknown as GamePlugin,
  zanzibarDicePlugin as unknown as GamePlugin,
  barboothPlugin as unknown as GamePlugin,
  hooliganDicePlugin as unknown as GamePlugin,
  glucksshausPlugin as unknown as GamePlugin,
  dice421Plugin as unknown as GamePlugin,
  craplessCrapsPlugin as unknown as GamePlugin,
  highPointCrapsPlugin as unknown as GamePlugin,
  bankCrapsPlugin as unknown as GamePlugin,
  brandubhPlugin as unknown as GamePlugin,
  ardRiPlugin as unknown as GamePlugin,
  magpieTaflPlugin as unknown as GamePlugin,
  zammaPlugin as unknown as GamePlugin,
  dameoPlugin as unknown as GamePlugin,
  yavalathPlugin as unknown as GamePlugin,
  ponnukiPlugin as unknown as GamePlugin,
  tablanPlugin as unknown as GamePlugin,
  daldosPlugin as unknown as GamePlugin,
  pallanguzhiPlugin as unknown as GamePlugin,
  cheatBsPlugin as unknown as GamePlugin,
  palificoPlugin as unknown as GamePlugin,
  skullBluffPlugin as unknown as GamePlugin,
  coupBluffPlugin as unknown as GamePlugin,
  loveLetterMiniPlugin as unknown as GamePlugin,
  resistanceQuizPlugin as unknown as GamePlugin,
  avalonQuizPlugin as unknown as GamePlugin,
  secretHitlerQuizPlugin as unknown as GamePlugin,
  werewolfQuizPlugin as unknown as GamePlugin,
  saboteurMiniPlugin as unknown as GamePlugin,
  thirteenCluesPlugin as unknown as GamePlugin,
  cryptidMiniPlugin as unknown as GamePlugin,
  deceptionHkPlugin as unknown as GamePlugin,
  turingMachinePuzzlePlugin as unknown as GamePlugin,
  tempelDeductionPlugin as unknown as GamePlugin,
  sleuthMiniPlugin as unknown as GamePlugin,
  code777MiniPlugin as unknown as GamePlugin,
  clueMiniPlugin as unknown as GamePlugin,
  lingoDeductionPlugin as unknown as GamePlugin,
  chameleonBluffPlugin as unknown as GamePlugin,
  insiderQuizPlugin as unknown as GamePlugin,
  superMastermindPlugin as unknown as GamePlugin,
  jottoPlugin as unknown as GamePlugin,
  blackBoxMiniPlugin as unknown as GamePlugin,
  chineseRingsPlugin as unknown as GamePlugin,
  fifteenTilesLogicPlugin as unknown as GamePlugin,
  eightPuzzlePlugin as unknown as GamePlugin,
  huaRongDaoPlugin as unknown as GamePlugin,
  lightsOut5x5Plugin as unknown as GamePlugin,
  hashiwokakeroMiniPlugin as unknown as GamePlugin,
  colorPicrossMiniPlugin as unknown as GamePlugin,
  cloneSudokuMiniPlugin as unknown as GamePlugin,
  windokuMiniPlugin as unknown as GamePlugin,
  chaosSudokuMiniPlugin as unknown as GamePlugin,
  towerOfHanoiMiniPlugin as unknown as GamePlugin,
  bejeweledBlitzPlugin as unknown as GamePlugin,
  bejeweledTwistPlugin as unknown as GamePlugin,
  sharikiPlugin as unknown as GamePlugin,
  jewelQuestArcadePlugin as unknown as GamePlugin,
  columnsMiniPlugin as unknown as GamePlugin,
  pillDropMiniPlugin as unknown as GamePlugin,
  magicalDropMiniPlugin as unknown as GamePlugin,
  moneyIdolMiniPlugin as unknown as GamePlugin,
  threesPuzzlePlugin as unknown as GamePlugin,
  game2048Plugin as unknown as GamePlugin,
  game1024Plugin as unknown as GamePlugin,
  tripleTownMiniPlugin as unknown as GamePlugin,
  luminesMiniPlugin as unknown as GamePlugin,
  samegameMiniPlugin as unknown as GamePlugin,
  clickomaniaMiniPlugin as unknown as GamePlugin,
  spikeDodgerPlugin as unknown as GamePlugin,
  canabaltMiniPlugin as unknown as GamePlugin,
  caveRunnerPlugin as unknown as GamePlugin,
  helicopterFlyerPlugin as unknown as GamePlugin,
  paperPlaneMiniPlugin as unknown as GamePlugin,
  batFlyerPlugin as unknown as GamePlugin,
  ufoFlyerPlugin as unknown as GamePlugin,
  ninjaWallMiniPlugin as unknown as GamePlugin,
  circleRushPlugin as unknown as GamePlugin,
  orbitArcadePlugin as unknown as GamePlugin,
  towerStackerMiniPlugin as unknown as GamePlugin,
  colorBallDropPlugin as unknown as GamePlugin,
  colorReactionPlugin as unknown as GamePlugin,
  circleTrackerPlugin as unknown as GamePlugin,
  reactionTestProPlugin as unknown as GamePlugin,
  simonPatternPlugin as unknown as GamePlugin,
  endlessWhackMolePlugin as unknown as GamePlugin,
  endlessCatchPlugin as unknown as GamePlugin,
  endlessTapCountPlugin as unknown as GamePlugin,
  laneDefenderMiniPlugin as unknown as GamePlugin,
  diceTenpinBowlPlugin as unknown as GamePlugin,
  diceNinepinBowlPlugin as unknown as GamePlugin,
  diceCandlepinPlugin as unknown as GamePlugin,
  diceDuckpinPlugin as unknown as GamePlugin,
  diceFivePinPlugin as unknown as GamePlugin,
  diceSkittlesPlugin as unknown as GamePlugin,
  diceKegelnPlugin as unknown as GamePlugin,
  dice301Plugin as unknown as GamePlugin,
  dice701Plugin as unknown as GamePlugin,
  diceShanghaiDartsPlugin as unknown as GamePlugin,
  diceHalveItPlugin as unknown as GamePlugin,
  diceKillerDartsPlugin as unknown as GamePlugin,
  diceAroundClockPlugin as unknown as GamePlugin,
  diceCricketDartsPlugin as unknown as GamePlugin,
  diceBoccePlugin as unknown as GamePlugin,
  dicePetanquePlugin as unknown as GamePlugin,
  diceBocciaPlugin as unknown as GamePlugin,
  diceKubbPlugin as unknown as GamePlugin,
  diceMolkkyPlugin as unknown as GamePlugin,
  diceCornholePlugin as unknown as GamePlugin,
  diceWasherTossPlugin as unknown as GamePlugin,
  diceKanjamPlugin as unknown as GamePlugin,
  diceSpikeballPlugin as unknown as GamePlugin,
  diceCrokinolePlugin as unknown as GamePlugin,
  diceCarromPlugin as unknown as GamePlugin,
  diceEisstockPlugin as unknown as GamePlugin,
  diceSjoelbakPlugin as unknown as GamePlugin,
  diceNovussPlugin as unknown as GamePlugin,
  diceDiscGolfPlugin as unknown as GamePlugin,
  diceAirhockeyPlugin as unknown as GamePlugin,
  diceFoosballPlugin as unknown as GamePlugin,
  diceTableTennisPlugin as unknown as GamePlugin,
  diceVolleyballPlugin as unknown as GamePlugin,
  diceSquashPlugin as unknown as GamePlugin,
  diceBadmintonPlugin as unknown as GamePlugin,
  telestrationsQuizPlugin as unknown as GamePlugin,
  reverseCharadesQuizPlugin as unknown as GamePlugin,
  trivialPursuitEightiesQuizPlugin as unknown as GamePlugin,
  applesToApplesQuizPlugin as unknown as GamePlugin,
  monikersQuizPlugin as unknown as GamePlugin,
  fibbageQuizPlugin as unknown as GamePlugin,
  drawfulQuizPlugin as unknown as GamePlugin,
  quiplashQuizPlugin as unknown as GamePlugin,
  dixitQuizPlugin as unknown as GamePlugin,
  witsWagersQuizPlugin as unknown as GamePlugin,
  crewDeepSeaCoopPlugin as unknown as GamePlugin,
  forbiddenIslandCoopPlugin as unknown as GamePlugin,
  forbiddenDesertCoopPlugin as unknown as GamePlugin,
  forbiddenSkyCoopPlugin as unknown as GamePlugin,
  spiritIslandCoopPlugin as unknown as GamePlugin,
  arkhamLcgCoopPlugin as unknown as GamePlugin,
  lotrLcgCoopPlugin as unknown as GamePlugin,
  marvelChampionsCoopPlugin as unknown as GamePlugin,
  hogwartsBattleCoopPlugin as unknown as GamePlugin,
  aeonsEndCoopPlugin as unknown as GamePlugin,
  sentinelsMultiverseCoopPlugin as unknown as GamePlugin,
  magicMazeCoopPlugin as unknown as GamePlugin,
  flashpointRescueCoopPlugin as unknown as GamePlugin,
  ironswornVowsPlugin as unknown as GamePlugin,
  starforgedSagaPlugin as unknown as GamePlugin,
  thousandYearVampirePlugin as unknown as GamePlugin,
  forTheQueenSagaPlugin as unknown as GamePlugin,
  wretchedLogPlugin as unknown as GamePlugin,
  aloneAmongStarsTalePlugin as unknown as GamePlugin,
  notoriousBountyPlugin as unknown as GamePlugin,
  apothecariaWitchPlugin as unknown as GamePlugin,
  wanderhomeJourneyPlugin as unknown as GamePlugin,
  quillLettersPlugin as unknown as GamePlugin,
  sigilWizardPlugin as unknown as GamePlugin,
  cartaExplorerPlugin as unknown as GamePlugin,
  stockpileSharesPlugin as unknown as GamePlugin,
  bullBearMarketPlugin as unknown as GamePlugin,
  acquireHotelsPlugin as unknown as GamePlugin,
  farmageddonCropsPlugin as unknown as GamePlugin,
  coffeeTradersMiniPlugin as unknown as GamePlugin,
  baronsEnginePlugin as unknown as GamePlugin,
  splendorGemsPlugin as unknown as GamePlugin,
  spiceRoadTraderPlugin as unknown as GamePlugin,
  brassCanalsPlugin as unknown as GamePlugin,
  monopolyDealMiniPlugin as unknown as GamePlugin,
  ponziCollapsePlugin as unknown as GamePlugin,
  alturienMarketPlugin as unknown as GamePlugin,
  scovillePeppersPlugin as unknown as GamePlugin,
  charteredCompaniesPlugin as unknown as GamePlugin,
  tinyEpicWesternPlugin as unknown as GamePlugin,
  shoveHapennyPlugin as unknown as GamePlugin,
  barDiceShipCaptainPlugin as unknown as GamePlugin,
  midnightBarDicePlugin as unknown as GamePlugin,
  threesBarDicePlugin as unknown as GamePlugin,
  coinDribblePlugin as unknown as GamePlugin,
  shuffleQuarterPlugin as unknown as GamePlugin,
  ringboardTossPlugin as unknown as GamePlugin,
  ringTheBullPlugin as unknown as GamePlugin,
  quoitsTossPlugin as unknown as GamePlugin,
  spoofBiddingPlugin as unknown as GamePlugin,
  sushiGoConveyorPlugin as unknown as GamePlugin,
  sevenWondersDraftPlugin as unknown as GamePlugin,
  bibliosTomesPlugin as unknown as GamePlugin,
  ethnosAlliesPlugin as unknown as GamePlugin,
  fairyTaleDraftPlugin as unknown as GamePlugin,
  betweenTwoCitiesPlugin as unknown as GamePlugin,
  pointSaladVegPlugin as unknown as GamePlugin,
  tidesOfTimePlugin as unknown as GamePlugin,
  bunnyKingdomPlugin as unknown as GamePlugin,
  innovationAgesPlugin as unknown as GamePlugin,
  presidentsMemoryPlugin as unknown as GamePlugin,
  monetMemoryPlugin as unknown as GamePlugin,
  flagsMemoryPlugin as unknown as GamePlugin,
  spotItClassicPlugin as unknown as GamePlugin,
  setShapesPlugin as unknown as GamePlugin,
  speedPairsPlugin as unknown as GamePlugin,
  zenMatchingPlugin as unknown as GamePlugin,
  blinkMatchPlugin as unknown as GamePlugin,
  warObservePlugin as unknown as GamePlugin,
  kimsGamePlugin as unknown as GamePlugin,
  trayMemoryPlugin as unknown as GamePlugin,
  observerCardPlugin as unknown as GamePlugin,
  wheresWaldoCardPlugin as unknown as GamePlugin,
  iSpyCardPlugin as unknown as GamePlugin,
  brainbowPlugin as unknown as GamePlugin,
  swishCardsPlugin as unknown as GamePlugin,
  colorBrainPlugin as unknown as GamePlugin,
  mapMemoryPlugin as unknown as GamePlugin,
  sherlookDiffPlugin as unknown as GamePlugin,
  halliGalliPlugin as unknown as GamePlugin,
  framedFilmPlugin as unknown as GamePlugin,
  cinematrixYrPlugin as unknown as GamePlugin,
  bandleAudioPlugin as unknown as GamePlugin,
  gamedlePixelPlugin as unknown as GamePlugin,
  poeltlNbaPlugin as unknown as GamePlugin,
  squirdlePokePlugin as unknown as GamePlugin,
  taylordleTsPlugin as unknown as GamePlugin,
  fluxxRulesPlugin as unknown as GamePlugin,
  guillotineHeadsPlugin as unknown as GamePlugin,
  abandonArtichokesPlugin as unknown as GamePlugin,
  kakerlakenPokerPlugin as unknown as GamePlugin,
  faceToFacePlugin as unknown as GamePlugin,
  klaskMagneticPlugin as unknown as GamePlugin,
  spitSpeedPlugin as unknown as GamePlugin,
  spoonsGrabPlugin as unknown as GamePlugin,
  methuselahPlugin as unknown as GamePlugin,
  towerOfLondonPlugin as unknown as GamePlugin,
  chessboardPlugin as unknown as GamePlugin,
  napoleonStHelenaPlugin as unknown as GamePlugin,
  napoleonsSquarePlugin as unknown as GamePlugin,
  napoleonsShoulderPlugin as unknown as GamePlugin,
  duchessLuynesPlugin as unknown as GamePlugin,
  propellerPlugin as unknown as GamePlugin,
  sundialPlugin as unknown as GamePlugin,
  trefoilPlugin as unknown as GamePlugin,
  moosehidePlugin as unknown as GamePlugin,
  chineseKlondikePlugin as unknown as GamePlugin,
  uskPatiencePlugin as unknown as GamePlugin,
  superiorCanfieldPlugin as unknown as GamePlugin,
  rainbowCanfieldPlugin as unknown as GamePlugin,
  selectiveCanfieldPlugin as unknown as GamePlugin,
  toadHolePlugin as unknown as GamePlugin,
  glenwoodPatiencePlugin as unknown as GamePlugin,
  hopscotchSolitairePlugin as unknown as GamePlugin,
  tutsTombPlugin as unknown as GamePlugin,
  simplePairsPlugin as unknown as GamePlugin,
  idiotsDelightPlugin as unknown as GamePlugin,
  carltonPatiencePlugin as unknown as GamePlugin,
  kingsQueensPlugin as unknown as GamePlugin,
  nineAcrossPlugin as unknown as GamePlugin,
  matrimonyPatiencePlugin as unknown as GamePlugin,
  gargantuaPlugin as unknown as GamePlugin,
  harpPatiencePlugin as unknown as GamePlugin,
  bigHarpPlugin as unknown as GamePlugin,
  raglanPatiencePlugin as unknown as GamePlugin,
  baronessPatiencePlugin as unknown as GamePlugin,
  legionPatiencePlugin as unknown as GamePlugin,
  bigBenPlugin as unknown as GamePlugin,
  labyrinthPatiencePlugin as unknown as GamePlugin,
  zodiacPatiencePlugin as unknown as GamePlugin,
  wordLadderMiniPlugin as unknown as GamePlugin,
  wordSearchMiniPlugin as unknown as GamePlugin,
  miniCrosswordPlugin as unknown as GamePlugin,
  acrosticPuzzlePlugin as unknown as GamePlugin,
  codewordsMiniPlugin as unknown as GamePlugin,
  arrowwordPlugin as unknown as GamePlugin,
  crossnumbersPlugin as unknown as GamePlugin,
  fillInKakuroPlugin as unknown as GamePlugin,
  wordHuntMiniPlugin as unknown as GamePlugin,
  boggle4x4Plugin as unknown as GamePlugin,
  boggle5x5Plugin as unknown as GamePlugin,
  ghostWordPlugin as unknown as GamePlugin,
  shiritoriPlugin as unknown as GamePlugin,
  categoriesLetterPlugin as unknown as GamePlugin,
  wordWheelPlugin as unknown as GamePlugin,
  wordFlowerPlugin as unknown as GamePlugin,
  wordChainsPlugin as unknown as GamePlugin,
  secretMessagePlugin as unknown as GamePlugin,
  caesarCipherPlugin as unknown as GamePlugin,
  vowelLessPlugin as unknown as GamePlugin,
  missingVowelsPlugin as unknown as GamePlugin,
  connectionsMiniPlugin as unknown as GamePlugin,
  strandsMiniPlugin as unknown as GamePlugin,
  wouldYouRatherPickPlugin as unknown as GamePlugin,
  truthOrDarePickPlugin as unknown as GamePlugin,
  neverHaveIEverPickPlugin as unknown as GamePlugin,
  twoTruthsLiePickPlugin as unknown as GamePlugin,
  spyfallMiniPlugin as unknown as GamePlugin,
  coconutShyTossPlugin as unknown as GamePlugin,
  carnivalDuckShootPlugin as unknown as GamePlugin,
  carnivalBallTossPlugin as unknown as GamePlugin,
  carnivalBalloonDartPlugin as unknown as GamePlugin,
  paperFootballFlickPlugin as unknown as GamePlugin,
  coinFlickingPlugin as unknown as GamePlugin,
  tiddlywinksFlickPlugin as unknown as GamePlugin,
  misereTicTacToePlugin as unknown as GamePlugin,
  orderAndChaosPlugin as unknown as GamePlugin,
  fiveInARowPlugin as unknown as GamePlugin,
  penteCapturePlugin as unknown as GamePlugin,
  renjuGamePlugin as unknown as GamePlugin,
  brazilianDraughtsPlugin as unknown as GamePlugin,
  italianDraughtsPlugin as unknown as GamePlugin,
  spanishDraughtsPlugin as unknown as GamePlugin,
  losingCheckersPlugin as unknown as GamePlugin,
  damaTurkishPlugin as unknown as GamePlugin,
  sternhalmaGamePlugin as unknown as GamePlugin,
  minichess4x4Plugin as unknown as GamePlugin,
  minichess6x6Plugin as unknown as GamePlugin,
  minishogi5x5Plugin as unknown as GamePlugin,
  kyotoShogiPlugin as unknown as GamePlugin,
  animalShogiPlugin as unknown as GamePlugin,
  shatranjArabicPlugin as unknown as GamePlugin,
  grandOthelloMiniPlugin as unknown as GamePlugin,
  twelveMensMorrisPlugin as unknown as GamePlugin,
  sixMensMorrisPlugin as unknown as GamePlugin,
  threeMensMorrisPlugin as unknown as GamePlugin,
  lascaStackPlugin as unknown as GamePlugin,
  toguzKorgoolPlugin as unknown as GamePlugin,
  congkakGamePlugin as unknown as GamePlugin,
  bantumiGamePlugin as unknown as GamePlugin,
  ayoMancalaPlugin as unknown as GamePlugin,
  gonnectGamePlugin as unknown as GamePlugin,
  yGamePlugin as unknown as GamePlugin,
  pylosPyramidPlugin as unknown as GamePlugin,
  tumblingBlocksPlugin as unknown as GamePlugin,
  nardeRussianPlugin as unknown as GamePlugin,
  hyperBackgammonPlugin as unknown as GamePlugin,
  wythoffsGamePlugin as unknown as GamePlugin,
  chompGamePlugin as unknown as GamePlugin,
  simEdgesPlugin as unknown as GamePlugin,
  cribbageMiniPlugin as unknown as GamePlugin,
  threeHandCribbagePlugin as unknown as GamePlugin,
  fourHandCribbagePlugin as unknown as GamePlugin,
  fiveCardCribbagePlugin as unknown as GamePlugin,
  sevenCardCribbagePlugin as unknown as GamePlugin,
  cribbageSquaresSoliPlugin as unknown as GamePlugin,
  speedCribbagePlugin as unknown as GamePlugin,
  mugginsPlugin as unknown as GamePlugin,
  peaceCardsPlugin as unknown as GamePlugin,
  beggarMyNeighbourPlugin as unknown as GamePlugin,
  menagerieCardsPlugin as unknown as GamePlugin,
  bsCheatPlugin as unknown as GamePlugin,
  iDoubtItPlugin as unknown as GamePlugin,
  bluffCardsPlugin as unknown as GamePlugin,
  kittyWhistPlugin as unknown as GamePlugin,
  concentrationCardsPlugin as unknown as GamePlugin,
  pelmanismPlugin as unknown as GamePlugin,
  hymnCountPlugin as unknown as GamePlugin,
  goBoomPlugin as unknown as GamePlugin,
  royalCasinoPlugin as unknown as GamePlugin,
  drawCasinoPlugin as unknown as GamePlugin,
  spadeCasinoPlugin as unknown as GamePlugin,
  zwickerPlugin as unknown as GamePlugin,
  tablanettePlugin as unknown as GamePlugin,
  scopaDi15Plugin as unknown as GamePlugin,
  scopaDAssiPlugin as unknown as GamePlugin,
  escobaMiniPlugin as unknown as GamePlugin,
  ciceraPlugin as unknown as GamePlugin,
  hanafudaKoiKoiPlugin as unknown as GamePlugin,
  hachiHachiPlugin as unknown as GamePlugin,
  mattatakPlugin as unknown as GamePlugin,
  pokerPatiencePlugin as unknown as GamePlugin,
  quiddlerCardsPlugin as unknown as GamePlugin,
  milleBornesPlugin as unknown as GamePlugin,
  eleusisPlugin as unknown as GamePlugin,
  anacondaPokerPlugin as unknown as GamePlugin,
  followTheQueenPlugin as unknown as GamePlugin,
  chicagoHighPokerPlugin as unknown as GamePlugin,
  chicagoLowPokerPlugin as unknown as GamePlugin,
  baseballPokerPlugin as unknown as GamePlugin,
  nightBaseballPlugin as unknown as GamePlugin,
  crissCrossPokerPlugin as unknown as GamePlugin,
  ironCrossPokerPlugin as unknown as GamePlugin,
  ticTacToePokerPlugin as unknown as GamePlugin,
  spitInTheOceanPlugin as unknown as GamePlugin,
  cincinnatiPokerPlugin as unknown as GamePlugin,
  drPepperPokerPlugin as unknown as GamePlugin,
  acesAndFacesPlugin as unknown as GamePlugin,
  jacksOrBetterPlugin as unknown as GamePlugin,
  jokerPokerVpPlugin as unknown as GamePlugin,
  bonusPokerDeluxePlugin as unknown as GamePlugin,
  doubleDoubleBonusPlugin as unknown as GamePlugin,
  sevensWildPlugin as unknown as GamePlugin,
  tensOrBetterPlugin as unknown as GamePlugin,
  looseDeucesWildPlugin as unknown as GamePlugin,
  fourCardPokerPlugin as unknown as GamePlugin,
  ultimateHoldemPlugin as unknown as GamePlugin,
  headsUpHoldemCasPlugin as unknown as GamePlugin,
  ezBaccaratPokerPlugin as unknown as GamePlugin,
  bigOPloPlugin as unknown as GamePlugin,
  plo6PokerPlugin as unknown as GamePlugin,
  potLimitOmahaPlugin as unknown as GamePlugin,
  royalHoldemPlugin as unknown as GamePlugin,
  drawmahaPokerPlugin as unknown as GamePlugin,
  fusionPokerPlugin as unknown as GamePlugin,
  manilaPokerPlugin as unknown as GamePlugin,
  sokoPokerPlugin as unknown as GamePlugin,
  mexicanPokerPlugin as unknown as GamePlugin,
  potLimitBadugiPlugin as unknown as GamePlugin,
  kuhnPokerPlugin as unknown as GamePlugin,
  klondikeThreesStandardPlugin as unknown as GamePlugin,
  klondikeThreesNoRedealPlugin as unknown as GamePlugin,
  klondikeDealOneNoRedealPlugin as unknown as GamePlugin,
  cassetteAgnesBernauerPlugin as unknown as GamePlugin,
  spadesSolitairePlugin as unknown as GamePlugin,
  blindHookeySolitairePlugin as unknown as GamePlugin,
  bakersKlondikePlugin as unknown as GamePlugin,
  fascinationPatiencePlugin as unknown as GamePlugin,
  freecellTwoDeckPlugin as unknown as GamePlugin,
  tripleFreecellPlugin as unknown as GamePlugin,
  spiderFourSuitsPlugin as unknown as GamePlugin,
  willOTheWispPlugin as unknown as GamePlugin,
  pyramidSolitaireClassicPlugin as unknown as GamePlugin,
  pyramidNoRedealPlugin as unknown as GamePlugin,
  pharaohsPyramidPlugin as unknown as GamePlugin,
  triPeaksSolitairePlugin as unknown as GamePlugin,
  golfSolitairePlugin as unknown as GamePlugin,
  golfParVariantPlugin as unknown as GamePlugin,
  blackHoleSolPlugin as unknown as GamePlugin,
  clockDoubleDeckPlugin as unknown as GamePlugin,
  gapsTwoDeckPlugin as unknown as GamePlugin,
  labyrinthSolPlugin as unknown as GamePlugin,
  americanToadPlugin as unknown as GamePlugin,
  rainbowSolitairePlugin as unknown as GamePlugin,
  ladyOfTheManorPlugin as unknown as GamePlugin,
  fortressCastellanPlugin as unknown as GamePlugin,
  laBelleLucieFanPlugin as unknown as GamePlugin,
  threeShufflesAndADrawPlugin as unknown as GamePlugin,
  crescentSolitairePlugin as unknown as GamePlugin,
  acesUpFiringSquadPlugin as unknown as GamePlugin,
  doubleDeckFreecellPlugin as unknown as GamePlugin,
  parallelsSolPlugin as unknown as GamePlugin,
  addictionSolPlugin as unknown as GamePlugin,
  alaskaSolPlugin as unknown as GamePlugin,
  somersetSolPlugin as unknown as GamePlugin,
  followQueenRankPlugin as unknown as GamePlugin,
  anacondaPassPlugin as unknown as GamePlugin,
  crissCrossBoardPlugin as unknown as GamePlugin,
  ironCrossRevealPlugin as unknown as GamePlugin,
  ticTacToeCardsPlugin as unknown as GamePlugin,
  spitOceanWildPlugin as unknown as GamePlugin,
  cincinnatiLamebrainsPlugin as unknown as GamePlugin,
  drPepperWildPlugin as unknown as GamePlugin,
  doubleBonusVpPlugin as unknown as GamePlugin,
  doubleDoubleBonusVpPlugin as unknown as GamePlugin,
  bonusDeluxeVpPlugin as unknown as GamePlugin,
  ultimateXPokerPlugin as unknown as GamePlugin,
  superTimesPayPlugin as unknown as GamePlugin,
  qwixxMixxerPlugin as unknown as GamePlugin,
  qwixxConnectedPlugin as unknown as GamePlugin,
  ganzCleverPlugin as unknown as GamePlugin,
  twiceAsCleverPlugin as unknown as GamePlugin,
  cleverCubedPlugin as unknown as GamePlugin,
  fleetDicePlugin as unknown as GamePlugin,
  rajasDiceCharmersPlugin as unknown as GamePlugin,
  rollingRealmsMiniPlugin as unknown as GamePlugin,
  wingspanDiceGamePlugin as unknown as GamePlugin,
  panicWallStreetPlugin as unknown as GamePlugin,
  coasterParkDicePlugin as unknown as GamePlugin,
  diceHospitalAdmitPlugin as unknown as GamePlugin,
  starshipCaptainsRollPlugin as unknown as GamePlugin,
  deckscapeSoloRollPlugin as unknown as GamePlugin,
  orchardSoloPlugin as unknown as GamePlugin,
  cantaloopSoloPlugin as unknown as GamePlugin,
  voyagersSoloPlugin as unknown as GamePlugin,
  imperialSettlersRwPlugin as unknown as GamePlugin,
  underwaterCitiesRwPlugin as unknown as GamePlugin,
  secondChanceCardsPlugin as unknown as GamePlugin,
  kokoroKodamaPlugin as unknown as GamePlugin,
  tigrisEuphratesMiniPlugin as unknown as GamePlugin,
  babyloniaTilesPlugin as unknown as GamePlugin,
  ingeniousHexMiniPlugin as unknown as GamePlugin,
  blokusTrigonMiniPlugin as unknown as GamePlugin,
  draftosaurusMiniPlugin as unknown as GamePlugin,
  verdantHouseplantPlugin as unknown as GamePlugin,
  ukiyoTilePlugin as unknown as GamePlugin,
  springMeadowMiniPlugin as unknown as GamePlugin,
  indianSummerMiniPlugin as unknown as GamePlugin,
  dragonDiceArenaPlugin as unknown as GamePlugin,
  quarmageddonDicePlugin as unknown as GamePlugin,
  tinyEpicGalaxyRollPlugin as unknown as GamePlugin,
  valeriaDiceBuildPlugin as unknown as GamePlugin,
  happySalmonMiniPlugin as unknown as GamePlugin,
  throwThrowBurritoQuizPlugin as unknown as GamePlugin,
  tacoCatGoatQuizPlugin as unknown as GamePlugin,
  trialTrolleyQuizPlugin as unknown as GamePlugin,
  fakeArtistQuizPlugin as unknown as GamePlugin,
  geekOutQuizPlugin as unknown as GamePlugin,
  patentlyStupidQuizPlugin as unknown as GamePlugin,
  drawful2QuizPlugin as unknown as GamePlugin,
  bountyTournamentPlugin as unknown as GamePlugin,
  progressiveKnockoutPlugin as unknown as GamePlugin,
  freezeoutTournamentPlugin as unknown as GamePlugin,
  rebuyTournamentPlugin as unknown as GamePlugin,
  reentryTournamentPlugin as unknown as GamePlugin,
  shootoutTournamentPlugin as unknown as GamePlugin,
  turboTournamentPlugin as unknown as GamePlugin,
  hyperTurboTournamentPlugin as unknown as GamePlugin,
  satelliteTournamentPlugin as unknown as GamePlugin,
  stepTournamentPlugin as unknown as GamePlugin,
  freerollTournamentPlugin as unknown as GamePlugin,
  sixMaxCashPlugin as unknown as GamePlugin,
  headsUpCashPlugin as unknown as GamePlugin,
  deepStackCashPlugin as unknown as GamePlugin,
  shortStackCashPlugin as unknown as GamePlugin,
  mttTournamentPlugin as unknown as GamePlugin,
  sitAndGoPlugin as unknown as GamePlugin,
  gtoDrillsPlugin as unknown as GamePlugin,
  killGamePlugin as unknown as GamePlugin,
  anteOnlyGamePlugin as unknown as GamePlugin,
  straddleGamePlugin as unknown as GamePlugin,
  bombPotPlugin as unknown as GamePlugin,
  runItTwicePlugin as unknown as GamePlugin,
  runItThricePlugin as unknown as GamePlugin,
  kansasCityLowballPlugin as unknown as GamePlugin,
  calLowballPlugin as unknown as GamePlugin,
  deucesWildVpPlugin as unknown as GamePlugin,
  gutsPokerPlugin as unknown as GamePlugin,
  triplePlayDrawPlugin as unknown as GamePlugin,
  fivePlayDrawPlugin as unknown as GamePlugin,
  tenPlayDrawPlugin as unknown as GamePlugin,
  chowahaPokerPlugin as unknown as GamePlugin,
  mangoPokerPlugin as unknown as GamePlugin,
  studMahaPlugin as unknown as GamePlugin,
  rotoPokerPlugin as unknown as GamePlugin,
  sohePokerPlugin as unknown as GamePlugin,
  flopPokerCasPlugin as unknown as GamePlugin,
  pokerRoulettePlugin as unknown as GamePlugin,
  fiveOPokerPlugin as unknown as GamePlugin,
  burnCardPokerPlugin as unknown as GamePlugin,
  rainbowSolPlugin as unknown as GamePlugin,
  exiledKingsPlugin as unknown as GamePlugin,
  citadelPlugin as unknown as GamePlugin,
  pegSolitaireCardPlugin as unknown as GamePlugin,
  redAndBlackPlugin as unknown as GamePlugin,
  castlesInSpainPlugin as unknown as GamePlugin,
  napoleonAtStHelenaPlugin as unknown as GamePlugin,
  limitedFortyThievesPlugin as unknown as GamePlugin,
  lucasPlugin as unknown as GamePlugin,
  mariaPlugin as unknown as GamePlugin,
  numberTenPlugin as unknown as GamePlugin,
  streetsPlugin as unknown as GamePlugin,
  indianPlugin as unknown as GamePlugin,
  bigFortyPlugin as unknown as GamePlugin,
  josephinePlugin as unknown as GamePlugin,
  blockadePlugin as unknown as GamePlugin,
  busyAcesPlugin as unknown as GamePlugin,
  giganticPlugin as unknown as GamePlugin,
  presidentsCabinetPlugin as unknown as GamePlugin,
  bearRiverPlugin as unknown as GamePlugin,
  diavoloPlugin as unknown as GamePlugin,
  sultanSolitairePlugin as unknown as GamePlugin,
  mrsMopPlugin as unknown as GamePlugin,
  bristolPlugin as unknown as GamePlugin,
  patienceRoyalCotillionPlugin as unknown as GamePlugin,
  captiveQueensPlugin as unknown as GamePlugin,
  calculationSolitairePlugin as unknown as GamePlugin,
  fourteenOutPlugin as unknown as GamePlugin,
  midnightOilPlugin as unknown as GamePlugin,
  quiltPlugin as unknown as GamePlugin,
  royalRendezvousPlugin as unknown as GamePlugin,
  eightByEightPlugin as unknown as GamePlugin,
  doubleRailPlugin as unknown as GamePlugin,
  herringBonePlugin as unknown as GamePlugin,
  zodiacPlugin as unknown as GamePlugin,
  deucesPlugin as unknown as GamePlugin,
  glenwoodPlugin as unknown as GamePlugin,
  doubletsPlugin as unknown as GamePlugin,
  quadrupleAlliancePlugin as unknown as GamePlugin,
  tamOShanterPlugin as unknown as GamePlugin,
  chess960QuizPlugin as unknown as GamePlugin,
  crazyhousePuzzlePlugin as unknown as GamePlugin,
  bughousePuzzlePlugin as unknown as GamePlugin,
  losingChessQuizPlugin as unknown as GamePlugin,
  atomicChessQuizPlugin as unknown as GamePlugin,
  hordeChessQuizPlugin as unknown as GamePlugin,
  threeCheckQuizPlugin as unknown as GamePlugin,
  racingKingsQuizPlugin as unknown as GamePlugin,
  fogOfWarQuizPlugin as unknown as GamePlugin,
  fourPlayerChessQuizPlugin as unknown as GamePlugin,
  aliceChessPuzzlePlugin as unknown as GamePlugin,
  knightmateQuizPlugin as unknown as GamePlugin,
  losAlamosQuizPlugin as unknown as GamePlugin,
  cylinderChessQuizPlugin as unknown as GamePlugin,
  toroidalChessQuizPlugin as unknown as GamePlugin,
  darkChessQuizPlugin as unknown as GamePlugin,
  progressiveChessQuizPlugin as unknown as GamePlugin,
  rifleChessQuizPlugin as unknown as GamePlugin,
  leganChessQuizPlugin as unknown as GamePlugin,
  marseillaisQuizPlugin as unknown as GamePlugin,
  spartanChessQuizPlugin as unknown as GamePlugin,
  capablancaChessQuizPlugin as unknown as GamePlugin,
  omegaChessQuizPlugin as unknown as GamePlugin,
  seirawanChessQuizPlugin as unknown as GamePlugin,
  annanShogiQuizPlugin as unknown as GamePlugin,
  makrukQuizPlugin as unknown as GamePlugin,
  sittuyinQuizPlugin as unknown as GamePlugin,
  shatranjQuizPlugin as unknown as GamePlugin,
  shogiQuizPlugin as unknown as GamePlugin,
  miniShogiQuizPlugin as unknown as GamePlugin,
  waShogiQuizPlugin as unknown as GamePlugin,
  heianShogiQuizPlugin as unknown as GamePlugin,
  toriShogiQuizPlugin as unknown as GamePlugin,
  kyotoShogiQuizPlugin as unknown as GamePlugin,
  microShogiQuizPlugin as unknown as GamePlugin,
  xiangqiQuizPlugin as unknown as GamePlugin,
  janggiQuizPlugin as unknown as GamePlugin,
  hnefataflMiniPlugin as unknown as GamePlugin,
  owareQuizPlugin as unknown as GamePlugin,
  kalahQuizPlugin as unknown as GamePlugin,
  cheerioYachtPlugin as unknown as GamePlugin,
  challengeYachtPlugin as unknown as GamePlugin,
  meyerDicePlugin as unknown as GamePlugin,
  sequencesDicePlugin as unknown as GamePlugin,
  sevensDicePlugin as unknown as GamePlugin,
  grandSicBoPlugin as unknown as GamePlugin,
  bankaFrancescaPlugin as unknown as GamePlugin,
  taiSaiBoPlugin as unknown as GamePlugin,
  schockenPubPlugin as unknown as GamePlugin,
  dicelandRoulettePlugin as unknown as GamePlugin,
  dudakDicePlugin as unknown as GamePlugin,
  knochelDicePlugin as unknown as GamePlugin,
  catchDicePlugin as unknown as GamePlugin,
  grabDicePlugin as unknown as GamePlugin,
  spinDicePlugin as unknown as GamePlugin,
  horseRaceDicePlugin as unknown as GamePlugin,
  countdown321Plugin as unknown as GamePlugin,
  pokerDiceFivePlugin as unknown as GamePlugin,
  mexenPubPlugin as unknown as GamePlugin,
  bidouDicePlugin as unknown as GamePlugin,
  chronogramPuzzlePlugin as unknown as GamePlugin,
  alphameticsMiniPlugin as unknown as GamePlugin,
  crossNumberPlugin as unknown as GamePlugin,
  kakurasuMiniPlugin as unknown as GamePlugin,
  fobidoshiMiniPlugin as unknown as GamePlugin,
  sashiganeMiniPlugin as unknown as GamePlugin,
  kurodokoMiniPlugin as unknown as GamePlugin,
  hamleMiniPlugin as unknown as GamePlugin,
  countryRoadMiniPlugin as unknown as GamePlugin,
  corralMiniPlugin as unknown as GamePlugin,
  tapaMiniPlugin as unknown as GamePlugin,
  litsMiniPlugin as unknown as GamePlugin,
  caveShadingPlugin as unknown as GamePlugin,
  nononoMiniPlugin as unknown as GamePlugin,
  grecoLatinPlugin as unknown as GamePlugin,
  hashiMiniPlugin as unknown as GamePlugin,
  akariMiniPlugin as unknown as GamePlugin,
  galaxiesMiniPlugin as unknown as GamePlugin,
  snakeLogicPlugin as unknown as GamePlugin,
  appleTapPlugin as unknown as GamePlugin,
  cherryBurstPlugin as unknown as GamePlugin,
  grapePopPlugin as unknown as GamePlugin,
  melonMashPlugin as unknown as GamePlugin,
  lemonZapPlugin as unknown as GamePlugin,
  kiwiClickerPlugin as unknown as GamePlugin,
  pumpkinSmashPlugin as unknown as GamePlugin,
  bubbleBurstArcadePlugin as unknown as GamePlugin,
  starTapperPlugin as unknown as GamePlugin,
  meteorTapPlugin as unknown as GamePlugin,
  cometClickerPlugin as unknown as GamePlugin,
  lightningTapPlugin as unknown as GamePlugin,
  snowflakeSnapPlugin as unknown as GamePlugin,
  acornTapPlugin as unknown as GamePlugin,
  bananaBashPlugin as unknown as GamePlugin,
  papayaPopPlugin as unknown as GamePlugin,
  blueberryBurstPlugin as unknown as GamePlugin,
  orangeTapPlugin as unknown as GamePlugin,
  limeTapPlugin as unknown as GamePlugin,
  moonTapPlugin as unknown as GamePlugin,
  synonymQuizPlugin as unknown as GamePlugin,
  antonymQuizPlugin as unknown as GamePlugin,
  homonymQuizPlugin as unknown as GamePlugin,
  rhymeQuizPlugin as unknown as GamePlugin,
  prefixQuizPlugin as unknown as GamePlugin,
  suffixQuizPlugin as unknown as GamePlugin,
  vocabularyBuilderPlugin as unknown as GamePlugin,
  wordRootsQuizPlugin as unknown as GamePlugin,
  proverbQuizPlugin as unknown as GamePlugin,
  palindromeQuizPlugin as unknown as GamePlugin,
  portmanteauQuizPlugin as unknown as GamePlugin,
  onomatopoeiaQuizPlugin as unknown as GamePlugin,
  alliterationQuizPlugin as unknown as GamePlugin,
  oxymoronQuizPlugin as unknown as GamePlugin,
  metaphorQuizPlugin as unknown as GamePlugin,
  simileQuizPlugin as unknown as GamePlugin,
  hyperboleQuizPlugin as unknown as GamePlugin,
  abbreviationQuizPlugin as unknown as GamePlugin,
  acronymDefineQuizPlugin as unknown as GamePlugin,
  spellingQuizPlugin as unknown as GamePlugin,
  queensPuzzlePlugin as unknown as GamePlugin,
  suicideSpadesPlugin as unknown as GamePlugin,
  game500Plugin as unknown as GamePlugin,
  rubiconBeziquePlugin as unknown as GamePlugin,
  trucPlugin as unknown as GamePlugin,
  klaverjassenPlugin as unknown as GamePlugin,
  jassPlugin as unknown as GamePlugin,
  frenchTarotPlugin as unknown as GamePlugin,
  tarocchiPlugin as unknown as GamePlugin,
  konigrufenPlugin as unknown as GamePlugin,
  napoleonNapPlugin as unknown as GamePlugin,
  bridgeContractPlugin as unknown as GamePlugin,
  minibridgePlugin as unknown as GamePlugin,
  honeymoonBridgePlugin as unknown as GamePlugin,
  pitchCardPlugin as unknown as GamePlugin,
  foxInTheForestPlugin as unknown as GamePlugin,
  barbuPlugin as unknown as GamePlugin,
  courtPieceRangPlugin as unknown as GamePlugin,
  mightyPlugin as unknown as GamePlugin,
  duplicateBridgePlugin as unknown as GamePlugin,
  rubberBridgePlugin as unknown as GamePlugin,
  switchPlugin as unknown as GamePlugin,
  oneCardPlugin as unknown as GamePlugin,
  shitheadPlugin as unknown as GamePlugin,
  tycoonPlugin as unknown as GamePlugin,
  scumPlugin as unknown as GamePlugin,
  capitalismPlugin as unknown as GamePlugin,
  douDizhuPlugin as unknown as GamePlugin,
  tractorPlugin as unknown as GamePlugin,
  thirteenTienLenPlugin as unknown as GamePlugin,
  chineseTenPlugin as unknown as GamePlugin,
  authorsPlugin as unknown as GamePlugin,
  happyFamiliesPlugin as unknown as GamePlugin,
  blackPeterPlugin as unknown as GamePlugin,
  donkeyPlugin as unknown as GamePlugin,
  unoStackoPlugin as unknown as GamePlugin,
  phase10Plugin as unknown as GamePlugin,
  skipBoPlugin as unknown as GamePlugin,
  michiganNewmarketPlugin as unknown as GamePlugin,
  sevensFanTanPlugin as unknown as GamePlugin,
  golf6CardPlugin as unknown as GamePlugin,
  hollywoodGinRPlugin as unknown as GamePlugin,
  roundCornerGinRPlugin as unknown as GamePlugin,
  persianRummyRPlugin as unknown as GamePlugin,
  rummy500ClassicRPlugin as unknown as GamePlugin,
  michiganRumRPlugin as unknown as GamePlugin,
  sambaCanastaRPlugin as unknown as GamePlugin,
  boliviaCanastaRPlugin as unknown as GamePlugin,
  brazilianCanastaRPlugin as unknown as GamePlugin,
  italianCanastaRPlugin as unknown as GamePlugin,
  uruguayCanastaRPlugin as unknown as GamePlugin,
  penniesHeavenRPlugin as unknown as GamePlugin,
  cubanCanastaRPlugin as unknown as GamePlugin,
  mexicanaCanastaRPlugin as unknown as GamePlugin,
  handFootRPlugin as unknown as GamePlugin,
  biribaRPlugin as unknown as GamePlugin,
  buracoRPlugin as unknown as GamePlugin,
  lobaRPlugin as unknown as GamePlugin,
  tonkRPlugin as unknown as GamePlugin,
  conquianRPlugin as unknown as GamePlugin,
  raminoRPlugin as unknown as GamePlugin,
  atlanticCityBjPlugin as unknown as GamePlugin,
  europeanBjPlugin as unknown as GamePlugin,
  multiHandBjPlugin as unknown as GamePlugin,
  doubleAttackBjPlugin as unknown as GamePlugin,
  twentyOneThreeBjPlugin as unknown as GamePlugin,
  fiveCardStudCasPlugin as unknown as GamePlugin,
  sixCardStudCasPlugin as unknown as GamePlugin,
  jackpotsDrawPlugin as unknown as GamePlugin,
  deucesWildDrawPlugin as unknown as GamePlugin,
  badeuceyDrawPlugin as unknown as GamePlugin,
  closedChinesePokerCasPlugin as unknown as GamePlugin,
  pineappleOfcCasPlugin as unknown as GamePlugin,
  cheminDeFerCasPlugin as unknown as GamePlugin,
  banqueCasPlugin as unknown as GamePlugin,
  dragonTigerCasPlugin as unknown as GamePlugin,
  videoPokerJacksPlugin as unknown as GamePlugin,
  allAmericanVpPlugin as unknown as GamePlugin,
  tensOrBetterVpPlugin as unknown as GamePlugin,
  multiHandVpFivePlugin as unknown as GamePlugin,
  redDogProgressiveCasPlugin as unknown as GamePlugin,
  backgammonStandardRacePlugin as unknown as GamePlugin,
  tavliGreekRacePlugin as unknown as GamePlugin,
  parcheesiTeamRacePlugin as unknown as GamePlugin,
  ludoQuickPlayPlugin as unknown as GamePlugin,
  parchisSpanishPlugin as unknown as GamePlugin,
  uckersRacePlugin as unknown as GamePlugin,
  nyoutYutRacePlugin as unknown as GamePlugin,
  patolliRacePlugin as unknown as GamePlugin,
  chutesAndLaddersClassicPlugin as unknown as GamePlugin,
  gameOfLifeRacePlugin as unknown as GamePlugin,
  camelUpRacePlugin as unknown as GamePlugin,
  formulaDRacePlugin as unknown as GamePlugin,
  rallymanGtRacePlugin as unknown as GamePlugin,
  downforceRacePlugin as unknown as GamePlugin,
  thunderAlleyRacePlugin as unknown as GamePlugin,
  aveCaesarRacePlugin as unknown as GamePlugin,
  pitchcarRacePlugin as unknown as GamePlugin,
  flammeRougeRacePlugin as unknown as GamePlugin,
  magnetRacingPlugin as unknown as GamePlugin,
  hollandRuleRacePlugin as unknown as GamePlugin,
  connectFourClassicClPlugin as unknown as GamePlugin,
  connectFourPop10Plugin as unknown as GamePlugin,
  connectFourPowerCheckerPlugin as unknown as GamePlugin,
  connectFourGravityFlipPlugin as unknown as GamePlugin,
  fiveInARowFreePlugin as unknown as GamePlugin,
  proOpeningGomokuPlugin as unknown as GamePlugin,
  longProOpeningGomokuPlugin as unknown as GamePlugin,
  yamaguchiOpeningPlugin as unknown as GamePlugin,
  soosyrvOpeningPlugin as unknown as GamePlugin,
  taraguchiOpeningPlugin as unknown as GamePlugin,
  ticTacToe3x3ClassicPlugin as unknown as GamePlugin,
  wildTicTacToeClPlugin as unknown as GamePlugin,
  ticTacToe4x4ClPlugin as unknown as GamePlugin,
  tic3d3x3x3Plugin as unknown as GamePlugin,
  noughtsCrossesInfinitePlugin as unknown as GamePlugin,
  gobbletClPlugin as unknown as GamePlugin,
  twelveMensMorrisClPlugin as unknown as GamePlugin,
  picariaClPlugin as unknown as GamePlugin,
  shisimaClPlugin as unknown as GamePlugin,
  daraClPlugin as unknown as GamePlugin,
  mahjongCastleKeepPlugin as unknown as GamePlugin,
  mahjongLotusBloomPlugin as unknown as GamePlugin,
  mahjongKoiFishPlugin as unknown as GamePlugin,
  mahjongBambooGrovePlugin as unknown as GamePlugin,
  mahjongZenGardenPlugin as unknown as GamePlugin,
  mahjongSakuraFallPlugin as unknown as GamePlugin,
  mahjongTsunamiWavePlugin as unknown as GamePlugin,
  mahjongMtFujiPlugin as unknown as GamePlugin,
  mahjongTempleBellPlugin as unknown as GamePlugin,
  mahjongPaperCranePlugin as unknown as GamePlugin,
  mahjongTeaHousePlugin as unknown as GamePlugin,
  mahjongJadeMountainPlugin as unknown as GamePlugin,
  mahjongPhoenixFeatherPlugin as unknown as GamePlugin,
  mahjongTigerClawPlugin as unknown as GamePlugin,
  mahjongDragonTailPlugin as unknown as GamePlugin,
  mahjongEmperorThronePlugin as unknown as GamePlugin,
  mahjongStoneLanternPlugin as unknown as GamePlugin,
  mahjongToriiGatePlugin as unknown as GamePlugin,
  mahjongPavilionRoofPlugin as unknown as GamePlugin,
  mahjongPlumBlossomPlugin as unknown as GamePlugin,
  mahjongRiverStreamPlugin as unknown as GamePlugin,
  mahjongCloudNinePlugin as unknown as GamePlugin,
  mahjongForbiddenCityPlugin as unknown as GamePlugin,
  mahjongSilkRoadPlugin as unknown as GamePlugin,
  mahjongGalaxySpiralPlugin as unknown as GamePlugin,
  tienLenQuizPlugin as unknown as GamePlugin,
  douDizhuQuizPlugin as unknown as GamePlugin,
  shengJiQuizPlugin as unknown as GamePlugin,
  zhengShangyouQuizPlugin as unknown as GamePlugin,
  ganjifaQuizPlugin as unknown as GamePlugin,
  tongitsQuizPlugin as unknown as GamePlugin,
  pusoyPokerQuizPlugin as unknown as GamePlugin,
  menkoQuizPlugin as unknown as GamePlugin,
  sashimiQuizPlugin as unknown as GamePlugin,
  takenokoQuizPlugin as unknown as GamePlugin,
  tsuroQuizPlugin as unknown as GamePlugin,
  ceeLoQuizPlugin as unknown as GamePlugin,
  oichoKabuQuizPlugin as unknown as GamePlugin,
  tansanQuizPlugin as unknown as GamePlugin,
  haikuDiceQuizPlugin as unknown as GamePlugin,
  carcassonneInnsCathedralsPlugin as unknown as GamePlugin,
  carcassonneRiverPlugin as unknown as GamePlugin,
  carcassonneTowerBuildPlugin as unknown as GamePlugin,
  carcassonnePrincessDragonPlugin as unknown as GamePlugin,
  carcassonneTradersBuildersPlugin as unknown as GamePlugin,
  carcassonneAbbeyMayorPlugin as unknown as GamePlugin,
  carcassonneHillsSheepPlugin as unknown as GamePlugin,
  queendominoTaxPlugin as unknown as GamePlugin,
  kingdominoDuelPlugin as unknown as GamePlugin,
  kingdominoGiantsPlugin as unknown as GamePlugin,
  azulSintraPlugin as unknown as GamePlugin,
  azulQueensGardenPlugin as unknown as GamePlugin,
  sagradaLifePlugin as unknown as GamePlugin,
  patchworkExpressGamePlugin as unknown as GamePlugin,
  patchworkDoodleQuiltPlugin as unknown as GamePlugin,
  tokaidoCrossroadsPlugin as unknown as GamePlugin,
  blokusClassicPlugin as unknown as GamePlugin,
  quadropolisCityPlugin as unknown as GamePlugin,
  meadowPathsPlugin as unknown as GamePlugin,
  fjordsClaimPlugin as unknown as GamePlugin,
  railroadInkYellowPlugin as unknown as GamePlugin,
  railroadInkGreenPlugin as unknown as GamePlugin,
  railroadInkChallengePlugin as unknown as GamePlugin,
  railroadInkNeonPlugin as unknown as GamePlugin,
  welcomeToClassicPlugin as unknown as GamePlugin,
  welcomeDinolandPlugin as unknown as GamePlugin,
  welcomeLasVegasPlugin as unknown as GamePlugin,
  welcomeMoonPlugin as unknown as GamePlugin,
  cartographersHeroesPlugin as unknown as GamePlugin,
  cartographersMonstersPlugin as unknown as GamePlugin,
  doppeltCleverPlugin as unknown as GamePlugin,
  cleverHochVierPlugin as unknown as GamePlugin,
  fleetEnginePlugin as unknown as GamePlugin,
  rajasCharmersPlugin as unknown as GamePlugin,
  trekAmericasPlugin as unknown as GamePlugin,
  yokohamaDicePlugin as unknown as GamePlugin,
  wingspanDiceRollPlugin as unknown as GamePlugin,
  laGranjaSiestaPlugin as unknown as GamePlugin,
  ageOfSteamRwPlugin as unknown as GamePlugin,
  miniRailsRwPlugin as unknown as GamePlugin,
  dominionIntriguePlugin as unknown as GamePlugin,
  dominionSeasidePlugin as unknown as GamePlugin,
  dominionProsperityPlugin as unknown as GamePlugin,
  dominionAdventuresPlugin as unknown as GamePlugin,
  clankInSpacePlugin as unknown as GamePlugin,
  aeonsEndLegacyPlugin as unknown as GamePlugin,
  mageKnightCardPlugin as unknown as GamePlugin,
  thunderstoneQuestPlugin as unknown as GamePlugin,
  legendaryMarvelPlugin as unknown as GamePlugin,
  tashKalarArenaPlugin as unknown as GamePlugin,
  sorcererCityBuildPlugin as unknown as GamePlugin,
  keyforgeArchonsPlugin as unknown as GamePlugin,
  summonerWarsGridPlugin as unknown as GamePlugin,
  battleconIndinesPlugin as unknown as GamePlugin,
  oneDeckGalaxyPlugin as unknown as GamePlugin,
  tantoCuoreMaidsPlugin as unknown as GamePlugin,
  dungeonLordsTrapPlugin as unknown as GamePlugin,
  fourSoulsIsaacPlugin as unknown as GamePlugin,
  undauntedNormandyPlugin as unknown as GamePlugin,
  undauntedNorthAfricaPlugin as unknown as GamePlugin,
  pandemicBasePlugin as unknown as GamePlugin,
  pandemicHotZoneNaPlugin as unknown as GamePlugin,
  pandemicFallOfRomePlugin as unknown as GamePlugin,
  pandemicIberiaPlugin as unknown as GamePlugin,
  pandemicInTheLabPlugin as unknown as GamePlugin,
  pandemicLegacyS1Plugin as unknown as GamePlugin,
  pandemicLegacyS2Plugin as unknown as GamePlugin,
  forbiddenJungleCoopPlugin as unknown as GamePlugin,
  spiritIslandJaggedPlugin as unknown as GamePlugin,
  spiritIslandNaturePlugin as unknown as GamePlugin,
  lordOfRingsLcgPlugin as unknown as GamePlugin,
  grizzledCoopPlugin as unknown as GamePlugin,
  grizzledOrdersPlugin as unknown as GamePlugin,
  aeonsEndWarEternalPlugin as unknown as GamePlugin,
  sentinelsDefinitivePlugin as unknown as GamePlugin,
  spaceAlertCoopPlugin as unknown as GamePlugin,
  robinsonCrusoeCoopPlugin as unknown as GamePlugin,
  magicMazeMaxSecurityPlugin as unknown as GamePlugin,
  letterJamCoopPlugin as unknown as GamePlugin,
  burgleBrosHeistPlugin as unknown as GamePlugin,
  pictionaryManiaQuizPlugin as unknown as GamePlugin,
  pictionaryCardGameQuizPlugin as unknown as GamePlugin,
  pictionaryManQuizPlugin as unknown as GamePlugin,
  telestrationsAfterDarkQuizPlugin as unknown as GamePlugin,
  telestrationsUpsideQuizPlugin as unknown as GamePlugin,
  classicCharadesQuizPlugin as unknown as GamePlugin,
  trivialPursuitGenusQuizPlugin as unknown as GamePlugin,
  trivialPursuitNinetiesQuizPlugin as unknown as GamePlugin,
  trivialPursuitDisneyQuizPlugin as unknown as GamePlugin,
  trivialPursuitStarwarsQuizPlugin as unknown as GamePlugin,
  trivialPursuitPotterQuizPlugin as unknown as GamePlugin,
  trivialPursuitOfficeQuizPlugin as unknown as GamePlugin,
  trivialPursuitFriendsQuizPlugin as unknown as GamePlugin,
  trivialPursuitTeamQuizPlugin as unknown as GamePlugin,
  applesToApplesKidsQuizPlugin as unknown as GamePlugin,
  applesBigPictureQuizPlugin as unknown as GamePlugin,
  monikersSeriousQuizPlugin as unknown as GamePlugin,
  thingAboutThingsQuizPlugin as unknown as GamePlugin,
  loadedQuestionsQuizPlugin as unknown as GamePlugin,
  fibbage2QuizPlugin as unknown as GamePlugin,
  fibbage3QuizPlugin as unknown as GamePlugin,
  fibbageXlQuizPlugin as unknown as GamePlugin,
  teeKoQuizPlugin as unknown as GamePlugin,
  jackboxPack1QuizPlugin as unknown as GamePlugin,
  jackboxPack7QuizPlugin as unknown as GamePlugin,
  stockpileCorruptionPlugin as unknown as GamePlugin,
  agricolaCreaturesPlugin as unknown as GamePlugin,
  agricolaCardOnlyPlugin as unknown as GamePlugin,
  foodChainMagnatePlugin as unknown as GamePlugin,
  powerGridCardPlugin as unknown as GamePlugin,
  splendorMarvelPlugin as unknown as GamePlugin,
  splendorDunePlugin as unknown as GamePlugin,
  centurySpiceRoadPlugin as unknown as GamePlugin,
  centuryEasternWondersPlugin as unknown as GamePlugin,
  centuryGolemEditionPlugin as unknown as GamePlugin,
  brassLancashirePlugin as unknown as GamePlugin,
  suburbiaIncPlugin as unknown as GamePlugin,
  paleoSurvivalPlugin as unknown as GamePlugin,
  architectsWestPlugin as unknown as GamePlugin,
  viticultureWinePlugin as unknown as GamePlugin,
  mastermind5peg8colorPlugin as unknown as GamePlugin,
  mastermind6peg10colorPlugin as unknown as GamePlugin,
  mastermindNoRepeatsPlugin as unknown as GamePlugin,
  tempelTrapPlugin as unknown as GamePlugin,
  clueMasterDetectivePlugin as unknown as GamePlugin,
  clueSuspectPlugin as unknown as GamePlugin,
  mysteryAbbeyPlugin as unknown as GamePlugin,
  cryptidDeductionPlugin as unknown as GamePlugin,
  mysteriumVisionsPlugin as unknown as GamePlugin,
  dixitCluePlugin as unknown as GamePlugin,
  theMindCoopPlugin as unknown as GamePlugin,
  kabulSpielcafePlugin as unknown as GamePlugin,
  conceptDeductionPlugin as unknown as GamePlugin,
  decryptoCodesPlugin as unknown as GamePlugin,
  codenamesPicturesPlugin as unknown as GamePlugin,
  codenamesXxlPlugin as unknown as GamePlugin,
  spyfallTimeTravelPlugin as unknown as GamePlugin,
  chroniclesOfCrimePlugin as unknown as GamePlugin,
  awkwardGuestsPlugin as unknown as GamePlugin,
  deadlyDowagersPlugin as unknown as GamePlugin,
  disneyMemoryPlugin as unknown as GamePlugin,
  animalsMemoryPlugin as unknown as GamePlugin,
  spotItJrPlugin as unknown as GamePlugin,
  spotItSplashPlugin as unknown as GamePlugin,
  spotItDinoPlugin as unknown as GamePlugin,
  spotItHarryPotterPlugin as unknown as GamePlugin,
  spotIt50PlusPlugin as unknown as GamePlugin,
  dobbleEuropeanPlugin as unknown as GamePlugin,
  dobbleKidsPlugin as unknown as GamePlugin,
  dobbleCampingPlugin as unknown as GamePlugin,
  setJuniorPlugin as unknown as GamePlugin,
  supersetGamePlugin as unknown as GamePlugin,
  concentrationSpeedPlugin as unknown as GamePlugin,
  cortexChallengePlugin as unknown as GamePlugin,
  cortexChallenge2Plugin as unknown as GamePlugin,
  simonSwipePlugin as unknown as GamePlugin,
  simonAirPlugin as unknown as GamePlugin,
  blinkSpeedPlugin as unknown as GamePlugin,
  egyptianRatScrewPlugin as unknown as GamePlugin,
  zickeZackePlugin as unknown as GamePlugin,
  marryBoffKillPlugin as unknown as GamePlugin,
  cardAdventureMiniPlugin as unknown as GamePlugin,
  lewdleCleanPlugin as unknown as GamePlugin,
  taylordleSwiftPlugin as unknown as GamePlugin,
  weeklyChess960Plugin as unknown as GamePlugin,
  fluxxRotatingPlugin as unknown as GamePlugin,
  fluxxOriginalMiniPlugin as unknown as GamePlugin,
  fluxxStarPlugin as unknown as GamePlugin,
  fluxxZombiePlugin as unknown as GamePlugin,
  fluxxPiratePlugin as unknown as GamePlugin,
  fluxxCthulhuPlugin as unknown as GamePlugin,
  fluxxMontyPythonPlugin as unknown as GamePlugin,
  parodyOpolyPlugin as unknown as GamePlugin,
  cheatingMothCardPlugin as unknown as GamePlugin,
  jokingHazardCardPlugin as unknown as GamePlugin,
  drunkStonedStupidPlugin as unknown as GamePlugin,
  dilemmaDeckPlugin as unknown as GamePlugin,
  cockroachBluffPlugin as unknown as GamePlugin,
  unstableUnicornsMiniPlugin as unknown as GamePlugin,
  tacoBurritoCardPlugin as unknown as GamePlugin,
  stratBaseballPlugin as unknown as GamePlugin,
  stratFootballPlugin as unknown as GamePlugin,
  stratHockeyPlugin as unknown as GamePlugin,
  stratBasketballPlugin as unknown as GamePlugin,
  apbaBaseballPlugin as unknown as GamePlugin,
  apbaFootballPlugin as unknown as GamePlugin,
  replayBaseballPlugin as unknown as GamePlugin,
  pursuePennantPlugin as unknown as GamePlugin,
  negamcoBaseballPlugin as unknown as GamePlugin,
  diceFormulaDePlugin as unknown as GamePlugin,
  diceRallymanDirtPlugin as unknown as GamePlugin,
  diceThunderPitPlugin as unknown as GamePlugin,
  diceGrandPrixF1Plugin as unknown as GamePlugin,
  dice301DartsPlugin as unknown as GamePlugin,
  diceFatBoyDartsPlugin as unknown as GamePlugin,
  diceGulfDartsPlugin as unknown as GamePlugin,
  diceFlyFishingPlugin as unknown as GamePlugin,
  diceDeepSeaFishingPlugin as unknown as GamePlugin,
  diceIceFishingPlugin as unknown as GamePlugin,
  diceMmaPlugin as unknown as GamePlugin,
  bejeweledClassicMiniPlugin as unknown as GamePlugin,
  bejeweledStarsMiniPlugin as unknown as GamePlugin,
  candyCrushMiniPlugin as unknown as GamePlugin,
  candySodaMiniPlugin as unknown as GamePlugin,
  candyJellyMiniPlugin as unknown as GamePlugin,
  candyFriendsMiniPlugin as unknown as GamePlugin,
  match3HexMiniPlugin as unknown as GamePlugin,
  match3TriangleMiniPlugin as unknown as GamePlugin,
  puzzleDragonsMiniPlugin as unknown as GamePlugin,
  puzzleQuestMiniPlugin as unknown as GamePlugin,
  superColumnsMiniPlugin as unknown as GamePlugin,
  puyoTsuMiniPlugin as unknown as GamePlugin,
  puyoSunMiniPlugin as unknown as GamePlugin,
  puyoFeverMiniPlugin as unknown as GamePlugin,
  wariosWoodsMiniPlugin as unknown as GamePlugin,
  pokepuzzleLeagueMiniPlugin as unknown as GamePlugin,
  moneyIdolExchangerPlugin as unknown as GamePlugin,
  tripleTownMergePlugin as unknown as GamePlugin,
  mergeDragonsMiniPlugin as unknown as GamePlugin,
  mergeMansionMiniPlugin as unknown as GamePlugin,
  darts301ClassicPlugin as unknown as GamePlugin,
  darts701ClassicPlugin as unknown as GamePlugin,
  dartsCricketClassicPlugin as unknown as GamePlugin,
  dartsAroundClockPlugin as unknown as GamePlugin,
  dartsHalveItPlugin as unknown as GamePlugin,
  dartsBaseballClassicPlugin as unknown as GamePlugin,
  dartsKillerClassicPlugin as unknown as GamePlugin,
  dartsGolfClassicPlugin as unknown as GamePlugin,
  pool9ballPlugin as unknown as GamePlugin,
  pool10ballPlugin as unknown as GamePlugin,
  poolStraight141Plugin as unknown as GamePlugin,
  poolBankPlugin as unknown as GamePlugin,
  poolCutthroatPlugin as unknown as GamePlugin,
  snookerSkillPlugin as unknown as GamePlugin,
  snookerSixRedPlugin as unknown as GamePlugin,
  bowling9pinPlugin as unknown as GamePlugin,
  bowlingCandlepinPlugin as unknown as GamePlugin,
  bowlingDuckpinPlugin as unknown as GamePlugin,
  bocceSkillPlugin as unknown as GamePlugin,
  miniGolf18Plugin as unknown as GamePlugin,
  starforgedVowsPlugin as unknown as GamePlugin,
  sunderedIslesSagaPlugin as unknown as GamePlugin,
  forTheDramaPlugin as unknown as GamePlugin,
  forTheCrownSagaPlugin as unknown as GamePlugin,
  aloneAmongStarsCardPlugin as unknown as GamePlugin,
  wretchedSwordPlugin as unknown as GamePlugin,
  wretchedForestPlugin as unknown as GamePlugin,
  wretchedZombiePlugin as unknown as GamePlugin,
  wretchedMagusPlugin as unknown as GamePlugin,
  artefactHistoryPlugin as unknown as GamePlugin,
  apothecariaSeasonsPlugin as unknown as GamePlugin,
  tslSoloQuestPlugin as unknown as GamePlugin,
  ironswornDelveQuestPlugin as unknown as GamePlugin,
  deadAreComingLogPlugin as unknown as GamePlugin,
  dungeonHeroCardsPlugin as unknown as GamePlugin,
  mythicEmulatorOraclePlugin as unknown as GamePlugin,
  scarletHeroesQuestPlugin as unknown as GamePlugin,
  quillGothicLettersPlugin as unknown as GamePlugin,
  exNovoMapmakerPlugin as unknown as GamePlugin,
  remnantsFragmentsPlugin as unknown as GamePlugin,
  sushiGoPartyMenuPlugin as unknown as GamePlugin,
  sevenWondersLeadersPlugin as unknown as GamePlugin,
  sevenWondersCitiesPlugin as unknown as GamePlugin,
  sevenWondersBabelPlugin as unknown as GamePlugin,
  sevenWondersEdificePlugin as unknown as GamePlugin,
  sevenWondersArmadaPlugin as unknown as GamePlugin,
  sevenWondersDuelPyramidPlugin as unknown as GamePlugin,
  duelPantheonGodsPlugin as unknown as GamePlugin,
  duelAgoraSenatePlugin as unknown as GamePlugin,
  sevenWondersArchitectsDraftPlugin as unknown as GamePlugin,
  wonderfulWorldDraftPlugin as unknown as GamePlugin,
  wonderfulWorldCorruptionPlugin as unknown as GamePlugin,
  wonderfulWorldWarPlugin as unknown as GamePlugin,
  amongStarsStationPlugin as unknown as GamePlugin,
  bibliosDiceDraftPlugin as unknown as GamePlugin,
  bloodRageVikingsPlugin as unknown as GamePlugin,
  tidesOfMadnessDraftPlugin as unknown as GamePlugin,
  seasonsMagesDraftPlugin as unknown as GamePlugin,
  wingspanEuropeanDraftPlugin as unknown as GamePlugin,
  wingspanOceaniaDraftPlugin as unknown as GamePlugin,
  cribbageCrashPlugin as unknown as GamePlugin,
  cribbageLurchPlugin as unknown as GamePlugin,
  cribbageSkunkPlugin as unknown as GamePlugin,
  cribbageDoubleSkunkPlugin as unknown as GamePlugin,
  cribbageShotgunPlugin as unknown as GamePlugin,
  cribbageSkunkedRubberPlugin as unknown as GamePlugin,
  cribbageMugginsVarPlugin as unknown as GamePlugin,
  nineMensMorrisPubPlugin as unknown as GamePlugin,
  shuffleboardTablePlugin as unknown as GamePlugin,
  skittlesEnglishPlugin as unknown as GamePlugin,
  skittlesRubberPlugin as unknown as GamePlugin,
  skittlesLongAlleyPlugin as unknown as GamePlugin,
  skittlesWestCountryPlugin as unknown as GamePlugin,
  ninepinsClassicPlugin as unknown as GamePlugin,
  quoitsEnglishPlugin as unknown as GamePlugin,
  quoitsScotsPlugin as unknown as GamePlugin,
  napWellingtonPlugin as unknown as GamePlugin,
  napBlucherPlugin as unknown as GamePlugin,
  bragThreeCardPlugin as unknown as GamePlugin,
  popeJoanPlugin as unknown as GamePlugin,
  yinshRingsPlugin as unknown as GamePlugin,
  zertzMarblesPlugin as unknown as GamePlugin,
  tamskTimedPlugin as unknown as GamePlugin,
  punctLinePlugin as unknown as GamePlugin,
  tzaarStackPlugin as unknown as GamePlugin,
  onitamaCardsPlugin as unknown as GamePlugin,
  martianChessPyramidsPlugin as unknown as GamePlugin,
  icehouseStacksPlugin as unknown as GamePlugin,
  zendoKoanPlugin as unknown as GamePlugin,
  carromFlickPlugin as unknown as GamePlugin,
  brusselsSproutsPlugin as unknown as GamePlugin,
  sproutsClassicPlugin as unknown as GamePlugin,
  hackenbushEdgesPlugin as unknown as GamePlugin,
  oukChatrangPlugin as unknown as GamePlugin,
  shatarMongolianPlugin as unknown as GamePlugin,
  banqiDarkPlugin as unknown as GamePlugin,
  miniXiangqiPlugin as unknown as GamePlugin,
  ayoayoPlugin as unknown as GamePlugin,
  bohnenspielPlugin as unknown as GamePlugin,
  mangalaArabianPlugin as unknown as GamePlugin,
  travelersPatiencePlugin as unknown as GamePlugin,
  towerLondonSoliPlugin as unknown as GamePlugin,
  vegasKlondikePlugin as unknown as GamePlugin,
  batsfordPatPlugin as unknown as GamePlugin,
  duchessPatPlugin as unknown as GamePlugin,
  moosehideYukonPlugin as unknown as GamePlugin,
  eagleWingPatPlugin as unknown as GamePlugin,
  aboveAndBelowPatPlugin as unknown as GamePlugin,
  headsTailsPatPlugin as unknown as GamePlugin,
  kingsQueensPatPlugin as unknown as GamePlugin,
  florentineSoliPlugin as unknown as GamePlugin,
  carltonSoliPlugin as unknown as GamePlugin,
  quiltPatPlugin as unknown as GamePlugin,
  midnightOilPatPlugin as unknown as GamePlugin,
  bisleyKingPlugin as unknown as GamePlugin,
  kingAlbertPatPlugin as unknown as GamePlugin,
  quadrupleAlliancePatPlugin as unknown as GamePlugin,
  fourteenOutPatPlugin as unknown as GamePlugin,
  doubletsPatPlugin as unknown as GamePlugin,
  carpetSoliPlugin as unknown as GamePlugin,
  spitOceanCasPlugin as unknown as GamePlugin,
  crazyPineappleCasPlugin as unknown as GamePlugin,
  lazyPineappleCasPlugin as unknown as GamePlugin,
  courchevelCasPlugin as unknown as GamePlugin,
  omahaSixCardHiPlugin as unknown as GamePlugin,
  sevenCardStudHiLoCasPlugin as unknown as GamePlugin,
  mississippiStudCasPlugin as unknown as GamePlugin,
  jackpotsPokerPlugin as unknown as GamePlugin,
  anacondaCasPlugin as unknown as GamePlugin,
  badeuceyCasPlugin as unknown as GamePlugin,
  badaceyCasPlugin as unknown as GamePlugin,
  horseCasPlugin as unknown as GamePlugin,
  hoseCasPlugin as unknown as GamePlugin,
  ofcPineappleCasPlugin as unknown as GamePlugin,
  headsUpBjPlugin as unknown as GamePlugin,
  multiHandVpThreePlugin as unknown as GamePlugin,
  fortunePaiGowCasPlugin as unknown as GamePlugin,
  paiGowTilesCasPlugin as unknown as GamePlugin,
  casinoFaroCasPlugin as unknown as GamePlugin,
  flushPokerCasPlugin as unknown as GamePlugin,
  classicCanastaRPlugin as unknown as GamePlugin,
  canastaCalienteRPlugin as unknown as GamePlugin,
  canastaMexicanaRPlugin as unknown as GamePlugin,
  canastaJuniorRPlugin as unknown as GamePlugin,
  canastaSpeedRPlugin as unknown as GamePlugin,
  pinochleRummyRPlugin as unknown as GamePlugin,
  wildCardRummyRPlugin as unknown as GamePlugin,
  skarneyRPlugin as unknown as GamePlugin,
  shedRummyRPlugin as unknown as GamePlugin,
  progressiveRummyRPlugin as unknown as GamePlugin,
  quickRummyRPlugin as unknown as GamePlugin,
  rummyRoyaleRPlugin as unknown as GamePlugin,
  nineFiveTwoRPlugin as unknown as GamePlugin,
  papluRPlugin as unknown as GamePlugin,
  scala40RPlugin as unknown as GamePlugin,
  dealsRummyRPlugin as unknown as GamePlugin,
  pointsRummyRPlugin as unknown as GamePlugin,
  indianMarriageRPlugin as unknown as GamePlugin,
  rummyTilesRPlugin as unknown as GamePlugin,
  michiganRumStopsRPlugin as unknown as GamePlugin,
  briscolonePlugin as unknown as GamePlugin,
  cirullaPlugin as unknown as GamePlugin,
  scopaDiQuindiciPlugin as unknown as GamePlugin,
  tressetteNonPrenderePlugin as unknown as GamePlugin,
  tressetteMortoPlugin as unknown as GamePlugin,
  calabresellaPlugin as unknown as GamePlugin,
  terziglioPlugin as unknown as GamePlugin,
  madrassoTrickPlugin as unknown as GamePlugin,
  marafoneBeccaccinoPlugin as unknown as GamePlugin,
  mariashPlugin as unknown as GamePlugin,
  licitovanyMariasPlugin as unknown as GamePlugin,
  voliMariasPlugin as unknown as GamePlugin,
  ramschSkatPlugin as unknown as GamePlugin,
  bauernskatPlugin as unknown as GamePlugin,
  officersSkatPlugin as unknown as GamePlugin,
  wenzPlugin as unknown as GamePlugin,
  geierPlugin as unknown as GamePlugin,
  soloSchafkopfPlugin as unknown as GamePlugin,
  ultiHungarianPlugin as unknown as GamePlugin,
  tarokyPlugin as unknown as GamePlugin,
  yahtzeeBossDicePlugin as unknown as GamePlugin,
  yahtzeeFreeForAllPlugin as unknown as GamePlugin,
  openFaceYahtzeePlugin as unknown as GamePlugin,
  tabulaGamePlugin as unknown as GamePlugin,
  ludus12Plugin as unknown as GamePlugin,
  trictracPlugin as unknown as GamePlugin,
  glucksradPlugin as unknown as GamePlugin,
  strikeArenaPlugin as unknown as GamePlugin,
  buttonMenDuelPlugin as unknown as GamePlugin,
  rhinoDicePlugin as unknown as GamePlugin,
  tumblinFlickPlugin as unknown as GamePlugin,
  grabDiceGamePlugin as unknown as GamePlugin,
  horseRace2d6Plugin as unknown as GamePlugin,
  heartsLetterDicePlugin as unknown as GamePlugin,
  threeTwoOneDownPlugin as unknown as GamePlugin,
  sequenceSixPlugin as unknown as GamePlugin,
  mexicanPubDicePlugin as unknown as GamePlugin,
  meyerBluffPlugin as unknown as GamePlugin,
  schummelnBluffPlugin as unknown as GamePlugin,
  dudakTavernPlugin as unknown as GamePlugin,
  canadianCheckers12Plugin as unknown as GamePlugin,
  poolCheckersAmPlugin as unknown as GamePlugin,
  thaiDraughtsPlugin as unknown as GamePlugin,
  russianCheckersFlyingPlugin as unknown as GamePlugin,
  crodaItalianPlugin as unknown as GamePlugin,
  dameoFreelingPlugin as unknown as GamePlugin,
  tawlbwrddWelshPlugin as unknown as GamePlugin,
  seaBattleTaflPlugin as unknown as GamePlugin,
  omwesoUgandaPlugin as unknown as GamePlugin,
  toguzKumalak92Plugin as unknown as GamePlugin,
  pallanguzhiTamilPlugin as unknown as GamePlugin,
  dvonnStackPlugin as unknown as GamePlugin,
  tzaarStonesPlugin as unknown as GamePlugin,
  gipfOriginalPlugin as unknown as GamePlugin,
  tamskSandPlugin as unknown as GamePlugin,
  qawaleStackPlugin as unknown as GamePlugin,
  fanoronaMalagasyPlugin as unknown as GamePlugin,
  zammaAfricanPlugin as unknown as GamePlugin,
  yoteWestPlugin as unknown as GamePlugin,
  yavalath3Plugin as unknown as GamePlugin,
  samuraiSudokuMiniPlugin as unknown as GamePlugin,
  tridokuMiniPlugin as unknown as GamePlugin,
  hexadokuMiniPlugin as unknown as GamePlugin,
  sudoku25Plugin as unknown as GamePlugin,
  sudoku16Plugin as unknown as GamePlugin,
  offsetSudokuMiniPlugin as unknown as GamePlugin,
  tripodSudokuMiniPlugin as unknown as GamePlugin,
  crossSudokuMiniPlugin as unknown as GamePlugin,
  flowerSudokuMiniPlugin as unknown as GamePlugin,
  windokuPlusMiniPlugin as unknown as GamePlugin,
  quadrupleClueSudokuPlugin as unknown as GamePlugin,
  sudoku159Plugin as unknown as GamePlugin,
  crypticSudokuPlugin as unknown as GamePlugin,
  girandolaSudokuPlugin as unknown as GamePlugin,
  skyscraperSudokuPlugin as unknown as GamePlugin,
  tetrominoSudokuPlugin as unknown as GamePlugin,
  offsetKillerSudokuPlugin as unknown as GamePlugin,
  diagonalKillerPlugin as unknown as GamePlugin,
  surplusSudokuPlugin as unknown as GamePlugin,
  kakuroCrossSumsPlugin as unknown as GamePlugin,
  diceStratFootballPlugin as unknown as GamePlugin,
  diceStratHockeyPlugin as unknown as GamePlugin,
  diceStratBasketballPlugin as unknown as GamePlugin,
  diceStratArenaPlugin as unknown as GamePlugin,
  diceApbaBasketballPlugin as unknown as GamePlugin,
  diceReplayBaseballDetailPlugin as unknown as GamePlugin,
  dicePursuePennantPlugin as unknown as GamePlugin,
  diceBaseballHighlightsPlugin as unknown as GamePlugin,
  diceFantasyFootballDraftPlugin as unknown as GamePlugin,
  diceFantasyBaseballDraftPlugin as unknown as GamePlugin,
  diceFantasyBasketballDraftPlugin as unknown as GamePlugin,
  diceSnookerMatchPlugin as unknown as GamePlugin,
  diceRussianPyramidPlugin as unknown as GamePlugin,
  diceKaisaPlugin as unknown as GamePlugin,
  diceCurlingStonesPlugin as unknown as GamePlugin,
  diceBicycleVelodromePlugin as unknown as GamePlugin,
  diceTourDeFrancePlugin as unknown as GamePlugin,
  diceBoxingKoPlugin as unknown as GamePlugin,
  diceHorseRacingCardPlugin as unknown as GamePlugin,
  diceBelmontStakesPlugin as unknown as GamePlugin,
  spikeTapPlugin as unknown as GamePlugin,
  moleMashPlugin as unknown as GamePlugin,
  pixelPopPlugin as unknown as GamePlugin,
  starShootPlugin as unknown as GamePlugin,
  rocketPopPlugin as unknown as GamePlugin,
  laserZapPlugin as unknown as GamePlugin,
  candyTapPlugin as unknown as GamePlugin,
  eggCatchPlugin as unknown as GamePlugin,
  bugSquashPlugin as unknown as GamePlugin,
  birdTapPlugin as unknown as GamePlugin,
  cloudPopPlugin as unknown as GamePlugin,
  heartPopPlugin as unknown as GamePlugin,
  coinGrabPlugin as unknown as GamePlugin,
  leafFallPlugin as unknown as GamePlugin,
  waveTapPlugin as unknown as GamePlugin,
  snowflakeTapPlugin as unknown as GamePlugin,
  sparkTapPlugin as unknown as GamePlugin,
  honeyTapPlugin as unknown as GamePlugin,
  slimeSplatPlugin as unknown as GamePlugin,
  ufoZapPlugin as unknown as GamePlugin,
  vowelQuizPlugin as unknown as GamePlugin,
  consonantQuizPlugin as unknown as GamePlugin,
  silentLetterQuizPlugin as unknown as GamePlugin,
  hyphenQuizPlugin as unknown as GamePlugin,
  prepositionQuizPlugin as unknown as GamePlugin,
  pronounQuizPlugin as unknown as GamePlugin,
  adverbQuizPlugin as unknown as GamePlugin,
  adjectiveQuizPlugin as unknown as GamePlugin,
  verbQuizPlugin as unknown as GamePlugin,
  nounQuizPlugin as unknown as GamePlugin,
  acronymMiniPlugin as unknown as GamePlugin,
  contractionQuizPlugin as unknown as GamePlugin,
  alliterationPickPlugin as unknown as GamePlugin,
  onomatopoeiaPickPlugin as unknown as GamePlugin,
  synonymPickPlugin as unknown as GamePlugin,
  antonymPickPlugin as unknown as GamePlugin,
  homonymPickPlugin as unknown as GamePlugin,
  homophonePickPlugin as unknown as GamePlugin,
  eponymQuizPlugin as unknown as GamePlugin,
  neologismQuizPlugin as unknown as GamePlugin,
  toponymQuizPlugin as unknown as GamePlugin,
  clicheQuizPlugin as unknown as GamePlugin,
  tautologyQuizPlugin as unknown as GamePlugin,
  collocationQuizPlugin as unknown as GamePlugin,
  spoonerismQuizPlugin as unknown as GamePlugin,
  mondegreenQuizPlugin as unknown as GamePlugin,
  malapropismQuizPlugin as unknown as GamePlugin,
  pluralsQuizPlugin as unknown as GamePlugin,
  tensesQuizPlugin as unknown as GamePlugin,
  comparativeQuizPlugin as unknown as GamePlugin,
  superlativeQuizPlugin as unknown as GamePlugin,
  articleQuizPlugin as unknown as GamePlugin,
  doubleLetterQuizPlugin as unknown as GamePlugin,
  silentEQuizPlugin as unknown as GamePlugin,
  heteronymQuizPlugin as unknown as GamePlugin,
  capitonymQuizPlugin as unknown as GamePlugin,
  zhengShangyouShedPlugin as unknown as GamePlugin,
  tractorShengJiPlugin as unknown as GamePlugin,
  authorsShedPlugin as unknown as GamePlugin,
  spoonsShedPlugin as unknown as GamePlugin,
  pitShedPlugin as unknown as GamePlugin,
  snipSnapShedPlugin as unknown as GamePlugin,
  bSCheatShedPlugin as unknown as GamePlugin,
  golfFourShedPlugin as unknown as GamePlugin,
  golfNineShedPlugin as unknown as GamePlugin,
  beggarNeighbourShedPlugin as unknown as GamePlugin,
  beatNeighbourShedPlugin as unknown as GamePlugin,
  doubleWarShedPlugin as unknown as GamePlugin,
  persianWarShedPlugin as unknown as GamePlugin,
  blitzThirtyOneShedPlugin as unknown as GamePlugin,
  sevenTwentySevenShedPlugin as unknown as GamePlugin,
  ristiklappiShedPlugin as unknown as GamePlugin,
  svoyiKoziriShedPlugin as unknown as GamePlugin,
  podkidnoyDurakShedPlugin as unknown as GamePlugin,
  perevodnoyDurakShedPlugin as unknown as GamePlugin,
  sviyiShedPlugin as unknown as GamePlugin,
  spanish21CasPlugin as unknown as GamePlugin,
  pontoonCasPlugin as unknown as GamePlugin,
  blackjackSwitchCasPlugin as unknown as GamePlugin,
  europeanBjCasPlugin as unknown as GamePlugin,
  atlanticCityBjCasPlugin as unknown as GamePlugin,
  chineseBlackjackCasPlugin as unknown as GamePlugin,
  multiHandVpTenPlugin as unknown as GamePlugin,
  superTimesPayCasPlugin as unknown as GamePlugin,
  doubleDoubleBonusCasPlugin as unknown as GamePlugin,
  allAmericanVpCasPlugin as unknown as GamePlugin,
  jokerPokerCasPlugin as unknown as GamePlugin,
  tensOrBetterCasPlugin as unknown as GamePlugin,
  redDogCasPlugin as unknown as GamePlugin,
  threeCardPokerCasPlugin as unknown as GamePlugin,
  fourCardPokerCasPlugin as unknown as GamePlugin,
  letItRideCasPlugin as unknown as GamePlugin,
  ultimateTexasCasPlugin as unknown as GamePlugin,
  casinoHoldemCasPlugin as unknown as GamePlugin,
  miniBaccaratMiniPlugin as unknown as GamePlugin,
  ezBaccaratMiniPlugin as unknown as GamePlugin,
  doubleDoubleBonusPokerPlugin as unknown as GamePlugin,
  progressiveKnockoutTournamentPlugin as unknown as GamePlugin,
  reEntryTournamentPlugin as unknown as GamePlugin,
  runItThreeTimesPlugin as unknown as GamePlugin,
  highLowChicagoPlugin as unknown as GamePlugin,
  aceyDeuceyInBetweenPlugin as unknown as GamePlugin,
  redDogCardPlugin as unknown as GamePlugin,
  screwYourNeighborCardPlugin as unknown as GamePlugin,
  passTheTrashCardPlugin as unknown as GamePlugin,
  countdownPokerPlugin as unknown as GamePlugin,
  woolworthPokerPlugin as unknown as GamePlugin,
  fieryCrossPokerPlugin as unknown as GamePlugin,
  drawmahaHiPokerPlugin as unknown as GamePlugin,
  turboDealersChoicePlugin as unknown as GamePlugin,
  fusionPokerClPlugin as unknown as GamePlugin,
  spitOceanClPlugin as unknown as GamePlugin,
  anacondaPassPokerPlugin as unknown as GamePlugin,
  fiveCardStudClassicPlugin as unknown as GamePlugin,
  spitInOceanPlugin as unknown as GamePlugin,
  threeCardGutsPlugin as unknown as GamePlugin,
  carcassonneTowerPlugin as unknown as GamePlugin,
  carcassonneBigTopPlugin as unknown as GamePlugin,
  carcassonneGermanCastlesPlugin as unknown as GamePlugin,
  carcassonneSafariPlugin as unknown as GamePlugin,
  carcassonneAmazonasPlugin as unknown as GamePlugin,
  carcassonneSouthSeasPlugin as unknown as GamePlugin,
  carcassonneStarWarsPlugin as unknown as GamePlugin,
  kingdominoPlugin as unknown as GamePlugin,
  queendominoPlugin as unknown as GamePlugin,
  patchworkPlugin as unknown as GamePlugin,
  patchworkDoodlePlugin as unknown as GamePlugin,
  barenparkPlugin as unknown as GamePlugin,
  azulStainedGlassPlugin as unknown as GamePlugin,
  sagradaPlugin as unknown as GamePlugin,
  tokaidoPlugin as unknown as GamePlugin,
  ingeniousPlugin as unknown as GamePlugin,
  blokusPlugin as unknown as GamePlugin,
  nmbr9Plugin as unknown as GamePlugin,
  tinyTownsPlugin as unknown as GamePlugin,
  calicoPlugin as unknown as GamePlugin,
  thumbPouchPlugin as unknown as GamePlugin,
  cassettePlugin as unknown as GamePlugin,
  agnesBernauerPlugin as unknown as GamePlugin,
  blindHookeySoliPlugin as unknown as GamePlugin,
  russianSoliPlugin as unknown as GamePlugin,
  penguinSoliPlugin as unknown as GamePlugin,
  scorpionSoliPlugin as unknown as GamePlugin,
  waspSoliPlugin as unknown as GamePlugin,
  blackWidowSpiderPlugin as unknown as GamePlugin,
  blackHoleSoliPlugin as unknown as GamePlugin,
  allInRowPlugin as unknown as GamePlugin,
  ladyManorPlugin as unknown as GamePlugin,
  sultanSoliPlugin as unknown as GamePlugin,
  threeShufflesPlugin as unknown as GamePlugin,
  midnightOilSoliPlugin as unknown as GamePlugin,
  quiltSoliPlugin as unknown as GamePlugin,
  zodiacSoliPlugin as unknown as GamePlugin,
  coloradoSoliPlugin as unknown as GamePlugin,
  deucesSoliPlugin as unknown as GamePlugin,
  rainbowSoliPlugin as unknown as GamePlugin,
  chess960CrazyhouseQuizPlugin as unknown as GamePlugin,
  minichess5x5QuizPlugin as unknown as GamePlugin,
  chuShogiBoardQuizPlugin as unknown as GamePlugin,
  xiangqiClassicQuizPlugin as unknown as GamePlugin,
  suicideCheckersQuizPlugin as unknown as GamePlugin,
  reversiAntiQuizPlugin as unknown as GamePlugin,
  reversiRandomQuizPlugin as unknown as GamePlugin,
  abaloneQuizPlugin as unknown as GamePlugin,
  halmaQuizPlugin as unknown as GamePlugin,
  go9QuizPlugin as unknown as GamePlugin,
  go13QuizPlugin as unknown as GamePlugin,
  go19QuizPlugin as unknown as GamePlugin,
  badukBoardQuizPlugin as unknown as GamePlugin,
  yConnectionQuizPlugin as unknown as GamePlugin,
  ataxxQuizPlugin as unknown as GamePlugin,
  arimaaQuizPlugin as unknown as GamePlugin,
  breakthroughCheckersQuizPlugin as unknown as GamePlugin,
  owareMancalaQuizPlugin as unknown as GamePlugin,
  baoMancalaQuizPlugin as unknown as GamePlugin,
  shatranjBoardQuizPlugin as unknown as GamePlugin,
  klondikeNoRedealPlugin as unknown as GamePlugin,
  cassetteBernauerPlugin as unknown as GamePlugin,
  athenaPatPlugin as unknown as GamePlugin,
  penguinPatPlugin as unknown as GamePlugin,
  stalactitesPatPlugin as unknown as GamePlugin,
  scorpionPatPlugin as unknown as GamePlugin,
  waspPatPlugin as unknown as GamePlugin,
  apophisSoliPlugin as unknown as GamePlugin,
  addictionSoliPlugin as unknown as GamePlugin,
  alaskaPatPlugin as unknown as GamePlugin,
  somersetPatPlugin as unknown as GamePlugin,
  citadelPatPlugin as unknown as GamePlugin,
  doubleKlondikePatPlugin as unknown as GamePlugin,
  windmillPatPlugin as unknown as GamePlugin,
  indianFtyPlugin as unknown as GamePlugin,
  zodiacPatPlugin as unknown as GamePlugin,
  sequentialPatPlugin as unknown as GamePlugin,
  ladyOfManorPlugin as unknown as GamePlugin,
  virginiaReelPlugin as unknown as GamePlugin,
  nertsSoliPlugin as unknown as GamePlugin,
  kingOfHillChessPlugin as unknown as GamePlugin,
  racingKingsChessPlugin as unknown as GamePlugin,
  fourPlayerChessTeamPlugin as unknown as GamePlugin,
  fogOfWarPlugin as unknown as GamePlugin,
  aliceChess2Plugin as unknown as GamePlugin,
  crazyhouseChessPlugin as unknown as GamePlugin,
  preChessPositionsPlugin as unknown as GamePlugin,
  sittuyinChessPlugin as unknown as GamePlugin,
  janggiChessPlugin as unknown as GamePlugin,
  xiangqiChessPlugin as unknown as GamePlugin,
  shatranjChessPlugin as unknown as GamePlugin,
  chuShogiBoardPlugin as unknown as GamePlugin,
  miniShogi5Plugin as unknown as GamePlugin,
  microShogi4Plugin as unknown as GamePlugin,
  canadianDraughtsPlugin as unknown as GamePlugin,
  dameoPosPlugin as unknown as GamePlugin,
  go9Plugin as unknown as GamePlugin,
  renjuClassicPlugin as unknown as GamePlugin,
  ninukiRenjuClassicPlugin as unknown as GamePlugin,
  pentePlugin as unknown as GamePlugin,
];

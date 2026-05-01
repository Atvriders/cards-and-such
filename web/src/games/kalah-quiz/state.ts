import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KalahQuizSettings { questions: "10"; }
export interface KalahQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KalahQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Kalah is a modern variant of", choices: ["Mancala", "Chess", "Backgammon", "Go"] as [string, string, string, string], correct: 0 },
  { question: "Kalah was patented by", choices: ["William Julius Champion Jr. in the United States", "An ancient African elder", "Reiner Knizia", "Sid Sackson"] as [string, string, string, string], correct: 0 },
  { question: "A standard Kalah board has", choices: ["Twelve small pits and two larger stores", "Sixteen pits", "Eight pits", "Ten pits"] as [string, string, string, string], correct: 0 },
  { question: "Each player's store in Kalah is called the", choices: ["Kalah", "House", "Mancala", "Bank"] as [string, string, string, string], correct: 0 },
  { question: "In standard Kalah, each pit starts with", choices: ["A fixed number of seeds, often four or six", "One seed", "No seeds", "Twenty seeds"] as [string, string, string, string], correct: 0 },
  { question: "On a turn, a player", choices: ["Picks up all seeds from one pit and sows them counterclockwise", "Moves a single seed", "Captures all enemies", "Rolls dice"] as [string, string, string, string], correct: 0 },
  { question: "If the last seed lands in your own Kalah, you", choices: ["Get another turn", "Lose the turn", "Capture all seeds", "Pass to the opponent"] as [string, string, string, string], correct: 0 },
  { question: "If your last seed lands in your own empty pit, you", choices: ["Capture that seed and the opposite enemy pit's seeds", "Lose the seed", "Skip the turn", "Promote a piece"] as [string, string, string, string], correct: 0 },
  { question: "Kalah is sometimes called", choices: ["Awari for similar variants, but Kalah is its own variant", "Chess", "Othello", "Mahjong"] as [string, string, string, string], correct: 0 },
  { question: "Kalah(6,4) refers to", choices: ["6 pits per side, 4 seeds in each pit at start", "6 stones, 4 wins", "Player counts", "Time controls"] as [string, string, string, string], correct: 0 },
  { question: "Kalah(6,6) is", choices: ["Strongly solved as a first-player win", "Unsolved", "A draw with perfect play", "A loss for the first player"] as [string, string, string, string], correct: 0 },
  { question: "Kalah seeds are typically", choices: ["Beans, stones, or marbles", "Cards", "Dice", "Coins"] as [string, string, string, string], correct: 0 },
  { question: "In Kalah, you do not place seeds in", choices: ["The opponent's Kalah store", "Any of your pits", "The opponent's pits", "The board edges"] as [string, string, string, string], correct: 0 },
  { question: "The game ends when", choices: ["One side has no seeds in their pits", "A captured pit reaches zero", "Time expires", "A player passes"] as [string, string, string, string], correct: 0 },
  { question: "At the end, remaining seeds in pits are", choices: ["Added to the player on whose side they are", "Discarded", "Split equally", "Returned to the bag"] as [string, string, string, string], correct: 0 },
  { question: "The winner of Kalah is the player with", choices: ["The most seeds in their store", "The first to empty pits", "The one who captured most", "The one with longest moves"] as [string, string, string, string], correct: 0 },
  { question: "Kalah's commercial board was popularized by", choices: ["The Kalah Game Company in the mid-20th century", "Hasbro in 1980", "Microsoft in 1990", "Reiner Knizia in 2010"] as [string, string, string, string], correct: 0 },
  { question: "In Kalah variants like 'Empty Capture', a player captures only when", choices: ["The last seed lands in their own previously empty pit", "Any pit reaches zero", "Both stores have equal seeds", "An opponent skips"] as [string, string, string, string], correct: 0 },
  { question: "In academic research, Kalah is used as", choices: ["A testbed for game-tree search and machine learning", "A gambling game", "A storytelling tool", "A music theory aid"] as [string, string, string, string], correct: 0 },
  { question: "Kalah was solved by", choices: ["Geoffrey Irving and others using retrograde analysis and computer search", "A 19th-century mathematician", "Magnus Carlsen", "Kasparov"] as [string, string, string, string], correct: 0 },
  { question: "A 'sowing' move in Kalah refers to", choices: ["Distributing seeds counterclockwise into pits", "Picking up all enemy seeds", "Doubling seeds", "A pass"] as [string, string, string, string], correct: 0 },
  { question: "If you can take an extra turn by ending in your store, you may", choices: ["Chain multiple turns together", "Only take two turns", "Not take it", "Skip your move"] as [string, string, string, string], correct: 0 },
  { question: "Kalah differs from Oware in", choices: ["Capture mechanics and bonus turns", "Using cards", "Using dice", "Being a card game"] as [string, string, string, string], correct: 0 },
  { question: "In Kalah, you cannot make a move that", choices: ["Leaves your opponent with no seeds (in some rule sets)", "Captures stones", "Sows clockwise", "Reaches your store"] as [string, string, string, string], correct: 0 },
  { question: "The Kalah game pieces are usually", choices: ["Glass beads or stones", "Plastic chips only", "Paper tokens", "Dice"] as [string, string, string, string], correct: 0 },
  { question: "A typical Kalah(6,4) game lasts", choices: ["Around 10-30 minutes", "Several hours", "About one minute", "Days"] as [string, string, string, string], correct: 0 },
  { question: "Counterclockwise sowing means seeds go", choices: ["From the player's left pit to the right and into their store", "Reverse direction each move", "Only into the opponent's side", "Randomly"] as [string, string, string, string], correct: 0 },
  { question: "Kalah's first-player advantage is", choices: ["Significant; perfect play wins for first player on small boards", "Negligible", "Reversed", "Zero"] as [string, string, string, string], correct: 0 },
  { question: "Kalah was introduced as a teaching tool to teach", choices: ["Counting and strategy in schools", "Calculus", "Latin", "Music"] as [string, string, string, string], correct: 0 },
  { question: "Kalah belongs to the family of", choices: ["Two-rank mancala games", "Card games", "Dice games", "Trick-taking games"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: KalahQuizSettings): KalahQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KalahQuizState, action: KalahQuizAction): KalahQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KalahQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

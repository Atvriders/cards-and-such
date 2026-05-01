import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpartanChessQuizSettings { questions: "10"; }
export interface SpartanChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpartanChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Spartan chess is an asymmetrical variant where", choices: ["One side uses standard chess pieces and the other uses Spartan pieces", "Both sides use new pieces", "Pieces are random", "There is no king"] as [string, string, string, string], correct: 0 },
  { question: "Spartan chess is played on", choices: ["A standard 8x8 board", "A 9x9 board", "A 10x10 board", "A hex grid"] as [string, string, string, string], correct: 0 },
  { question: "The Spartan side has", choices: ["Two kings (kings without check rules combined)", "One king", "No king", "Three kings"] as [string, string, string, string], correct: 0 },
  { question: "The Spartan king pieces are also known as", choices: ["Kings (with special twin-king rules)", "Lieutenants", "Generals", "Knights"] as [string, string, string, string], correct: 0 },
  { question: "Spartan chess was designed by", choices: ["Steven Streetman", "Bobby Fischer", "Reiner Knizia", "Sid Sackson"] as [string, string, string, string], correct: 0 },
  { question: "The Spartan side's special pieces include", choices: ["Hoplite, lieutenant, captain, warlord, and general", "Pawn, knight, bishop, rook, queen, king", "Wizard and warrior", "Just kings"] as [string, string, string, string], correct: 0 },
  { question: "The Hoplite moves like", choices: ["A pawn but captures and moves differently", "A knight only", "A queen", "A bishop only"] as [string, string, string, string], correct: 0 },
  { question: "If both Spartan kings are captured, the Spartan side", choices: ["Loses the game", "Wins the game", "Draws", "Promotes"] as [string, string, string, string], correct: 0 },
  { question: "If only one Spartan king remains, that king", choices: ["Plays under standard check rules from then on", "Is removed", "Becomes a queen", "Is doubled"] as [string, string, string, string], correct: 0 },
  { question: "The Persian (standard) side wins by", choices: ["Capturing both Spartan kings or checkmating a single remaining king", "Promoting all pawns", "Reaching the eighth rank", "Drawing"] as [string, string, string, string], correct: 0 },
  { question: "Spartan chess is published by", choices: ["Spartan Chess via online communities", "FIDE", "Hasbro", "Days of Wonder"] as [string, string, string, string], correct: 0 },
  { question: "The Spartan side begins with how many pieces?", choices: ["Sixteen, including two kings and various unique pieces", "Eighteen", "Twelve", "Eight"] as [string, string, string, string], correct: 0 },
  { question: "The Lieutenant in Spartan chess moves like a", choices: ["Bishop with extra moves", "Rook only", "Knight only", "Pawn only"] as [string, string, string, string], correct: 0 },
  { question: "The Captain moves like a", choices: ["Limited rook (cannot move diagonally)", "Bishop", "Knight", "Queen"] as [string, string, string, string], correct: 0 },
  { question: "The Warlord moves like a", choices: ["Combined knight and bishop, similar to an archbishop", "Pawn only", "King only", "Rook only"] as [string, string, string, string], correct: 0 },
  { question: "The General moves like a", choices: ["Combined knight and rook, similar to a chancellor", "Pawn", "Bishop only", "King only"] as [string, string, string, string], correct: 0 },
  { question: "Spartan chess emphasizes", choices: ["Asymmetric tactical play between distinct armies", "Standard symmetric play", "Card draws", "Auction"] as [string, string, string, string], correct: 0 },
  { question: "The Persian side starts with", choices: ["Standard chess setup", "An asymmetric setup", "Random placement", "Half pieces only"] as [string, string, string, string], correct: 0 },
  { question: "In Spartan chess, both sides", choices: ["Have unique tactical advantages", "Play identically", "Use the same pieces", "Have only kings"] as [string, string, string, string], correct: 0 },
  { question: "If a Spartan king is in check while another Spartan king exists,", choices: ["The check rule is relaxed; the side may sometimes ignore check", "Standard check applies", "The game ends immediately", "Both kings explode"] as [string, string, string, string], correct: 0 },
  { question: "Spartan pawns (Hoplites) capture", choices: ["Differently from standard pawns", "Identically to standard pawns", "Like knights", "Like bishops"] as [string, string, string, string], correct: 0 },
  { question: "Spartan chess was inspired by", choices: ["Greco-Persian wars and asymmetric warfare", "Modern chess only", "World War I", "Card games"] as [string, string, string, string], correct: 0 },
  { question: "The Spartan side promotion rules", choices: ["Allow promotion to certain Spartan pieces", "Disallow promotion", "Promote to king only", "Promote to queen only"] as [string, string, string, string], correct: 0 },
  { question: "Persian (standard) pawn promotion remains", choices: ["Standard chess promotion (Q, R, B, N)", "Disabled", "Reduced", "Doubled"] as [string, string, string, string], correct: 0 },
  { question: "Spartan chess is", choices: ["Free to play and shared by hobbyists online", "A commercial product only", "FIDE-only", "Nintendo-licensed"] as [string, string, string, string], correct: 0 },
  { question: "In Spartan chess, the absence of standard symmetry forces players to", choices: ["Adapt strategy to each side's strengths", "Memorize standard openings", "Use random play", "Play blindfold"] as [string, string, string, string], correct: 0 },
  { question: "Spartan chess pieces use", choices: ["Custom symbols or letters in notation", "Standard chess notation", "Numeric only", "Greek letters only"] as [string, string, string, string], correct: 0 },
  { question: "The variant has been featured in", choices: ["Chess variant magazines and websites", "FIDE championships", "Olympic tournaments", "Major poker tours"] as [string, string, string, string], correct: 0 },
  { question: "Most Spartan chess matches are played", choices: ["Online by hobbyists", "Over-the-board only", "Postal", "By correspondence only"] as [string, string, string, string], correct: 0 },
  { question: "Spartan chess provides a study of", choices: ["Asymmetric balance and unique piece interaction", "Pawn structure only", "Standard chess theory", "Card probabilities"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: SpartanChessQuizSettings): SpartanChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SpartanChessQuizState, action: SpartanChessQuizAction): SpartanChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SpartanChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

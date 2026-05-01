import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CapablancaChessQuizSettings { questions: "10"; }
export interface CapablancaChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CapablancaChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Capablanca chess was proposed by", choices: ["Cuban world champion Jose Raul Capablanca", "Bobby Fischer", "Tigran Petrosian", "Mikhail Botvinnik"] as [string, string, string, string], correct: 0 },
  { question: "Capablanca chess is played on", choices: ["A 10x8 board", "An 8x8 board", "A 12x12 board", "A hex grid"] as [string, string, string, string], correct: 0 },
  { question: "Capablanca chess adds two new pieces called the", choices: ["Archbishop and Chancellor (also known as cardinal and marshal)", "Wizard and Champion", "Dragon and Phoenix", "Spear and Shield"] as [string, string, string, string], correct: 0 },
  { question: "The Archbishop in Capablanca chess moves like a", choices: ["Bishop and a knight combined", "Rook and a pawn combined", "Queen and a king combined", "Knight only"] as [string, string, string, string], correct: 0 },
  { question: "The Chancellor (Marshal) moves like a", choices: ["Rook and a knight combined", "Bishop and pawn combined", "Queen and a king combined", "Knight only"] as [string, string, string, string], correct: 0 },
  { question: "Capablanca proposed the variant because", choices: ["He believed master chess was approaching a draw death", "He found regular chess too tactical", "He preferred Shogi", "He wanted bigger boards"] as [string, string, string, string], correct: 0 },
  { question: "Capablanca chess was first proposed in the", choices: ["1920s by Capablanca during his championship reign", "1500s", "1990s", "2010s"] as [string, string, string, string], correct: 0 },
  { question: "Each side has how many pawns in Capablanca chess?", choices: ["Ten", "Eight", "Twelve", "Six"] as [string, string, string, string], correct: 0 },
  { question: "Castling in Capablanca chess is", choices: ["Allowed but with adjustments for the larger board", "Forbidden", "Mandatory", "Reversed"] as [string, string, string, string], correct: 0 },
  { question: "Pawn promotion in Capablanca chess can include", choices: ["Promotion to archbishop or chancellor", "Only queen", "Only knight", "Only rook"] as [string, string, string, string], correct: 0 },
  { question: "The Archbishop's nickname is sometimes", choices: ["Cardinal", "Bishop's helper", "Knight's friend", "Pawn"] as [string, string, string, string], correct: 0 },
  { question: "The Chancellor's nickname is sometimes", choices: ["Marshal", "Bishop", "Knight", "Pawn"] as [string, string, string, string], correct: 0 },
  { question: "Capablanca chess is sometimes called", choices: ["Capablanca's Chess or simply Capablanca chess", "Grand Chess only", "Shatranj", "Xiangqi"] as [string, string, string, string], correct: 0 },
  { question: "Capablanca chess influenced", choices: ["Other 10x8 variants like Gothic Chess and Grand Chess", "Standard 8x8 chess only", "Card games", "Mancala"] as [string, string, string, string], correct: 0 },
  { question: "On the 10x8 board, files are typically labeled", choices: ["a through j", "a through h only", "1 through 10", "Greek letters"] as [string, string, string, string], correct: 0 },
  { question: "Each side starts with how many pieces total?", choices: ["Eighteen (10 pawns plus 8 majors and minors)", "Sixteen", "Twenty-four", "Twelve"] as [string, string, string, string], correct: 0 },
  { question: "Capablanca chess was tested in", choices: ["A few exhibition games during Capablanca's lifetime", "All FIDE championships", "Modern Olympiads", "Online tournaments only"] as [string, string, string, string], correct: 0 },
  { question: "Bobby Fischer's later variant Chess960 differs from Capablanca chess by", choices: ["Using a standard 8x8 board with random starting positions", "Adding new pieces", "Using a 10x10 board", "Using cards"] as [string, string, string, string], correct: 0 },
  { question: "Capablanca chess pieces are often abbreviated as", choices: ["A for archbishop, C for chancellor (or M for marshal)", "X and Y", "F and G", "Q and R"] as [string, string, string, string], correct: 0 },
  { question: "The chancellor combines movement of", choices: ["Rook + knight", "Bishop + knight", "Bishop + rook", "Queen + king"] as [string, string, string, string], correct: 0 },
  { question: "On a 10x8 board, the total squares are", choices: ["Eighty", "Sixty-four", "One hundred", "Seventy-two"] as [string, string, string, string], correct: 0 },
  { question: "Capablanca's motivation included", choices: ["Slowing the rise of draws in top-level play", "Creating a children's game", "Marketing", "Replacing chess for FIDE"] as [string, string, string, string], correct: 0 },
  { question: "Capablanca chess shares ancestry with", choices: ["Other expanded chess variants of the early 20th century", "Backgammon", "Mancala", "Mahjong"] as [string, string, string, string], correct: 0 },
  { question: "The variant is described in", choices: ["Books and articles about chess history and variants", "Modern poker textbooks", "Card game encyclopedias", "Music theory books"] as [string, string, string, string], correct: 0 },
  { question: "In Capablanca chess, the bishop's pair", choices: ["Still has its standard chess strength advantage", "Is removed", "Is reduced", "Is doubled"] as [string, string, string, string], correct: 0 },
  { question: "Tournament play of Capablanca chess is", choices: ["Rare but supported by enthusiast organizations", "Common at FIDE level", "Mandated", "Banned"] as [string, string, string, string], correct: 0 },
  { question: "The starting layout places the new pieces", choices: ["On the back rank between the standard pieces", "On the second rank", "Outside the board", "On the corners only"] as [string, string, string, string], correct: 0 },
  { question: "Capablanca's championship reign was during", choices: ["1921-1927", "1900-1910", "1950-1960", "1980-1990"] as [string, string, string, string], correct: 0 },
  { question: "In Capablanca chess, en passant", choices: ["Still applies as in standard chess", "Is forbidden", "Doubles in effect", "Is replaced"] as [string, string, string, string], correct: 0 },
  { question: "Capablanca chess remains primarily", choices: ["A variant played by hobbyists and chess historians", "A FIDE championship game", "A children's game", "An e-sport"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: CapablancaChessQuizSettings): CapablancaChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CapablancaChessQuizState, action: CapablancaChessQuizAction): CapablancaChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CapablancaChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

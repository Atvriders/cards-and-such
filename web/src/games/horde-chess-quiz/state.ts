import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HordeChessQuizSettings { questions: "10"; }
export interface HordeChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HordeChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Horde chess, one side controls", choices: ["A horde of 36 pawns versus a standard army", "Two queens", "Half the pieces", "Only knights"] as [string, string, string, string], correct: 0 },
  { question: "The non-horde side has", choices: ["The standard 16-piece chess army", "Eight pawns", "Two kings", "No queen"] as [string, string, string, string], correct: 0 },
  { question: "The Horde side wins by", choices: ["Checkmating the standard army's king", "Promoting all pawns", "Surviving 50 moves", "Reaching the eighth rank"] as [string, string, string, string], correct: 0 },
  { question: "The standard side wins by", choices: ["Capturing every horde pawn", "Checkmating the horde king", "Promoting first", "Reaching the first rank"] as [string, string, string, string], correct: 0 },
  { question: "The Horde side has", choices: ["No king and cannot be checkmated directly", "One king on h1", "Two kings", "A queen and king only"] as [string, string, string, string], correct: 0 },
  { question: "Pawns in the horde may promote", choices: ["Yes, on the eighth rank as in standard chess", "Never", "Only on the seventh", "Only to knights"] as [string, string, string, string], correct: 0 },
  { question: "Horde chess is played on", choices: ["A standard 8x8 board", "A 6x6 board", "A hex grid", "A 10x10 board"] as [string, string, string, string], correct: 0 },
  { question: "On Lichess, Horde was added as a", choices: ["Chess variant playable online", "Bug fix", "Tournament-only mode", "Premium feature"] as [string, string, string, string], correct: 0 },
  { question: "Horde chess often features pawns on", choices: ["The first four ranks (with extras on the fourth rank)", "Only the second rank", "Random squares", "Just the back rank"] as [string, string, string, string], correct: 0 },
  { question: "The standard army's king must avoid", choices: ["Pawn-controlled squares while seeking to break the horde", "Capturing pawns", "Castling", "Promotion"] as [string, string, string, string], correct: 0 },
  { question: "Horde tactics often include", choices: ["Sacrificing minor pieces to break the pawn chain", "Avoiding all sacrifices", "Trading queens immediately", "Promoting first"] as [string, string, string, string], correct: 0 },
  { question: "In Horde, en passant", choices: ["Is allowed for either side", "Is forbidden", "Only for the horde", "Only for the standard side"] as [string, string, string, string], correct: 0 },
  { question: "If the standard army loses its king, it", choices: ["Loses the game", "Promotes a pawn", "Continues with rooks", "Wins"] as [string, string, string, string], correct: 0 },
  { question: "Horde chess is considered", choices: ["Asymmetrical and unbalanced but enjoyable", "Perfectly balanced", "A trick-taking game", "A puzzle"] as [string, string, string, string], correct: 0 },
  { question: "Castling for the standard side is", choices: ["Allowed as normal", "Forbidden", "Required", "Reversed"] as [string, string, string, string], correct: 0 },
  { question: "The horde's pawn structure resembles", choices: ["A wave of attackers covering the lower half of the board", "A single line", "A diagonal", "Random scatter"] as [string, string, string, string], correct: 0 },
  { question: "Horde was popularized through", choices: ["Online chess platforms", "FIDE tournaments", "Postal chess", "Television"] as [string, string, string, string], correct: 0 },
  { question: "Pinning a horde pawn", choices: ["Has no special effect because there's no king in the horde", "Wins the game", "Loses the game", "Promotes the pawn"] as [string, string, string, string], correct: 0 },
  { question: "In Horde, sacrificial play by the standard army targets", choices: ["Breaking through the pawn mass", "Promoting a pawn", "Castling kingside", "Drawing"] as [string, string, string, string], correct: 0 },
  { question: "Horde chess introduced the variant on Lichess in", choices: ["The mid-2010s", "1990", "1980", "2025"] as [string, string, string, string], correct: 0 },
  { question: "If all horde pawns are captured but a promoted piece remains, the game", choices: ["Continues until that piece is also captured", "Is a draw", "Standard side wins instantly", "Resets"] as [string, string, string, string], correct: 0 },
  { question: "Horde rewards", choices: ["Tactical breakthroughs against pawn walls", "Slow positional grinding only", "Avoiding captures", "Card counting"] as [string, string, string, string], correct: 0 },
  { question: "The horde's standard starting layout includes", choices: ["A row of pawns on rank 4 and the typical pawn ranks below", "Only one pawn", "Pawns scattered randomly", "All pawns on rank 8"] as [string, string, string, string], correct: 0 },
  { question: "Stalemating the standard side", choices: ["Is a draw as in classical chess", "Means the horde wins", "Is a horde loss", "Restarts the game"] as [string, string, string, string], correct: 0 },
  { question: "The horde cannot castle because", choices: ["It has no king", "It has no rooks", "Castling is forbidden in variants", "Pawns cannot castle anyway"] as [string, string, string, string], correct: 0 },
  { question: "If a horde pawn promotes, it becomes", choices: ["A queen, rook, bishop, or knight (player's choice)", "A king", "An extra pawn", "An en passant marker"] as [string, string, string, string], correct: 0 },
  { question: "Standard side openings often involve", choices: ["Aggressive minor piece sacrifices to clear the horde", "Quiet positional play", "Castling queenside immediately", "Promoting"] as [string, string, string, string], correct: 0 },
  { question: "Endgame technique for the standard side", choices: ["Differs significantly from regular chess", "Is identical to regular chess", "Is impossible", "Requires no calculation"] as [string, string, string, string], correct: 0 },
  { question: "Horde chess is generally", choices: ["More tactical than positional", "More positional than tactical", "Strategic balance only", "A pure luck game"] as [string, string, string, string], correct: 0 },
  { question: "If the horde pushes a passed pawn to the eighth rank, the standard side", choices: ["Must respond before that pawn promotes to a queen", "Wins instantly", "Loses instantly", "Promotes too"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HordeChessQuizSettings): HordeChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HordeChessQuizState, action: HordeChessQuizAction): HordeChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HordeChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

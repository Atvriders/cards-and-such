import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TvDramasQuizSettings { questions: "10" | "20" | "30"; }
export interface TvDramasQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TvDramasQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "'The Sopranos' main character?", choices: ["Tony Soprano", "Michael Corleone", "Walter White", "Don Draper"], correct: 0 },
  { question: "James Gandolfini played?", choices: ["Tony Soprano", "Walter White", "Don Draper", "Jimmy McNulty"], correct: 0 },
  { question: "'The Sopranos' creator?", choices: ["David Chase", "Vince Gilligan", "Matthew Weiner", "David Simon"], correct: 0 },
  { question: "'Breaking Bad' main character?", choices: ["Tony Soprano", "Walter White", "Don Draper", "Jimmy McNulty"], correct: 1 },
  { question: "Walter's pseudonym?", choices: ["Heisenberg", "Saul Goodman", "Mr. White", "Cap'n Cook"], correct: 0 },
  { question: "Walter teaches what subject?", choices: ["Math", "Chemistry", "Physics", "Biology"], correct: 1 },
  { question: "'Breaking Bad' creator?", choices: ["Vince Gilligan", "David Chase", "Matthew Weiner", "David Simon"], correct: 0 },
  { question: "'Mad Men' main character?", choices: ["Don Draper", "Roger Sterling", "Peter Campbell", "Tony Soprano"], correct: 0 },
  { question: "'Mad Men' is set in what industry?", choices: ["Banking", "Advertising", "Law", "Publishing"], correct: 1 },
  { question: "'Mad Men' creator?", choices: ["Matthew Weiner", "David Chase", "Vince Gilligan", "David Simon"], correct: 0 },
  { question: "'The Wire' setting?", choices: ["Baltimore", "New York", "Philadelphia", "Boston"], correct: 0 },
  { question: "'The Wire' creator?", choices: ["David Simon", "David Chase", "Matthew Weiner", "Vince Gilligan"], correct: 0 },
  { question: "'Game of Thrones' is based on novels by?", choices: ["George R.R. Martin", "J.R.R. Tolkien", "Brandon Sanderson", "Patrick Rothfuss"], correct: 0 },
  { question: "Iron Throne final winner?", choices: ["Bran", "Daenerys", "Jon Snow", "Cersei"], correct: 0 },
  { question: "'Better Call Saul' is a prequel to?", choices: ["The Sopranos", "Breaking Bad", "Mad Men", "The Wire"], correct: 1 },
  { question: "'Succession' family name?", choices: ["Roy", "King", "Murdoch", "Hearst"], correct: 0 },
  { question: "'The West Wing' setting?", choices: ["White House", "Pentagon", "Capitol Hill", "Supreme Court"], correct: 0 },
  { question: "'House of Cards' main character?", choices: ["Frank Underwood", "Tony Soprano", "Walter White", "Don Draper"], correct: 0 },
  { question: "'Lost' setting?", choices: ["Mysterious island", "Submarine", "Spaceship", "Mountain"], correct: 0 },
  { question: "'24' protagonist?", choices: ["Jack Bauer", "Don Draper", "Tony Soprano", "Walter White"], correct: 0 },
  { question: "Each season of '24' covers?", choices: ["A day", "A week", "A month", "A year"], correct: 0 },
  { question: "'Stranger Things' Eleven actress?", choices: ["Millie Bobby Brown", "Sadie Sink", "Maya Hawke", "Natalia Dyer"], correct: 0 },
  { question: "'Stranger Things' setting?", choices: ["Hawkins, Indiana", "Springwood, Ohio", "Crystal Lake", "Castle Rock"], correct: 0 },
  { question: "'Ozark' family name?", choices: ["Byrde", "Roy", "Soprano", "White"], correct: 0 },
  { question: "Don Draper's secret real name?", choices: ["Dick Whitman", "Don Draper", "Bill Carson", "Frank Sterling"], correct: 0 },
  { question: "'The Crown' subject?", choices: ["British royal family", "Italian mafia", "American politics", "Russian aristocracy"], correct: 0 },
  { question: "'Yellowstone' main character?", choices: ["John Dutton", "Rip Wheeler", "Beth Dutton", "Jamie Dutton"], correct: 0 },
  { question: "'The Handmaid's Tale' is based on?", choices: ["Margaret Atwood novel", "Stephen King novel", "Original screenplay", "Real events"], correct: 0 },
  { question: "Tony Soprano's therapist?", choices: ["Dr. Melfi", "Dr. House", "Dr. Brennan", "Dr. Wilson"], correct: 0 },
  { question: "Saul Goodman's real name?", choices: ["Jimmy McGill", "Saul Goodman", "Walter White", "Mike Ehrmantraut"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TvDramasQuizSettings): TvDramasQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TvDramasQuizState, action: TvDramasQuizAction): TvDramasQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TvDramasQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

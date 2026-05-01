import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BeatlesQuizSettings { questions: "10" | "20" | "30"; }
export interface BeatlesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BeatlesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many original Beatles members?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "The Beatles' hometown?", choices: ["London", "Liverpool", "Manchester", "Birmingham"], correct: 1 },
  { question: "Who replaced Pete Best as drummer?", choices: ["Ringo Starr", "Jimmy Nicol", "Andy White", "Stuart Sutcliffe"], correct: 0 },
  { question: "John Lennon's main instrument?", choices: ["Bass", "Rhythm guitar", "Lead guitar", "Drums"], correct: 1 },
  { question: "Paul McCartney's primary instrument with the Beatles?", choices: ["Lead guitar", "Bass", "Drums", "Keyboard"], correct: 1 },
  { question: "George Harrison was the band's?", choices: ["Lead guitarist", "Bassist", "Drummer", "Keyboard"], correct: 0 },
  { question: "Ringo Starr's real name?", choices: ["Richard Starkey", "Richard Best", "Richard Lennon", "Richard Harrison"], correct: 0 },
  { question: "Which Beatle was the lead vocalist on 'Let It Be'?", choices: ["John Lennon", "Paul McCartney", "George Harrison", "Ringo Starr"], correct: 1 },
  { question: "Manager who signed the Beatles to EMI?", choices: ["George Martin", "Brian Epstein", "Allen Klein", "Phil Spector"], correct: 1 },
  { question: "Beatles' famous producer?", choices: ["George Martin", "Phil Spector", "Quincy Jones", "Rick Rubin"], correct: 0 },
  { question: "Album with the cover of a zebra crossing?", choices: ["Abbey Road", "Sgt. Pepper's", "Let It Be", "Help!"], correct: 0 },
  { question: "Album 'Sgt. Pepper's Lonely Hearts Club Band' year?", choices: ["1965", "1966", "1967", "1968"], correct: 2 },
  { question: "The 'White Album' is officially titled?", choices: ["The Beatles", "White", "Album '68", "Revolution"], correct: 0 },
  { question: "First U.S. #1 single by the Beatles?", choices: ["I Want to Hold Your Hand", "Love Me Do", "She Loves You", "Help!"], correct: 0 },
  { question: "Beatles broke up officially in?", choices: ["1969", "1970", "1971", "1972"], correct: 1 },
  { question: "Which Beatle wrote 'While My Guitar Gently Weeps'?", choices: ["John", "Paul", "George Harrison", "Ringo"], correct: 2 },
  { question: "Who wrote 'Yesterday'?", choices: ["Paul McCartney", "John Lennon", "George Harrison", "Lennon-McCartney equal"], correct: 0 },
  { question: "Lennon's wife famous as artist?", choices: ["Yoko Ono", "Linda Eastman", "Patti Boyd", "Cynthia"], correct: 0 },
  { question: "Paul's first wife (photographer)?", choices: ["Linda Eastman", "Yoko Ono", "Heather Mills", "Patti Boyd"], correct: 0 },
  { question: "George's first wife (model)?", choices: ["Patti Boyd", "Yoko Ono", "Linda Eastman", "Cynthia"], correct: 0 },
  { question: "John Lennon was murdered in?", choices: ["1980", "1985", "1990", "1979"], correct: 0 },
  { question: "John was killed in which city?", choices: ["New York City", "London", "Liverpool", "Los Angeles"], correct: 0 },
  { question: "Beatles' first feature film?", choices: ["A Hard Day's Night", "Help!", "Magical Mystery Tour", "Let It Be"], correct: 0 },
  { question: "Beatles' rooftop concert (final live) was on?", choices: ["Apple Records' London rooftop, 1969", "Abbey Road studio roof", "Cavern Club roof", "Buckingham Palace"], correct: 0 },
  { question: "Famous Liverpool club where they played early?", choices: ["Cavern Club", "Marquee Club", "Whisky a Go Go", "100 Club"], correct: 0 },
  { question: "First album released by the Beatles?", choices: ["Please Please Me (1963)", "With the Beatles", "A Hard Day's Night", "Help!"], correct: 0 },
  { question: "George Harrison's solo hit triple album?", choices: ["All Things Must Pass", "Imagine", "Band on the Run", "Living in the Material World"], correct: 0 },
  { question: "John Lennon's iconic peace anthem?", choices: ["Imagine", "Give Peace a Chance", "Both", "Working Class Hero"], correct: 2 },
  { question: "Beatles' record label they founded?", choices: ["Apple Records", "EMI", "Parlophone", "Capitol"], correct: 0 },
  { question: "Beatles' last studio album recorded together?", choices: ["Abbey Road", "Let It Be", "The White Album", "Sgt. Pepper's"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BeatlesQuizSettings): BeatlesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BeatlesQuizState, action: BeatlesQuizAction): BeatlesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BeatlesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

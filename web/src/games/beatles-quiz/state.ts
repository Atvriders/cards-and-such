import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BeatlesQuizSettings { questions: "10" | "20" | "30"; }
export interface BeatlesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BeatlesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many original Beatles members?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "Beatles' hometown?", choices: ["London", "Liverpool", "Manchester", "Birmingham"], correct: 1 },
  { question: "Who replaced Pete Best as drummer?", choices: ["Ringo Starr", "Jimmy Nicol", "Andy White", "Stuart Sutcliffe"], correct: 0 },
  { question: "John Lennon's main instrument?", choices: ["Bass", "Rhythm guitar", "Lead guitar", "Drums"], correct: 1 },
  { question: "Paul McCartney's main instrument?", choices: ["Drums", "Bass", "Rhythm guitar", "Piano"], correct: 1 },
  { question: "George Harrison was the?", choices: ["Bass player", "Lead guitarist", "Rhythm guitarist", "Drummer"], correct: 1 },
  { question: "Ringo Starr's role?", choices: ["Drummer", "Bassist", "Vocals", "Producer"], correct: 0 },
  { question: "First U.S. number-one Beatles single?", choices: ["I Want to Hold Your Hand", "She Loves You", "Love Me Do", "Please Please Me"], correct: 0 },
  { question: "Beatles 'White Album' year?", choices: ["1966", "1967", "1968", "1969"], correct: 2 },
  { question: "'Sgt. Pepper's Lonely Hearts Club Band' year?", choices: ["1965", "1966", "1967", "1968"], correct: 2 },
  { question: "Year Beatles broke up?", choices: ["1968", "1969", "1970", "1971"], correct: 2 },
  { question: "Who shot John Lennon?", choices: ["Mark David Chapman", "John Hinckley", "Sirhan Sirhan", "James Earl Ray"], correct: 0 },
  { question: "Year John Lennon was killed?", choices: ["1978", "1980", "1982", "1985"], correct: 1 },
  { question: "Beatles producer?", choices: ["Phil Spector", "George Martin", "Brian Epstein", "Quincy Jones"], correct: 1 },
  { question: "Beatles manager?", choices: ["Brian Epstein", "George Martin", "Phil Spector", "Allen Klein"], correct: 0 },
  { question: "Last Beatles studio album recorded?", choices: ["Let It Be", "Abbey Road", "Sgt. Pepper", "Revolver"], correct: 1 },
  { question: "Last Beatles album released?", choices: ["Abbey Road", "Let It Be", "Help!", "White Album"], correct: 1 },
  { question: "Famous photo zebra crossing on which album?", choices: ["Sgt. Pepper", "Abbey Road", "Let It Be", "Help!"], correct: 1 },
  { question: "'Yesterday' was written primarily by?", choices: ["John Lennon", "Paul McCartney", "George Harrison", "Ringo Starr"], correct: 1 },
  { question: "'Hey Jude' was written for?", choices: ["Julian Lennon", "Sean Lennon", "George's wife", "Linda McCartney"], correct: 0 },
  { question: "'Strawberry Fields' refers to a place in?", choices: ["Liverpool", "London", "New York", "Hamburg"], correct: 0 },
  { question: "'Let It Be' opening lyric mentions?", choices: ["Mother Mary", "Father John", "Sister Sue", "Brother Paul"], correct: 0 },
  { question: "Where did Beatles play residencies before stardom?", choices: ["Hamburg", "Berlin", "Paris", "Amsterdam"], correct: 0 },
  { question: "'Norwegian Wood' features which instrument prominently?", choices: ["Sitar", "Banjo", "Harmonica", "Mandolin"], correct: 0 },
  { question: "George Harrison's most famous solo song?", choices: ["My Sweet Lord", "Imagine", "Maybe I'm Amazed", "Photograph"], correct: 0 },
  { question: "John Lennon's most famous solo song?", choices: ["Imagine", "My Sweet Lord", "Mull of Kintyre", "Photograph"], correct: 0 },
  { question: "Yoko Ono married which Beatle?", choices: ["John", "Paul", "George", "Ringo"], correct: 0 },
  { question: "Linda Eastman married?", choices: ["John", "Paul", "George", "Ringo"], correct: 1 },
  { question: "How many U.S. number-one singles did the Beatles have?", choices: ["12", "20", "27", "35"], correct: 1 },
  { question: "Beatles' first feature film?", choices: ["A Hard Day's Night", "Help!", "Yellow Submarine", "Magical Mystery Tour"], correct: 0 },
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

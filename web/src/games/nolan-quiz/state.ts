import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NolanQuizSettings { questions: "10" | "20" | "30"; }
export interface NolanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NolanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What was Christopher Nolan's debut feature film?", choices: ["Following", "Memento", "Insomnia", "Batman Begins"], correct: 0 },
  { question: "What 2000 Nolan film unfolds in reverse?", choices: ["Memento", "Following", "Insomnia", "The Prestige"], correct: 0 },
  { question: "Nolan's first studio film was a remake of which Norwegian thriller?", choices: ["Insomnia", "The Prestige", "Memento", "Following"], correct: 0 },
  { question: "Nolan's Batman trilogy began with?", choices: ["Batman Begins (2005)", "The Dark Knight (2008)", "The Dark Knight Rises (2012)", "Batman Forever"], correct: 0 },
  { question: "Heath Ledger won posthumous Oscar for playing Joker in?", choices: ["The Dark Knight", "Batman Begins", "The Dark Knight Rises", "Suicide Squad"], correct: 0 },
  { question: "What 2006 Nolan film features rival magicians?", choices: ["The Prestige", "Memento", "Insomnia", "Inception"], correct: 0 },
  { question: "Who stars as Cobb in 'Inception' (2010)?", choices: ["Leonardo DiCaprio", "Tom Hardy", "Joseph Gordon-Levitt", "Cillian Murphy"], correct: 0 },
  { question: "Inception involves what kind of heists?", choices: ["Stealing/planting ideas in dreams", "Bank robberies", "Art theft", "Diamond theft"], correct: 0 },
  { question: "What 2014 space epic stars Matthew McConaughey?", choices: ["Interstellar", "Gravity", "The Martian", "Ad Astra"], correct: 0 },
  { question: "Interstellar was scored by?", choices: ["Hans Zimmer", "John Williams", "Ludwig Göransson", "Howard Shore"], correct: 0 },
  { question: "What 2017 Nolan WWII film?", choices: ["Dunkirk", "1917", "Saving Private Ryan", "The Thin Red Line"], correct: 0 },
  { question: "Dunkirk uses what three time perspectives?", choices: ["Land (week), Sea (day), Air (hour)", "Day, Night, Dawn", "Past, Present, Future", "Three soldier views"], correct: 0 },
  { question: "What 2020 Nolan film involves time inversion?", choices: ["Tenet", "Interstellar", "Inception", "Dunkirk"], correct: 0 },
  { question: "Tenet stars whom as the Protagonist?", choices: ["John David Washington", "Robert Pattinson", "Kenneth Branagh", "Tom Hardy"], correct: 0 },
  { question: "What 2023 biopic won Nolan Best Director Oscar?", choices: ["Oppenheimer", "Tenet", "Dunkirk", "Interstellar"], correct: 0 },
  { question: "Who plays J. Robert Oppenheimer?", choices: ["Cillian Murphy", "Robert Downey Jr.", "Matt Damon", "Kenneth Branagh"], correct: 0 },
  { question: "Who plays Lewis Strauss in 'Oppenheimer'?", choices: ["Robert Downey Jr.", "Matt Damon", "Cillian Murphy", "Gary Oldman"], correct: 0 },
  { question: "Oppenheimer is based on which biography?", choices: ["American Prometheus", "Manhattan Project", "Father of the Bomb", "Atomic Father"], correct: 0 },
  { question: "Nolan was born in which city?", choices: ["London", "Los Angeles", "New York", "Edinburgh"], correct: 0 },
  { question: "Nolan's brother Jonathan often co-writes - which series did Jonathan create?", choices: ["Westworld", "Lost", "Game of Thrones", "Stranger Things"], correct: 0 },
  { question: "What format does Nolan prefer for shooting?", choices: ["Film (IMAX/35mm)", "Digital 8K", "Mini DV", "iPhone"], correct: 0 },
  { question: "Hans Zimmer or Ludwig Göransson scored Tenet?", choices: ["Ludwig Göransson", "Hans Zimmer", "Both", "Neither"], correct: 0 },
  { question: "Heath Ledger died before which film's release?", choices: ["The Dark Knight", "The Dark Knight Rises", "Batman Begins", "Brokeback Mountain"], correct: 0 },
  { question: "What is the name of Cobb's totem in Inception?", choices: ["A spinning top", "A loaded die", "A pawn", "A coin"], correct: 0 },
  { question: "Who plays Joker in The Dark Knight?", choices: ["Heath Ledger", "Jared Leto", "Joaquin Phoenix", "Mark Hamill"], correct: 0 },
  { question: "Who plays Bane in The Dark Knight Rises?", choices: ["Tom Hardy", "Cillian Murphy", "Liam Neeson", "Aaron Eckhart"], correct: 0 },
  { question: "What is the planet near Gargantua in Interstellar called?", choices: ["Miller's planet", "Mann's planet", "Edmunds' planet", "All of these are visited"], correct: 3 },
  { question: "Nolan married which producer?", choices: ["Emma Thomas", "Lynda Obst", "Kathleen Kennedy", "Amy Pascal"], correct: 0 },
  { question: "Memento was based on a story by?", choices: ["Jonathan Nolan", "Christopher Nolan", "Stephen King", "Philip K. Dick"], correct: 0 },
  { question: "How many Nolan films feature Michael Caine?", choices: ["Most of them (8+)", "Two", "Three", "One"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NolanQuizSettings): NolanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NolanQuizState, action: NolanQuizAction): NolanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NolanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

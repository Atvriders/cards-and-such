import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DcComicsFilmsQuizSettings { questions: "10" | "20" | "30"; }
export interface DcComicsFilmsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DcComicsFilmsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What 1978 film starred Christopher Reeve as Superman?", choices: ["Superman","Superman II","Superman III","Superman IV"], correct: 0 },
  { question: "Who directed Tim Burton's Batman (1989)?", choices: ["Tim Burton","Joel Schumacher","Christopher Nolan","Zack Snyder"], correct: 0 },
  { question: "Who played Batman in 1989?", choices: ["Michael Keaton","Val Kilmer","George Clooney","Christian Bale"], correct: 0 },
  { question: "Who played the Joker in 1989?", choices: ["Jack Nicholson","Heath Ledger","Joaquin Phoenix","Cesar Romero"], correct: 0 },
  { question: "Who directed The Dark Knight (2008)?", choices: ["Christopher Nolan","Tim Burton","Joel Schumacher","Zack Snyder"], correct: 0 },
  { question: "Who played the Joker in The Dark Knight?", choices: ["Heath Ledger","Jack Nicholson","Jared Leto","Joaquin Phoenix"], correct: 0 },
  { question: "What year did Heath Ledger win posthumous Oscar?", choices: ["2009","2008","2007","2010"], correct: 0 },
  { question: "Who played Batman in the Nolan trilogy?", choices: ["Christian Bale","Ben Affleck","Robert Pattinson","Michael Keaton"], correct: 0 },
  { question: "Who plays Wonder Woman in the DCEU?", choices: ["Gal Gadot","Lynda Carter","Margot Robbie","Both Gadot and Carter (different eras)"], correct: 0 },
  { question: "Who played Superman in Man of Steel (2013)?", choices: ["Henry Cavill","Tom Welling","Brandon Routh","Christopher Reeve"], correct: 0 },
  { question: "Who directed Man of Steel?", choices: ["Zack Snyder","Christopher Nolan","Joss Whedon","David Goyer"], correct: 0 },
  { question: "Who plays Aquaman in DCEU?", choices: ["Jason Momoa","Patrick Wilson","Yahya Abdul-Mateen","Willem Dafoe"], correct: 0 },
  { question: "What 2017 film starred Gal Gadot?", choices: ["Wonder Woman","Justice League","Both","BvS"], correct: 2 },
  { question: "What 2019 film won Joaquin Phoenix his Oscar?", choices: ["Joker","Her","The Master","Walk the Line"], correct: 0 },
  { question: "Who plays Joker in the 2019 film?", choices: ["Joaquin Phoenix","Heath Ledger","Jared Leto","Jack Nicholson"], correct: 0 },
  { question: "Who plays Harley Quinn?", choices: ["Margot Robbie","Lady Gaga","Anya Taylor-Joy","Saoirse Ronan"], correct: 0 },
  { question: "What 2017 film flopped despite high expectations?", choices: ["Justice League","Wonder Woman","Aquaman","Shazam"], correct: 0 },
  { question: "What 2021 cut was 4-hour version of Justice League?", choices: ["Snyder Cut","Whedon Cut","Both released","Just Whedon"], correct: 0 },
  { question: "Who plays Batman in The Batman (2022)?", choices: ["Robert Pattinson","Ben Affleck","Christian Bale","Michael Keaton"], correct: 0 },
  { question: "Who directed The Batman (2022)?", choices: ["Matt Reeves","Christopher Nolan","Zack Snyder","Tim Burton"], correct: 0 },
  { question: "Who plays the Penguin in 2022's The Batman?", choices: ["Colin Farrell","Danny DeVito","Burgess Meredith","Robin Lord Taylor"], correct: 0 },
  { question: "Who plays Riddler in 2022's The Batman?", choices: ["Paul Dano","Jim Carrey","Frank Gorshin","Cory Michael Smith"], correct: 0 },
  { question: "What's Cyborg's real name?", choices: ["Victor Stone","Dick Grayson","Wally West","Hal Jordan"], correct: 0 },
  { question: "Who plays The Flash in DCEU?", choices: ["Ezra Miller","Grant Gustin","Henry Cavill","Ray Fisher"], correct: 0 },
  { question: "What's Lex Luthor's portrayer in Man of Steel sequel?", choices: ["Jesse Eisenberg","Gene Hackman","Kevin Spacey","Michael Rosenbaum"], correct: 0 },
  { question: "What 2019 film starred Zachary Levi?", choices: ["Shazam","Aquaman","Wonder Woman","Justice League"], correct: 0 },
  { question: "Who directed Watchmen (2009)?", choices: ["Zack Snyder","Christopher Nolan","Tim Burton","Joel Schumacher"], correct: 0 },
  { question: "What does V stand for in V for Vendetta?", choices: ["Vendetta","Victor","Veronica","Vendetta only"], correct: 0 },
  { question: "Who plays Mera (Aquaman's love)?", choices: ["Amber Heard","Nicole Kidman","Yahya","Patrick Wilson"], correct: 0 },
  { question: "Who plays Wonder Woman in 1970s TV?", choices: ["Lynda Carter","Gal Gadot","Adrianne Palicki","Wendi McLendon-Covey"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DcComicsFilmsQuizSettings): DcComicsFilmsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DcComicsFilmsQuizState, action: DcComicsFilmsQuizAction): DcComicsFilmsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DcComicsFilmsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SciFiFilmsQuizSettings { questions: "10" | "20" | "30"; }
export interface SciFiFilmsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SciFiFilmsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What 1968 Kubrick sci-fi film features HAL 9000?", choices: ["2001: A Space Odyssey","Solaris","Blade Runner","Alien"], correct: 0 },
  { question: "What 1977 George Lucas film?", choices: ["Star Wars","Close Encounters","Alien","E.T."], correct: 0 },
  { question: "What 1979 Ridley Scott sci-fi horror?", choices: ["Alien","Blade Runner","Prometheus","Black Hawk Down"], correct: 0 },
  { question: "What 1982 sci-fi by Ridley Scott features replicants?", choices: ["Blade Runner","Alien","Total Recall","Logan's Run"], correct: 0 },
  { question: "What 1984 Cameron film features killer cyborg?", choices: ["The Terminator","Aliens","Predator","RoboCop"], correct: 0 },
  { question: "Who directed The Terminator?", choices: ["James Cameron","Ridley Scott","Steven Spielberg","George Lucas"], correct: 0 },
  { question: "Who plays the Terminator?", choices: ["Arnold Schwarzenegger","Sylvester Stallone","Bruce Willis","Vin Diesel"], correct: 0 },
  { question: "What 1991 sci-fi sequel features liquid metal terminator?", choices: ["T2: Judgment Day","T3","Salvation","Genisys"], correct: 0 },
  { question: "What 1985 film stars Marty McFly?", choices: ["Back to the Future","BTTF II","BTTF III","All star Marty"], correct: 0 },
  { question: "Who plays Marty McFly?", choices: ["Michael J. Fox","Eric Stoltz (replaced)","Both initially","Just MJF"], correct: 0 },
  { question: "What 1999 film features Neo?", choices: ["The Matrix","Reloaded","Revolutions","Resurrections"], correct: 0 },
  { question: "Who plays Neo?", choices: ["Keanu Reeves","Laurence Fishburne","Carrie-Anne Moss","Hugo Weaving"], correct: 0 },
  { question: "What 2009 Cameron film features Pandora?", choices: ["Avatar","The Abyss","Aliens","Terminator 2"], correct: 0 },
  { question: "What 1997 sci-fi by Robert Zemeckis features alien contact?", choices: ["Contact","Cocoon","Close Encounters","War of the Worlds"], correct: 0 },
  { question: "What 2014 Nolan sci-fi about wormholes?", choices: ["Interstellar","Inception","Tenet","Memento"], correct: 0 },
  { question: "What 2010 Nolan sci-fi about dreams?", choices: ["Inception","Memento","Tenet","Interstellar"], correct: 0 },
  { question: "What 1985 film features replicants chasing humans? (trick: it's actually 1982)", choices: ["Blade Runner","Tron","Brazil","Mad Max 2"], correct: 0 },
  { question: "What 1979 Tarkovsky film?", choices: ["Stalker","Solaris","Mirror","Andrei Rublev"], correct: 0 },
  { question: "What 1972 Tarkovsky film?", choices: ["Solaris","Stalker","Mirror","Sacrifice"], correct: 0 },
  { question: "What 2016 first-contact film by Villeneuve?", choices: ["Arrival","Blade Runner 2049","Dune","Sicario"], correct: 0 },
  { question: "What 2017 Blade Runner sequel?", choices: ["Blade Runner 2049","Final Cut","Black Mirror","Soldier"], correct: 0 },
  { question: "What 2021 Villeneuve adaptation of Frank Herbert?", choices: ["Dune","Dune Part Two","Both","Just first"], correct: 2 },
  { question: "What 1968 Charlton Heston classic about apes?", choices: ["Planet of the Apes","Soylent Green","Omega Man","Beneath the Planet"], correct: 0 },
  { question: "What 1982 Spielberg about alien?", choices: ["E.T.","Close Encounters","War of Worlds","A.I."], correct: 0 },
  { question: "What 2002 Tom Cruise film by Spielberg?", choices: ["Minority Report","War of the Worlds","A.I.","All Spielberg"], correct: 0 },
  { question: "What 1983 Cronenberg film features VHS hallucinations?", choices: ["Videodrome","The Fly","Dead Ringers","eXistenZ"], correct: 0 },
  { question: "What 1986 Cronenberg remake?", choices: ["The Fly","Scanners","Dead Ringers","Crash"], correct: 0 },
  { question: "What 1973 dystopian Soylent Green famously ends with?", choices: ["Soylent Green is people","People","Aliens","Robots"], correct: 0 },
  { question: "What 2011 Mike Cahill film features another Earth?", choices: ["Another Earth","Coherence","Primer","Looper"], correct: 0 },
  { question: "What 2013 Cuaron film in space?", choices: ["Gravity","Roma","Children of Men","Y tu Mama"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SciFiFilmsQuizSettings): SciFiFilmsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SciFiFilmsQuizState, action: SciFiFilmsQuizAction): SciFiFilmsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SciFiFilmsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

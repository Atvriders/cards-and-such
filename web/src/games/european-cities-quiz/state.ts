import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EuropeanCitiesQuizSettings { questions: "10" | "20" | "30"; }
export interface EuropeanCitiesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EuropeanCitiesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which city is known as the Eternal City?", choices: ["Athens","Rome","Paris","Madrid"], correct: 1 },
  { question: "In which city is the Brandenburg Gate located?", choices: ["Munich","Vienna","Berlin","Prague"], correct: 2 },
  { question: "Which European city is built on canals and famous for gondolas?", choices: ["Amsterdam","Venice","Stockholm","Bruges"], correct: 1 },
  { question: "Where is the Acropolis located?", choices: ["Rome","Istanbul","Athens","Sofia"], correct: 2 },
  { question: "Which city hosts the European Parliament's main seat?", choices: ["Brussels","Strasbourg","Luxembourg","The Hague"], correct: 1 },
  { question: "Which city is divided by the Bosphorus?", choices: ["Athens","Belgrade","Istanbul","Bucharest"], correct: 2 },
  { question: "In which city would you find the Charles Bridge?", choices: ["Vienna","Budapest","Prague","Bratislava"], correct: 2 },
  { question: "Which city is the home of the Little Mermaid statue?", choices: ["Oslo","Copenhagen","Stockholm","Helsinki"], correct: 1 },
  { question: "Which city straddles the river Tagus?", choices: ["Madrid","Porto","Lisbon","Seville"], correct: 2 },
  { question: "In which city is the Schloss Schoenbrunn?", choices: ["Berlin","Vienna","Munich","Salzburg"], correct: 1 },
  { question: "Which Italian city is famous for its leaning tower?", choices: ["Florence","Pisa","Siena","Lucca"], correct: 1 },
  { question: "Which Spanish city hosts La Sagrada Familia?", choices: ["Madrid","Valencia","Barcelona","Seville"], correct: 2 },
  { question: "Which city is the capital of Belgium?", choices: ["Antwerp","Bruges","Brussels","Ghent"], correct: 2 },
  { question: "Which city is called the Pearl of the Adriatic?", choices: ["Split","Dubrovnik","Zadar","Kotor"], correct: 1 },
  { question: "In which city is the Hermitage Museum?", choices: ["Moscow","Kyiv","St. Petersburg","Minsk"], correct: 2 },
  { question: "Which city is the capital of Scotland?", choices: ["Glasgow","Edinburgh","Aberdeen","Inverness"], correct: 1 },
  { question: "Where is the Anne Frank House located?", choices: ["Brussels","Amsterdam","Antwerp","The Hague"], correct: 1 },
  { question: "Which city sits on seven hills like Rome?", choices: ["Lisbon","Madrid","Athens","Sofia"], correct: 0 },
  { question: "Which French city is famous for its film festival?", choices: ["Nice","Cannes","Marseille","Lyon"], correct: 1 },
  { question: "Where is the Atomium landmark?", choices: ["Paris","Brussels","Amsterdam","Berlin"], correct: 1 },
  { question: "Which city has the Sagres point and Atlantic vibe as Portugal's capital region?", choices: ["Lisbon","Madrid","Faro","Porto"], correct: 0 },
  { question: "Which city is split between two countries (mostly)?", choices: ["Geneva","Basel","Frankfurt","Salzburg"], correct: 1 },
  { question: "Which city is the capital of Hungary?", choices: ["Bratislava","Vienna","Budapest","Belgrade"], correct: 2 },
  { question: "In which city is Tivoli Gardens?", choices: ["Stockholm","Copenhagen","Helsinki","Oslo"], correct: 1 },
  { question: "What city is the seat of the European Court of Justice?", choices: ["Luxembourg City","Brussels","The Hague","Strasbourg"], correct: 0 },
  { question: "Which city is famous for the Oktoberfest beer festival?", choices: ["Berlin","Frankfurt","Munich","Hamburg"], correct: 2 },
  { question: "Where is the Trevi Fountain?", choices: ["Florence","Naples","Rome","Milan"], correct: 2 },
  { question: "What is the capital of Romania?", choices: ["Cluj-Napoca","Brasov","Bucharest","Iasi"], correct: 2 },
  { question: "Which Norwegian city sits at the head of a famous fjord?", choices: ["Oslo","Bergen","Trondheim","Stavanger"], correct: 1 },
  { question: "Which city is the largest in Switzerland?", choices: ["Bern","Geneva","Basel","Zurich"], correct: 3 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EuropeanCitiesQuizSettings): EuropeanCitiesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EuropeanCitiesQuizState, action: EuropeanCitiesQuizAction): EuropeanCitiesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EuropeanCitiesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

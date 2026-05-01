import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EurovisionQuizSettings { questions: "10" | "20" | "30"; }
export interface EurovisionQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EurovisionQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Where was the first Eurovision held in 1956?", choices: ["Paris","London","Lugano","Stockholm"], correct: 2 },
  { question: "Which group won Eurovision 1974 with 'Waterloo'?", choices: ["Brotherhood of Man","ABBA","Bucks Fizz","Teach-In"], correct: 1 },
  { question: "Who won the 1988 contest for Switzerland?", choices: ["Celine Dion","Lara Fabian","France Gall","Vicky Leandros"], correct: 0 },
  { question: "Which monster rock band won in 2006?", choices: ["Hatari","Lordi","Rasmus","Apocalyptica"], correct: 1 },
  { question: "Conchita Wurst won Eurovision in which year?", choices: ["2012","2013","2014","2015"], correct: 2 },
  { question: "Which country won the most Eurovisions ever?", choices: ["Sweden","Ireland","UK","Norway"], correct: 1 },
  { question: "Loreen won Eurovision twice with which 2012 song?", choices: ["Tattoo","Euphoria","Heroes","Rise Like a Phoenix"], correct: 1 },
  { question: "Which Israeli singer won 2018 with 'Toy'?", choices: ["Dana International","Netta","Noa Kirel","Eden Alene"], correct: 1 },
  { question: "Kalush Orchestra represented which country in 2022?", choices: ["Poland","Ukraine","Romania","Moldova"], correct: 1 },
  { question: "What language did Eurovision require until 1973 (and 1977-1998)?", choices: ["English","French","Native country language","Any"], correct: 2 },
  { question: "Riverdance debuted as the 1994 interval act in which city?", choices: ["Dublin","Cork","Belfast","Galway"], correct: 0 },
  { question: "Which year was Eurovision cancelled due to the pandemic?", choices: ["2019","2020","2021","2022"], correct: 1 },
  { question: "Måneskin won 2021 with which rock song?", choices: ["Beggin'","Zitti e buoni","I Wanna Be Your Slave","Coraline"], correct: 1 },
  { question: "Which country hosted in 2023 on behalf of Ukraine?", choices: ["Spain","United Kingdom","Germany","Sweden"], correct: 1 },
  { question: "Salvador Sobral won 2017 for which country?", choices: ["Spain","Italy","Portugal","Greece"], correct: 2 },
  { question: "Which UK singer won 1976 with 'Save Your Kisses for Me'?", choices: ["Sandie Shaw","Brotherhood of Man","Lulu","Bucks Fizz"], correct: 1 },
  { question: "Bucks Fizz won 1981 with which song?", choices: ["Making Your Mind Up","Diggi-Loo Diggi-Ley","What's Another Year","Hold Me Now"], correct: 0 },
  { question: "Johnny Logan has won Eurovision how many times as a performer?", choices: ["1","2","3","4"], correct: 1 },
  { question: "Eurovision is organized by which broadcasting union?", choices: ["EBU","BBC","RTL","ARD"], correct: 0 },
  { question: "Big Five countries get a free pass — which is NOT one?", choices: ["UK","Germany","Norway","Spain"], correct: 2 },
  { question: "Loreen returned and won Eurovision again in which year?", choices: ["2021","2022","2023","2024"], correct: 2 },
  { question: "Dana won 1970 for which country with \"All Kinds of Everything\"?", choices: ["UK","Ireland","Spain","Netherlands"], correct: 1 },
  { question: "Which Eurovision winner first opened with \"We are the winners of Eurovision\"?", choices: ["Lordi","LT United","Verka Serduchka","Dustin"], correct: 1 },
  { question: "Italy returned to Eurovision in which year after a long break?", choices: ["2009","2010","2011","2012"], correct: 2 },
  { question: "Australia debuted in Eurovision in which year?", choices: ["2014","2015","2016","2017"], correct: 1 },
  { question: "\"Diva\" won 1998 for Israel sung by which artist?", choices: ["Dana International","Netta","Ofra Haza","Izhar Cohen"], correct: 0 },
  { question: "Eurovision 1969 had how many joint winners?", choices: ["2","3","4","5"], correct: 2 },
  { question: "\"Rise Like a Phoenix\" was sung by Conchita Wurst representing?", choices: ["Germany","Austria","Switzerland","Hungary"], correct: 1 },
  { question: "\"Heroes\" won Eurovision 2015 for Sweden sung by?", choices: ["Loreen","Måns Zelmerlöw","John Lundvik","Robin Bengtsson"], correct: 1 },
  { question: "Which country won Eurovision 2024 with \"The Code\"?", choices: ["Switzerland","Israel","Croatia","France"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EurovisionQuizSettings): EurovisionQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EurovisionQuizState, action: EurovisionQuizAction): EurovisionQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EurovisionQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

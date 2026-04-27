import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface BrazilCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BrazilCultureQuizSettings { questions: "10" | "20"; }
export interface BrazilCultureQuizState { questions: BrazilCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BrazilCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: BrazilCultureQuizQuestion[] = [
  { question: "What is the capital of Brazil?", choices: ["Rio de Janeiro","São Paulo","Brasília","Salvador"], correct: 2 },
  { question: "Brazilians speak which language?", choices: ["Spanish","Portuguese","French","English"], correct: 1 },
  { question: "Carnaval's most famous city is?", choices: ["Salvador","Recife","Rio","Belo Horizonte"], correct: 2 },
  { question: "Pelé played mostly which position?", choices: ["Defender","Forward","Goalie","Midfielder"], correct: 1 },
  { question: "Christ the Redeemer overlooks?", choices: ["São Paulo","Rio","Salvador","Brasília"], correct: 1 },
  { question: "Bossa nova fused samba with?", choices: ["Rock","Jazz","Disco","Reggae"], correct: 1 },
  { question: "Feijoada features which key ingredient?", choices: ["Black beans","Rice","Corn","Wheat"], correct: 0 },
  { question: "The Amazon flows mostly through?", choices: ["Argentina","Brazil","Peru","Colombia"], correct: 1 },
  { question: "Caipirinha is made with?", choices: ["Rum","Cachaça","Tequila","Vodka"], correct: 1 },
  { question: "Brazil won how many men's World Cups?", choices: ["3","4","5","6"], correct: 2 },
  { question: "The samba dance originates from?", choices: ["Indigenous","African heritage","Portuguese","All blends"], correct: 1 },
  { question: "Brazil gained independence from?", choices: ["Spain","Portugal","France","UK"], correct: 1 },
  { question: "Capoeira combines dance with?", choices: ["Yoga","Martial arts","Music only","Drama"], correct: 1 },
  { question: "Which is a famous beach in Rio?", choices: ["Bondi","Copacabana","Waikiki","Venice"], correct: 1 },
  { question: "Brazil's currency is?", choices: ["Peso","Real","Cruzeiro","Dollar"], correct: 1 },
  { question: "The Amazon rainforest is called the planet's?", choices: ["Battery","Lungs","Heart","Roof"], correct: 1 },
  { question: "Pedro II was an emperor of?", choices: ["Portugal","Brazil","Spain","Mexico"], correct: 1 },
  { question: "Tom Jobim wrote which famous bossa nova?", choices: ["Águas de Março","Garota de Ipanema","Both","Neither"], correct: 2 },
  { question: "Salvador's state is?", choices: ["Bahia","Pernambuco","Ceará","Maranhão"], correct: 0 },
  { question: "Açaí is a?", choices: ["Coffee","Berry","Fish","Cheese"], correct: 1 },
  { question: "Brazil's largest city is?", choices: ["Rio","São Paulo","Brasília","Belo Horizonte"], correct: 1 },
  { question: "Pão de queijo is?", choices: ["Cheese bread","Stew","Cake","Beer"], correct: 0 },
  { question: "The Maracanã is a?", choices: ["Beach","Stadium","River","Mountain"], correct: 1 },
  { question: "Brazil shares a border with which Pacific country? (trick)", choices: ["Chile","Peru","Ecuador","None"], correct: 3 },
  { question: "Forró is a music style from the?", choices: ["Northeast","South","Center","Amazon"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BrazilCultureQuizSettings): BrazilCultureQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BrazilCultureQuizState, action: BrazilCultureQuizAction): BrazilCultureQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BrazilCultureQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

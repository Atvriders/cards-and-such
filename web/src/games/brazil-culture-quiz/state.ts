import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface BrazilCultureQuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BrazilCultureQuizSettings { questions: "10" | "20"; }
export interface BrazilCultureQuizState { questions: BrazilCultureQuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BrazilCultureQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: BrazilCultureQuizQuestion[] = [
  { question: "What is the capital of Brazil?", choices: ["Rio de Janeiro","Sao Paulo","Brasilia","Salvador"], correct: 2 },
  { question: "Which is the official language of Brazil?", choices: ["Spanish","Portuguese","French","English"], correct: 1 },
  { question: "The Amazon rainforest mostly lies within which country?", choices: ["Peru","Colombia","Brazil","Venezuela"], correct: 2 },
  { question: "Carnival in Brazil is most famously celebrated in which city?", choices: ["Sao Paulo","Salvador","Rio de Janeiro","Recife"], correct: 2 },
  { question: "The Christ the Redeemer statue overlooks which city?", choices: ["Sao Paulo","Rio de Janeiro","Belo Horizonte","Curitiba"], correct: 1 },
  { question: "Brazil declared independence from which country in 1822?", choices: ["Spain","France","Portugal","Netherlands"], correct: 2 },
  { question: "Which Brazilian footballer is widely known simply as 'Pele'?", choices: ["Edson Arantes do Nascimento","Manuel dos Santos","Arthur Friedenreich","Romario"], correct: 0 },
  { question: "Feijoada, considered a national dish of Brazil, is a stew of?", choices: ["Beans and pork","Corn and chicken","Fish and rice","Lentils and beef"], correct: 0 },
  { question: "Samba music originated in which Brazilian region?", choices: ["Amazon","Northeast","Rio de Janeiro","South"], correct: 2 },
  { question: "Which river in Brazil discharges the most water of any river in the world?", choices: ["Sao Francisco","Parana","Amazon","Tocantins"], correct: 2 },
  { question: "Iguazu Falls lies on the border of Brazil with which country?", choices: ["Bolivia","Paraguay","Argentina","Uruguay"], correct: 2 },
  { question: "Brazil's currency is the?", choices: ["Peso","Real","Cruzeiro","Escudo"], correct: 1 },
  { question: "Which Brazilian city was the country's capital before Brasilia?", choices: ["Sao Paulo","Salvador","Rio de Janeiro","Belo Horizonte"], correct: 2 },
  { question: "How many times has Brazil won the FIFA World Cup (as of 2024)?", choices: ["Three","Four","Five","Six"], correct: 2 },
  { question: "Which Brazilian author wrote 'The Alchemist'?", choices: ["Jorge Amado","Paulo Coelho","Machado de Assis","Clarice Lispector"], correct: 1 },
  { question: "Caipirinha, Brazil's national cocktail, is made from?", choices: ["Rum and lime","Cachaca, sugar, lime","Tequila and lime","Vodka and lime"], correct: 1 },
  { question: "Bossa nova music emerged in Brazil during which decade?", choices: ["1940s","1950s","1960s","1970s"], correct: 1 },
  { question: "Brazil is the world's largest producer of which beverage crop?", choices: ["Tea","Coffee","Cocoa","Sugarcane (only)"], correct: 1 },
  { question: "The Maracana stadium is located in which city?", choices: ["Sao Paulo","Brasilia","Rio de Janeiro","Salvador"], correct: 2 },
  { question: "Which is Brazil's largest city by population?", choices: ["Rio de Janeiro","Sao Paulo","Brasilia","Fortaleza"], correct: 1 },
  { question: "Pao de queijo is a snack made primarily from cheese and what flour?", choices: ["Wheat","Corn","Tapioca (cassava)","Rice"], correct: 2 },
  { question: "Which architect designed many of Brasilia's modernist buildings?", choices: ["Lucio Costa","Oscar Niemeyer","Paulo Mendes da Rocha","Ruy Ohtake"], correct: 1 },
  { question: "Capoeira combines martial arts with?", choices: ["Wrestling","Music and dance","Acrobatics only","Fencing"], correct: 1 },
  { question: "Which Brazilian state is known as the heartland of Afro-Brazilian culture?", choices: ["Bahia","Sao Paulo","Minas Gerais","Para"], correct: 0 },
  { question: "Which Formula 1 driver from Brazil won three world championships?", choices: ["Nelson Piquet","Ayrton Senna","Rubens Barrichello","Felipe Massa"], correct: 1 },
  { question: "The Pantanal is the world's largest tropical?", choices: ["Desert","Wetland","Savanna","Mangrove"], correct: 1 },
  { question: "Which Brazilian dance is performed during Rio's Carnival parades?", choices: ["Tango","Samba","Salsa","Forro"], correct: 1 },
  { question: "Which empire ruled Brazil from 1822 to 1889?", choices: ["Republic","Empire of Brazil","Kingdom of Portugal","Spanish Viceroyalty"], correct: 1 },
  { question: "Coffee beans were historically called Brazilian 'green' what?", choices: ["Gold","Diamonds","Silk","Salt"], correct: 0 },
  { question: "Which Brazilian model became one of the world's highest-paid in the 2000s?", choices: ["Adriana Lima","Gisele Bundchen","Alessandra Ambrosio","Isabeli Fontana"], correct: 1 }
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

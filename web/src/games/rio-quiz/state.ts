import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RioQuizSettings { questions: "10" | "20"; }
export interface RioQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RioQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Christ the Redeemer overlooks Rio from?",
    "choices": [
      "Sugarloaf",
      "Corcovado",
      "Pedra Bonita",
      "Tijuca peak"
    ],
    "correct": 1
  },
  {
    "question": "Rio's beach immediately south of Copacabana is?",
    "choices": [
      "Botafogo",
      "Ipanema",
      "Leblon east",
      "Flamengo"
    ],
    "correct": 1
  },
  {
    "question": "Carnival in Rio is held in?",
    "choices": [
      "January",
      "February or early March",
      "April",
      "June"
    ],
    "correct": 1
  },
  {
    "question": "The Sambódromo hosts?",
    "choices": [
      "football",
      "samba school parades",
      "rodeo",
      "music festivals only"
    ],
    "correct": 1
  },
  {
    "question": "Rio is in which Brazilian state?",
    "choices": [
      "São Paulo",
      "Rio de Janeiro",
      "Minas Gerais",
      "Bahia"
    ],
    "correct": 1
  },
  {
    "question": "Sugarloaf Mountain is reached primarily by?",
    "choices": [
      "funicular",
      "cable car",
      "stairs only",
      "helicopter only"
    ],
    "correct": 1
  },
  {
    "question": "The 2016 Summer Olympics were hosted by?",
    "choices": [
      "Rio",
      "Tokyo",
      "London",
      "Beijing"
    ],
    "correct": 0
  },
  {
    "question": "Maracanã is famous as a?",
    "choices": [
      "beach",
      "football stadium",
      "cathedral",
      "shopping mall"
    ],
    "correct": 1
  },
  {
    "question": "The 1950 World Cup final upset at Maracanã was won by?",
    "choices": [
      "Brazil",
      "Uruguay",
      "Italy",
      "Spain"
    ],
    "correct": 1
  },
  {
    "question": "Rio's iconic black-and-white wavy sidewalk pattern was designed by?",
    "choices": [
      "Niemeyer",
      "Burle Marx",
      "Lina Bo Bardi",
      "Costa"
    ],
    "correct": 1
  },
  {
    "question": "Rio served as Brazil's capital until?",
    "choices": [
      "1822",
      "1889",
      "1960",
      "1985"
    ],
    "correct": 2
  },
  {
    "question": "Brasília replaced Rio as the federal capital in?",
    "choices": [
      "1955",
      "1960",
      "1968",
      "1972"
    ],
    "correct": 1
  },
  {
    "question": "Tijuca is the world's largest urban?",
    "choices": [
      "beach",
      "rainforest",
      "mall",
      "stadium"
    ],
    "correct": 1
  },
  {
    "question": "Pão de Queijo is a snack made of?",
    "choices": [
      "wheat & ham",
      "cheese & cassava starch",
      "corn & beans",
      "rice & coconut"
    ],
    "correct": 1
  },
  {
    "question": "Brazil's national cocktail is the?",
    "choices": [
      "Mojito",
      "Caipirinha",
      "Pisco Sour",
      "Cuba Libre"
    ],
    "correct": 1
  },
  {
    "question": "Caipirinha is made with cachaça, sugar and?",
    "choices": [
      "lime",
      "lemon",
      "orange",
      "mint"
    ],
    "correct": 0
  },
  {
    "question": "Feijoada is a traditional Brazilian stew with?",
    "choices": [
      "chickpeas & lamb",
      "black beans & pork",
      "white beans & beef",
      "lentils & chicken"
    ],
    "correct": 1
  },
  {
    "question": "Açaí na tigela originally hails from?",
    "choices": [
      "Amazon region",
      "Andes",
      "Pantanal",
      "Patagonia"
    ],
    "correct": 0
  },
  {
    "question": "Bossa nova was born in Rio in the?",
    "choices": [
      "1940s",
      "late 1950s",
      "1970s",
      "1990s"
    ],
    "correct": 1
  },
  {
    "question": "'The Girl from Ipanema' was co-written by?",
    "choices": [
      "Caetano Veloso",
      "Antonio Carlos Jobim",
      "Gilberto Gil",
      "Chico Buarque"
    ],
    "correct": 1
  },
  {
    "question": "Lapa is famous for its?",
    "choices": [
      "aqueduct arches & nightlife",
      "skyscrapers",
      "ancient ruins",
      "ski slopes"
    ],
    "correct": 0
  },
  {
    "question": "The colorful Escadaria Selarón steps were created by an artist from?",
    "choices": [
      "Italy",
      "Chile",
      "Spain",
      "Argentina"
    ],
    "correct": 1
  },
  {
    "question": "Rio's main beachfront avenue is?",
    "choices": [
      "Avenida Atlântica",
      "Avenida Paulista",
      "Avenida Brasil",
      "Avenida Rio Branco"
    ],
    "correct": 0
  },
  {
    "question": "Rio residents are called?",
    "choices": [
      "Paulistas",
      "Cariocas",
      "Mineiros",
      "Baianos"
    ],
    "correct": 1
  },
  {
    "question": "The favela perched above Ipanema/Leblon is?",
    "choices": [
      "Rocinha",
      "Vidigal",
      "Mangueira",
      "Salgueiro"
    ],
    "correct": 1
  },
  {
    "question": "Rocinha is South America's largest?",
    "choices": [
      "public park",
      "favela",
      "shopping center",
      "rail yard"
    ],
    "correct": 1
  },
  {
    "question": "Christ the Redeemer was inaugurated in?",
    "choices": [
      "1911",
      "1931",
      "1951",
      "1971"
    ],
    "correct": 1
  },
  {
    "question": "Niterói, across the bay, is connected to Rio by?",
    "choices": [
      "Rio-Niterói Bridge",
      "Tijuca Tunnel",
      "Rebouças Tunnel",
      "metro only"
    ],
    "correct": 0
  },
  {
    "question": "Cristo Redentor stands roughly how tall (statue)?",
    "choices": [
      "10 m",
      "30 m",
      "50 m",
      "80 m"
    ],
    "correct": 1
  },
  {
    "question": "The colorful samba schools compete during?",
    "choices": [
      "Christmas",
      "Carnival",
      "Easter",
      "Independence Day"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: RioQuizSettings): RioQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RioQuizState, action: RioQuizAction): RioQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RioQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

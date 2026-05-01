import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CannesQuizSettings { questions: "10" | "20"; }
export interface CannesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CannesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Cannes Film Festival is held in which country?",
    "choices": [
      "Italy",
      "France",
      "Spain",
      "Belgium"
    ],
    "correct": 1
  },
  {
    "question": "Cannes Festival was first held in?",
    "choices": [
      "1939 (postponed)",
      "1946",
      "1950",
      "1955"
    ],
    "correct": 1
  },
  {
    "question": "Top prize at Cannes is?",
    "choices": [
      "Golden Lion",
      "Palme d'Or",
      "Golden Bear",
      "Silver Shell"
    ],
    "correct": 1
  },
  {
    "question": "Palme d'Or was introduced (named) in?",
    "choices": [
      "1939",
      "1946",
      "1955",
      "1964"
    ],
    "correct": 2
  },
  {
    "question": "Cannes is held annually in which month (typically)?",
    "choices": [
      "April",
      "May",
      "June",
      "July"
    ],
    "correct": 1
  },
  {
    "question": "Festival venue's main building?",
    "choices": [
      "Carlton",
      "Palais des Festivals",
      "Croisette Hall",
      "Majestic"
    ],
    "correct": 1
  },
  {
    "question": "Famous boulevard along the Cannes seafront?",
    "choices": [
      "Champs-Elysees",
      "La Croisette",
      "Promenade Anglais",
      "Rue Royale"
    ],
    "correct": 1
  },
  {
    "question": "Director with most Palme d'Or wins (2 each, several)?",
    "choices": [
      "Spielberg",
      "Ken Loach (2)",
      "Lynch",
      "Tarkovsky"
    ],
    "correct": 1
  },
  {
    "question": "First American film to win Palme d'Or?",
    "choices": [
      "Marty",
      "The Lost Weekend",
      "All About Eve",
      "On the Waterfront"
    ],
    "correct": 0
  },
  {
    "question": "Pulp Fiction won the Palme d'Or in?",
    "choices": [
      "1992",
      "1994",
      "1996",
      "1998"
    ],
    "correct": 1
  },
  {
    "question": "Apocalypse Now shared the Palme in?",
    "choices": [
      "1977",
      "1979",
      "1981",
      "1983"
    ],
    "correct": 1
  },
  {
    "question": "Taxi Driver won the Palme in?",
    "choices": [
      "1974",
      "1976",
      "1978",
      "1980"
    ],
    "correct": 1
  },
  {
    "question": "Parasite won Palme d'Or in?",
    "choices": [
      "2018",
      "2019",
      "2020",
      "2021"
    ],
    "correct": 1
  },
  {
    "question": "Anatomy of a Fall won Palme in?",
    "choices": [
      "2022",
      "2023",
      "2024",
      "2021"
    ],
    "correct": 1
  },
  {
    "question": "The Square (Ostlund) won Palme in?",
    "choices": [
      "2015",
      "2016",
      "2017",
      "2018"
    ],
    "correct": 2
  },
  {
    "question": "Triangle of Sadness (Ostlund) won Palme in?",
    "choices": [
      "2020",
      "2021",
      "2022",
      "2023"
    ],
    "correct": 2
  },
  {
    "question": "First female solo Palme d'Or director?",
    "choices": [
      "Jane Campion",
      "Julia Ducournau",
      "Justine Triet",
      "Lina Wertmuller"
    ],
    "correct": 0
  },
  {
    "question": "Jane Campion's Palme d'Or was for?",
    "choices": [
      "Bright Star",
      "The Piano",
      "Holy Smoke",
      "An Angel at My Table"
    ],
    "correct": 1
  },
  {
    "question": "Titane (2021) director?",
    "choices": [
      "Audrey Diwan",
      "Julia Ducournau",
      "Mati Diop",
      "Celine Sciamma"
    ],
    "correct": 1
  },
  {
    "question": "Cannes jury president is selected each year by?",
    "choices": [
      "Mayor of Cannes",
      "Festival President",
      "French President",
      "UNESCO"
    ],
    "correct": 1
  },
  {
    "question": "Festival's longtime president (1985-2014)?",
    "choices": [
      "Gilles Jacob",
      "Pierre Lescure",
      "Thierry Fremaux",
      "Jean Cocteau"
    ],
    "correct": 0
  },
  {
    "question": "Cannes Festival opens with a film called?",
    "choices": [
      "Out of Competition",
      "Opening Film",
      "La Premiere",
      "First Light"
    ],
    "correct": 1
  },
  {
    "question": "Section for new directors at Cannes?",
    "choices": [
      "Un Certain Regard",
      "Directors' Fortnight",
      "Critics' Week",
      "All of these"
    ],
    "correct": 3
  },
  {
    "question": "Critics' Week is run by?",
    "choices": [
      "Cahiers du Cinema",
      "French Syndicate of Cinema Critics",
      "Variety",
      "Le Monde"
    ],
    "correct": 1
  },
  {
    "question": "Director banned by Cannes (2011) for Nazi remarks?",
    "choices": [
      "Lars von Trier",
      "Gaspar Noe",
      "Kim Ki-duk",
      "Bruno Dumont"
    ],
    "correct": 0
  },
  {
    "question": "Best Director (2017) for The Beguiled?",
    "choices": [
      "Sofia Coppola",
      "Lynne Ramsay",
      "Naomi Kawase",
      "Andrea Arnold"
    ],
    "correct": 0
  },
  {
    "question": "4 Months, 3 Weeks and 2 Days won Palme in?",
    "choices": [
      "2005",
      "2007",
      "2009",
      "2011"
    ],
    "correct": 1
  },
  {
    "question": "Palme d'Or 2013 (Blue Is the Warmest Color) director?",
    "choices": [
      "Cuaron",
      "Kechiche",
      "Refn",
      "Jia Zhangke"
    ],
    "correct": 1
  },
  {
    "question": "Cannes Marche du Film is the festival's?",
    "choices": [
      "Awards gala",
      "Film market",
      "Opening parade",
      "Jury room"
    ],
    "correct": 1
  },
  {
    "question": "Cannes festival logo features what motif?",
    "choices": [
      "Anchor",
      "Palm leaf",
      "Lion",
      "Tower"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CannesQuizSettings): CannesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CannesQuizState, action: CannesQuizAction): CannesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CannesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

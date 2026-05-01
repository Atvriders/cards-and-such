import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ManBookerQuizSettings { questions: "10" | "20"; }
export interface ManBookerQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ManBookerQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Booker Prize was launched in?",
    "choices": [
      "1965",
      "1969",
      "1973",
      "1977"
    ],
    "correct": 1
  },
  {
    "question": "Originally called?",
    "choices": [
      "Booker Prize",
      "Man Booker",
      "Booker McConnell Prize",
      "International Booker"
    ],
    "correct": 2
  },
  {
    "question": "Booker Prize is for fiction written in?",
    "choices": [
      "French",
      "English",
      "Any language",
      "German"
    ],
    "correct": 1
  },
  {
    "question": "Until 2014 the Booker was open to authors from?",
    "choices": [
      "UK only",
      "Commonwealth/Ireland",
      "Europe",
      "Anywhere"
    ],
    "correct": 1
  },
  {
    "question": "Salman Rushdie won the Booker in 1981 for?",
    "choices": [
      "Shame",
      "Midnight's Children",
      "The Satanic Verses",
      "The Moor's Last Sigh"
    ],
    "correct": 1
  },
  {
    "question": "Midnight's Children was later voted the?",
    "choices": [
      "Booker of Bookers",
      "Lost Booker",
      "Best of Booker",
      "All of these"
    ],
    "correct": 3
  },
  {
    "question": "J.M. Coetzee was the first author to win Booker how many times?",
    "choices": [
      "Once",
      "Twice",
      "Thrice",
      "Four times"
    ],
    "correct": 1
  },
  {
    "question": "Coetzee's two Booker winners are?",
    "choices": [
      "Disgrace + Life and Times",
      "Foe + Disgrace",
      "Boyhood + Disgrace",
      "Slow Man + Disgrace"
    ],
    "correct": 0
  },
  {
    "question": "Hilary Mantel won the Booker for?",
    "choices": [
      "Bring Up the Bodies",
      "Wolf Hall",
      "Both",
      "Neither"
    ],
    "correct": 2
  },
  {
    "question": "Wolf Hall (Mantel) won in?",
    "choices": [
      "2007",
      "2009",
      "2011",
      "2013"
    ],
    "correct": 1
  },
  {
    "question": "Bring Up the Bodies won in?",
    "choices": [
      "2010",
      "2011",
      "2012",
      "2013"
    ],
    "correct": 2
  },
  {
    "question": "Margaret Atwood won the Booker for?",
    "choices": [
      "The Blind Assassin",
      "The Testaments",
      "Both",
      "Alias Grace"
    ],
    "correct": 2
  },
  {
    "question": "Atwood's first Booker (Blind Assassin) was in?",
    "choices": [
      "1998",
      "2000",
      "2002",
      "2004"
    ],
    "correct": 1
  },
  {
    "question": "Yann Martel won the Booker for?",
    "choices": [
      "Life of Pi",
      "Beatrice and Virgil",
      "The High Mountains",
      "Self"
    ],
    "correct": 0
  },
  {
    "question": "Life of Pi won the Booker in?",
    "choices": [
      "2000",
      "2002",
      "2004",
      "2006"
    ],
    "correct": 1
  },
  {
    "question": "Aravind Adiga won the Booker for?",
    "choices": [
      "Last Man in Tower",
      "The White Tiger",
      "Selection Day",
      "Amnesty"
    ],
    "correct": 1
  },
  {
    "question": "The White Tiger won in?",
    "choices": [
      "2006",
      "2008",
      "2010",
      "2012"
    ],
    "correct": 1
  },
  {
    "question": "Hilary Mantel's two consecutive wins made her?",
    "choices": [
      "First Brit",
      "First woman with 2",
      "First with 2 in Tudor genre",
      "All of these"
    ],
    "correct": 3
  },
  {
    "question": "Marlon James won the Booker for?",
    "choices": [
      "John Crow's Devil",
      "The Book of Night Women",
      "A Brief History of Seven Killings",
      "Black Leopard"
    ],
    "correct": 2
  },
  {
    "question": "The Sellout (Beatty) won in?",
    "choices": [
      "2014",
      "2015",
      "2016",
      "2017"
    ],
    "correct": 2
  },
  {
    "question": "Lincoln in the Bardo (Saunders) won in?",
    "choices": [
      "2015",
      "2016",
      "2017",
      "2018"
    ],
    "correct": 2
  },
  {
    "question": "Milkman (Anna Burns) won in?",
    "choices": [
      "2017",
      "2018",
      "2019",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "2019 Booker was shared by Atwood and?",
    "choices": [
      "Salman Rushdie",
      "Bernardine Evaristo",
      "Lucy Ellmann",
      "Elif Shafak"
    ],
    "correct": 1
  },
  {
    "question": "Bernardine Evaristo's winning novel?",
    "choices": [
      "Mr Loverman",
      "Girl, Woman, Other",
      "Soul Tourists",
      "Lara"
    ],
    "correct": 1
  },
  {
    "question": "Shuggie Bain (Stuart) won in?",
    "choices": [
      "2019",
      "2020",
      "2021",
      "2022"
    ],
    "correct": 1
  },
  {
    "question": "The Promise (Galgut) won in?",
    "choices": [
      "2020",
      "2021",
      "2022",
      "2023"
    ],
    "correct": 1
  },
  {
    "question": "The Seven Moons of Maali Almeida won in?",
    "choices": [
      "2021",
      "2022",
      "2023",
      "2024"
    ],
    "correct": 1
  },
  {
    "question": "Author of 2022 winner Seven Moons of Maali Almeida?",
    "choices": [
      "Karunatilaka",
      "Hanif",
      "Sobhraj",
      "Selvadurai"
    ],
    "correct": 0
  },
  {
    "question": "Prophet Song (Lynch) won in?",
    "choices": [
      "2022",
      "2023",
      "2024",
      "2021"
    ],
    "correct": 1
  },
  {
    "question": "International Booker Prize honors works in translation since?",
    "choices": [
      "2005",
      "2016",
      "2010",
      "2020"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ManBookerQuizSettings): ManBookerQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ManBookerQuizState, action: ManBookerQuizAction): ManBookerQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ManBookerQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

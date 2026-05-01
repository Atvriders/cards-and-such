import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NobelPeaceQuizSettings { questions: "10" | "20"; }
export interface NobelPeaceQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NobelPeaceQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "In which city is the Nobel Peace Prize awarded?",
    "choices": [
      "Stockholm",
      "Oslo",
      "Helsinki",
      "Copenhagen"
    ],
    "correct": 1
  },
  {
    "question": "In what year was the first Nobel Peace Prize awarded?",
    "choices": [
      "1895",
      "1901",
      "1918",
      "1945"
    ],
    "correct": 1
  },
  {
    "question": "Whose will established the Nobel Prizes?",
    "choices": [
      "Alfred Nobel",
      "Albert Nobel",
      "Andrew Nobel",
      "Anders Nobel"
    ],
    "correct": 0
  },
  {
    "question": "In what year did Mandela & de Klerk share the prize?",
    "choices": [
      "1991",
      "1993",
      "1995",
      "1997"
    ],
    "correct": 1
  },
  {
    "question": "In what year did Martin Luther King Jr. win?",
    "choices": [
      "1962",
      "1964",
      "1968",
      "1972"
    ],
    "correct": 1
  },
  {
    "question": "Mother Teresa won the Peace Prize in?",
    "choices": [
      "1973",
      "1979",
      "1986",
      "1997"
    ],
    "correct": 1
  },
  {
    "question": "Malala Yousafzai shared the prize in?",
    "choices": [
      "2012",
      "2013",
      "2014",
      "2015"
    ],
    "correct": 2
  },
  {
    "question": "Did Mahatma Gandhi ever win the Peace Prize?",
    "choices": [
      "Yes, 1948",
      "Yes, 1947",
      "Yes, 1939",
      "No, never"
    ],
    "correct": 3
  },
  {
    "question": "Doctors Without Borders (MSF) won in?",
    "choices": [
      "1999",
      "2001",
      "2003",
      "2008"
    ],
    "correct": 0
  },
  {
    "question": "Henry Kissinger shared the Peace Prize in?",
    "choices": [
      "1971",
      "1973",
      "1975",
      "1979"
    ],
    "correct": 1
  },
  {
    "question": "Wangari Maathai of Kenya won in?",
    "choices": [
      "1998",
      "2002",
      "2004",
      "2007"
    ],
    "correct": 2
  },
  {
    "question": "Liu Xiaobo (in absentia) won in?",
    "choices": [
      "2008",
      "2010",
      "2012",
      "2014"
    ],
    "correct": 1
  },
  {
    "question": "Body that selects the Peace laureate?",
    "choices": [
      "Swedish Academy",
      "Norwegian Nobel Committee",
      "Karolinska Institutet",
      "Nobel Foundation"
    ],
    "correct": 1
  },
  {
    "question": "Barack Obama won the Peace Prize in?",
    "choices": [
      "2008",
      "2009",
      "2010",
      "2011"
    ],
    "correct": 1
  },
  {
    "question": "Al Gore shared the prize with which body in 2007?",
    "choices": [
      "UNEP",
      "IPCC",
      "IAEA",
      "UNHCR"
    ],
    "correct": 1
  },
  {
    "question": "The IAEA and ElBaradei won in?",
    "choices": [
      "2003",
      "2005",
      "2007",
      "2009"
    ],
    "correct": 1
  },
  {
    "question": "The EU won the Peace Prize in?",
    "choices": [
      "2010",
      "2011",
      "2012",
      "2013"
    ],
    "correct": 2
  },
  {
    "question": "Aung San Suu Kyi won in?",
    "choices": [
      "1989",
      "1991",
      "1993",
      "1995"
    ],
    "correct": 1
  },
  {
    "question": "Lech Walesa of Poland won in?",
    "choices": [
      "1981",
      "1983",
      "1985",
      "1987"
    ],
    "correct": 1
  },
  {
    "question": "Mikhail Gorbachev won in?",
    "choices": [
      "1988",
      "1989",
      "1990",
      "1991"
    ],
    "correct": 2
  },
  {
    "question": "The Dalai Lama won in?",
    "choices": [
      "1987",
      "1989",
      "1991",
      "1993"
    ],
    "correct": 1
  },
  {
    "question": "Yitzhak Rabin, Shimon Peres & Yasser Arafat shared in?",
    "choices": [
      "1992",
      "1993",
      "1994",
      "1995"
    ],
    "correct": 2
  },
  {
    "question": "Jimmy Carter won the Peace Prize in?",
    "choices": [
      "1998",
      "2000",
      "2002",
      "2004"
    ],
    "correct": 2
  },
  {
    "question": "Kofi Annan and the UN shared in?",
    "choices": [
      "1999",
      "2000",
      "2001",
      "2002"
    ],
    "correct": 2
  },
  {
    "question": "Theodore Roosevelt won in 1906 for mediating which war?",
    "choices": [
      "Boer War",
      "Russo-Japanese War",
      "Boxer Rebellion",
      "WWI"
    ],
    "correct": 1
  },
  {
    "question": "Woodrow Wilson won in 1919 for?",
    "choices": [
      "The League of Nations",
      "Ending WWI",
      "Suffrage",
      "Fourteen Points only"
    ],
    "correct": 0
  },
  {
    "question": "ICAN (anti-nuclear coalition) won in?",
    "choices": [
      "2015",
      "2016",
      "2017",
      "2018"
    ],
    "correct": 2
  },
  {
    "question": "Abiy Ahmed of Ethiopia won in?",
    "choices": [
      "2017",
      "2018",
      "2019",
      "2020"
    ],
    "correct": 2
  },
  {
    "question": "Maria Ressa & Dmitry Muratov won in 2021 for?",
    "choices": [
      "Press freedom",
      "Climate",
      "Disarmament",
      "Refugee aid"
    ],
    "correct": 0
  },
  {
    "question": "Narges Mohammadi (2023) is from which country?",
    "choices": [
      "Afghanistan",
      "Iran",
      "Iraq",
      "Yemen"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NobelPeaceQuizSettings): NobelPeaceQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NobelPeaceQuizState, action: NobelPeaceQuizAction): NobelPeaceQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NobelPeaceQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

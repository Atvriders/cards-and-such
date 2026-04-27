import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DisneyClassicsQuizSettings { questions: "10" | "20" | "30"; }
export interface DisneyClassicsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DisneyClassicsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Disney's first feature film?", choices: ["Pinocchio", "Snow White and the Seven Dwarfs", "Bambi", "Fantasia"], correct: 1 },
  { question: "Year of 'Snow White' release?", choices: ["1934", "1937", "1940", "1942"], correct: 1 },
  { question: "Mickey Mouse first appeared in?", choices: ["Plane Crazy", "Steamboat Willie", "The Band Concert", "Fantasia"], correct: 1 },
  { question: "Who founded Walt Disney Animation Studios?", choices: ["Walt Disney", "Roy Disney", "Both brothers", "Lillian Disney"], correct: 2 },
  { question: "'The Little Mermaid' protagonist?", choices: ["Cinderella", "Belle", "Ariel", "Jasmine"], correct: 2 },
  { question: "Year 'The Little Mermaid' released?", choices: ["1985", "1989", "1991", "1994"], correct: 1 },
  { question: "'Beauty and the Beast' was the first animated film nominated for Best Picture in?", choices: ["1989", "1991", "1993", "1995"], correct: 1 },
  { question: "'Aladdin' main villain?", choices: ["Jafar", "Scar", "Frollo", "Maleficent"], correct: 0 },
  { question: "Genie in 'Aladdin' was voiced by?", choices: ["Robin Williams", "Eddie Murphy", "Jim Carrey", "Steve Martin"], correct: 0 },
  { question: "'The Lion King' (1994) main protagonist?", choices: ["Mufasa", "Simba", "Scar", "Timon"], correct: 1 },
  { question: "Who voices Mufasa?", choices: ["Morgan Freeman", "James Earl Jones", "Denzel Washington", "Samuel L. Jackson"], correct: 1 },
  { question: "Mulan's love interest?", choices: ["Li Shang", "Mushu", "The Emperor", "Shan Yu"], correct: 0 },
  { question: "What is the name of Cinderella's stepmother?", choices: ["Lady Tremaine", "Lady Catherine", "Lady Drizella", "Lady Anastasia"], correct: 0 },
  { question: "'Frozen' protagonists?", choices: ["Anna and Elsa", "Belle and Adam", "Tiana and Naveen", "Rapunzel and Eugene"], correct: 0 },
  { question: "Elsa's iconic song?", choices: ["How Far I'll Go", "Let It Go", "Part of Your World", "A Whole New World"], correct: 1 },
  { question: "'Moana' is set in what culture?", choices: ["Hawaiian", "Polynesian", "Maori", "Tongan"], correct: 1 },
  { question: "Maui in 'Moana' was voiced by?", choices: ["Dwayne Johnson", "Jason Momoa", "Kevin Hart", "Vin Diesel"], correct: 0 },
  { question: "Princess Tiana is from?", choices: ["Atlanta", "New Orleans", "Charleston", "Savannah"], correct: 1 },
  { question: "'Sleeping Beauty' main villain?", choices: ["Maleficent", "Ursula", "Cruella", "Evil Queen"], correct: 0 },
  { question: "'101 Dalmatians' villain?", choices: ["Cruella de Vil", "Maleficent", "Ursula", "Yzma"], correct: 0 },
  { question: "Pinocchio's nose grows when he?", choices: ["Lies", "Sings", "Sneezes", "Eats"], correct: 0 },
  { question: "Bambi's father is?", choices: ["Owl", "Great Prince", "Thumper's dad", "Mufasa"], correct: 1 },
  { question: "'Tangled' is based on?", choices: ["Cinderella", "Rapunzel", "Sleeping Beauty", "Snow White"], correct: 1 },
  { question: "Belle's father in 'Beauty and the Beast'?", choices: ["Maurice", "Lefou", "Gaston", "Cogsworth"], correct: 0 },
  { question: "'Hercules' Greek mythology villain?", choices: ["Hades", "Pain", "Panic", "Phil"], correct: 0 },
  { question: "Pocahontas was inspired by which historical figure?", choices: ["Sacagawea", "Pocahontas", "Mulan", "Jeanne d'Arc"], correct: 1 },
  { question: "Who voices Jasmine in 'Aladdin' (1992)?", choices: ["Linda Larkin", "Lea Salonga (singing)", "Both", "Mandy Moore"], correct: 2 },
  { question: "'The Hunchback of Notre Dame' is set in?", choices: ["London", "Paris", "Rome", "Vienna"], correct: 1 },
  { question: "Who is Disney's first African-American princess?", choices: ["Tiana", "Moana", "Mulan", "Pocahontas"], correct: 0 },
  { question: "'Robin Hood' (1973) main character is depicted as a?", choices: ["Bear", "Fox", "Wolf", "Lion"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: DisneyClassicsQuizSettings): DisneyClassicsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DisneyClassicsQuizState, action: DisneyClassicsQuizAction): DisneyClassicsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DisneyClassicsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

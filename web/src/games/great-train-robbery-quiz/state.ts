import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GreatTrainRobberyQuizSettings { questions: "10" | "20"; }
export interface GreatTrainRobberyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GreatTrainRobberyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {"question": "When did the Great Train Robbery (UK) occur?", "choices": ["1961", "1963", "1965", "1967"], "correct": 1},
  {"question": "Which Royal Mail train was robbed?", "choices": ["Glasgow-London", "London-Edinburgh", "Bristol-London", "Liverpool-London"], "correct": 0},
  {"question": "In which county did the robbery happen?", "choices": ["Berkshire", "Buckinghamshire", "Bedfordshire", "Surrey"], "correct": 1},
  {"question": "At which bridge did the gang stop the train?", "choices": ["Bridego Bridge", "Sears Crossing", "Cheddington", "Leighton Buzzard"], "correct": 0},
  {"question": "Roughly how much was stolen (GBP)?", "choices": ["260,000", "1.5 million", "2.6 million", "6 million"], "correct": 2},
  {"question": "Most famous robber who fled to Brazil?", "choices": ["Bruce Reynolds", "Ronnie Biggs", "Buster Edwards", "Charlie Wilson"], "correct": 1},
  {"question": "Mastermind credited with planning?", "choices": ["Ronnie Biggs", "Bruce Reynolds", "Roy James", "Gordon Goody"], "correct": 1},
  {"question": "How was the train signal tampered with?", "choices": ["Cut wires", "Glove over green + battery red", "Smoke bomb", "Hijacked signal box"], "correct": 1},
  {"question": "Where did the gang hide after the robbery?", "choices": ["Leatherslade Farm", "Bridego Cottage", "Cheddington Hall", "Aylesbury House"], "correct": 0},
  {"question": "What clue at the hideout helped police?", "choices": ["Map", "Monopoly board with prints", "Tickets", "Photos"], "correct": 1},
  {"question": "Which driver was struck during the robbery?", "choices": ["Jack Mills", "Frank Dewhurst", "David Whitby", "Tom Kett"], "correct": 0},
  {"question": "Biggs escaped from which UK prison?", "choices": ["Pentonville", "Wandsworth", "Brixton", "Strangeways"], "correct": 1},
  {"question": "Which film about Biggs starred Phil Collins?", "choices": ["Buster", "McVicar", "The Bank Job", "Robbery"], "correct": 0},
  {"question": "Many sentences handed down were how long?", "choices": ["10 years", "20 years", "30 years", "life"], "correct": 2},
  {"question": "Buster Edwards later ran what stall in London?", "choices": ["Newsstand", "Flower stall", "Coffee", "Books"], "correct": 1},
  {"question": "Which gang member was nicknamed 'The Weasel'?", "choices": ["Tommy Wisbey", "Jim Hussey", "Roy James", "Roger Cordrey"], "correct": 2},
  {"question": "Roy James was also known as a skilled what?", "choices": ["Locksmith", "Racing driver", "Boxer", "Jeweler"], "correct": 1},
  {"question": "Where was Biggs eventually rearrested?", "choices": ["Spain", "Brazil", "Australia", "Barbados"], "correct": 0},
  {"question": "Biggs returned to the UK voluntarily in?", "choices": ["1995", "2001", "2005", "2009"], "correct": 0},
  {"question": "Which 1967 film fictionalized the heist?", "choices": ["Robbery", "The Train", "The Heist", "Loot"], "correct": 0},
  {"question": "Which detective led the investigation?", "choices": ["Tommy Butler", "Jack Slipper", "Frank Williams", "Peter Vibart"], "correct": 0},
  {"question": "Slipper of the Yard tracked Biggs to where?", "choices": ["Rio", "Sydney", "Adelaide", "Melbourne"], "correct": 0},
  {"question": "How many men were directly involved?", "choices": ["8", "12", "15", "20"], "correct": 2},
  {"question": "The mailbags were transferred to what vehicles?", "choices": ["Vans", "Land Rovers + Army truck", "Lorries", "Cars"], "correct": 1},
  {"question": "Charlie Wilson escaped from which prison?", "choices": ["Winson Green", "Wandsworth", "Pentonville", "Durham"], "correct": 0},
  {"question": "Wilson was later murdered in what country?", "choices": ["Spain", "Portugal", "Mexico", "Morocco"], "correct": 0},
  {"question": "Which insider tipped off the gang (the 'Ulsterman')?", "choices": ["Patrick McKenna", "Brian Field", "Bill Boal", "Unknown insider"], "correct": 0},
  {"question": "Bruce Reynolds fled where after the heist?", "choices": ["Mexico/Canada", "Brazil", "South Africa", "France"], "correct": 0},
  {"question": "How long did the actual robbery roughly take?", "choices": ["5 minutes", "15 minutes", "30 minutes", "1 hour"], "correct": 1},
  {"question": "Buster Edwards's body was found in?", "choices": ["1994", "1995", "1996", "2000"], "correct": 0}
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GreatTrainRobberyQuizSettings): GreatTrainRobberyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questionsArr=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:questionsArr,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GreatTrainRobberyQuizState, action: GreatTrainRobberyQuizAction): GreatTrainRobberyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GreatTrainRobberyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

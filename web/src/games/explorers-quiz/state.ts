import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface ExplorersState { questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing"|"result"|"done"; }
export type ExplorersAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" } | { type:"tick" };
export interface ExplorersSettings { questions: "10"|"20"|"30"; }

const ALL_Q: QuizQuestion[] = [
  { question:"Christopher Columbus first reached the Americas in which year?", choices:["1488","1492","1497","1500"], correct:1 },
  { question:"Which explorer was first to circumnavigate the globe (completing the voyage)?", choices:["Magellan","Juan Sebastián Elcano","Francis Drake","Vasco da Gama"], correct:1 },
  { question:"Vasco da Gama found the sea route to which region?", choices:["Americas","India","China","Africa"], correct:1 },
  { question:"Which explorer claimed Canada for France and sailed the St. Lawrence River?", choices:["Jacques Cartier","Samuel de Champlain","Giovanni Verrazzano","Étienne Brûlé"], correct:0 },
  { question:"Who led the first European expedition across the Pacific Ocean?", choices:["Vasco Núñez de Balboa","Ferdinand Magellan","Juan de Fuca","James Cook"], correct:1 },
  { question:"Roald Amundsen was first to reach which pole?", choices:["North Pole","South Pole","Magnetic north pole","Geomagnetic south pole"], correct:1 },
  { question:"Robert Peary claimed to be first to reach which pole in 1909?", choices:["South Pole","North Pole","Magnetic north pole","Geographic south pole"], correct:1 },
  { question:"Which explorer led the first European overland journey to China (13th century)?", choices:["Ibn Battuta","Marco Polo","Zheng He","Niccolò Polo"], correct:1 },
  { question:"Which Chinese admiral led massive maritime expeditions in the early 15th century?", choices:["Kublai Khan","Zheng He","Cheng Zu","Yongle Emperor"], correct:1 },
  { question:"Leif Erikson came from which Norse homeland?", choices:["Denmark","Sweden","Greenland (Norse)","Iceland"], correct:2 },
  { question:"James Cook is famous for mapping which ocean?", choices:["Atlantic","Arctic","Pacific","Indian"], correct:2 },
  { question:"Which explorer discovered Victoria Falls in Africa?", choices:["Henry Morton Stanley","Richard Francis Burton","David Livingstone","John Speke"], correct:2 },
  { question:"Henry Morton Stanley is famous for finding?", choices:["The source of the Nile","Dr. Livingstone in Africa","The Congo River","Victoria Falls"], correct:1 },
  { question:"Who first successfully trekked to the South Pole in 1911?", choices:["Ernest Shackleton","Robert Falcon Scott","Roald Amundsen","Douglas Mawson"], correct:2 },
  { question:"Which explorer founded the city of Quebec in 1608?", choices:["Jacques Cartier","Samuel de Champlain","Louis Jolliet","René-Robert de La Salle"], correct:1 },
  { question:"Amerigo Vespucci's name was given to which continents?", choices:["Europe and Asia","North and South America","Africa and Antarctica","Australia and Oceania"], correct:1 },
  { question:"Francis Drake was the second person to circumnavigate the globe — what nationality was he?", choices:["Spanish","Portuguese","French","English"], correct:3 },
  { question:"Who discovered the sea route around Africa's Cape of Good Hope in 1488?", choices:["Vasco da Gama","Bartolomeu Dias","Christopher Columbus","Ferdinand Magellan"], correct:1 },
  { question:"John Cabot explored which coastline for England in 1497?", choices:["South America","North American coast (likely Newfoundland)","West Africa","India"], correct:1 },
  { question:"Ibn Battuta was a famous 14th-century explorer from?", choices:["Persia","Morocco","Egypt","Turkey"], correct:1 },
  { question:"Which explorer discovered the Mississippi River and claimed the region for France?", choices:["Samuel de Champlain","René-Robert de La Salle","Louis Jolliet","Jean Nicolet"], correct:2 },
  { question:"Hernán Cortés conquered which empire?", choices:["Inca","Aztec","Maya","Olmec"], correct:1 },
  { question:"Francisco Pizarro conquered which empire?", choices:["Aztec","Inca","Maya","Zapotec"], correct:1 },
  { question:"Which explorer led the Lewis and Clark Expedition across North America?", choices:["Meriwether Lewis and William Clark","John Frémont","Zebulon Pike","James Cook"], correct:0 },
  { question:"Who was the first person confirmed to reach the summit of Everest (with Tenzing Norgay)?", choices:["George Mallory","Edmund Hillary","Chris Bonington","Reinhold Messner"], correct:1 },
  { question:"Ernest Shackleton's ship that was crushed by Antarctic ice was called?", choices:["Discovery","Endurance","Terra Nova","Nimrod"], correct:1 },
  { question:"Who first crossed Australia from south to north in 1861?", choices:["Burke and Wills","Edward Eyre","Matthew Flinders","John McDouall Stuart"], correct:0 },
  { question:"Which European country sponsored Columbus's first voyage?", choices:["Portugal","England","Spain","France"], correct:2 },
  { question:"Pytheas, the ancient Greek explorer, is credited with being among the first to describe?", choices:["Sub-Saharan Africa","The British Isles and Arctic ice","India","China"], correct:1 },
  { question:"Which explorer was the first European to see the Pacific Ocean from a peak in Darien?", choices:["Columbus","Balboa","Magellan","Cortés"], correct:1 },
];

function shuffle<T>(arr:T[], rng:()=>number):T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];} return a; }

export function initialState(seed:number, settings:ExplorersSettings):ExplorersState {
  const rng=mulberry32(seed);
  const count=parseInt(settings.questions,10);
  let pool=shuffle([...ALL_Q],rng).slice(0,Math.min(count,ALL_Q.length));
  const questions=pool.map(q=>{
    const idx=q.choices.map((c,i)=>({c,i}));
    const sh=shuffle(idx,rng);
    const newCorrect=sh.findIndex(x=>x.i===q.correct) as 0|1|2|3;
    return {...q,choices:sh.map(x=>x.c) as [string,string,string,string],correct:newCorrect};
  });
  return {questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}

export function reducer(state:ExplorersState, action:ExplorersAction):ExplorersState {
  if(state.phase==="done") return state;
  switch(action.type){
    case"select": if(state.submitted) return state; return {...state,selected:action.choice};
    case"submit":{ if(state.submitted||state.selected===null) return state; const q=state.questions[state.currentIndex]!; const ok=state.selected===q.correct; const pts=ok?100+Math.floor(state.timeLeft*10):0; return {...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"}; }
    case"tick":{ if(state.submitted) return state; const t=state.timeLeft-1; if(t<=0) return {...state,timeLeft:0,submitted:true,phase:"result"}; return {...state,timeLeft:t}; }
    case"next":{ const next=state.currentIndex+1; if(next>=state.questions.length) return {...state,phase:"done"}; return {...state,currentIndex:next,selected:null,submitted:false,timeLeft:15,phase:"playing"}; }
    default: return state;
  }
}

export function isTerminal(state:ExplorersState):{score:number}|null {
  return state.phase==="done"?{score:state.score}:null;
}

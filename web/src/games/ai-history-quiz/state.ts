import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AiHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface AiHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AiHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who proposed the imitation game now called the Turing test?", choices: ["Alan Turing", "Marvin Minsky", "John McCarthy", "Geoffrey Hinton"], correct: 0 },
  { question: "Who coined the term 'artificial intelligence'?", choices: ["John McCarthy", "Alan Turing", "Marvin Minsky", "Claude Shannon"], correct: 0 },
  { question: "Where was the seminal 1956 AI workshop held?", choices: ["MIT", "Dartmouth College", "Stanford", "Carnegie Mellon"], correct: 1 },
  { question: "Which 1966 program by Joseph Weizenbaum is often called the first chatbot?", choices: ["ELIZA", "PARRY", "ALICE", "Cleverbot"], correct: 0 },
  { question: "Which IBM system defeated chess champion Garry Kasparov in 1997?", choices: ["Deep Blue", "Watson", "Deep Thought", "AlphaZero"], correct: 0 },
  { question: "Which IBM system won at Jeopardy! in 2011?", choices: ["Watson", "Deep Blue", "Big Blue", "Summit"], correct: 0 },
  { question: "Which DeepMind program defeated Lee Sedol at Go in 2016?", choices: ["AlphaGo", "AlphaZero", "MuZero", "Gato"], correct: 0 },
  { question: "Geoffrey Hinton is best known for advancing what?", choices: ["Deep neural networks and backpropagation", "Symbolic logic programming", "Genetic algorithms", "Fuzzy logic"], correct: 0 },
  { question: "Yann LeCun is most associated with which model family?", choices: ["Convolutional neural networks", "Recurrent neural networks", "Decision trees", "Hidden Markov models"], correct: 0 },
  { question: "Yoshua Bengio is associated with research on what?", choices: ["Deep learning and representation learning", "Expert systems", "Reinforcement learning robotics", "Bayesian networks (primarily)"], correct: 0 },
  { question: "The 2017 'Attention Is All You Need' paper introduced what architecture?", choices: ["Transformer", "LSTM", "ResNet", "GAN"], correct: 0 },
  { question: "GANs were introduced in 2014 by whom?", choices: ["Ian Goodfellow and colleagues", "Geoffrey Hinton", "Yann LeCun", "Andrew Ng"], correct: 0 },
  { question: "Which company released the GPT series of large language models?", choices: ["OpenAI", "DeepMind", "Anthropic", "Meta AI"], correct: 0 },
  { question: "ImageNet was created by a team led by whom?", choices: ["Fei-Fei Li", "Andrew Ng", "Geoffrey Hinton", "Yann LeCun"], correct: 0 },
  { question: "AlexNet (2012) was developed by Krizhevsky, Sutskever, and which advisor?", choices: ["Geoffrey Hinton", "Yann LeCun", "Andrew Ng", "Yoshua Bengio"], correct: 0 },
  { question: "'Perceptrons' (1969) by Minsky and Papert highlighted limits of which model?", choices: ["Single-layer perceptrons", "Decision trees", "Bayesian networks", "Support vector machines"], correct: 0 },
  { question: "The first 'AI winter' is generally dated to which period?", choices: ["Mid-1970s", "Late 1990s", "Early 2010s", "Late 1950s"], correct: 0 },
  { question: "MYCIN, an early 1970s expert system, diagnosed what?", choices: ["Bacterial infections and antibiotics", "Heart disease", "Mineral deposits", "Mortgage risk"], correct: 0 },
  { question: "LISP, a key early AI language, was created by whom?", choices: ["John McCarthy", "Alan Turing", "Marvin Minsky", "Allen Newell"], correct: 0 },
  { question: "Prolog, a logic programming language for AI, originated where?", choices: ["Marseille, France", "MIT", "Stanford", "Edinburgh"], correct: 0 },
  { question: "SHRDLU, an early NLP program, was written by whom?", choices: ["Terry Winograd", "Marvin Minsky", "Roger Schank", "Noam Chomsky"], correct: 0 },
  { question: "Reinforcement learning was strongly shaped by whose textbook?", choices: ["Sutton and Barto", "Russell and Norvig", "Christopher Bishop", "Goodfellow et al."], correct: 0 },
  { question: "AlphaZero notably mastered which set of games via self-play?", choices: ["Chess, shogi, and Go", "Poker and bridge", "StarCraft and Dota 2", "Backgammon only"], correct: 0 },
  { question: "Which company developed AlphaFold for protein structure prediction?", choices: ["DeepMind", "OpenAI", "Anthropic", "Meta AI"], correct: 0 },
  { question: "'Big Blue' is a nickname most associated with which company in AI history?", choices: ["IBM", "Intel", "Apple", "Microsoft"], correct: 0 },
  { question: "Stuart Russell and Peter Norvig co-authored which standard textbook?", choices: ["Artificial Intelligence: A Modern Approach", "Deep Learning", "Pattern Recognition and Machine Learning", "Reinforcement Learning: An Introduction"], correct: 0 },
  { question: "Backpropagation was popularized for neural nets in 1986 by Rumelhart, Hinton, and whom?", choices: ["Williams", "LeCun", "Bengio", "Schmidhuber"], correct: 0 },
  { question: "LSTM networks were introduced in 1997 by whom?", choices: ["Hochreiter and Schmidhuber", "Hinton and Salakhutdinov", "Bengio and LeCun", "Goodfellow and Bengio"], correct: 0 },
  { question: "Which DeepMind agent learned to play Atari games from pixels (2013)?", choices: ["DQN", "AlphaGo", "MuZero", "Gato"], correct: 0 },
  { question: "The Dartmouth Workshop took place in what year?", choices: ["1950", "1956", "1962", "1969"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AiHistoryQuizSettings): AiHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AiHistoryQuizState, action: AiHistoryQuizAction): AiHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AiHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }

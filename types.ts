
export interface Question {
  q: string;
  a: string;
}

export interface Excerpt {
  id: number;
  subtitle: string;
  text: string;
  notes: Record<string, string>;
  questions: Question[];
}

export interface Work {
  id: string;
  author: string;
  title: string;
  description:string;
  excerpts: Excerpt[];
}

export interface AnswerData {
  answers: string[];
  studyTime: number; // in seconds
}

export interface UserAnswers {
  [workId: string]: {
    [excerptId: string]: AnswerData[];
  };
}

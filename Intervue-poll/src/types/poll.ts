export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  endTime: number;
  responses?: Record<string, number>;
}

export interface PollResult {
  question: string;
  options: PollOption[];
  totalResponses?: number;
  startTime: number;
  endTime: number;
}


export interface PollOption {
  id: string;
  text: string;
  count: number;
  percentage: number;
  isCorrect?: boolean;
}

export interface PollResult {
  id: number | string;
  question: string;
  options: PollOption[];
  responses: Record<string, number>;
}
export type StepStatus = 'pending' | 'inProgress' | 'success' | 'failure';

export interface Step {
  id: number;
  title: string;
  status: StepStatus;
  apiEndpoint: string;
}

export interface Message {
  id: string;
  type: 'system' | 'user';
  content: string;
  timestamp: Date;
}

export interface Detection {
  item: string;
  status: 'clear' | 'detected';
}

export interface ProctorState {
  currentStep: number;
  steps: Step[];
  messages: Message[];
  detections: Detection[];
  isLoading: boolean;
  startTime: Date | null;
  isCompleted: boolean;
}

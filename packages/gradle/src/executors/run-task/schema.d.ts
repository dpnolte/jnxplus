export interface RunTaskExecutorSchema {
  task: string | string[];
  projectPath?: string;
  keepItRunning: boolean;
}

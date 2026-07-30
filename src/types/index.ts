export type Task = {
  id: number;
  us: string;
  memberId: number;
  effort: number;
  startDate: string;
};

export type State = {
  members: string[];
  tasks: Task[];
  _nextId: number;
};

export const noteStatuses = ["Open", "In progress", "Done"] as const;
export type NoteStatus = typeof noteStatuses[number];

export interface NoteDraft {
  id: string;
  header: string;
  body: string;
  status: NoteStatus;
  deadline: string;
}

export interface Note extends NoteDraft {
  updatedAt: string;
}

export interface DateRange {
  from: string;
  to: string;
}

import { Flowgear } from "flowgear-webapp";
import type { DateRange, Note, NoteDraft } from "../models/notes";

const notesPath = "/note-taker/notes";

export function listNotes(range: DateRange) {
  const search = new URLSearchParams({ from: range.from, to: range.to });
  return Flowgear.Sdk.invoke<Note[]>("GET", notesPath + "?" + search);
}

export function saveNote({ id, header, body, status, deadline }: NoteDraft, isNew: boolean) {
  const draft = { header, body, status, deadline };
  return isNew
    ? Flowgear.Sdk.invoke("POST", notesPath, { ...draft, id })
    : Flowgear.Sdk.invoke("PUT", notesPath + "/" + encodeURIComponent(id), draft);
}

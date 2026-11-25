import { useEffect, useState } from "react";
import { Flowgear } from "flowgear-webapp";
import { noteStatuses, type DateRange, type Note, type NoteDraft } from "../../models/notes";
import { listNotes } from "../../services/notes";
import { NoteEditor } from "./NoteEditor";

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone: "UTC" });
type SortField = "updatedAt" | "header" | "status" | "deadline";

function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

function defaultRange(): DateRange {
  const firstDay = new Date();
  firstDay.setUTCDate(firstDay.getUTCDate() - 29);
  return { from: firstDay.toISOString().slice(0, 10), to: todayUtc() };
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export function NotesWorkspace() {
  const [range, setRange] = useState(defaultRange);
  const [applied, setApplied] = useState(range);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [rangeError, setRangeError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [deadline, setDeadline] = useState("");
  const [sort, setSort] = useState<SortField>("updatedAt");
  const [editor, setEditor] = useState<{ draft: NoteDraft; isNew: boolean }>();

  useEffect(() => {
    let current = true;
    void listNotes(applied)
      .then((result) => {
        if (current) setNotes(result ?? []);
      })
      .catch(() => {
        if (current) {
          setNotes([]);
          setLoadError("Couldn’t load your notes. Try applying the date range again.");
        }
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => { current = false; };
  }, [applied]);

  function applyRange(next: DateRange) {
    if (!next.from || !next.to || next.from > next.to) {
      setRangeError("Choose a valid start and end date.");
      return;
    }
    if (Date.parse(next.to) - Date.parse(next.from) > 365 * 86_400_000) {
      setRangeError("Choose a date range of 366 days or fewer.");
      return;
    }
    setRangeError("");
    setLoadError("");
    setLoading(true);
    setApplied({ ...next });
  }

  function createNote() {
    const draft: NoteDraft = { id: crypto.randomUUID(), header: "", body: "", status: "Open", deadline: "" };
    setEditor({ isNew: true, draft });
  }

  const today = todayUtc();
  const text = search.trim().toLocaleLowerCase();
  const visibleNotes = notes
    .filter((note) => note.header.toLocaleLowerCase().includes(text)
      && (!status || note.status === status)
      && (!deadline || note.deadline === deadline))
    .sort((left, right) => {
      if (sort === "updatedAt") return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
      if (sort === "status") return noteStatuses.indexOf(left.status) - noteStatuses.indexOf(right.status);
      if (sort === "deadline") return (left.deadline || "9999-12-31").localeCompare(right.deadline || "9999-12-31");
      return left.header.localeCompare(right.header, undefined, { sensitivity: "base" });
    });

  return (
    <main className="workspace">
      <div className="workspace-header">
        <div>
          <button className="brand" type="button" onClick={() => Flowgear.Sdk.openUrl("https://www.flowgear.net")}>Flowgear</button>
          <h1>Note Taker</h1>
        </div>
        <button type="button" className="button button-primary" onClick={createNote}><span aria-hidden="true">＋</span> New note</button>
      </div>

      <section className="notes-panel" aria-label="My notes">
        <div className="panel-header">
          <div><h2>My notes</h2><p>Filter by the date each note was saved (UTC).</p></div>
          <div className="range-controls">
            <label>From<input type="date" value={range.from} onChange={(event) => setRange({ ...range, from: event.target.value })} /></label>
            <label>To<input type="date" value={range.to} onChange={(event) => setRange({ ...range, to: event.target.value })} /></label>
            <button type="button" className="button button-quiet" onClick={() => applyRange(range)} disabled={loading}>Apply dates</button>
          </div>
        </div>
        <div className="filters">
          <label>Search headers<input type="search" value={search} placeholder="Search notes" onChange={(event) => setSearch(event.target.value)} /></label>
          <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            {noteStatuses.map((option) => <option key={option}>{option}</option>)}
          </select></label>
          <label>Deadline<input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} /></label>
          <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value as SortField)}>
            <option value="updatedAt">Recently saved</option>
            <option value="header">Header (A–Z)</option>
            <option value="status">Status</option>
            <option value="deadline">Deadline</option>
          </select></label>
        </div>
        {(rangeError || loadError) && <p className="notice error" role="alert">{rangeError || loadError}</p>}
        {feedback && <p className="notice" role="status">{feedback}</p>}
        <div aria-busy={loading}>
          {loading ? <p className="empty-state" role="status">Loading notes…</p> : visibleNotes.length ? (
            <div className="note-table-wrap">
              <table className="note-table">
                <thead><tr><th scope="col">Header</th><th scope="col">Status</th><th scope="col">Deadline</th><th scope="col">Saved</th><th scope="col"><span className="visually-hidden">Actions</span></th></tr></thead>
                <tbody>
                  {visibleNotes.map((note) => (
                    <tr key={note.id}>
                      <td><strong>{note.header}</strong>{note.body && <p className="note-preview">{note.body}</p>}</td>
                      <td><span className="status-chip" data-status={note.status}>{note.status}</span></td>
                      <td className={note.status !== "Done" && note.deadline && note.deadline < today ? "overdue" : ""}>{note.deadline ? formatDate(note.deadline) : "—"}</td>
                      <td>{formatDate(note.updatedAt)}</td>
                      <td><button type="button" className="button button-quiet" aria-label={"Edit " + note.header} onClick={() => setEditor({ draft: note, isNew: false })}>Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : !loadError && (
            <div className="empty-state">
              <h3>{notes.length ? "No matching notes" : "No notes in this date range"}</h3>
              <p>{notes.length ? "Try a different header, status, or deadline." : "Create a note or choose a different range."}</p>
            </div>
          )}
        </div>
      </section>
      {editor && <NoteEditor
        initialDraft={editor.draft}
        isNew={editor.isNew}
        onClose={() => setEditor(undefined)}
        onSaved={() => {
          setEditor(undefined);
          setFeedback(editor.isNew ? "Note created." : "Changes saved.");
          const next = today >= applied.from && today <= applied.to ? applied : defaultRange();
          setRange(next);
          applyRange(next);
        }}
      />}
    </main>
  );
}

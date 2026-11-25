import { useEffect, useRef, useState } from "react";
import { noteStatuses, type NoteDraft } from "../../models/notes";
import { saveNote } from "../../services/notes";

interface Props {
  initialDraft: NoteDraft;
  isNew: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function NoteEditor({ initialDraft, isNew, onClose, onSaved }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(initialDraft);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  async function save() {
    if (!draft.header.trim()) {
      setError("Enter a header for this note.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveNote({ ...draft, header: draft.header.trim() }, isNew);
      onSaved();
    } catch (failure) {
      const status = (failure as { statusCode?: number } | undefined)?.statusCode;
      setError(status === 404 ? "This note could not be found." : "Couldn’t save the note. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog ref={dialog} className="note-editor" aria-labelledby="editor-title" onCancel={(event) => {
      event.preventDefault();
      if (!saving) onClose();
    }}>
      <div className="editor-header">
        <h2 id="editor-title">{isNew ? "New note" : "Edit note"}</h2>
        <button type="button" className="button button-quiet" disabled={saving} onClick={onClose} aria-label="Close editor">×</button>
      </div>
      <div className="editor-fields">
        <label>Header
          <input value={draft.header} maxLength={120} disabled={saving} onChange={(event) => setDraft({ ...draft, header: event.target.value })} />
        </label>
        <label>Note
          <textarea value={draft.body} maxLength={4000} rows={7} disabled={saving} onChange={(event) => setDraft({ ...draft, body: event.target.value })} />
        </label>
        <div className="editor-grid">
          <label>Status
            <select value={draft.status} disabled={saving} onChange={(event) => setDraft({ ...draft, status: event.target.value as NoteDraft["status"] })}>
              {noteStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
          </label>
          <label>Deadline
            <input type="date" value={draft.deadline} disabled={saving} onChange={(event) => setDraft({ ...draft, deadline: event.target.value })} />
          </label>
        </div>
      </div>
      {error && <p className="notice error" role="alert">{error}</p>}
      <div className="editor-actions">
        <button type="button" className="button button-quiet" onClick={onClose} disabled={saving}>Cancel</button>
        <button type="button" className="button button-primary" onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save note"}
        </button>
      </div>
    </dialog>
  );
}

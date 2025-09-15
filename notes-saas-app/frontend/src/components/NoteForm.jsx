import { useState } from "react";

const NoteForm = ({ note, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: note ? note.title : "",
    content: note ? note.content : "",
  });

  const { title, content } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="note-form-overlay">
      <div className="note-form">
        <h3>{note ? "Edit Note" : "Create Note"}</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Title"
              name="title"
              value={title}
              onChange={onChange}
              required
            />
          </div>
          <div>
            <textarea
              placeholder="Content"
              name="content"
              value={content}
              onChange={onChange}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit">{note ? "Update" : "Create"}</button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;

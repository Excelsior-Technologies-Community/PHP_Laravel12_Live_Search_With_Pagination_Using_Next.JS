import { PostInput } from '../interfaces';
import { createPost, updatePost } from '../services/api';
import { useState } from 'react';

interface Props {
  editingId: number | null;
  existingData?: PostInput;
  onSuccess: () => void;
  onClose: () => void;
}

export default function PostForm({ editingId, existingData, onSuccess, onClose }: Props) {
  const [title, setTitle] = useState(existingData?.title || '');
  const [body, setBody] = useState(existingData?.body || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updatePost(editingId, { title, body });
        alert('Post updated successfully');
      } else {
        await createPost({ title, body });
        alert('Post created successfully');
      }
      setTitle('');
      setBody('');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error saving post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block bg-dark bg-opacity-50">
      <div className="modal-dialog">
        <div className="modal-content p-3">
          <h5>{editingId ? 'Edit Post' : 'Create Post'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <label>Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="form-control"
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Submit'}
            </button>
            <button type="button" className="btn btn-secondary ms-2" onClick={onClose}>
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

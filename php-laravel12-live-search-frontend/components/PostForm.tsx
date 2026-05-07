import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';
import { createPost, updatePost } from '../services/api';
import { PostInput } from '../interfaces';

interface Props {
  editingId: number | null;
  existingData?: PostInput;
  onSuccess: () => void;
  onClose: () => void;
  darkMode: boolean;
}

export default function PostForm({ editingId, existingData, onSuccess, onClose, darkMode }: Props) {
  const [title, setTitle]   = useState(existingData?.title || '');
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: existingData?.body || '',
    immediatelyRender: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = editor?.getHTML() || '';
    if (!body || body === '<p></p>') {
      alert('Body is required');
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await updatePost(editingId, { title, body });
      } else {
        await createPost({ title, body });
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error saving post');
    } finally {
      setLoading(false);
    }
  };

  const modalBg   = darkMode ? '#2c2c2c' : '#fff';
  const textColor = darkMode ? '#f1f1f1' : '#000';
  const inputCls  = `form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`;
  const toolbarCls = darkMode ? 'tiptap-toolbar tiptap-toolbar-dark' : 'tiptap-toolbar';
  const editorCls  = darkMode ? 'tiptap-editor tiptap-dark' : 'tiptap-editor';

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content" style={{ backgroundColor: modalBg, color: textColor }}>

          <div className="modal-header" style={{ borderBottom: darkMode ? '1px solid #444' : '' }}>
            <h5 className="modal-title">{editingId ? 'Edit Post' : 'Create Post'}</h5>
            <button className="btn-close" onClick={onClose} style={{ filter: darkMode ? 'invert(1)' : '' }} />
          </div>

          <div className="modal-body">
            <form onSubmit={handleSubmit}>

              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className={inputCls}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Body</label>
                <div className={toolbarCls}>
                  <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={editor?.isActive('bold') ? 'active' : ''}>B</button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={editor?.isActive('italic') ? 'active' : ''}><em>I</em></button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleStrike().run()}
                    className={editor?.isActive('strike') ? 'active' : ''}><s>S</s></button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={editor?.isActive('heading', { level: 1 }) ? 'active' : ''}>H1</button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor?.isActive('heading', { level: 2 }) ? 'active' : ''}>H2</button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={editor?.isActive('bulletList') ? 'active' : ''}>• List</button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    className={editor?.isActive('orderedList') ? 'active' : ''}>1. List</button>
                  <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                    className={editor?.isActive('blockquote') ? 'active' : ''}>" Quote</button>
                  <button type="button" onClick={() => editor?.chain().focus().undo().run()}>↩ Undo</button>
                  <button type="button" onClick={() => editor?.chain().focus().redo().run()}>↪ Redo</button>
                </div>
                <div className={editorCls}>
                  <EditorContent editor={editor} />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Save'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
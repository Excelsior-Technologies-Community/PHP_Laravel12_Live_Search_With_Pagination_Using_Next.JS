import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Post } from '../interfaces';
import { fetchPosts, deletePost } from '../services/api';

const PostForm = dynamic(() => import('../components/PostForm'), { ssr: false });

export default function Home() {
  const [posts, setPosts]               = useState<Post[]>([]);
  const [search, setSearch]             = useState('');
  const [debouncedSearch, setDebounced] = useState('');
  const [sort, setSort]                 = useState('');
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [loading, setLoading]           = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [editingId, setEditingId]       = useState<number | null>(null);
  const [editingData, setEditingData]   = useState<{ title: string; body: string } | undefined>();
  const [darkMode, setDarkMode]         = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') setDarkMode(true);
  }, []);

  const toggleDark = () => {
    setDarkMode((prev) => {
      localStorage.setItem('darkMode', String(!prev));
      return !prev;
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const highlightText = (text: string) => {
    if (!search.trim()) return text;
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b(${escaped})\\b`, 'gi');
    return text.replace(regex, '<mark class="highlight">$1</mark>');
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetchPosts(debouncedSearch, page, sort);
      setPosts(res.data.data);
      setTotalPages(res.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, [debouncedSearch, page, sort]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      await deletePost(id);
      loadPosts();
    }
  };

  const bg        = darkMode ? '#1a1a2e' : '#f8f9fa';
  const cardBg    = darkMode ? '#16213e' : '#fff';
  const textColor = darkMode ? '#e0e0e0' : '#000';
  const tableCls  = `table table-bordered table-hover ${darkMode ? 'table-dark' : ''}`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, color: textColor, transition: 'all 0.3s' }}>
      <div className="container py-5">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Laravel + Next.js CRUD</h1>
          <button className="btn btn-outline-secondary" onClick={toggleDark}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <button className="btn btn-success" onClick={() => setShowForm(true)}>
            + Create Post
          </button>
          <div className="d-flex gap-2">
            <input
              type="text"
              className={`form-control ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ maxWidth: '250px' }}
            />
            <select
              className={`form-select ${darkMode ? 'bg-dark text-white border-secondary' : ''}`}
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
            >
              <option value="">Sort</option>
              <option value="title_asc">Title A-Z</option>
              <option value="title_desc">Title Z-A</option>
              <option value="oldest">Oldest</option>
              <option value="latest">Latest</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div style={{ backgroundColor: cardBg, borderRadius: '8px', overflow: 'hidden' }}>
            <table className={tableCls}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Body</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-danger fw-bold">
                      No results found {search && `for "${search}"`}
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id}>
                      <td>{post.id}</td>
                      <td dangerouslySetInnerHTML={{ __html: highlightText(post.title) }} />
                      <td dangerouslySetInnerHTML={{ __html: highlightText(post.body) }} />
                      <td>
                        <button className="btn btn-primary btn-sm me-2"
                          onClick={() => {
                            setEditingId(post.id);
                            setEditingData({ title: post.title, body: post.body });
                            setShowForm(true);
                          }}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(post.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="d-flex justify-content-center mt-4">
          <ul className="pagination">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(p)}>{p}</button>
              </li>
            ))}
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
            </li>
          </ul>
        </div>

        {showForm && (
          <PostForm
            editingId={editingId}
            existingData={editingData}
            onSuccess={loadPosts}
            darkMode={darkMode}
            onClose={() => {
              setShowForm(false);
              setEditingId(null);
              setEditingData(undefined);
            }}
          />
        )}

      </div>
    </div>
  );
}
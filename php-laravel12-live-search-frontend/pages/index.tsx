import { useEffect, useState } from 'react';
import { Post } from '../interfaces';
import { fetchPosts, deletePost } from '../services/api';
import PostForm from '../components/PostForm';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<{ title: string; body: string } | undefined>();

  // 🔥 Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // 🔥 Highlight ONLY exact word
  const highlightText = (text: string) => {
    if (!search.trim()) return text;

    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex
    const regex = new RegExp(`\\b(${escaped})\\b`, 'gi'); // exact word match

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

  useEffect(() => {
    loadPosts();
  }, [debouncedSearch, page, sort]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      await deletePost(id);
      loadPosts();
    }
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Laravel + Next.js CRUD</h1>

      {/* Controls */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-success" onClick={() => setShowForm(true)}>
          + Create Post
        </button>

        <div className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: '250px' }}
          />

          <select
            className="form-select"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Sort</option>
            <option value="title_asc">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
            <option value="oldest">Oldest</option>
            <option value="latest">Latest</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <>
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
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

                    <td
                      dangerouslySetInnerHTML={{
                        __html: highlightText(post.title),
                      }}
                    />

                    <td
                      dangerouslySetInnerHTML={{
                        __html: highlightText(post.body),
                      }}
                    />

                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => {
                          setEditingId(post.id);
                          setEditingData({ title: post.title, body: post.body });
                          setShowForm(true);
                        }}
                      >
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
        </>
      )}

      {/* Pagination */}
      <div className="d-flex justify-content-center">
        <ul className="pagination">
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPage(page - 1)}>
              Previous
            </button>
          </li>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <li key={p} className={`page-item ${page === p ? 'active' : ''}`}>
              <button className="page-link" onClick={() => setPage(p)}>
                {p}
              </button>
            </li>
          ))}

          <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPage(page + 1)}>
              Next
            </button>
          </li>
        </ul>
      </div>

      {/* Modal */}
      {showForm && (
        <PostForm
          editingId={editingId}
          existingData={editingData}
          onSuccess={loadPosts}
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
            setEditingData(undefined);
          }}
        />
      )}
    </div>
  );
}
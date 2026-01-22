# PHP_Laravel12_Live_Search_With_Pagination_Using_Next.JS

---


This project demonstrates a full-stack CRUD (Create, Read, Update, Delete) application using Laravel 12 as the backend and Next.js with TypeScript as the frontend. It also includes live search and pagination functionality to efficiently manage and display posts.


### Project Features
- **Full CRUD Operations:** Create, read, update, delete posts
- **Live Search:** Search posts by title or body
- **Pagination:** Backend and frontend support
- **Modal Form:** Create/Edit posts in a modal
- **RESTful API:** Laravel API endpoints
- **Cross-Origin Support:** CORS enabled
- **Responsive UI:** Bootstrap-based design



---


# Project SetUp

---

## STEP 1: Create New Laravel 12 Project

### Run Command :

```
composer create-project laravel/laravel PHP_Laravel12_Live_Search_With_Pagination_Using_Next.JS "12.*"
```

### Go inside project:

```
cd PHP_Laravel12_Live_Search_With_Pagination_Using_Next.JS

```


## STEP 2: Database Configuration

### Open .env file and update database credentials:

```

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=live_search_nextjs
DB_USERNAME=root
DB_PASSWORD=

```

### Create database:

```
live_search_nextjs

```


## Step 3: Create Items Table & Model

### Run Command :

```

php artisan make:model Post -m

```


This creates:

Model → Post.php

Migration → create_posts_table



### Migration: database/migrations/xxxx_create_posts_table.php

```

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
{
    Schema::create('posts', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        $table->text('body');
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};

```

This defines the posts table structure.


### Model: app/Models/Post.php

```

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     * This allows you to use Post::create($data) safely.
     */
    protected $fillable = [
        'title',
        'body',
    ];

    /**
     * Optional: You can customize the table name if it's different
     */
    // protected $table = 'posts';

    /**
     * Optional: You can customize the primary key if needed
     */
    // protected $primaryKey = 'id';

    /**
     * Optional: If you want to disable timestamps
     */
    // public $timestamps = false;
}

```

### Run migration:
```

php artisan migrate

```




## Step 4: Create API Controller

### Run Command :

```

php artisan make:controller Api/PostController --api


```

### app/Http/Controllers/Api/PostController.php

```

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    // List posts with pagination and search
    public function index(Request $request)
    {
        $query = Post::query();

        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%")
                  ->orWhere('body', 'like', "%{$request->search}%");
        }

        $posts = $query->orderBy('id', 'asc')->paginate(3);
        return response()->json($posts);
    }

    // Create post
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        $post = Post::create($request->all());
        return response()->json($post, 201);
    }

    // Show single post
    public function show(Post $post)
    {
        return response()->json($post);
    }

    // Update post
    public function update(Request $request, Post $post)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        $post->update($request->all());
        return response()->json($post);
    }

    // Delete post
    public function destroy(Post $post)
    {
        $post->delete();
        return response()->json(null, 204);
    }
}

```


## Step 5: Routes

### routes/api.php

```

<?php

use App\Http\Controllers\Api\PostController;

Route::apiResource('posts', PostController::class);

```


## Step 6: Enable CORS

Edit config/cors.php:

```

<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:3000'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];

```


## Step 7: Run Backend

Run Command:

```
php artisan serve

```

API runs on:

```
 http://127.0.0.1:8000/api/posts

```


# PART 2: Next.js Frontend Setup


## Step 1: Create Next.js Project

Go to parent directory:

```
cd PHP_Laravel12_Live_Search_With_Pagination_Using_Next.JS

npx create-next-app php-laravel12-live-search-frontend --typescript

cd  php-laravel12-live-search-frontend

```


### Install dependencies:

Run Command:

```
npm install axios bootstrap react-bootstrap

```

### Import Bootstrap in pages/_app.tsx:

```

import 'bootstrap/dist/css/bootstrap.min.css';

import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

```

if you use this then \app folder remove.





## Step 2: Create Post Interface

### Create interfaces/index.ts:

```

export interface Post {
  id: number;
  title: string;
  body: string;
}

export interface PostInput {
  title: string;
  body: string;
}

```


## Step 3: Create API Service

### services/api.ts:

```

import axios from 'axios';
import { PostInput } from '../interfaces';

const API_URL = 'http://127.0.0.1:8000/api/posts';

export const fetchPosts = (search: string = '', page: number = 1) => {
  return axios.get(`${API_URL}?search=${search}&page=${page}`);
};

export const createPost = (data: PostInput) => axios.post(API_URL, data);
export const updatePost = (id: number, data: PostInput) => axios.put(`${API_URL}/${id}`, data);
export const deletePost = (id: number) => axios.delete(`${API_URL}/${id}`);

```


## Step 4: Create PostForm Component

### components/PostForm.tsx:

```

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

```


## Step 5: Create Main Page

### pages/index.tsx:

```

import { useEffect, useState } from 'react';
import { Post } from '../interfaces';
import { fetchPosts, deletePost } from '../services/api';
import PostForm from '../components/PostForm';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<{ title: string; body: string } | undefined>(undefined);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetchPosts(search, page);
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
  }, [search, page]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      await deletePost(id);
      loadPosts();
    }
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Laravel + Next.js CRUD</h1>

  
     {/* Search & Create */}
<div className="d-flex justify-content-between align-items-center mb-4">
  {/* Create Button on Left */}
  <button className="btn btn-success btn-lg order-1" onClick={() => setShowForm(true)}>
    + Create Post
  </button>

  {/* Search Bar on Right */}
  <input
    type="text"
    className="form-control search-bar ms-3 order-2"
    placeholder="Search posts by title or body..."
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setPage(1); // Reset to first page on search
    }}
    style={{ maxWidth: '400px' }} // Optional: limit search width
  />
</div>


      {/* Posts Table */}
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <table className="table table-hover table-bordered bg-white">
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
                <td colSpan={4} className="text-center">
                  No posts found
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.id}</td>
                  <td>{post.title}</td>
                  <td>{post.body}</td>
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
      )}

      {/* Pagination */}
      <nav aria-label="Page navigation" className="d-flex justify-content-center mt-4">
        <ul className="pagination">
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPage(page - 1)}>
              Previous
            </button>
          </li>

          {/* Show page numbers */}
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
      </nav>

      {/* Modal Form */}
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

```

## Step 6: Run Frontend

Run Command:

```
npm run dev
```

### Open:

```
 http://localhost:3000

```


## So You can see this type Output:

### Main Page:


<img width="1919" height="963" alt="Screenshot 2025-12-30 163305" src="https://github.com/user-attachments/assets/db7a524c-166a-461f-88e9-b9f8076794cd" />



### Create Page:


<img width="1917" height="969" alt="Screenshot 2025-12-30 163503" src="https://github.com/user-attachments/assets/f583f9c9-3282-43be-bf9b-f74ac1aa08d8" />

<img width="1918" height="972" alt="Screenshot 2025-12-30 163525" src="https://github.com/user-attachments/assets/6be1c7e6-30fa-4cb3-bf79-c2775058e900" />



### Edit Page:


<img width="1919" height="975" alt="Screenshot 2025-12-30 163538" src="https://github.com/user-attachments/assets/1713e020-fefb-4955-8fc8-0029b446bfb0" />

<img width="1919" height="956" alt="Screenshot 2025-12-30 163548" src="https://github.com/user-attachments/assets/3f2fc043-a84d-4693-b49a-ea683d592d1c" />


### Search Page (Title):


<img width="1919" height="955" alt="Screenshot 2025-12-30 163611" src="https://github.com/user-attachments/assets/4c269275-fd69-40d0-a64b-b1002b03dcfa" />


### Search Page (Body):


<img width="1915" height="968" alt="Screenshot 2025-12-30 163627" src="https://github.com/user-attachments/assets/d2cbf2d3-58d0-4f2a-bd34-ee75777b8435" />



###  Pagination (page-1):


<img width="1919" height="970" alt="Screenshot 2025-12-30 163643" src="https://github.com/user-attachments/assets/63b75cfc-c3be-4c7f-91e3-9c38dd5cd42c" />


### Delete Page:


<img width="1915" height="967" alt="Screenshot 2025-12-30 163654" src="https://github.com/user-attachments/assets/7333211b-6693-4960-af6b-661d7d8f3a7d" />




---

# PHP_Laravel12_Live_Search_With_Pagination_Using_Next.JS Folder Structure:

```

PHP_Laravel12_Live_Search_With_Pagination_Using_Next.JS/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       └── PostController.php      # CRUD API Controller
│   │   └── Kernel.php
│   └── Models/
│       └── Post.php                        # Post Model
├── database/
│   ├── migrations/
│   │   └── xxxx_create_posts_table.php     # Migration
│   └── seeders/
│       └── DatabaseSeeder.php
├── routes/
│   └── api.php                              # API routes
├── config/
│   └── cors.php                             # Update allowed_origins for Next.js
├── .env                                     # Database credentials
└── composer.json

```


# Next.js Frontend Structure (PHP_Laravel12_Live_Search_Frontend):

```

PHP_Laravel12_Live_Search_Frontend/
├── components/
│   └── PostForm.tsx                         # Modal form for Create/Edit
├── interfaces/
│   └── index.ts                             # TypeScript interfaces
├── pages/
│   ├── _app.tsx                             # Bootstrap import
│   └── index.tsx                            # Main CRUD page
├── services/
│   └── api.ts                               # Axios API functions
├── public/
├── styles/
│   └── globals.css
├── package.json
└── tsconfig.json


```

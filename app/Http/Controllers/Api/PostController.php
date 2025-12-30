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

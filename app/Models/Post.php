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

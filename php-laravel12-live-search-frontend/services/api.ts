import axios from 'axios';
import { PostInput } from '../interfaces';

const API_URL = 'http://127.0.0.1:8000/api/posts';

//  UPDATED (search + pagination + sorting)
export const fetchPosts = (search = '', page = 1, sort = '') => {
  return axios.get(`${API_URL}?search=${search}&page=${page}&sort=${sort}`);
};

export const createPost = (data: PostInput) => axios.post(API_URL, data);
export const updatePost = (id: number, data: PostInput) => axios.put(`${API_URL}/${id}`, data);
export const deletePost = (id: number) => axios.delete(`${API_URL}/${id}`);
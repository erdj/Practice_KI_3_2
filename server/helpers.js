import axios from 'axios';
import { DB_REQ_CONFIG } from './webSocket.js';

export async function updateUser(id, data) {
  return await axios.put('http://localhost:5000/api/users/' + id, data, DB_REQ_CONFIG);
}

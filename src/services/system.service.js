import axios from 'axios';

export function getAllSystem() {
  return axios.get('/mock/system_list');
}
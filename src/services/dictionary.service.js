import axios from 'axios';

export function getDictionaryForm(node_id) {  
  return axios.get('/mock/dictionary/get_dictionary_form', {
    params: {
      node_id
    },
  });
}
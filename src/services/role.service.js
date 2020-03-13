import axios from 'axios';

export function getRoleForm(roleId) {  
  return axios.get('/mock/role/get_role_form', {
    params: {
    	role_id: roleId
    }
  });
}
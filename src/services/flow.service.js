import axios from 'axios';

export function getBpmnXMLStr(process_id, process_type) {  
  return axios.get('/mock/process/deployment_get', {
    params: {
      process_id,
      process_type,
    },
  });
}

export function getStructureAssignee(process_id) {
  return axios.get('/mock/process/get_structure_assignee', {
    params: {
      process_id,
    },
  });
}

export function getRoleAssignee(process_id) {
  return axios.get('/mock/process/get_role_assignee', {
    params: {
      process_id,
    },
  });
}

export function getProcessData(process_id, get_type) {  
  return axios.get('/mock/process/get_process_data', {
    params: {
      process_id,
      get_type
    },
  });
}

export function submitProcessData(process_id, activity, task_id, form, action, comment, data_type, task_key, approvers, folder_id, child_form_list = [], other_approvers = []) {  
  if(!activity){
    return axios.post('/mock/process/submit', {
      process_id,
      task_id,
      form,
      action,
      comment,
      data_type,
      task_key,
      folder_id,
      approvers,
      other_approvers,
      child_form_list
    });
  }else{
    return axios.post('/mock/process/submit', {
      process_id,
      activity,
      task_id,
      form,
      action,
      comment,
      data_type,
      task_key,
      folder_id,
      approvers,
      other_approvers,
      child_form_list
    });
  }
}
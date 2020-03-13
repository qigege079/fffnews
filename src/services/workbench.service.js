import axios from 'axios';

export function getAllWorkbenchPage() {
  return axios.get('/mock/workbench/get_workbench_catalog');
}

export function getWorkbenchNodeModuleDetails(item_id) {
  return axios.get('/mock/system/get_data_by_id', {
    params: {
      item_id,
    }
  });
}
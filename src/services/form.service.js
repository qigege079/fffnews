import axios from 'axios';

export function getFormById(form_id, type) {
  return axios.get('/mock/get_form_by_id', {
    params: {
      form_id,
      type
    },
  });
}

export function updateFormById(form_id, form, type, templateform, child_form_list = [] ) {
  return axios.post('/mock/form/update_form_by_id', {
    form_id,
    form,
    type,
    templateform,
    child_form_list
  });
}

export function startInstance(form_template_id, folder_id, form, child_form_list = []) {
  return axios.post('/mock/form/start_instance', {
    form_template_id,
    folder_id,
    form,
    child_form_list
  });
}

export function getAssociatingDetail(form_id) {
  return axios.get('/mock/form/get_template_instance_list', {
    params: {
      folder_id: '',
      template_id: form_id,
      router_type: 'resource',
      by_version: false
    },
  });
}

export function getAssociatingFormList(instance_ids, type_ids) {
  return axios.post('/mock/form/get_associating_form_list', {
    instance_ids,
    type_ids
  });
}

export function getPeopleListByDeptid(dept_id) {
  return axios.post('/mock/form/get_peoplelist_by_deptid', {
    dept_id
  });
}

export function getDeptListByDeptid(dept_id) {
  return axios.post('/mock/form/get_deptlist_by_deptid', {
    dept_id
  });
}

export function getWorkspaceByTemplateId(template_id) {
  return axios.get('/mock/form/get_workspace_by_templateid', {
    params: {
      template_id
    },
  });
}

export function getFormLinkageFieldResultList(relate_form_id, relate_field_id) {
  return axios.get('/mock/form/get_form_linkage_field_result_list', {
    params: {
      relate_form_id,
      relate_field_id
    },
  });
}

export function getFormDataLinkageResultList(linkage_value, data_linkage_list) {
  return axios.post('/mock/form/get_form_data_linkage_result_list', {
    linkage_value,
    data_linkage_list
  });
}

export function getExpressionValue(computed_list) {
  return axios.post('/mock/form/get_expression_value', {
    computed_list
  });
}

export function getChildFormList(form_instance_ids, form_template_id) {
  return axios.post('/mock/form/get_child_form_list', {
    form_instance_ids,
    form_template_id
  });
}

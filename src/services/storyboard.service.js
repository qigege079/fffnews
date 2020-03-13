import axios from 'axios';

export function updataStoryboardById(story_id, form, templateform, type) {  
  return axios.post('/mock/storyboard/update_storyboard_by_id', {
    story_id,
    form,
    templateform,
    type
  });
}

export function publishStoryboard(storyboard_id, folder_id, form) {  
  return axios.post('/mock/storyboard/start_instance', {
    storyboard_id,    
    folder_id,
    form,
  });
}
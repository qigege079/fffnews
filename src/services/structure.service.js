import axios from 'axios';

export function getStructureForm(structureId) {  
  return axios.get('/mock/structure/get_structure_form', {
    params: {
    	structure_id: structureId
    }
  });
}

export function getStructureLevelForm(levelId) {  
  return axios.get('/mock/structure/get_structure_level_form', {
    params: {
    	level_id: levelId
    }
  });
}


import translations from './zh-CN.js'

export default function customTranslate(template, replacements) {
  replacements = replacements || {};

  // Translate
  template = translations[template] || template;

  // Replace
  return template.replace(/{([^}]+)}/g, function(_, key){
	 var str = replacements[key];
	  if(translations[replacements[key]] != null && translations[replacements[key]] != 'undefined'){
		  str = translations[replacements[key]];
	  }
    return str || '{' + key + '}'; 
  });
}

// For building, replace node_modules/diagram-js/lib/i18n/translate/translate.js with forllowing contents

// import translations from '../../../../../src/assets/translations/zh-CN.js'  // +++++++

// export default function translate(template, replacements) {

//   replacements = replacements || {};

//   // Translate
//   template = translations[template] || template  // +++++++

//   return template.replace(/{([^}]+)}/g, function(_, key) {
//     return replacements[key] || '{' + key + '}';
//   });
// }
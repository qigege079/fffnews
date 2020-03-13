<template>
  <!-- 表单实例组件 -->
  <div class="instance-detail">
    <div class="toolbar">
      <div></div>
      <div class="toolbar-button">
        <button @click="saveForm" class="add-people clickable">
          <span>保存</span>          
        </button> 
      </div>    
    </div>
    <div class="outContainer">
      <detail-form ref="detailform" v-if="routerFrom == 'form'" :templateId="templateId" :formId="instanceId"></detail-form>
    </div>   
  </div>
</template>

<script>

import { mapState } from 'vuex';

import { startInstance, updateFormById } from '../services/form.service';
import { publishStoryboard, updataStoryboardById } from '../services/storyboard.service';

export default {
  name: 'InstanceDetail',

  props: {
    routerFrom: {
      type: String,
    },

    folderId: {
      type: String,
      default: '',
    },

    templateId: {
      type: String,
      default: '',
    },

    instanceId: {
      type: String,
      default: '',
    },
  },

  computed: {
    ...mapState({
      account: state => state.account.account,
      editMode: state => state.account.editMode,
    }),
  },

  methods: {
    getData: function() {
      return this.$refs.detailform.getData()
    },

    //保存
    saveForm: function() {
      let formData = this.getData(); 

      if(formData){
        if(this.routerFrom === 'form' && this.instanceId === 'new'){
          let child_form_list = this.$refs.detailform.getChildFormData()
          if(child_form_list){
            startInstance(this.templateId, this.folderId, formData, child_form_list).then(res => {
              alert('保存成功')
            }).catch(err => {
              console.log(err)
            });
          }
        }else if(this.routerFrom === 'form' && this.instanceId !== 'new'){
          let child_form_list = this.$refs.detailform.getChildFormData()
          if(child_form_list){
            updateFormById(this.instanceId, formData, 'instance', {}, child_form_list).then(res => {
              alert('保存成功')
            }).catch(err => {
              console.log(err)
            });
          }
        }      
      }          
    }
  }
}
</script>

<style lang="scss" scoped>

@import '../assets/css/global';

.instance-detail {
  height: 100%;
}

.toolbar {
  height: 40px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-name {
  margin-right: 10px;
  font-size: $font-l;
}

.toolbar-button {
  width: auto;
  display: flex;
  align-items: center;
}

.add-people {
  @include highContrastButton();
}

.outContainer {
  margin-top: 6px;
  width: 100%;
  height:  calc(100% - 50px);
  overflow: hidden;
  position: relative;
}
</style>
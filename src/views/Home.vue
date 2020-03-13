<template>
  <!-- 整个工作台区域 -->
  <div class="workbench-content">
    <template v-for="moduleItem in module_list">
      <!-- controller_module表示模块类型为控件模块 -->
      <template v-if="moduleItem.system_item_type === 'controller_module'">
        <!-- 模块资源类型为表单 -->
        <div class="module-content" v-if="moduleItem.resource_type === 'form'">
          <form-instance :routerFrom="moduleItem.resource_type" :folderId="folder_id" :templateId="moduleItem.resource_id" :instanceId="'new'"></form-instance>
        </div>
        <!-- 模块资源类型为流程 -->
        <div class="module-content" v-if="moduleItem.resource_type === 'process'">
          <flow-instance :folderId="folder_id" :flowId="moduleItem.resource_id"></flow-instance>
        </div>
      </template>
    </template>
  </div>
</template>

<script>

import { mapState } from 'vuex';
import { mapActions } from 'vuex';

import { login, tokenAvailable, setAccount } from "../services/user.service";
import { getAllSystem } from "../services/system.service";
import { getAllWorkbenchPage, getWorkbenchNodeModuleDetails } from '../services/workbench.service';

import FormInstance from '../components/FormInstance';
import FlowInstance from '../components/FlowInstance';

export default {
  name: 'home',

  components: {
    'form-instance': FormInstance,
    'flow-instance': FlowInstance,
  },

  data: function() {
    return {
      folder_id: '',//某个工作台目录id
      module_list: []//某个工作台目录下的模块列表
    }
  },

  created: function() {
    //用户登陆
    login('jianwen.chen@duoc.cn', '000000').then(
      res => {
        if(tokenAvailable()) {
          //将用户信息保存在localstorge
          setAccount(JSON.stringify(res.data.result))
          this.updateAccount(res.data.result)
        }
      }).catch(
      err => {
        console.log(err)
    })
    //获取系统列表
    getAllSystem().then(
      res => {
        let systems = res.data.result.system_list
      }).catch(
      err => {
        console.log(err)
    })
    //某个系统的id
    this.updateSystem( {systemId: '6733021641342713865'} )
    //获取工作台目录列表
    getAllWorkbenchPage().then(
      res => {
        let structures = res.data.result.data_list
      }).catch(
      err => {
        console.log(err)
    });
    //某个工作台目录id
    this.folder_id = '6747585452967985191'
    //根据目录id获取工作台模块列表
    getWorkbenchNodeModuleDetails(this.folder_id).then(
      res => {
        this.module_list = res.data.result.data_list
      }).catch(
      err => {
        console.log(err);
    });
  },

  methods: {
    ...mapActions({
      updateAccount: 'account/update',
      updateSystem: 'system/switchToSystem'
    })
  }
}
</script>

<style lang="scss" scoped>

.workbench-content {
  height: 1500px;
  width: 1000px;
}

.module-content {
  height: 500px;
  width: 1500px;
  border: 1px solid blue
}
</style>


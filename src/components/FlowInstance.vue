<template>
  <!-- 流程实例组件 -->
  <div class="system-workbench-flow-module">
    <el-tabs class="system-workbench-flow-content" v-model="currentTab">
      <el-tab-pane class="system-workbench-flow-tab form-flex" label="流程表单" name="form">
        <div class="outContainer">
          <detail-form ref="detailform" v-if="formId !== ''" :routerFrom="routerFrom" :systemId="this.$route.params.systemId" :folderId="this.$route.params.folderId" :processId="flowId"></detail-form>
        </div>
        <div class="system-workbench-flow-operation" style="width:300px">
          <div class="system-workbench-flow-operation-textbutton">
            <span v-for="Item in node_attr.more_button_list" @click="operationHandler(Item, false)">{{ Item.button_name }}</span>
            <span v-for="Item in node_attr.other_button_list" v-if="Item.button_type !== 'countersign' && Item.button_type !== 'record' && Item.button_type !== 'opinion'" @click="operationHandler(Item, false)">{{ Item.button_name }}</span>
          </div>
          <div v-if="isOpinion" class="system-workbench-flow-operation-toolbar">处理意见</div>
          <div class="system-workbench-flow-operation-textarea">
            <el-input v-if="isOpinion" type="textarea" v-model="comment" placeholder="处理意见" :rows="8" resize="none"></el-input>
            <template v-if="isCountersign">
              <div class="system-workbench-flow-operation-title">下一节点会签人员</div>
              <el-select size="mini" style="width:100%" v-model="countersign_type" @change="countersign_person=[]">
                <el-option label="组织架构" value="structure_id_list"></el-option>
                <el-option label="角色" value="role_id_list"></el-option>
              </el-select>

              <el-select size="mini" style="width:100%;margin-top:5px" v-model="countersign_person" multiple>
                <template v-if="countersign_type === 'structure_id_list'">
                  <el-option v-for="(item, index) in structurePeopleHandler" :key="index" :label="item.node_name" :value="item.node_id">
                    <span :style="{ 'margin-left': (item.level*20-20)+'px' }">{{ item.node_name }}</span>
                  </el-option>
                </template>
                <template v-else-if="countersign_type === 'role_id_list'">
                  <el-option v-for="(item, index) in rolePeople" :key="index" :label="item.node_name" :value="item.node_id"></el-option>
                </template>
              </el-select>
            </template>
          </div>
          <div class="system-workbench-flow-operation-footer">
            <template v-for="Item in node_attr.basic_button_list">
              <el-dropdown v-if="Item.button_type === 'reject_to'" size="small" placement="bottom">
                <el-button style="width:80px;margin:0 10px" size="medium" round>{{ Item.button_name }}</el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-for="(dropdownItem, index) in node_attr.dropdown_list" :key="index">
                    <span @click="operationHandler(Item, dropdownItem)">{{ dropdownItem.activity_name }}</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <el-button v-else style="width:80px;margin:0 10px" size="medium" type="primary"  @click="operationHandler(Item, false)" round>{{ Item.button_name }}</el-button>
            </template>
          </div>

          <hr/>

          <div class="system-workbench-flow-operation-toolbar">流转日志</div>
          <ul>
            <li class="system-workbench-flow-log-item" v-for="logItem in circulation_log">
              <div class="log-item-toolbar">
                <div class="log-item-toolbar-people">节点负责人{{ logItem.handle_person }}</div>
                <div class="log-item-toolbar-date">{{ formatDate(logItem.handle_time) }}</div>
              </div>
              <hr/>
              <div class="log-item-content">{{ logItem.handle_content == ''?'无':logItem.handle_content }}</div>
            </li>
          </ul>
        </div>
      </el-tab-pane>
      <el-tab-pane class="system-workbench-flow-tab" label="流程图" name="chart">
        <div class="canvas" ref="canvas"></div>
        <!-- <div class="canvas-readonly"></div> -->
      </el-tab-pane>
      <!-- <el-tab-pane class="system-workbench-flow-tab" label="处理意见" name="opinion"></el-tab-pane>
      <el-tab-pane class="system-workbench-flow-tab" label="流转日志" name="log"></el-tab-pane> -->
    </el-tabs>

    <modal class="flow-instance-modal" :contentHeight="'550px'" :contentWidth="'450px'" :class="{ hide: !structureOrRoleSelectedWinVisiable }">
      <div class="modal-header">选择{{ handleringButton.button_name }}人</div>
      <div class="modal-content">
        <div class="content-header">
          <span class="clickable" :class="{ active : selectTab == 'structure'}" @click="selectTab = 'structure'">组织架构</span>
          <span class="clickable" :class="{ active : selectTab == 'role'}" style="margin-left:10px" @click="selectTab = 'role'">角色</span>
        </div>         
        <div class="content-list">
          <selection-tree v-for="people in structurePeople"
            :key="people.structure_id"
            treeId=""
            :tree="people" 
            :labelPropertyName="'structure_name'"
            :nodeId="'structure_id'"
            :childrenKeyName="'children'"
            :selectionList="selectionList"
            :selectionEnabled="true"
            v-if="selectTab === 'structure'">
          </selection-tree>
          <selection-tree v-for="people in rolePeople"
            :key="people.node_id"
            treeId=""
            :tree="people" 
            :labelPropertyName="'node_name'"
            :nodeId="'node_id'"
            :childrenKeyName="'children'"
            :selectionList="selectionList"
            :selectionEnabled="true"
            v-if="selectTab === 'role'">
          </selection-tree>
        </div>
      </div>
      <div class="modal-footer">
        <div class="clickable add-people" @click="moreOperationHandler">确定</div>
        <div class="clickable add-people" style="margin-left:20px" @click="structureOrRoleSelectedWinVisiable = false">取消</div>        
      </div>
    </modal>

    <modal class="flow-instance-modal" :contentHeight="'550px'" :contentWidth="'450px'" :class="{ hide: !structureSelectedWinVisiable }">
      <div class="modal-header">选择{{ handleringButton.button_name }}人</div>
      <div class="modal-content">
        <div class="content-header">组织架构</div>         
        <div class="content-list">
          <selection-tree v-for="people in structurePeople"
            :key="people.structure_id"
            treeId="flowInstanceStructureTree"
            :tree="people" 
            :labelPropertyName="'structure_name'"
            :nodeId="'structure_id'"
            :childrenKeyName="'children'"
            :selectionList="selectionList"
            :selectionEnabled="true">
          </selection-tree>
        </div>
      </div>
      <div class="modal-footer">
        <div class="clickable add-people" @click="moreOperationHandler">确定</div>
        <div class="clickable add-people" style="margin-left:20px" @click="structureSelectedWinVisiable = false">取消</div>        
      </div>
    </modal>
  </div>
</template>

<script>

import BpmnViewer from 'bpmn-js'
import BpmnModeler from 'bpmn-js/lib/Modeler'

import customTranslate from '../assets/translations/i11n.js'
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda'

import { getBpmnXMLStr, getProcessData, getStructureAssignee, getRoleAssignee, submitProcessData } from '../services/flow.service';

import SelectionTree from './SelectionTree'
import Modal from './Modal'

export default {
  name: 'FlowInstance',

  props: {
    folderId: {
      type: String
    },
    flowId: {
      type: String
    }
  },

  components: {
    SelectionTree,
    Modal
  },

  data: function() {
    return {
      currentTab: 'form',

      routerFrom: 'flowTemplate',
      process_type: 'template',

      bpmnModeler: '',
      
      task_id: '',
      task_key: '',
      bpmnXML: '',
      formId: '',
      node_attr: {},
      circulation_log: [],
      countersign_person: [],

      isCountersign: false,
      isOpinion: false,

      countersign_type: '',
      structurePeople: [],
      structurePeopleHandler: [],
      rolePeople: [],

      handleringButton: {},
      structureOrRoleSelectedWinVisiable: false,
      structureSelectedWinVisiable: false,
      selectTab: '',
      selectionList: [{
        id: 'selection',
        label: '选择',
      }],

      comment: '',
    }
  },  

  mounted: function() {
    let canvas = this.$refs.canvas

    let customTranslateModule = {
      translate: [ 'value', customTranslate ]
    }

    //建模，官方文档这里讲的很详细
    this.bpmnModeler = new BpmnModeler({
      container: canvas,
      additionalModules: [
        customTranslateModule,
      ],
      moddleExtensions: {
        camunda: camundaModdleDescriptor
      },
      height: '100%',
      width: '100%',
    });

    this.getDiagram(this.flowId)
  },

  methods: {
    getDiagram: function(flowId) {
      getBpmnXMLStr(flowId, this.process_type).then(
        res=>{
          this.bpmnXML = res.data.result.bpmn_xml
          this.formId = res.data.result.form_id
          let that = this

          //将字符串转换成图显示出来
          this.bpmnModeler.importXML(this.bpmnXML, function(err){
            if(err){
              console.error(err)
            }else{
              let node_status = res.data.result.node_status ? res.data.result.node_status : []
              let overlays = that.bpmnModeler.get('overlays');
              for(let i=0; i<node_status.length; i++){
                if(node_status[i].status === 'complete'){
                  overlays.add(node_status[i].node_name, {
                    position: {
                      left: 42,
                      bottom: 0
                    },
                    html: '<i class="iconfont iconwancheng" style="color: blue"></i>'
                  });
                }else if(node_status[i].status === 'handling'){
                  overlays.add(node_status[i].node_name, {
                  position: {
                    left: 42,
                    bottom: -2
                  },
                  html: '<i class="iconfont iconhongqi" style="color: red"></i>'
                });
                }
              }
            }
          })

          getProcessData(this.flowId, this.process_type).then(
            res=>{
              this.node_attr = res.data.result.node_attr
              this.circulation_log = res.data.result.circulation_log
              this.countersign()
              this.opinion()
              let p1 = getStructureAssignee(this.flowId);
              let p2 = getRoleAssignee(this.flowId);
              Promise.all([p1, p2]).then(
                reses => {
                  this.structurePeople = reses[0].data.result.data_list
                  this.structurePeopleHandler = this.treeHandler(JSON.parse(JSON.stringify(reses[0].data.result.data_list)));
                  this.rolePeople = reses[1].data.result.data_list;
                  for(let item of this.rolePeople){
                    item.node_id = 'r' + item.node_id
                    item.selection = false
                  }
              }).catch(
                err => {
                  console.log(err);
              });
          }).catch(
            err => {
              console.log(err)
          })
      }).catch(
        err => {
          console.log(err)
      })
    },

    countersign: function() {
      for(let i=0; i<this.node_attr.other_button_list.length; i++){
        if(this.node_attr.other_button_list[i].button_type === 'countersign'){
          this.isCountersign = true
          break
        }
      }
    },

    opinion: function() {
      for(let i=0; i<this.node_attr.other_button_list.length; i++){
        if(this.node_attr.other_button_list[i].button_type === 'opinion'){
          this.isOpinion = true
        }
      }
    },

    operationHandler: function(button_item, activity) {
      if(button_item.button_type === 'record'){
        console.log('跳页面')
        return
      }
      if(button_item.button_type === 'add_countersign' || button_item.button_type === 'transfer'){
        this.$globalEventBus.$off('flowInstanceStructureTree selection tree selected')

        this.$globalEventBus.$on('flowInstanceStructureTree selection tree selected', ({ node_id, selected }) => {
          if(selected){
            this.treeHandler2(this.structurePeople, node_id)
          }
        })
        this.handleringButton = button_item
        this.structureSelectedWinVisiable = true
        return
      }
      if(button_item.button_type === 'notify'){
        this.selectTab = "structure"
        this.handleringButton = button_item
        this.structureOrRoleSelectedWinVisiable = true
        return
      }
      if(button_item.operate === 'countersign'){
        if(this.countersign_person.length === 0){
          alert("请选择会签人员")
          return false
        }
      }
      let formData = this.$refs.detailform.getData()
      let child_form_list = this.$refs.detailform.getChildFormData()
      if(formData && child_form_list){
        submitProcessData(this.flowId, activity, this.task_id, formData, button_item.button_type, this.comment, this.process_type, this.task_key, this.countersign_person.length > 0 ? this.countersign_person : [], this.$route.params.folderId, child_form_list).then(
          res => {
            if(res && res.data && res.data.result) {
              alert('提交成功')
              this.reload()
            }else{
              alert(res.data.error_msg)
            }
          }).catch(
          err => {
            console.log(err);
        });
      }else{
        alert('不能上传空表单')
      }
    },

    moreOperationHandler: function() {
      let person = []
      if(this.selectTab === 'role'){
        for(let item of this.rolePeople){
          if(item.selection){
            person.push(item.node_id)
          }
        }
      }else{
        let structure = this.treeHandler(this.structurePeople)
        for(let item of structure){
          if(item.selection){
            person.push(item.node_id)
          }
        }
      }
      if(person.length === 0){
        alert('请选择人员')
        return
      }
      let formData = this.$refs.detailform.getData()
      let child_form_list = this.$refs.detailform.getChildFormData()
      if(formData && child_form_list){
        submitProcessData(this.flowId, false, this.task_id, formData, this.handleringButton.button_type, this.comment, this.process_type, this.task_key, this.countersign_person.length > 0 ? this.countersign_person : [], this.$route.params.folderId, child_form_list, person).then(
          res => {
            if(res && res.data && res.data.result) {
              alert('提交成功')
              this.reload()
            }else{
              alert(res.data.error_msg)
            }
          }).catch(
          err => {
            console.log(err);
        });
      }else{
        alert('不能上传空表单')
      }
    },

    treeHandler: function(treeList) {
      let newTreeList = new Array();
      //递归
      let recursion = function(item, level) {
        level++
        for(let i=0; i<item.length; i++){
          newTreeList.push({
            node_id: item[i].structure_id,
            node_name: item[i].structure_name,
            level,
            selection: item[i].selection,
          })
          if(typeof item[i].children !== "undefined"){
            recursion(item[i].children, level)
          }
        }
      }
      recursion(treeList, 0);
      return newTreeList;
    },

    treeHandler2: function(treeList, node_id) {
      //递归
      let recursion = function(item) {
        for(let i=0; i<item.length; i++){
          if(typeof item[i].selection !== "undefined"){
            if(item[i].structure_id === node_id){
              item[i].selection = true
            }else{
              item[i].selection = false
            }
          }
          if(typeof item[i].children !== "undefined"){
            recursion(item[i].children)
          }
        }
      }
      recursion(treeList);
    },

    formatDate: function(time) {
      if(typeof time !== 'number'){
        if(!isNaN(parseInt(time))){
          time = parseInt(time)
        }else{
          return time
        }
      }
      time = new Date(time)
      let year = time.getFullYear()
      let month = time.getMonth()+1>9?time.getMonth()+1:'0'+(time.getMonth()+1)
      let date = time.getDate()>9?time.getDate():'0'+time.getDate()
      let hour = time.getHours()>9?time.getHours():'0'+time.getHours()
      let minute = time.getMinutes()>9?time.getMinutes():'0'+time.getMinutes()
      let second = time.getSeconds()>9?time.getSeconds():'0'+time.getSeconds()
      return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second
    }
  },

  beforeDestroy: function() {
    this.$globalEventBus.$off('flowInstanceStructureTree selection tree selected')
  }
}
</script>

<style lang="scss">

@import '../assets/css/global';

.system-workbench-flow-module {
  height: 100%;

  .toolbar {
    height: 40px;
    display: flex;
    justify-content: space-between;

    .go-back {
      color: $primary-color;
      font-size: $font-l;
    }
  }

  .add-people {
    @include highContrastButton();
  }

  .system-workbench-flow-content {
    height: 100%;

    .el-tabs__content {
      height: calc(100% - 55px);
      background: white;
    }

    .system-workbench-flow-tab {
      height: 100%;
      position: relative;

      .canvas {
        width: 100%;
        height: 100%;
      }

      .canvas-readonly {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1000;
      }

      .system-workbench-flow-operation {
        margin: 10px;
        background: $secondary-color-5;
        padding: 0 10px;
        box-sizing: border-box;
        overflow: auto;

        hr {
          width: 100%;
          margin-top: 15px;
          height: 1px;
          border: 0px;
          background-color: $secondary-color-2;
          color: $secondary-color-2;
        }

        ul {
          width: 100%;
          margin: 0;
          padding: 0;
        }
      }

      .system-workbench-flow-operation-textbutton {
        height: 40px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        color: $primary-color;
        border-bottom: 1px solid $secondary-color-2;

        span {
          cursor: pointer;
          margin-left: 8px;
        }
      }

      .system-workbench-flow-operation-toolbar {
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
      }

      .system-workbench-flow-operation-textarea {
        width: 100%;
        margin-bottom: 10px;

        .system-workbench-flow-operation-title {
          margin: 5px 0;
        }
      }

      .system-workbench-flow-operation-footer {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .system-workbench-flow-log-item {
        margin-bottom: 10px;
        width: 100%;
        height: auto;
        background-color: white;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;

        .log-item-toolbar {
          width: 100%;
          height: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .log-item-toolbar-people {
            font-size: $font-m;
            color: $primary-color;
          }

          .log-item-toolbar-date {
            font-size: $font-s;
            color: $secondary-color-2;
          }
        }

        .log-item-content {
          width: 100%;
          margin-bottom: 10px;
        }

        hr {
          margin-top: 0;
        }
      }
    }

    .form-flex {
      display: flex;
      flex-direction: row;
    }
  }

  .outContainer {
    flex: 1;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  .flow-instance-modal .wrapper {
    padding: 20px 40px !important;
  }

  .flow-instance-modal .modal-header {
    color: $primary-color;
    font-size: $font-xl;
    font-weight: bold;
  }

  .flow-instance-modal .modal-content {
    height: 430px;
    border: 1px solid $secondary-color-2;
    display: flex;
    flex-direction: column;
  }

  .flow-instance-modal .content-header {
    width: 100%;
    height: 35px;
    border-bottom: 1px solid $secondary-color-2;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    box-sizing: border-box;
    padding: 0 20px;

    .active {
      line-height: 35px;
      color: $primary-color;
    }
  }

  .flow-instance-modal .content-list {
    width: 100%;
    box-sizing: border-box;
    padding-top: 5px;
    padding-bottom: 0;
    padding-left: 0;
    padding-right: 0;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  .flow-instance-modal .content-list .selection-tree {
    width: 100%;
    box-sizing: border-box;
    padding-left: 20px;
  }

  .flow-instance-modal .content-list .node-row {
    border-bottom: 1px dashed $secondary-color-2;
    width: auto;
    height: 30px;
    box-sizing: border-box;
    margin-right: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .flow-instance-modal .content-list .node-selections {
    width: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    input[type=checkbox] {
      height: 16px;
      width: 16px;
    }
  }

  .flow-instance-modal .table-content {
    height: calc(100% - 130px);
    overflow-y: auto;
  }

  .flow-instance-modal .table-content .row {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    > div {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .flow-instance-modal .table-content .title {
    color: $secondary-color-2;
  }

  .flow-instance-modal .select {
    min-width: 40px;  
    display: flex;
    align-items: center;
  }

  .flow-instance-modal .column {
    min-width: 100px;
  }

  .flow-instance-modal .table-content .each-person {
    border-bottom: 1px solid $secondary-color-4;
    width: 100%;
  }

  .flow-instance-modal .modal-footer {
    display: flex;
    justify-content: flex-end;
  }

  .djs-palette {
    display: none
  }
}
</style> 
<template>
  <div class="detailForm-container">
    <el-form 
      class="detailForm-content"
      size="small" 
      label-position="left" 
      label-width="120px"
      @submit.native.prevent>
      <template v-for="(item, index) in templateData">
        <template v-if="item.form_type == 'grid'">
          <el-row class="form-content-grid" :key="index" type="flex">
            <el-col v-for="(col, colIndex) in item.columns" :key="colIndex" :span="col.list.length === 0 ? 0 : getTrueSpan(item.columns, col.span)">
              <template v-for="(citem, index) in col.list">
                <detail-form-item :ref="citem.attr.type_id" 
                  v-if="typeof data[citem.attr.type_id] !== 'undefined'" 
                  :key="index" :widget="citem" :data="data" :instanceData="instanceData" :fieldMap="fieldMap" :dataLinkageList="dataLinkageList" :computedFieldList="computedFieldList" :templateId="templateId"
                  @peoButtonClick="peoWinHandler(arguments)" 
                  @deptButtonClick="deptWinHandler(arguments)" 
                  @relateFieldButtonClick="relateFieldWinHandler(arguments)" 
                  @relateFormButtonClick="relateFormWinHandler(arguments)" 
                  @relateFormMore="relateFormMoreButtonClick(arguments)" 
                  @openInstance="openInstance(arguments)" 
                  @changeSelectList="changeSelectList(arguments)" 
                  @computedField="computedField(arguments)" 
                  @openMap="mapWinHandler(arguments)">
                </detail-form-item>
              </template>
            </el-col>
          </el-row>
        </template>
        <template v-else>
          <detail-form-item :ref="item.attr.type_id" 
            v-if="typeof data[item.attr.type_id] !== 'undefined'" 
            :key="index" :widget="item" :data="data" :instanceData="instanceData" :fieldMap="fieldMap" :dataLinkageList="dataLinkageList" :computedFieldList="computedFieldList" :templateId="templateId"
            @peoButtonClick="peoWinHandler(arguments)" 
            @deptButtonClick="deptWinHandler(arguments)" 
            @relateFieldButtonClick="relateFieldWinHandler(arguments)" 
            @relateFormButtonClick="relateFormWinHandler(arguments)" 
            @relateFormMore="relateFormMoreButtonClick(arguments)" 
            @openInstance="openInstance(arguments)" 
            @changeSelectList="changeSelectList(arguments)" 
            @computedField="computedField(arguments)" 
            @openMap="mapWinHandler(arguments)">
          </detail-form-item>
        </template>       
      </template>
    </el-form>
    <!-- 人员选择弹框 -->
    <modal class="detailForm-modal" :contentHeight="'550px'" :contentWidth="'450px'" :class="{ hide: !peopleSelectVisible }">
      <div class="modal-header">人员选择</div>
      <div class="modal-content">
        <div class="content-header">
          <span class="clickable" :class="{ active : peopleSelectIsPeo == true}" @click="peopleSelectIsPeo = true">联系人</span>
          <span class="clickable" :class="{ active : peopleSelectIsPeo == false}" style="margin-left:10px" @click="peopleSelectIsPeo = false">组织架构</span>
        </div>         
        <div class="content-list">
          <selection-tree v-for="deptSelect in peopleSelectPeoList"
            :key="deptSelect.structure_id"
            treeId=""
            :tree="deptSelect" 
            :labelPropertyName="'structure_name'"
            :nodeId="'structure_id'"
            :childrenKeyName="'children'"
            :selectionList="selectionList"
            :selectionEnabled="true"
            v-show="peopleSelectIsPeo">
          </selection-tree>
          <selection-tree v-for="deptSelect in peopleSelectDeptList"
            :key="deptSelect.structure_id"
            treeId=""
            :tree="deptSelect" 
            :labelPropertyName="'structure_name'"
            :nodeId="'structure_id'"
            :childrenKeyName="'children'"
            :selectionList="selectionList"
            :selectionEnabled="true"
            v-show="!peopleSelectIsPeo">
          </selection-tree>
        </div>
      </div>
      <div class="modal-footer">
        <div class="clickable add-people" @click="addModal('people')">确定</div>
        <div class="clickable add-people" style="margin-left:20px" @click="closeModal('people')">取消</div>        
      </div>
    </modal>
    <!-- 部门选择弹框 -->
    <modal class="detailForm-modal" :contentHeight="'550px'" :contentWidth="'450px'" :class="{ hide: !deptSelectVisible }">
      <div class="modal-header">部门选择</div>
      <div class="modal-content">
        <div class="content-header">组织架构</div>
        <div class="content-list">
          <selection-tree v-for="deptSelect in deptSelectList"
            :key="deptSelect.structure_id"
            treeId=""
            :tree="deptSelect" 
            :labelPropertyName="'structure_name'"
            :nodeId="'structure_id'"
            :childrenKeyName="'children'"
            :selectionList="selectionList"
            :selectionEnabled="true">
          </selection-tree>
        </div>
      </div>
      <div class="modal-footer">
        <div class="clickable add-people" @click="addModal('dept')">确定</div>
        <div class="clickable add-people" style="margin-left:20px" @click="closeModal('dept')">取消</div>     
      </div>
    </modal>
    <!-- 关联他表/字段弹框 -->
    <modal class="detailForm-modal" :contentHeight="'550px'" :contentWidth="'750px'" :class="{ hide: !relateVisible }">
      <div>
        <div class="modal-header modal-flex">
          <span>{{ relateType=='relateform'?'关联他表':'关联字段' }}</span>
          <div>
            <span class="clickable" @click="refresh">刷新</span>
            <span class="clickable" @click="newInstance" style="margin-left:10px">新建记录</span>
          </div>
        </div> 
        <div style="margin-top:10px">
          <span>工作台目录</span>
          <el-select style="margin-left:10px" size="small" v-model="workspaceValue" clearable>
            <el-option v-for="(workspaceItem, index) in workspaceList" :key="index" :value="workspaceItem.workspace_id" :label="workspaceItem.workspace_name" :disabled="!workspaceItem.isleaf">
              <span :style="{ 'margin-left':(workspaceItem.level*20-20)+'px' }">{{ workspaceItem.workspace_name }}</span>
            </el-option>
          </el-select>
        </div>  
      </div>   
      <div class="table-content">
        <div class="row title">
          <div class="select"></div>
          <div class="column" v-for="relateHead in relateList.headlist">
            {{ relateHead.label }}
          </div>
        </div>
        <div class="row" v-for="relateRow in relateList.tablelist">
          <div class="select">
            <input type="checkbox" v-model="relateRow.selected" @change="mutexHandler(relateRow.selected, relateRow.data_id)">
          </div>
          <div class="column" v-for="relateHead in relateList.headlist">
            {{ relateRow[relateHead.prop] }}
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <div class="clickable add-people" @click="addModal(relateType)">确定</div>
        <div class="clickable add-people" style="margin-left:20px" @click="closeModal(relateType)">取消</div>       
      </div>
    </modal>
    <!-- 地址弹框 -->
    <modal :contentHeight="'550px'" :contentWidth="'1000px'" v-if="mapVisible" @modalTransparentClicked="cancelAddress">
      <a-map :detailAddress="editButtonParent ? data[editButtonParent].data[editButtonParentIndex][editButton].detail : data[editButton].detail" @selectAddress="selectAddress" @cancel="cancelAddress"></a-map>
    </modal>
    <!-- 更多页面弹框 -->
    <modal :contentHeight="'550px'" :contentWidth="'1000px'" v-if="morePageVisiable" @modalTransparentClicked="closeMoreButtonModal">
      <form-more-page :instanceIds="instanceIds" :typeIds="typeIds" :relateTemplateId="relateTemplateId" @openInstance="openInstance(arguments)"></form-more-page>
    </modal>
    <!-- 实例表单弹框 -->
    <modal :contentHeight="'550px'" :contentWidth="'1000px'" v-if="formInstanceVisible" @modalTransparentClicked="closeFormInstanceModal">
      <form-instance :routerFrom="'form'" :folderId="workspaceValue" :templateId="formInstanceTemplateId" :instanceId="formInstanceInstanceId"></form-instance>
    </modal>
  </div>
</template>

<script>

import { getFormById, getPeopleListByDeptid, getDeptListByDeptid, getWorkspaceByTemplateId, getAssociatingDetail, getAssociatingFormList, getExpressionValue, getChildFormList } from '../../services/form.service'
import { getProcessData } from '../../services/flow.service'
import { getStructureForm, getStructureLevelForm } from '../../services/structure.service';
import { getRoleForm } from '../../services/role.service';
import { getDictionaryForm } from '../../services/dictionary.service';

import DetailFormItem from './DetailFormItem'
import Modal from '../../components/Modal'
import SelectionTree from '../../components/SelectionTree'
import AMap from '../../components/AMap';
import FormInstance from '../../components/FormInstance';
import FormMorePage from '../../components/FormMorePage';

export default {
  name: 'DetailForm',

  components: {
    DetailFormItem,
    Modal,
    SelectionTree,
    AMap,
    FormInstance,
    FormMorePage
  },

  //templateId 表单模板id
  //formId 表单实例id
  //processId 流程id
  //contactsItemId 通讯录的相关项目id
  props: ['routerFrom', 'templateId', 'formId', 'processId', 'contactsItemId', 'dictionaryId'],

  data: function() {
    return {
      templateData: [],//模板数据
      instanceData: [],//实例数据
      data: {},//扒出来的数据模板

      dataLinkageList: {},//数据联动信息
      computedFieldList: {}, //计算公式信息

      fieldMap: {},//保存每个控件的类型和父级信息map

      peopleSelectVisible: false,//人员选择窗口是否展示
      peopleSelectIsPeo: true,//人员选择列表窗口tab页切换控制
      deptSelectVisible: false,//部门选择窗口是否展示
      relateVisible: false,//关联他表窗口是否展示
      mapVisible: false,//地址窗口是否展示
      formInstanceVisible: false,//表单实例窗口是否展示
      morePageVisiable: false,//更多窗口是否展示

      peopleSelectPeoList: [],//人员选择窗口的人员列表（平铺
      peopleSelectDeptList: [],//人员选择窗口的人员列表（树形）

      deptSelectList: [],//部门选择窗口的部门列表（树形）

      relateType: '',//关联他表还是关联字段
      workspaceList: [],//关联他表窗口的工作台下拉列表         
      workspaceValue: '',//关联他表窗口选中工作台的值
      relateList: {
        headlist: [],
        tablelist: []
      },//关联他表/字段窗口的底表列表

      formInstanceTemplateId: '',//实例窗口模板id
      formInstanceInstanceId: '',//实例窗口实例id

      instanceIds: '',//更多窗口实例数组
      typeIds: '',//更多窗口列数组
      relateTemplateId: '',//更多窗口模板id

      editButton: '',//当前编辑的控件id,弹出人员选择部门选择关联他表弹窗时使用
      editButtonParent: false,//子表单内控件编辑时使用
      editButtonParentIndex: 0,//子表单内控件编辑时使用
      relateEditId: '',//关联他表/字段控件所关联的模板id
      relateFormEditRange: [],//关联他表控件所关联的模板字段id数组
      relateFieldEditRange: '',//关联字段控件所关联的模板字段id

      selectionList: [{
        id: 'selected',
        label: '选择',
      }]
    }
  },

  created: function() {
    this.loadForm()
  },

  methods: {
    loadForm: async function() {
      let interface_type = ""
      let params = ""
      let id = ""
      let res = ""
      //流程建模页面查看表单
      if(this.routerFrom === 'flow'){
        id = this.templateId
        interface_type = "form"
        params = "template"
      //流程实例发起页面展示空表单
      }else if(this.routerFrom === 'flowTemplate'){
        id = this.processId
        interface_type = "flow"
        params = "template"
      //流程实例查看页面展示表单
      }else if(this.routerFrom === 'flowInstance'){
        id = this.processId
        interface_type = "flow"
        params = "instance"
      //组织架构页面展示表单
      }else if(this.routerFrom === 'structure' || this.routerFrom === 'role' || this.routerFrom === 'structurelevel'){ 
        id = this.contactsItemId
        interface_type = this.routerFrom
      //接口页面查看表单
      }else if(this.routerFrom === 'interface'){
        id = this.templateId
        interface_type = "form"
        params = "template"
      }else if(this.routerFrom === 'dictionary'){
        id = this.dictionaryId
        interface_type = "dictionary"
      }else{
        //表单发起页面展示空表单
        if(this.formId === "new"){
          id = this.templateId
          interface_type = "form"
          params = "template"
        //表单实例页面展示表单
        }else{
          id = this.formId
          interface_type = "form"
          params = "instance"
        }
      }
      try {
        if(interface_type === 'form'){
          res = await getFormById(id, params)
        }else if(interface_type === 'flow'){
          res = await getProcessData(id, params)
        }else if(interface_type === 'structure'){
          res = await getStructureForm(id)
        }else if(interface_type === 'role'){
          res = await getRoleForm(id)
        }else if(interface_type === 'structurelevel'){
          res = await getStructureLevelForm(id)
        }else if(interface_type === 'dictionary'){
          res = await getDictionaryForm(id)
        }
        if(res && res.data && res.data.result && res.data.result.template_item_list && res.data.result.form_item_list) {        
          this.templateData = res.data.result.template_item_list.form_data
          this.instanceData = res.data.result.form_item_list
          this.dataHandler()
        }
      } catch(err) {
        console.log(err)
      }
    },

    dataHandler: async function() {
      for(let i=0; i<this.instanceData.length; i++){
        let type = this.instanceData[i].form_type
        let id = this.instanceData[i].attr.type_id
        this.fieldMap[id] = {
          type
        }
        this.modelDataHandlerForDatalinkage(this.instanceData[i])
        this.modelDataHandlerForComputed(this.instanceData[i])
        this.$set(this.data, id, await this.modelDataHandler(this.instanceData[i]))
      }
    },
    //表单数据模型处理
    modelDataHandler: async function(item) {
      let type = item.form_type
      let value = [] 
      let modelItem = ''

      if(typeof item.content_list !== "undefined" && item.content_list.length !== 0){
        value = item.content_list
      }

      if(type == 'single_line_input' || type == 'phone_input' || type == 'float_input' || type == 'amount_input' || type == 'big_amount_input' || type == 'email_input' || type == 'date_select'){
        modelItem = value.length == 0 ? '' : value[0].value ? value[0].value : ''
      }else if(type == 'multi_select'){
        let valueArray = new Array()
        for(let j=0; j<value.length; j++){
          valueArray.push(value[j].value)
        }
        modelItem = valueArray 
      }else if(type == 'single_select_drop_down' || type == 'parent_select'){
        modelItem = value.length == 0 ? '' : value[0].id
      }else if(type == 'upload_select' || type == 'photo_select'){
        let valueArray = new Array()
        for(let j=0; j<value.length; j++){
          let filevalue = value[j].value ? JSON.parse(value[j].value) : '' 
          valueArray.push({
            uid: value[j].id ? value[j].id : '',
            name: filevalue.file_name ? filevalue.file_name : '',
            size: filevalue.file_size ? filevalue.file_size : '',
            type: filevalue.type ? filevalue.type : '',
            src: filevalue.url ? '/mock' + filevalue.url : '',
          })
        }
        modelItem = valueArray
      }else if(type == 'person_page_select' || type == 'department_page_select' || type == 'associating_field'){
        modelItem = value
      }else if(type == 'address_input'){
        let valueArray = value.length == 0 ? [] : value[0].area ? value[0].area.split(' ') : []
        let valueObject = {
          province_value: '',
          city_value: '',
          area_value: '',
          detail: value.length == 0 ? '' : value[0].value ? value[0].value : ''
        }
        if(valueArray.length > 0) valueObject.province_value = valueArray[0]
        if(valueArray.length > 1) valueObject.city_value = valueArray[1]
        if(valueArray.length > 2) valueObject.area_value = valueArray[2]
        modelItem = valueObject
      }else if(type == 'associating_table'){
        modelItem = await this.updateRelateFormData(value, item.attr.range)
      }else if(type == 'child_form'){
        modelItem = await this.ChildFormDataHandler(value, item.attr.form_template_id, item.attr.type_id)
      }
      return modelItem
    },
    //子表单的数据模型处理
    ChildFormDataHandler: async function(value, form_template_id, parent_type_id) {
      try {
        for(let i=0; i<value.length; i++){
          value[i] = value[i].value
        }
        let res = await getChildFormList(value, form_template_id)
        let relateFormItem = {
          form_data_list: [],
          template_data: [],
          data: [],
          data_for_new: {},
        }
        if(res && res.data && res.data.result){
          for(let item of res.data.result.form_data_list){
            this.$set(item, 'operate_type', 'update')
          }
          relateFormItem.form_data_list = res.data.result.form_data_list
          relateFormItem.template_data = res.data.result.template_data
          //模板解析
          for(let item of res.data.result.template_data){
            this.fieldMap[item.attr.type_id] = {
              parent_type_id,
              type: item.form_type
            }
            this.modelDataHandlerForDatalinkage(item)
            this.modelDataHandlerForComputed(item)
            relateFormItem.data_for_new[item.attr.type_id] = await this.modelDataHandler(item) 
          }
          //数据扒出来
          for(let item of res.data.result.form_data_list){
            let dataItem = {}
            for(let sitem of item.form_item_list){
              dataItem[sitem.attr.type_id] = await this.modelDataHandler(sitem)
            }
            relateFormItem.data.push(dataItem)
          }
        }
        return relateFormItem
      } catch(err) {
        console.log(err)
      }
    },
    //包装数据联动信息
    modelDataHandlerForDatalinkage: function(item) {
      let type = item.form_type
      //数据联动功能的数据模型
      if(type == 'single_line_input' || type == 'phone_input' || type == 'float_input' || type == 'amount_input' || type == 'big_amount_input' || type == 'email_input' || type == 'date_select' || type == 'single_select_drop_down'){
        if(item.attr.data_linkage.linkage_field !== ''){
          let dataLinkageItem = {
            original_form_id: item.attr.data_linkage.original_form_id,
            original_form_linkage_field: item.attr.data_linkage.original_form_linkage_field,
            original_form_type_id: item.attr.data_linkage.original_form_type_id,
            linkage_field: item.attr.type_id
          }
          if(typeof this.dataLinkageList[item.attr.data_linkage.linkage_field] === "undefined"){
            this.dataLinkageList[item.attr.data_linkage.linkage_field] = new Array()
          }
          this.dataLinkageList[item.attr.data_linkage.linkage_field].push(dataLinkageItem)
        } 
      }
    },
    //包装计算公式信息
    modelDataHandlerForComputed: function(item) {
      let type = item.form_type
      //计算公式数据模型
      if(type == 'single_line_input' || type == 'float_input' || type == 'amount_input' || type == 'date_select'){
        if(typeof item.attr.computed_content !== 'undefined' && item.attr.computed_content !== null && item.attr.computed_content !== ''){
          //截取${xxx}格式的数据
          let args = item.attr.computed_content.match(/\$\{(.*?)\}/g)
          //包装params数据
          let computedArray = []
          let params = []
          for(let i=0; i<args.length; i++){
            let type_id = args[i].substring(2, args[i].length-1)
            if(computedArray.indexOf(type_id) === -1){
              computedArray.push(type_id)
              params.push({
                field_id: type_id
              })
            }
          }
          let computedItem = {
            field_id: item.attr.type_id,
            formula: item.attr.computed_content,
            params
          }
          //包装计算公式信息
          for(let i=0; i<computedArray.length; i++){
            if(typeof this.computedFieldList[computedArray[i]] === "undefined"){
              this.computedFieldList[computedArray[i]] = new Array()
            }
            this.computedFieldList[computedArray[i]].push(computedItem)
          }
        } 
      }
    },

    //人员选择控件
    peoWinHandler: function(msg) {
      //获取到人员的组织架构树
      getPeopleListByDeptid(msg[1]).then(
        res => {
          let peopleSelectDeptListRes = "";
          if(res && res.data && res.data.result && res.data.result.data_list) {
            peopleSelectDeptListRes = res.data.result.data_list;
          }
          if(msg[2]){
            //初始化按钮已选中的值
            this.peopleSelectDeptList = this.deptListHandler(peopleSelectDeptListRes, this.data[msg[2]].data[msg[3]][msg[0]])
          }else{
            //初始化按钮已选中的值
            this.peopleSelectDeptList = this.deptListHandler(peopleSelectDeptListRes, this.data[msg[0]])
          }
          //由树形转化为平铺
          this.peopleSelectPeoList = this.deptListHandler2(this.peopleSelectDeptList)
          this.peopleSelectVisible = true
          this.editButton = msg[0]
          this.editButtonParent = msg[2]
          this.editButtonParentIndex = msg[3]
      }).catch(err => {
        console.log(err)
      });
    },
    //部门选择控件
    deptWinHandler: function(msg) {
      //获取到部门的组织架构树
      getDeptListByDeptid(msg[1]).then(
        res => {
          let deptSelectListRes = "";
          if(res && res.data && res.data.result && res.data.result.data_list) {
            deptSelectListRes = res.data.result.data_list;
          }
          if(msg[2]){
            //初始化按钮已选中的值
            this.deptSelectList = this.deptListHandler(deptSelectListRes, this.data[msg[2]].data[msg[3]][msg[0]])
          }else{
            //初始化按钮已选中的值
            this.deptSelectList = this.deptListHandler(deptSelectListRes, this.data[msg[0]])
          }
          this.deptSelectVisible = true
          this.editButton = msg[0]
          this.editButtonParent = msg[2]
          this.editButtonParentIndex = msg[3]
      }).catch(err => {
        console.log(err)
      });
    },
    //关联他表控件
    relateFormWinHandler: function(msg) {
      //获取工作台列表和底表列表数据
      Promise.all([getWorkspaceByTemplateId(msg[1]), getAssociatingDetail(msg[1])]).then(
        res => {
          this.relateType = "relateform"
          //加载工作台列表
          let workspaceListRes = "";
          if(res[0] && res[0].data && res[0].data.result && res[0].data.result.data_list) {
            workspaceListRes = res[0].data.result.data_list;
          }
          this.workspaceList = this.workspaceTreeHandler(workspaceListRes)

          //加载底表列表数据
          let relateFormListRes = "";
          if(res[1] && res[1].data && res[1].data.result && res[1].data.result.column_head_list) {
            relateFormListRes = res[1].data.result;
          }
          
          if(msg[3]){
            if(typeof this.data[msg[3]].data[msg[4]][msg[0]] !== "undefined"){
              this.relateList = this.relateListHandler(relateFormListRes, this.data[msg[3]].data[msg[4]][msg[0]].value, 3);
            }else{
              this.relateList = this.relateListHandler(relateFormListRes, [], 0);
            }
          }else{
            if(typeof this.data[msg[0]] !== "undefined"){
              this.relateList = this.relateListHandler(relateFormListRes, this.data[msg[0]].value, 3);
            }else{
              this.relateList = this.relateListHandler(relateFormListRes, [], 0);
            }
          }

          this.relateVisible = true
          this.editButton = msg[0]
          this.relateEditId = msg[1]
          this.relateFormEditRange = msg[2]
          this.editButtonParent = msg[3]
          this.editButtonParentIndex = msg[4]
      }).catch(err => {
        console.log(err)
      }); 
    },
    //关联字段控件
    relateFieldWinHandler: function(msg) {
      //获取工作台列表和底表列表数据
      Promise.all([getWorkspaceByTemplateId(msg[1]), getAssociatingDetail(msg[1])]).then(
        res => {
          this.relateType = "relatefield"
          //加载工作台列表
          let workspaceListRes = "";
          if(res[0] && res[0].data && res[0].data.result && res[0].data.result.data_list) {
            workspaceListRes = res[0].data.result.data_list;
          }
          this.workspaceList = this.workspaceTreeHandler(workspaceListRes)

          //加载底表列表数据
          let relateFieldListRes = "";
          if(res[1] && res[1].data && res[1].data.result && res[1].data.result.column_head_list) {
            relateFieldListRes = res[1].data.result;
          }

          if(msg[3]){
            if(typeof this.data[msg[3]].data[msg[4]][msg[0]] !== "undefined"){
              this.relateList = this.relateListHandler(relateFieldListRes, this.data[msg[3]].data[msg[4]][msg[0]], 0);
            }else{
              this.relateList = this.relateListHandler(relateFieldListRes, [], 0);
            }
          }else{
            if(typeof this.data[msg[0]] !== "undefined"){
              this.relateList = this.relateListHandler(relateFieldListRes, this.data[msg[0]], 0);
            }else{
              this.relateList = this.relateListHandler(relateFieldListRes, [], 0);
            }
          }

          this.relateVisible = true
          this.editButton = msg[0]
          this.relateEditId = msg[1]
          this.relateFieldEditRange = msg[2]
          this.editButtonParent = msg[3]
          this.editButtonParentIndex = msg[4]
      }).catch(err => {
        console.log(err)
      });
    },
    //地图控件
    mapWinHandler: function(msg) {
      this.editButton = msg[0]
      this.editButtonParent = msg[1]
      this.editButtonParentIndex = msg[2]
      this.mapVisible = true
    },

    //地图弹窗点击确定
    selectAddress: function(msg) {
      if(this.editButtonParent){
        this.data[this.editButtonParent].data[this.editButtonParentIndex][this.editButton].detail = msg
      }else{
        this.data[this.editButton].detail = msg
      }
      this.closeModal('address')
    },
    //地图弹窗点击关闭
    cancelAddress: function() {
      this.closeModal('address')
    },
    
    //人员选择和部门选择弹窗：组织架构树解构，初始化树形结构的选择项
    deptListHandler: function(deptList, valueList) {
      //递归
      let recursion = function(item) {
        for(let i=0; i<item.length; i++) {
          if(typeof item[i].children !== "undefined"){
            item[i].children = recursion(item[i].children)
          }else{
            for(let j=0; j<valueList.length; j++){
              if(valueList[j].id === item[i].structure_id){
                item[i].selected=true
              }
            }
          }
        }
        return item
      }
      return recursion(deptList);
    },
    //人员选择弹窗：组织架构树解构，树形结构转平铺结构，只有人员节点可选
    deptListHandler2: function(deptList) {
      let leaflist = new Array();
      //递归
      let recursion = function(item) {
        for(let i=0; i<item.length; i++){
          if(typeof item[i].children !== "undefined"){
            recursion(item[i].children)
          }else{
            if(typeof item[i].selected !== "undefined"){
              leaflist.push({
                structure_id:item[i].structure_id,
                structure_name:item[i].structure_name,
                selected:item[i].selected
              })
            }
          }
        }
      }
      recursion(deptList);
      return leaflist;
    },
    //部门选择弹窗：组织架构树解构，树形结构转平铺结构，所有节点都可选
    deptListHandler3: function(deptList) {
      let leaflist = new Array();
      //递归
      let recursion = function(item) {
        for(let i=0; i<item.length; i++){
          if(typeof item[i].selected !== "undefined"){
            leaflist.push({
              structure_id:item[i].structure_id,
              structure_name:item[i].structure_name,
              selected:item[i].selected
            })
          }
          if(typeof item[i].children !== "undefined"){
            recursion(item[i].children)
          }
        }
      }
      recursion(deptList);
      return leaflist;
    },
    //关联他表/字段弹窗：工作台列表解构
    workspaceTreeHandler: function(treeList) {
      let newTreeList = new Array();
      //递归
      let recursion = function(item, level) {
        level++
        for(let i=0; i<item.length; i++){
          newTreeList.push({
            workspace_id:item[i].workspace_id,
            workspace_name:item[i].workspace_name,
            level,
            isleaf:typeof item[i].children === "undefined" ? true : false
          })
          if(typeof item[i].children !== "undefined"){
            recursion(item[i].children, level)
          }         
        }
      }
      recursion(treeList, 0);
      return newTreeList;
    },

    //关联他表窗口：关联他表控件的数据包装
    updateRelateFormData: async function(value, range) {
      let valueJson = {}
      let content = new Array()     
      for(let i=0; i<value.length; i++){ 
        content.push(value[i].value)
      }
      try {
        if(content.length > 0){           
          let res = await getAssociatingFormList(content, range)
          let relateFormItem = "";
          if(res && res.data && res.data.result && res.data.result.column_head_list) {
            relateFormItem = res.data.result;
          }
          //关联他表底表解析
          if(range.length === 1){
            relateFormItem = this.relateListHandler(relateFormItem, [], 0);
          }else{
            relateFormItem = this.relateListHandler(relateFormItem, [], 3);//最多展示3行
          }
          valueJson = {
            value,
            headlist:relateFormItem.headlist,
            tablelist:relateFormItem.tablelist
          }       
        }else{
          valueJson = {
            value,
            headlist:[],
            tablelist:[]
          }
        }
      } catch(err) {
        console.log(err)
      }
      return valueJson
    },

    //关联字段窗口：单选功能互斥处理
    mutexHandler: function(selected, data_id) {
      if(selected && this.relateType === 'relatefield'){
        for(let i=0; i<this.relateList.tablelist.length; i++){
          if(this.relateList.tablelist[i].selected && this.relateList.tablelist[i].data_id !== data_id){
            this.relateList.tablelist[i].selected = false
          }
        }
      }
    },

    //关联他表/字段：接口返回值解构，参数：表格数据、选中的id数组（用于初始化）、展示条数的限制
    relateListHandler: function(relateItem, valueList, lengthLimit) {
      let Item = {};
      Item.headlist = this.headListHandler(relateItem.column_head_list)
      Item.tablelist = this.tableListHandler(relateItem.report_table_list, Item.headlist, valueList, lengthLimit)
      return Item;
    },
    //接口的头部解构
    headListHandler: function(columnHeadList) {
      let headlist = new Array();
      //递归
      let recursion = function(item) {
        for(let i=0; i<item.length; i++){
          if(typeof item[i].children !== "undefined"){
            recursion(item[i].children)
          }else{
            headlist.push({
              prop:item[i].prop,
              labelType: item[i].label_type,
              label:item[i].label
            })
          }
        }
      }
      recursion(columnHeadList);
      return headlist;
    },
    //接口的内容解构
    tableListHandler: function(columnContentList, columnHeadList, valueList, lengthLimit) {
      let contentList = new Array();
      let maxLength = lengthLimit > 0 ? (columnContentList.length > lengthLimit ? lengthLimit : columnContentList.length) : columnContentList.length
      for(let i=0; i<maxLength; i++){
        let contentListItem = {};
        let selectStatus = false;
        if(this.relateType == 'relateform'){
          for(let j=0; j<valueList.length; j++){
            if(valueList[j].value === columnContentList[i].data_id.content_list[0].value){ selectStatus = true }
          }
        }else if(this.relateType == 'relatefield'){
          for(let j=0; j<valueList.length; j++){
            if(valueList[j].id === columnContentList[i].data_id.content_list[0].value){ selectStatus = true }
          }
        }
        contentListItem.selected = selectStatus
        contentListItem.data_id = columnContentList[i].data_id.content_list[0].value
        for(let j=0; j<columnHeadList.length; j++){
          let valueString = ""
          if(typeof columnContentList[i][columnHeadList[j].prop] !== "undefined"){
            for(let k=0; k<columnContentList[i][columnHeadList[j].prop].content_list.length; k++){
              let valueStringItem = columnContentList[i][columnHeadList[j].prop].content_list[k].value ? columnContentList[i][columnHeadList[j].prop].content_list[k].value : ''
              valueString = valueString + valueStringItem + ','
            }
            valueString = valueString.substring(0, valueString.length - 1)
            if(columnHeadList[j].labelType == 'date_select'){
              valueString = this.formatDate(valueString)
            }
            if(columnHeadList[j].labelType == 'associating_table'){
              valueString = '关联他表'
            }
            if(columnHeadList[j].labelType == 'child_form'){
              valueString = '子表单'
            }
          }
          contentListItem[columnHeadList[j].prop] = valueString
        }        
        contentList.push(contentListItem)
      }
      return contentList;
    },

    //弹窗点击确定
    addModal: async function(type) {
      let selectArray = new Array();
      if(type === "people"){
        if(this.peopleSelectIsPeo){
          for(let i=0; i<this.peopleSelectPeoList.length; i++){
            if(this.peopleSelectPeoList[i].selected){
              selectArray.push({
                "id":this.peopleSelectPeoList[i].structure_id,
                "value":this.peopleSelectPeoList[i].structure_name
              });
            }
          }
        }else{
          let peoLeafList = this.deptListHandler2(this.peopleSelectDeptList)
          for(let i=0; i<peoLeafList.length; i++){
            if(peoLeafList[i].selected){
              selectArray.push({
                "id":peoLeafList[i].structure_id,
                "value":peoLeafList[i].structure_name
              });
            }
          }
        }
        if(this.editButtonParent){
          this.data[this.editButtonParent].data[this.editButtonParentIndex][this.editButton] = selectArray
        }else{
          this.data[this.editButton] = selectArray;
        }
      }else if(type === "dept"){
        let deptLeafList = this.deptListHandler3(this.deptSelectList)
        for(let i=0; i<deptLeafList.length; i++){
          if(deptLeafList[i].selected){
            selectArray.push({
              "id":deptLeafList[i].structure_id,
              "value":deptLeafList[i].structure_name
            });
          }
        }
        if(this.editButtonParent){
          this.data[this.editButtonParent].data[this.editButtonParentIndex][this.editButton] = selectArray
        }else{
          this.data[this.editButton] = selectArray;
        }
      }else if(type === "relateform"){
        for(let i=0; i<this.relateList.tablelist.length; i++){
          if(this.relateList.tablelist[i].selected){
            selectArray.push({
              "id":"",
              "value":this.relateList.tablelist[i].data_id
            });
          }
        }
        if(this.editButtonParent){
          this.data[this.editButtonParent].data[this.editButtonParentIndex][this.editButton] = await this.updateRelateFormData(selectArray, this.relateFormEditRange);  
        }else{
          this.data[this.editButton] = await this.updateRelateFormData(selectArray, this.relateFormEditRange);  
        } 
      }else if(type === "relatefield"){
        for(let i=0; i<this.relateList.tablelist.length; i++){
          if(this.relateList.tablelist[i].selected){
            selectArray.push({
              "id": this.relateList.tablelist[i].data_id,
              "value": this.relateList.tablelist[i][this.relateFieldEditRange]
            });
          }
        }

        if(this.editButtonParent){
          this.data[this.editButtonParent].data[this.editButtonParentIndex][this.editButton] = selectArray
          this.$refs[this.editButtonParent][0].dataLinkageHandler(this.editButton, selectArray[0].value, this.editButtonParent, this.editButtonParentIndex)  
        }else{
          this.data[this.editButton] = selectArray 
          this.$refs[this.editButton][0].dataLinkageHandler(this.editButton, selectArray[0].value, false, 0)   
        }   
      }   
      this.closeModal(type)
    },
    //弹窗点击关闭
    closeModal: function(type) {
      if(type === "people") { 
        this.peopleSelectVisible = false
        this.peopleSelectIsPeo = true
      }else if(type === "dept") { 
        this.deptSelectVisible = false
      }else if(type === "relateform") { 
        this.relateVisible = false
        this.workspaceValue = ""  
        this.relateEditId = "" 
        this.relateFormEditRange = []     
      }else if(type === "relatefield") { 
        this.relateVisible = false
        this.workspaceValue = ""  
        this.relateEditId = "" 
        this.relateFieldEditRange = []     
      }else if(type === "address") { 
        this.mapVisible = false   
      }   
      this.editButton = ''
      this.editButtonParent = false
      this.editButtonParentIndex = 0
    },

    //关联他表/字段：窗口刷新按钮
    refresh: function() {
      getAssociatingDetail(this.relateEditId).then(
        res => {
          let relateListRes = "";
          if(res && res.data && res.data.result && res.data.result.column_head_list) {
            relateListRes = res.data.result;
          }

          if(this.editButtonParent){
            if(typeof this.data[this.editButtonParent].data[this.editButtonParentIndex][this.editButton] !== "undefined"){
              this.relateList = this.relateListHandler(relateListRes, this.data[this.editButtonParent].data[this.editButtonParentIndex][this.editButton], 0);
            }else{
              this.relateList = this.relateListHandler(relateListRes, [], 0);
            }
          }else{
            if(typeof this.data[this.editButton] !== "undefined"){
              this.relateList = this.relateListHandler(relateListRes, this.data[this.editButton], 0);
            }else{
              this.relateList = this.relateListHandler(relateListRes, [], 0);
            }
          }
      }).catch(err => {
        console.log(err)
      }); 
    },
    //关联他表/字段：窗口新建实例按钮
    newInstance: function() {
      if(this.workspaceValue === ''){
        alert('请选择工作台目录')
        return false
      }
      this.formInstanceTemplateId = this.relateEditId
      this.formInstanceInstanceId = 'new'
      this.formInstanceVisible = true
    },
    //关联他表：更多按钮
    relateFormMoreButtonClick: function(msg) {
      this.instanceIds = msg[0]
      this.typeIds = msg[1]
      this.relateTemplateId = msg[2]
      this.morePageVisiable = true
    },
    closeMoreButtonModal: function() {
      this.morePageVisiable = false
    },
    //关联他表：点击某行跳转到实例
    openInstance: function(msg) {
      this.formInstanceTemplateId =  msg[0]
      this.formInstanceInstanceId = msg[1]
      this.formInstanceVisible = true
    },
    closeFormInstanceModal: function() {
      if(this.relateVisible){
        this.refresh()
      }
      this.formInstanceVisible = false
    },

    //计算字段功能实现
    computedField: async function(msg) {
      let index = msg.length > 1 ? msg[1] : -1
      msg = msg[0]
      for(let i=0; i<this.computedFieldList[msg].length; i++){
        //影响的控件id
        let change_field_id = this.computedFieldList[msg][i].field_id
        for(let j=0; j<this.computedFieldList[msg][i].params.length; j++){
          let item = this.computedFieldList[msg][i].params[j]
          let value = []

          item.form_type = this.fieldMap[item.field_id].type
          //计算公式中参与计算的控件为非子表单控件，那么直接拿来值用
          if(typeof this.fieldMap[item.field_id].parent_type_id === 'undefined'){   
            value.push(this.data[item.field_id] + "")
            item.value = value
          //计算公式中参与计算的控件是子表单控件，影响的控件也是子表单控件
          }else if(typeof this.fieldMap[item.field_id].parent_type_id !== 'undefined' && typeof this.fieldMap[change_field_id].parent_type_id !== 'undefined'){
            let parent_type_id = this.fieldMap[item.field_id].parent_type_id
            //计算公式中参与计算控件是与影响的控件在同一个子表单内，那么直接拿来值用
            if(this.fieldMap[item.field_id].parent_type_id === this.fieldMap[change_field_id].parent_type_id){
              value.push(this.data[parent_type_id].data[index][item.field_id] + "")
              item.value = value
            //计算公式中参与计算的控件是与影响的控件不在在同一个子表单内，需要将参与计算的子表单控件的值做成数组
            }else{
              for(let dataItem of this.data[parent_type_id].data){
                value.push(dataItem[item.field_id] + "")
              }
              item.value = value
            }
          //计算公式参与计算的控件是子表单控件，影响的控件不是子表单控件，需要将参与计算的子表单控件的值做成数组
          }else{
            let parent_type_id = this.fieldMap[item.field_id].parent_type_id
            for(let dataItem of this.data[parent_type_id].data){
              value.push(dataItem[item.field_id] + "")
            }
            item.value = value
          }
        }
      }
      try {
        let res = await getExpressionValue(this.computedFieldList[msg])
        let dataList = "";
        if(res && res.data && res.data.result && res.data.result.data_list) {
          dataList = res.data.result.data_list;
        }
        for(let i=0; i<dataList.length; i++){
          if(typeof this.fieldMap[dataList[i].field_id].parent_type_id === 'undefined'){
            this.data[dataList[i].field_id] = dataList[i].content_list[0].value
          }else if(typeof this.fieldMap[dataList[i].field_id].parent_type_id !== 'undefined' && typeof this.fieldMap[msg].parent_type_id !== 'undefined'){
            let parent_type_id = this.fieldMap[dataList[i].field_id].parent_type_id
            if(this.fieldMap[dataList[i].field_id].parent_type_id === this.fieldMap[msg].parent_type_id){
              this.data[parent_type_id].data[index][dataList[i].field_id] = dataList[i].content_list[0].value
            }else{
              for(let item of this.data[parent_type_id].data){
                item[dataList[i].field_id] = dataList[i].content_list[0].value
              }
            }
          }else{
            let parent_type_id = this.fieldMap[dataList[i].field_id].parent_type_id
            for(let item of this.data[parent_type_id].data){
              item[dataList[i].field_id] = dataList[i].content_list[0].value
            }
          }
        }
      } catch(err) {
        console.log(err)
      }
    },

    //修改下拉框的content_with_id_list的值，下拉框关联他表字段功能
    changeSelectList: function(msg) {
      for(let i=0; i<this.instanceData.length; i++){
        if(this.instanceData[i].attr.type_id === msg[0]){
          this.instanceData[i].attr.content_with_id_list = msg[1]
          break;
        }
      }
    },

    //获取值
    getData: function() {
      let insdata = this.instanceData
      for(let i=0; i<insdata.length; i++){
        if(insdata[i].form_type !== "child_form"){
          let dataItem = this.getDataHandler(insdata[i], this.data, false, 0)
          if(dataItem){
            insdata[i] = dataItem
          }else{
            return false
          }
        }
      }
      return insdata
    },
    getChildFormData: function() {
      let insdata = this.instanceData
      let child_form_data = []
      for(let i=0; i<insdata.length; i++){
        if(insdata[i].form_type == "child_form"){
          for(let j=0; j<this.data[insdata[i].attr.type_id].form_data_list.length; j++){
            for(let item of this.data[insdata[i].attr.type_id].form_data_list[j].form_item_list){
              let dataItem = this.getDataHandler(item, this.data[insdata[i].attr.type_id].data[j], insdata[i].attr.type_id, j)
              if(dataItem){
                item = dataItem
              }else{
                return false
              }
            }
          }
          let child_form_item = {
            field_id: insdata[i].attr.type_id,
            form_data_list: this.data[insdata[i].attr.type_id].form_data_list
          }
          child_form_data.push(child_form_item)
        }
      }
      return child_form_data
    },
    getDataHandler: function(item, data, parent_type_id, index) {
      if(item.form_type == 'single_line_input' || item.form_type == 'email_input' || item.form_type == 'date_select'){
        if(item.writable && item.attr.required && data[item.attr.type_id] === ''){
          alert('某些必填项为空('+item.attr.type_title+')')
          return false
        }
        item.content_list = [
          { 
            value:data[item.attr.type_id]
          }
        ]
      }else if(item.form_type == 'phone_input' || item.form_type == 'float_input' || item.form_type == 'amount_input' || item.form_type == 'big_amount_input'){
        if(item.writable && item.attr.required && data[item.attr.type_id] === ''){
          alert('某些必填项为空('+item.attr.type_title+')')
          return false
        }
        let reg = /^(-?\d+)(\.\d+)?$/;
        if(data[item.attr.type_id] && data[item.attr.type_id] !== '' && !reg.test(data[item.attr.type_id])){
          alert(item.attr.type_title+'必须为数字')
          return false
        }
        item.content_list = [
          { 
            value:data[item.attr.type_id]
          }
        ]
      }else if(item.form_type == "multi_select"){
        if(item.writable && item.attr.required && data[item.attr.type_id] === ''){
          alert('某些必填项为空('+item.attr.type_title+')')
          return false
        }
        let contentArray = new Array()
        for(let j=0; j<item.attr.content_with_id_list.length; j++){
          if(data[item.attr.type_id].indexOf(item.attr.content_with_id_list[j].value)>-1){
            contentArray.push(item.attr.content_with_id_list[j])
          }
        }
        item.content_list = contentArray
      }else if(item.form_type == "single_select_drop_down" || item.form_type == "parent_select"){
        if(item.writable && item.attr.required && data[item.attr.type_id] === ''){
          alert('某些必填项为空('+item.attr.type_title+')')
          return false
        }
        let contentArray = new Array()
        for(let j=0; j<item.attr.content_with_id_list.length; j++){
          if(data[item.attr.type_id] == item.attr.content_with_id_list[j].id || data[item.attr.type_id] == item.attr.content_with_id_list[j].value){
            contentArray.push(item.attr.content_with_id_list[j])
            break;
          }
        }
        item.content_list = contentArray
      }else if(item.form_type == "address_input"){
        if(item.writable && item.attr.required && data[item.attr.type_id].province_value === ''){
          alert('某些必填项为空('+item.attr.type_title+')')
          return false
        }
        item.content_list = [
          { 
            id: '',
            area: data[item.attr.type_id].province_value + ' ' + data[item.attr.type_id].city_value + ' ' + data[item.attr.type_id].area_value,
            value: data[item.attr.type_id].detail
          }
        ]
      }else if(item.form_type == "upload_select" || item.form_type == "photo_select"){
        let contentList = ''
        if(parent_type_id){
          contentList = this.$refs[parent_type_id][0].getContentList(item.attr.type_id, parent_type_id, index)
        }else{
          contentList = this.$refs[item.attr.type_id][0].getContentList(item.attr.type_id, false, 0)
        }
        if(!contentList){
          return false
        }else if(item.writable && item.attr.required && contentList.length === 0){
          alert('某些必填项为空('+item.attr.type_title+')')
          return false
        }else{
          item.content_list = contentList
        }
      }else if(item.form_type == "person_page_select" || item.form_type == "department_page_select" || item.form_type == "associating_field"){
        if(item.writable && item.attr.required && data[item.attr.type_id].length === 0){
          alert('某些必填项为空('+item.attr.type_title+')')
          return false
        }
        item.content_list = data[item.attr.type_id]
      }else if(item.form_type == "associating_table"){
        if(item.writable && item.attr.required && data[item.attr.type_id].value.length === 0){
          alert('某些必填项为空('+item.attr.type_title+')')
          return false 
        }
        item.content_list = data[item.attr.type_id].value
      }
      return item
    },

    getTrueSpan(columns, span){
      let allspan = 0
      for(let item of columns){
        let span = item.list.length === 0 ? 0 : item.span
        allspan = allspan + span
      }
      return Math.round((span * 24) / allspan)
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

  watch: {
    contactsItemId() {
      this.loadForm()
    }
  }
}
</script>

<style lang="scss">

@import '../css/global';

.detailForm-container .detailForm-content{
  background: #fff;  
  overflow-x:hidden;
  overflow-y:scroll;
  position: absolute;
  top:0;
  bottom:0;
  left: 0;
  right:-18px;
  padding: 20px 50px;

  .el-form-item {
    border: 1px solid $secondary-color-2;
    margin: 0 1px 0 0!important;
    padding: 0px 5px !important;
    min-height: 40px; 
  }

  .el-col {
    border: 1px solid $secondary-color-2;
    margin: 0 !important;
    
    .el-form-item {
      border: 0;
    }
  }

  .el-form-item__label {
    line-height: 20px;
    color: $secondary-color-2;
  }

  .el-input__inner {
    border: 0px;
    background-color: $secondary-color-5;
    margin-top: 5px;
  }

  .el-textarea__inner {
    border: 0px;
    background-color: $secondary-color-5;
    margin-top: 5px;
  }

  .el-table th.gutter{
    display: table-cell !important;
  }

  .el-table--border {
    border: 1px solid $secondary-color-2;
  }

  .el-table--border th {
    height: 40px;
    font-size: $font-m;
    background-color: $secondary-color-4;
  }

  .el-table th {
    text-align: center;
  }

  .el-table thead {
    color: $secondary-color-1;
  }

  .el-table--border td {
    height: 40px;
    font-size: $font-s;
  }

  .el-table td {
    text-align: center;
  }

  .is_req{
    .el-form-item__label::after{
      content: '*';
      color: $contrast-color;
      margin-left: 5px;
    }
  }

  .chart_show_components{
    height: 350px;
    width: calc(100% + 100px);
    padding-bottom: 32px;
    position: relative;
    left: -100px;
    top: 32px;   
  }

  .child-form-component {
    max-width: 100%;
    overflow: auto;

    .row {
      display: flex;
      flex-direction: row;

      .small-column {
        width: 58px;
        min-height: 40px;
        margin: -1px -1px 0px 0;
        border: 1px solid #DCDFE6;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .column {
        width: 199px;
        min-height: 40px;
        margin: -1px -1px 0px 0;
        border: 1px solid #DCDFE6;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }

  .address-component-detail{
    margin-top: 5px;
    display: flex;
    flex-direction: row;
  }

  .text-button {
    font-size: $font-s;
    color: $primary-color;
  }
}

.detailForm-modal .wrapper {
  padding: 20px 40px !important;
}

.detailForm-modal .modal-header {
  color: $primary-color;
  font-size: $font-xl;
  font-weight: bold;
}

.detailForm-modal .modal-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detailForm-modal .modal-content {
  height: 430px;
  border: 1px solid $secondary-color-2;
  display: flex;
  flex-direction: column;
}

.detailForm-modal .content-header {
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

.detailForm-modal .content-list {
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

.detailForm-modal .content-list .selection-tree {
  width: 100%;
  box-sizing: border-box;
  padding-left: 20px;
}

.detailForm-modal .content-list .node-row {
  border-bottom: 1px dashed $secondary-color-2;
  width: auto;
  height: 30px;
  box-sizing: border-box;
  margin-right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detailForm-modal .content-list .node-selections {
  width: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  input[type=checkbox] {
    height: 16px;
    width: 16px;
  }
}

.detailForm-modal .table-content {
  height: calc(100% - 130px);
  overflow-y: auto;
}

.detailForm-modal .table-content .row {
  height: 50px;
  display: -webkit-box;

  > div {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.detailForm-modal .table-content .title {
  color: $secondary-color-2;
}

.detailForm-modal .select {
  width: 40px;  
  display: flex;
  align-items: center;
}

.detailForm-modal .column {
  width: 150px;
  border-bottom: 1px solid $secondary-color-4;
}

.detailForm-modal .modal-footer {
  display: flex;
  justify-content: flex-end;
}

.detailForm-container .add-people {
  @include highContrastButton();
}
</style>

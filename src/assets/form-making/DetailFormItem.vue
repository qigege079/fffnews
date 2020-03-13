<template>
  <el-form-item 
    :label="widget.attr.type_title"
    :class="{ 'is_req': widget.attr.required }">
    <template v-if="widget.form_type == 'single_line_input'
                || widget.form_type == 'phone_input'
                || widget.form_type == 'amount_input'
                || widget.form_type == 'email_input'">
      <el-input type="textarea" v-model="data[widget.attr.type_id]" style="width:100%" :placeholder="widget.attr.guide_text" @blur="blurHandler(widget.attr.type_id, data[widget.attr.type_id])" :disabled="!widget.writable" autosize></el-input>
    </template>

    <template v-if="widget.form_type == 'big_amount_input'">
      <el-input v-model="data[widget.attr.type_id]" style="width:60%" :placeholder="widget.attr.guide_text" @blur="blurHandlerForBigAmount(widget.attr.type_id, data[widget.attr.type_id])" :disabled="!widget.writable"></el-input>
      <el-input :ref="widget.attr.type_id" style="width:40%" :value="convertBigAmount(data[widget.attr.type_id])" :readonly="true"></el-input>
    </template>

    <template v-if="widget.form_type == 'float_input'">
      <el-input v-model="data[widget.attr.type_id]" @blur="blurHandler(widget.attr.type_id, data[widget.attr.type_id])" :disabled="!widget.writable"></el-input>
    </template>

    <template v-if="widget.form_type == 'multi_select'">
      <el-checkbox-group v-model="data[widget.attr.type_id]" @change="blurHandler(widget.attr.type_id, data[widget.attr.type_id])" :disabled="!widget.writable">
        <el-checkbox style="display:'inline-block'" :label="item.value" v-for="(item, index) in widget.attr.content_with_id_list" :key="index">
          <template>{{ item.value }}</template>
        </el-checkbox>
      </el-checkbox-group>
    </template>

    <template v-if="widget.form_type == 'single_select_drop_down'">
      <el-select style="width:100%" v-model="data[widget.attr.type_id]" :placeholder="widget.attr.guide_text" @change="blurHandler(widget.attr.type_id, data[widget.attr.type_id])" :disabled="!widget.writable">
        <el-option v-for="(item, index) in widget.attr.content_with_id_list" :key="index" :value="item.id" :label="item.value"></el-option>
      </el-select>
    </template>

    <template v-if="widget.form_type == 'date_select'">
      <el-date-picker style="width:100%" v-model="data[widget.attr.type_id]" :placeholder="widget.attr.guide_text" format="yyyy-MM-dd" value-format="timestamp" :disabled="!widget.writable"></el-date-picker>
    </template>

    <template v-if="widget.form_type == 'address_input'">
      <el-select v-model="data[widget.attr.type_id].province_value" placeholder="省" style="width:33%" @change="changeCity">
        <el-option v-for="(item, index) in province_list" :key="index" :value="item" :label="item"></el-option>
      </el-select>
      <el-select v-model="data[widget.attr.type_id].city_value" placeholder="市" style="width:33%;margin-left:0.5%" @change="changeArea">
        <el-option v-for="(item, index) in city_list" :key="index" :value="item" :label="item"></el-option>
      </el-select>
      <el-select v-model="data[widget.attr.type_id].area_value" placeholder="区" style="width:33%;margin-left:0.5%">
        <el-option v-for="(item, index) in area_list" :key="index" :value="item" :label="item"></el-option>
      </el-select>
      <div class="address-component-detail">
        <el-input style="margin-right:5px;flex:1" v-model="data[widget.attr.type_id].detail" placeholder="详细地址"></el-input>
        <i class="clickable iconfont iconxiugai07" @click="openMap(widget.attr.type_id, false, 0)"></i>
      </div>
    </template>

    <template v-if="widget.form_type == 'upload_select'">
      <el-upload :ref="widget.attr.type_id" action="/mock/form/upload_file" :headers="headers" :data="upload_data" :file-list="data[widget.attr.type_id]" :auto-upload="false" :disabled="!widget.writable" :on-preview="downFile" multiple>
        <el-button slot="trigger" size="small" type="primary">选择文件</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload(widget.attr.type_id)">上传到服务器</el-button>
      </el-upload>
    </template>

    <template v-if="widget.form_type == 'photo_select' && is_load">
      <el-upload :ref="widget.attr.type_id" action="/mock/form/upload_file" :headers="headers" :data="upload_data" :file-list="data[widget.attr.type_id]" :auto-upload="false" list-type="picture" :disabled="!widget.writable" :on-preview="downFile" multiple>
        <el-button slot="trigger" size="small" type="primary">选择图片</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload(widget.attr.type_id)">上传到服务器</el-button>
      </el-upload>
    </template>

    <template v-if="widget.form_type == 'person_page_select' || widget.form_type == 'department_page_select'">
      <el-input :value="arrayHandler(data[widget.attr.type_id])" style="width:calc(95% - 32px);" :readonly="true"></el-input>
      <el-button style="margin-left:1%" icon="el-icon-plus" @click="winHandler(widget.form_type, widget.attr.type_id, widget.attr.range, false, 0)" :disabled="!widget.writable" circle></el-button>
    </template>

    <template v-if="widget.form_type == 'associating_field'">
      <el-input :value="arrayHandler(data[widget.attr.type_id])" style="width:calc(94% - 64px)" :readonly="true"></el-input>
      <el-button style="margin-left:1%" icon="el-icon-search" @click="openInstanceRelateField(widget.attr.relate_form_id, data[widget.attr.type_id])" circle></el-button>
      <el-button style="margin-left:1%" icon="el-icon-plus" @click="relateFieldwinHandler(widget.attr.type_id, widget.attr.relate_form_id, widget.attr.relate_field_id, false, 0)" :disabled="!widget.writable" circle></el-button>
    </template>

    <template v-if="widget.form_type == 'associating_table'">
      <template v-if="data[widget.attr.type_id].value.length > 0 && widget.attr.range.length == 1">
        <el-button type="text" v-for="(item, index) in data[widget.attr.type_id].tablelist" :key="index" @click="openInstanceSingleLine(item.data_id)">{{ item[widget.attr.range[0]] }}</el-button>
      </template>
      <el-button type="primary" @click="relateFormWinHandler(widget.attr.type_id, widget.attr.relate_form_id, widget.attr.range, false, 0)" :disabled="!widget.writable" plain round>添加纪录</el-button>
      <template v-if="data[widget.attr.type_id].value.length > 0 && widget.attr.range.length > 1">
        <el-table style="margin-top:10px" :data="data[widget.attr.type_id].tablelist" size="mini" @cell-click="openInstance" fit border>
          <el-table-column fixed="left" label="操作" width="100" v-if="widget.writable">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click.stop="relateFormDeleteRow(scope.row)">删除</el-button>
            </template>
          </el-table-column>
          <el-table-column v-for="(item, index) in data[widget.attr.type_id].headlist" :key="index" :prop="item.prop" :label="item.label" :show-overflow-tooltip="true"></el-table-column>
        </el-table>
        <el-button type="text" @click="more(data[widget.attr.type_id].value, widget.attr.range, widget.attr.relate_form_id)">更多</el-button>
      </template>
    </template>

    <template v-if="widget.form_type == 'parent_select'">
      <el-select style="width:100%" v-model="data[widget.attr.type_id]" :disabled="!widget.writable">
        <el-option v-for="(item, index) in widget.attr.content_with_id_list" :key="index" :value="item.id" :label="item.value"></el-option>
      </el-select>
    </template>

    <template v-if="widget.form_type == 'child_form'">
      <span v-show="!is_open" class="text-button clickable" @click="is_open = !is_open">+ 展开</span>
      <span v-show="is_open" class="text-button clickable" @click="is_open = !is_open">- 收起</span>
      <div v-show="is_open">
        <template v-for="(item, index) in data[widget.attr.type_id].form_data_list">
          编号: {{ index + 1 }}
          <span class="text-button clickable" @click="deleteChildFormItem(widget.attr.type_id, index)">删除</span>
          <el-form size="small" label-position="left" label-width="120px" :key="index" @submit.native.prevent>
            <template v-for="(sitem, sindex) in item.form_item_list">
              <detail-form-item :ref="widget.attr.type_id + '_' + sitem.attr.type_id + '_' + index"
                :key="sindex" :widget="sitem" :data="data[widget.attr.type_id].data[index]" :fieldMap="fieldMap" :dataLinkageList="dataLinkageList" :computedFieldList="computedFieldList"
                @peoButtonClick="peoButtonChildForm(arguments, index)" 
                @deptButtonClick="deptButtonChildForm(arguments, index)" 
                @relateFieldButtonClick="relateFieldButtonChildForm(arguments, index)"
                @relateFormButtonClick="relateFormButtonChildForm(arguments, index)"
                @relateFormMore="relateFormMoreChildForm(arguments, index)"
                @openInstance="openInstanceChildForm(arguments, index)" 
                @computedField="computedFieldChildForm(arguments, index)"
                @openMap="openMapChildForm(arguments, index)">
              </detail-form-item>
            </template>
          </el-form>
        </template>
      </div>
      <div v-show="!is_open" class="child-form-component">
        <div class="row" :style="{ width: data[widget.attr.type_id].template_data.length*200+120+'px'}">
          <div class="small-column" style="margin-top:0">编号</div>
          <div class="small-column" style="margin-top:0">操作</div>
          <div class="column" style="margin-top:0" v-for="item in data[widget.attr.type_id].template_data">{{ item.attr.type_title }}</div>
        </div>
        <div class="row" :style="{ width: data[widget.attr.type_id].template_data.length*200+120+'px'}" v-for="(item, index) in data[widget.attr.type_id].form_data_list" v-if="item.operate_type !== 'delete'">
          <div class="small-column">{{ index+1 }}</div>
          <div class="small-column"><span class="text-button clickable" @click="deleteChildFormItem(widget.attr.type_id, index)">删除</span></div>
          <div class="column" v-for="(sitem, sindex) in item.form_item_list">
            <template v-if="sitem.form_type == 'single_line_input'
                || sitem.form_type == 'phone_input'
                || sitem.form_type == 'amount_input'
                || sitem.form_type == 'email_input'">
              <el-input v-model="data[widget.attr.type_id].data[index][sitem.attr.type_id]" style="width:90%" :placeholder="sitem.attr.guide_text" @blur="blurHandlerForChildForm(sitem.attr.type_id, data[widget.attr.type_id].data[index][sitem.attr.type_id], widget.attr.type_id, index)"></el-input>
            </template>
            <template v-else-if="sitem.form_type == 'float_input'">
              <el-input v-model="data[widget.attr.type_id].data[index][sitem.attr.type_id]" style="width:90%" @blur="blurHandlerForChildForm(sitem.attr.type_id, data[widget.attr.type_id].data[index][sitem.attr.type_id], widget.attr.type_id, index)"></el-input>
            </template>
            <template v-else-if="sitem.form_type == 'date_select'">
              <el-date-picker v-model="data[widget.attr.type_id].data[index][sitem.attr.type_id]" style="width:90%" :placeholder="sitem.attr.guide_text" @blur="blurHandlerForChildForm(sitem.attr.type_id, data[widget.attr.type_id].data[index][sitem.attr.type_id], widget.attr.type_id, index)"></el-date-picker>
            </template>
            <template v-else-if="sitem.form_type == 'person_page_select' || sitem.form_type == 'department_page_select'">
              <el-input :value="arrayHandler(data[widget.attr.type_id].data[index][sitem.attr.type_id])" style="width:calc(95% - 32px)" :readonly="true"></el-input>
              <el-button style="margin-left:1%" icon="el-icon-plus" @click="winHandler(sitem.form_type, sitem.attr.type_id, sitem.attr.range, widget.attr.type_id, index)" :disabled="!sitem.writable" circle></el-button>
            </template>
            <template v-else-if="sitem.form_type == 'associating_field'">
              <el-input :value="arrayHandler(data[widget.attr.type_id].data[index][sitem.attr.type_id])" style="width:calc(94% - 64px)" :readonly="true"></el-input>
              <el-button style="margin-left:1%" icon="el-icon-search" @click="openInstanceRelateField(sitem.attr.relate_form_id, data[widget.attr.type_id].data[index][sitem.attr.type_id])" circle></el-button>
              <el-button style="margin-left:1%" icon="el-icon-plus" @click="relateFieldwinHandler(sitem.attr.type_id, sitem.attr.relate_form_id, sitem.attr.relate_field_id, widget.attr.type_id, index)" :disabled="!sitem.writable" circle></el-button>
            </template>
            <template v-else>展开后操作</template>
          </div>
        </div>   
      </div>
      <span class="text-button clickable" @click="addChildFormItem(widget.attr.type_id)">添加</span>
    </template>
  </el-form-item>
</template>

<script>

import axios from 'axios';
import FileSaver from 'file-saver';

import { mapState } from 'vuex';

import { getFormLinkageFieldResultList, getFormDataLinkageResultList } from '../../services/form.service'
import { province, city, area } from './AddressInfo.js'

import api from '../js/api';
import { getToken } from '../../services/user.service';

export default {
  name: 'DetailFormItem',

  computed: {
    ...mapState({
      systemId: state => state.system.systemId
    }),
  },

  props: ['widget', 'instanceData', 'data', 'dataLinkageList', 'computedFieldList', 'fieldMap', 'templateId'],

  data: function() {
    return {
      province_list: province,
      city_list: [],
      area_list: [],

      is_open: false,//子表单控件是否展开
      is_load: false,

      headers: {
        "Authorization": getToken(),
        "System-Id": ''
      },
      upload_data: {
        form_template_id: ''
      }
    }
  },

  created: function() {
    //下拉框需要做特殊处理
    if(this.widget.form_type == "single_select_drop_down"){
      //开启监听，如果下拉框里的值因为数据联动而发生改变，那需要更新下拉选项
      this.$globalEventBus.$on('single-select-drop-down-datalinkage', (obj)=> {
        if(obj.field_id === this.widget.attr.type_id){
          this.data[this.widget.attr.type_id] = ''
          for(let i=0; i<this.instanceData.length; i++){
            if(this.instanceData[i].attr.type_id === this.widget.attr.type_id){
              this.widget.attr.content_with_id_list = this.instanceData[i].attr.content_with_id_list
            }
          }
        }
      });
      this.relateFormFieldHandler()
    //地址控件需要做特殊处理
    }else if(this.widget.form_type == "address_input"){
      if(this.data[this.widget.attr.type_id].province_value !== ''){
        this.city_list = city[this.data[this.widget.attr.type_id].province_value]
      }
      if(this.data[this.widget.attr.type_id].city_value !== ''){
        this.area_list = area[this.data[this.widget.attr.type_id].province_value + '-' + this.data[this.widget.attr.type_id].city_value]
      }
    }else if(this.widget.form_type == "parent_select"){
      this.relateFormFieldHandler()
    }else if(this.widget.form_type == "upload_select"){
      this.headers["System-Id"] = this.systemId
      this.upload_data.form_template_id = this.templateId
    }else if(this.widget.form_type == "photo_select"){
      this.headers["System-Id"] = this.systemId
      this.upload_data.form_template_id = this.templateId
      for(let item of this.data[this.widget.attr.type_id]){
        axios.get(item.src, { responseType: 'blob'}).then(res => {
          let reader = new FileReader()
          reader.onload = (e) => {
            this.$set(item, 'url', e.target.result)
          }
          reader.readAsDataURL(res.data)
        })
      }
      this.is_load = true
    }
  },

  methods: {
    relateFormFieldHandler: async function() {
      //下拉框关联他表字段的判断
      if(this.widget.attr.is_relate_form_field){        
        try {     
          let res = await getFormLinkageFieldResultList(this.widget.attr.relate_form_id, this.widget.attr.relate_field_id)
          if(res && res.data && res.data.result && res.data.result.content_with_id_list) {
            this.widget.attr.content_with_id_list = res.data.result.content_with_id_list;
          }
          this.$emit("changeSelectList", this.widget.attr.type_id, this.widget.attr.content_with_id_list)
        }catch(err) {
          console.log(err)
        }        
      }else{
        for(let i=0; i<this.instanceData.length; i++){
          if(this.instanceData[i].attr.type_id === this.widget.attr.type_id){
            this.widget.attr.content_with_id_list = this.instanceData[i].attr.content_with_id_list
          }
        }
      }
    },

    //地址控件：改变市
    changeCity: function(){
      this.data[this.widget.attr.type_id].city_value = ''
      this.city_list = city[this.data[this.widget.attr.type_id].province_value]
      this.data[this.widget.attr.type_id].area_value = ''
      this.area_list = []
    },
    //改变区
    changeArea: function(){
      this.data[this.widget.attr.type_id].area_value = ''
      this.area_list = area[this.data[this.widget.attr.type_id].province_value + '-' + this.data[this.widget.attr.type_id].city_value]
    },

    //子表单：增加一行
    addChildFormItem: function(type_id) {
      let newItem = {
        operate_type: "create",
        form_item_list: JSON.parse(JSON.stringify(this.data[type_id].template_data))
      }
      this.data[type_id].form_data_list.push(newItem)
      this.data[type_id].data.push(JSON.parse(JSON.stringify(this.data[type_id].data_for_new)))
    },
    //删除一行
    deleteChildFormItem: function(type_id, index) {
      if(this.data[type_id].form_data_list[index].operate_type === 'create'){
        this.data[type_id].form_data_list.splice(index, 1)
        this.data[type_id].data.splice(index, 1)
      }else{
        this.data[type_id].form_data_list[index].operate_type = 'delete'
      }
    },

    //附件图片相关功能
    getContentList: function(id, parent_type_id, index) {
      let uploadFilesList = []
      if(parent_type_id){
        uploadFilesList = this.$refs[parent_type_id + '_' + id + '_' + index][0].getContentList(id, false, 0)
        return uploadFilesList
      }
      for(let i=0; i<this.$refs[id].uploadFiles.length; i++){
        if(this.$refs[id].uploadFiles[i].status === "success" && typeof this.$refs[id].uploadFiles[i].response === "undefined"){
          let value = {
            file_name: this.$refs[id].uploadFiles[i].name ? this.$refs[id].uploadFiles[i].name : '',
            file_size: this.$refs[id].uploadFiles[i].size ? this.$refs[id].uploadFiles[i].size : '',
            type: this.$refs[id].uploadFiles[i].type ? this.$refs[id].uploadFiles[i].type : '',
            url: this.$refs[id].uploadFiles[i].src ? this.$refs[id].uploadFiles[i].src : ''
          }
          uploadFilesList.push({
            id: this.$refs[id].uploadFiles[i].uid,
            value: JSON.stringify(value)
          })
        }else if(this.$refs[id].uploadFiles[i].status === "success" && typeof this.$refs[id].uploadFiles[i].response !== "undefined"){       
          let value = {
            file_name: this.$refs[id].uploadFiles[i].name ? this.$refs[id].uploadFiles[i].name : '',
            file_size: this.$refs[id].uploadFiles[i].size ? this.$refs[id].uploadFiles[i].size : '',
            type: this.$refs[id].uploadFiles[i].type ? this.$refs[id].uploadFiles[i].type : '',
            url: this.$refs[id].uploadFiles[i].response.result.url ? this.$refs[id].uploadFiles[i].response.result.url : ''
          }
          uploadFilesList.push({
            id: this.$refs[id].uploadFiles[i].response.result.id,
            value: JSON.stringify(value)
          })
        }else if(this.$refs[id].uploadFiles[i].status === "ready"){
          alert("有文件未上传")      
          return false
        }
      }
      return uploadFilesList
    },
    submitUpload: function(id) {     
      this.$refs[id].submit()
    },
    downFile: function(file){
      if(file.status === "success" && typeof file.response === "undefined"){
        axios.get(file.src, { responseType: 'blob'}).then(res => {
          let reader = new FileReader()
          reader.onload = (e) => {
            FileSaver.saveAs(e.target.result, file.name)
          }
          reader.readAsDataURL(res.data)
        })
      }
    },

    //人员选择部门选择：弹出窗口
    winHandler: function(form_type, type_id, range, parent_type_id, index) {
      if(form_type == "person_page_select"){
        this.$emit("peoButtonClick", type_id, range, parent_type_id, index)
      }else if(form_type == "department_page_select"){
        this.$emit("deptButtonClick", type_id, range, parent_type_id, index)
      }
    },
    //关联字段：弹出窗口
    relateFieldwinHandler: function(type_id, relate_form_id, relate_field_id, parent_type_id, index) {
      this.$emit("relateFieldButtonClick", type_id, relate_form_id, relate_field_id, parent_type_id, index)
    },
    //关联字段：点击选择的值
    openInstanceRelateField: function(relate_form_id, data) {
      if(data.length > 0){
        this.$emit("openInstance", relate_form_id, data[0].id)
      }
    },
    //关联他表：弹出窗口
    relateFormWinHandler: function(type_id, relate_form_id, range, parent_type_id, index) {
      this.$emit("relateFormButtonClick", type_id, relate_form_id, range, parent_type_id, index)
    },
    //关联他表：点击更多按钮
    more: function(value, range, templateId) {
      this.$emit("relateFormMore", value, range, templateId)
    },
    //关联他表：点击删除按钮
    relateFormDeleteRow: function(row) {
      for(let i=0; i<this.data[this.widget.attr.type_id].value.length; i++){
        if(this.data[this.widget.attr.type_id].value[i].value === row.data_id){
          this.data[this.widget.attr.type_id].value.splice(i, 1)
          break
        }
      }
      for(let i=0; i<this.data[this.widget.attr.type_id].tablelist.length; i++){
        if(this.data[this.widget.attr.type_id].tablelist[i].data_id === row.data_id){
          this.data[this.widget.attr.type_id].tablelist.splice(i, 1)
          break
        }
      }
    },
    //关联他表：只关联一列的情况下点击某项
    openInstanceSingleLine: function(data_id) {
      this.$emit("openInstance", this.widget.attr.relate_form_id, data_id)
    },
    //关联他表：关联多列的情况下点击某行
    openInstance: function(row, column, cell) {
      this.$emit("openInstance", this.widget.attr.relate_form_id, row.data_id)
    },
    //地图：弹出窗口
    openMap: function(type_id, parent_type_id, index ) {
      this.$emit("openMap", type_id, parent_type_id, index)
    },

    //子表单展开时子控件相关功能
    peoButtonChildForm: function(msg, index) {
      this.$emit("peoButtonClick", msg[0], msg[1], this.widget.attr.type_id, index)
    },
    deptButtonChildForm: function(msg, index) {
      this.$emit("deptButtonClick", msg[0], msg[1], this.widget.attr.type_id, index)
    },
    relateFieldButtonChildForm: function(msg, index) {
      this.$emit("relateFieldButtonClick", msg[0], msg[1], msg[2], this.widget.attr.type_id, index)
    },
    relateFormButtonChildForm: function(msg, index) {
      this.$emit("relateFormButtonClick", msg[0], msg[1], msg[2], this.widget.attr.type_id, index)
    },
    relateFormMoreChildForm: function(msg, index) {
      this.$emit("relateFormMore", msg[0], msg[1], msg[2])
    },
    openInstanceChildForm: function(msg, index) {
      this.$emit("openInstance", msg[0], msg[1])
    },
    computedFieldChildForm: function(msg, index) {
      this.$emit("computedField", msg[0], index)
    },
    openMapChildForm: function(msg, index) {
      this.$emit("openMap", msg[0], this.widget.attr.type_id, index)
    },

    //非子表单内控件失去焦点触发事件
    blurHandler: function(type_id, value) {
      if(typeof this.dataLinkageList[type_id] !== "undefined"){
        this.dataLinkageHandler(type_id, value, false, 0)
      }
      if(typeof this.computedFieldList[type_id] !== "undefined"){
        this.$emit("computedField", type_id)
      }
    },
    //子表单内控件失去焦点触发事件
    blurHandlerForChildForm: function(type_id, value, parent_type_id, index) {
      if(typeof this.dataLinkageList[type_id] !== "undefined"){
        this.dataLinkageHandler(type_id, value, parent_type_id, index)
      }
      if(typeof this.computedFieldList[type_id] !== "undefined"){
        this.$emit("computedField", type_id, index)
      }
    },
    //大写金额控件失去焦点触发事件
    blurHandlerForBigAmount: function(type_id, value) {
      this.$refs[type_id].$el.children[0].value = this.convertBigAmount(this.data[type_id])
      if(typeof this.dataLinkageList[type_id] !== "undefined"){
        this.dataLinkageHandler(type_id, value, false, 0)
      }
    },
    convertBigAmount: function(money) {
      return api.convertCurrency(money)
    },

    //数据联动事件
    dataLinkageHandler: async function(type_id, value, parent_type_id, index) {
      try{
        if(Array.isArray(value)){
          value = value.length > 0 ? value[0].value : ''
        }else if(this.widget.form_type === "single_select_drop_down"){
          for(let i=0; i<this.widget.attr.content_with_id_list.length; i++){
            if(this.widget.attr.content_with_id_list[i].id === value){
              value = this.widget.attr.content_with_id_list[i].value
            }
          }
        }
        if(value !== ''){
          let res = await getFormDataLinkageResultList(value, this.dataLinkageList[type_id])
          let result = []
          if(res && res.data && res.data.result && res.data.result.linkage_result_list) {
            result = res.data.result.linkage_result_list;
          }
          for(let i=0; i<result.length; i++){
            if(this.fieldMap[result[i].linkage_field].type === 'single_select_drop_down'){
              this.$emit("changeSelectList", result[i].linkage_field, result[i].content_list)
              this.$globalEventBus.$emit('single-select-drop-down-datalinkage', {
                field_id: result[i].linkage_field
              });
            }else{
              let value = ''
              for(let j=0; j<result[i].content_list.length; j++){
                  value = value + (result[i].content_list[j].value?result[i].content_list[j].value:'') + ','
              }
              if(parent_type_id){
                this.data[parent_type_id].data[index][result[i].linkage_field] = value.substring(0, value.length - 1)
              }else{
                if(typeof this.fieldMap[result[i].linkage_field].parent_type_id !== 'undefined'){
                  let id = this.fieldMap[result[i].linkage_field].parent_type_id
                  for(let item of this.data[id].data){
                    item[result[i].linkage_field] = value.substring(0, value.length - 1)
                  }
                }
                this.data[result[i].linkage_field] = value.substring(0, value.length - 1)
              }
            }
          }
        }         
      }catch(err) {
        console.log(err)
      }      
    },

    arrayHandler: function(value) {
      let string = ""
      if(typeof value !== "undefined"){
        for(let i=0; i<value.length; i++){
          string = string + value[i].value + ","
        }
        if(string.length > 0){
          string = string.substring(0, string.length - 1)
        }
      }
      return string
    },
  },

  beforeDestroy: function() {
    this.$globalEventBus.$off('single-select-drop-down-datalinkage')
  }
}
</script>

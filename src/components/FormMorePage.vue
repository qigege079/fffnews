<template>
  <!-- 表单关联他表更多页面的组件 -->
  <div class="outContainer">
    <div class="form-more-table-content" v-if="tablelist.length>0">
      <el-table :data="tablelist" size="mini" @cell-click="openInstance" border>
        <el-table-column v-for="(item, index) in headlist" :key="index" :prop="item.prop" :label="item.label" :show-overflow-tooltip="true"></el-table-column>
      </el-table> 
    </div>
  </div>
</template>

<script>

import { getAssociatingFormList } from '../services/form.service';

export default { 
  props: ['instanceIds', 'typeIds', 'relateTemplateId'],

  data: function() {
    return {
      headlist:[],
      tablelist:[]
    }
  },

  created: function() {
    let content = new Array()
    for(let i=0; i<this.instanceIds.length; i++){ 
      content.push(this.instanceIds[i].value)
    }

    getAssociatingFormList(content, this.typeIds).then(
      res => {
      let relateFormItem = {};
      if(res && res.data && res.data.result && res.data.result.column_head_list) {
        relateFormItem = res.data.result;
      }
      this.relateFormListHandler(relateFormItem);
    }).catch(err => {
      console.log(err)
    });
  },

  methods: {
    //关联他表底表接口解构
    relateFormListHandler: function(relateFormItem) {
      this.headlist = this.headListHandler(relateFormItem.column_head_list)
      this.tablelist = this.tableListHandler(relateFormItem.report_table_list, this.headlist);
    },
    //底表列表头部解构
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
              label:item[i].label
            })
          }
        }
      }
      recursion(columnHeadList);

      return headlist;
    },
    //底表列表内容解构
    tableListHandler: function(columnContentList, columnHeadList) {
      let contentList = new Array();
      for(let i=0; i<columnContentList.length; i++){
        let contentListItem = {};
        for(let j=0; j<columnHeadList.length; j++){
          contentListItem.data_id = columnContentList[i].data_id.content_list[0].value
          let valueString = ""
          if(typeof columnContentList[i][columnHeadList[j].prop] !== "undefined"){
            for(let k=0; k<columnContentList[i][columnHeadList[j].prop].content_list.length; k++){
              let valueStringItem = columnContentList[i][columnHeadList[j].prop].content_list[k].value?columnContentList[i][columnHeadList[j].prop].content_list[k].value:''
              valueString = valueString + valueStringItem + ','
            }
            valueString = valueString.substring(0, valueString.length-1)
          }
          contentListItem[columnHeadList[j].prop] = valueString
        }
        contentList.push(contentListItem)
      }
      return contentList;
    },
    
    openInstance: function(row, column, cell) {
      this.$emit('openInstance', this.relateTemplateId, row.data_id)
    }
  },
}
</script>

<style lang="scss" scoped>

@import '../assets/css/global';

.outContainer {
  width: 100%;
  height: calc(100vh - 170px);
  overflow: hidden;
  position: relative;
}

.form-more-table-content {
  overflow-x:hidden;
  overflow-y:scroll;
  position: absolute;
  top:0;
  bottom:0;
  left: 0;
  right:-18px;
}
</style>

<style lang="scss">

@import '../assets/css/global';

.form-more-table-content {
  .el-table th.gutter{
    display: table-cell!important;
  }
  
  .el-table--border {
    border: 1px solid $secondary-color-2;
  }

  .el-table--border th {
    height: 40px;
    font-size: $font-m;
    border-bottom: solid 1px $secondary-color-2 !important;
    border-right: solid 1px $secondary-color-2;
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
    border-bottom: solid 1px $secondary-color-2;
    border-right: solid 1px $secondary-color-2;
  }

  .el-table td {
    text-align: center;
  }
}
</style>
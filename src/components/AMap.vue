<template>
  <!-- 地图组件 -->
  <div class="map-container">
    <div class="map-toolbar">
      <div class="search-box">
        <el-input id="search" style="width:300px;margin-left:10px" size="small" v-model="searchKey" @focus="showSearch = true" clearable></el-input>
        <el-button type="primary" style="margin-left:10px" size="small"  @click="searchByHand" round>搜索</el-button>
        <el-button type="primary" style="margin-left:10px" size="small"  @click="initPosition" round>定位</el-button>
        <div id="searchTip" class="tip-box" v-show="showSearch"></div>
      </div>
    </div>

    <div class="map-content">
      <el-amap vid="amap" :zoom="zoom" :center="center" :amapManager="amapManager" :events="events">
        <el-amap-marker :position="center"></el-amap-marker>
      </el-amap>
    </div>

    <div class="map-footer">
      <div class="clickable add-people" @click="selectAddress">确定</div>
      <div class="clickable add-people" style="margin-left:15px" @click="cancel">取消</div>       
    </div>
  </div>
</template>

<script>

import { AMapManager } from "vue-amap"
import { watch } from 'fs';

let amapManager = new AMapManager();

export default {
  data() {
    let that = this

    return {
      zoom: 16,

      address: "",
      center: [0, 0],

      showSearch: false,
      searchKey: "",

      amapManager,
      map: null,
      poiPicker: null,

      events:{
        init(o){
          that.map = o
        },
        //地图上的点击事件
        click(e){
          if(that.poiPicker !== null){
            that.poiPicker.clearSearchResults()
          }

          that.center = [e.lnglat.lng, e.lnglat.lat]

          var geocoder = new AMap.Geocoder({
            radius: 1000,
            extensions: "all"
          })
          geocoder.getAddress(that.center, function(status, result){
            if(status === 'complete' && result.info === 'OK'){
              if(result && result.regeocode){
                that.searchKey = result.regeocode.formattedAddress
              }
            }
          })
        }
      }
    }
  },

  props: {
    detailAddress: {
      type: String,
      default: '' 
    }
  },

  mounted: function() {
    this.$nextTick(()=>{
      let that = this

      AMapUI.loadUI(['misc/PoiPicker'], function(PoiPicker){
        let poiPicker = new PoiPicker({
          input: 'search',
          placeSearchOptions: {
            map: that.amapManager.getMap(),
            pageSize: 5
          },
          suggestContainer: 'searchTip',
          searchResultsContainer:'searchTip'
        })
        //添加点击事件
        poiPicker.on('poiPicked', function(poiResult){
          let source = poiResult.source
          let poi = poiResult.item
          if(source !== 'search'){
            poiPicker.searchByKeyword(poi.name)
          }else{
            poiPicker.clearSearchResults()
            that.center = [poiResult.item.location.lng,poiResult.item.location.lat]
            that.searchKey = poi.cityname + poi.adname + poi.address + '-' + poi.name
          }
        })
        that.poiPicker = poiPicker
        //等poiPicked加载完成后进行页面初始化
        if(that.detailAddress === ''){
          that.initPosition()
        }else{
          that.showSearch = true
          that.searchKey = that.detailAddress
          that.searchByHand()
        }
      })
    })
  },

  methods:{
    initPosition: function() {
      let that = this
      let map = this.amapManager.getMap()

      map.plugin('AMap.Geolocation', function(){
        let geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
            convert: true,
            showButton: false,
            showMarker: false,
            showCircle: false,
            panToLocation: true,
            extensions:'all'
        })
        map.addControl(geolocation)

        geolocation.getCurrentPosition()
        //如果成功就定位
        AMap.event.addListener(geolocation, 'complete', function(data){
          that.searchKey = data.formattedAddress
          that.center = [data.position.lng, data.position.lat]
        })
        //如果出错打印错误日志
        AMap.event.addListener(geolocation, 'error', function(data){
          console.log(data)
        })
      })
    },

    searchByHand: function() {
      if(this.searchKey !== ''){
        this.poiPicker.searchByKeyword(this.searchKey)
      }
    },

    selectAddress: function() {
      this.$emit('selectAddress', this.searchKey)
    },

    cancel: function() {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss">

@import '../assets/css/global';

.map-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  .map-toolbar {
    height: 50px;
    background-color: $secondary-color-5;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .search-box {
      position: relative;

       .el-input__inner {
        border-radius: 16px;
      }
    }

    .tip-box {
      width: 300px;
      max-height: 260px;
      position: absolute;
      top: 32px;
      left: 10px;
      overflow-y: auto;
      background-color: white;
      z-index: 5;
    }
  }

  .map-content {
    margin-top: 10px;
    flex: 1;
  }

  .map-footer {
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;
  }

  .add-people {
    @include highContrastButton();
  }
}
</style>
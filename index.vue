<template>
  <div id="dad-btn">
    <span class="dad-btn" @click="visible = true">
      <img :src="divideImg.divideImgBtn" />
    </span>
    <el-dialog
      width='85%'
      top="25vh"
      class="dad-dialog"
      :visible.sync="visible"
      :close-on-click-modal="false"
    >
      <div class="dialog-container">
        <img :src="QRcodeImgType" class="qr-code-img" />
        <img :src="CloseBtn" class="close-btn" @click="visible = false" />
      </div>
    </el-dialog>
  </div>
</template>
<script>
import CloseBtn from '@/assets/imgs/dadBtn/closeBtn@2x.png';
import browserAttr from '@/utils/browserAttr';

export default {
  name: 'DadBtn',
  props: {
    divideImg: Object,
    qrCodeShow: Boolean,
  },
  data () {
    return {
      CloseBtn,
      visible: this.qrCodeShow,
    };
  },
  watch: {
    qrCodeShow: function (newVal) {
      if (!newVal) {
        this.visible = false;
      }
    },
  },
  computed: {
    QRcodeImgType () {
      if (!(this.divideImg.divideModalImgWx && this.divideImg.divideModalImgQQ)) return '';
      if (browserAttr.versions.qq) return this.divideImg.divideModalImgQQ;
      return this.divideImg.divideModalImgWx;
    },
  },
};
</script>
<style lang="less" scoped rel="stylesheet/less">
  .dad-btn {
    position: fixed;
    bottom: 2rem;
    right: 0.15rem;
    z-index: 100;
    cursor: pointer;
    img {
      width: 72px;
    }
  }

  .dialog-container {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  .qr-code-img {
    width: 145px;
  }

  .close-btn {
    width: 30px;
    margin-top: .6rem;
  }
</style>

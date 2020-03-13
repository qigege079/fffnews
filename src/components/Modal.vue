<template>
  <!-- 弹窗组件 -->
  <div class="modal" @click="transparentClicked">
    <div class="wrapper" v-bind:style="{ width: contentWidth, height: contentHeight }">
      <slot></slot>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Modal',

  props: {
    contentWidth: {
      default: '600px'
    },
    contentHeight: {
      default: '750px'
    },
  },

  methods: {
    transparentClicked: function(event) {
      let classList = event.target.className.split(' ')
      if(classList.indexOf('modal') > -1) {
        this.$emit('modalTransparentClicked');
      }
    }
  }
}
</script>

<style lang="scss" scoped>

@import '../assets/css/global';

.modal {
  position: fixed;
  z-index: 2000;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(60, 70, 100, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}

.wrapper {
  background-color: white;
}
</style>
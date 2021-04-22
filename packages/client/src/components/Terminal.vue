<template>
  <div class="root" ref="root"></div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
const root = ref<HTMLDivElement | null>(null)
onMounted(() => {
  if (!root.value) return
})

onBeforeUnmount(() => {

})





</script>
<style scoped lang="scss">
.root {
  left: 200px;
  top: 100px;
  position: fixed;
  z-index: 999;
  width: 500px;
  height: 300px;
}
</style>
<template>
  <div style="  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: auto;" class="window">
    <div @mousedown.capture.stop="handleTitlebarMousedown" ref="titlebar" class="titlebar">
      <div class="title">
        <span>{{ title }}</span>
      </div>
      <div @click="$emit('close')" class="close">
        <svg
          t="1614565967778"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="6333"
          width="200"
          height="200"
        >
          <path
            d="M574.55 522.35L904.4 192.5c16.65-16.65 16.65-44.1 0-60.75l-1.8-1.8c-16.65-16.65-44.1-16.65-60.75 0L512 460.25 182.15 129.95c-16.65-16.65-44.1-16.65-60.75 0l-1.8 1.8c-17.1 16.65-17.1 44.1 0 60.75l329.85 329.85L119.6 852.2c-16.65 16.65-16.65 44.1 0 60.75l1.8 1.8c16.65 16.65 44.1 16.65 60.75 0L512 584.9 841.85 914.75c16.65 16.65 44.1 16.65 60.75 0l1.8-1.8c16.65-16.65 16.65-44.1 0-60.75L574.55 522.35z"
            p-id="6334"
          />
        </svg>
      </div>
    </div>
    <div class="main">
      <slot></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, onMounted, ref } from 'vue';
import type { PropType } from "vue"
import { useEventListener } from "@vueuse/core"
const { title } = defineProps({
  title: { type: String, required: true }
})

const titlebar = ref<HTMLDivElement | null>(null)


function handleTitlebarMousedown(e: MouseEvent) {

  const { x, y, offsetX, offsetY } = e
  const target = titlebar.value
  const p = target?.parentElement
  if (!p) return
  document.addEventListener('mousemove', mousemove)
  document.addEventListener('mouseup', mouseup)

  function mousemove(e: MouseEvent) {
    const { movementX, movementY, x, y } = e
    if (!p) return

    p.style.left = x - (offsetX) + 'px'
    p.style.top = y - (offsetY) + 'px'
    p.style.bottom = ''
    p.style.right = ''
    p.style.margin = ''
  }

  function mouseup() {
    document?.removeEventListener('mousemove', mousemove)
    document?.removeEventListener('mouseup', mouseup)
  }
}

</script>
<style scoped lang="scss">
.window {
  box-shadow: 1px 2px 10px #eeeeee;
  position: fixed;
  width: 800px;
  height: 500px;
  z-index: 2;
  background: #fff;
  display: flex;
  flex-direction: column;
  .titlebar {
    cursor: move;
    position: relative;
    height: 30px;
    display: flex;
    justify-content: flex-end;
    padding: 5px 10px;
    .title {
      user-select: none;
      pointer-events: none;
      position: absolute;
      height: 100%;
      width: 200px;
      margin: 0;
      top: 0;
      left: 0;
      right: 0;
      margin: auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .close {
      cursor: pointer;
      height: 20px;
      width: 20px;
      svg {
        width: 100%;
        height: 100%;
      }
    }
  }

  .main {
    padding: 10px 20px;
    height: 450px;
  }
}
</style>
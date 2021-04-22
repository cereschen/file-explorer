<template>
  <div :style="{ ...contextMenuPosition }" ref="contextMenu" class="context-menu">
    <div
      @mousedown.stop="() => { }"
      @click.stop="(e) => { item.handle && item.handle(e), $emit('close') }"
      v-show="item.show ? item.show() : true"
      v-for="item in menus"
      class="item"
    >
      <div class="icon-box">
        <i></i>
      </div>
      <span class="label">{{ item.label }}</span>
      <ContextMenu @close="$emit('close')" :menus="item.children" v-if="item.children"></ContextMenu>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, defineProps, onMounted, reactive, ref, useContext } from "vue";
import type { PropType } from "vue"
import { useMouse, useEventListener } from "@vueuse/core"
const contextMenu = ref<HTMLDivElement | null>(null)

const props = defineProps({
  menus: { type: (Array as PropType<Menu[]>), required: true },
  root: { type: Boolean, default: false }
})


// const { x, y } = useMouse()
const { emit } = useContext()
const contextMenuPosition = reactive({ top: '0', left: '100%', position: props.root ? 'fixed' : 'absolute' })

useEventListener(window, 'mousedown', (e) => {
  if (e.buttons === 2) {
    if (!contextMenu.value) return
    if (props.root) {
      contextMenuPosition.left = e.x + 'px'
      contextMenuPosition.top = e.y + 'px'
    }
    // e.stopPropagation()
    // e.preventDefault()
  } else {
    if (!contextMenu.value) return
    if (!e.composedPath().includes(contextMenu.value)) {
      emit('close')
    }
  }
}, true)

</script>
<style scoped lang="scss">
.context-menu {
  * {
    user-select: none;
  }
  padding: 3px 1px;
  background: #eeeeee;
  width: 280px;
  height: 500px;
  border: 1px #b3b3b3 solid;
  box-shadow: 1px 1px 2px #b3b3b3;
  font-size: 14px;
  .item {
    position: relative;
    display: flex;
    padding: 5px;
    overflow: hidden;
    &:hover {
      background: #fefefe;
      overflow: visible;
    }
    .icon-box {
      width: 30px;
      height: 100%;
    }
  }
}
</style>
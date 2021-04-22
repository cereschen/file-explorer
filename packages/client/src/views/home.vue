<template>
  <div
    @drop.stop.prevent="handleDrop"
    ref="container"
    @dragover.stop.prevent="noop"
    class="container"
  >
    <div style="display: flex;justify-content: space-between;">
      <svg-icon @click="$emit('backOrForward', 0)" style="cursor: pointer;" icon-class="back"></svg-icon>
      <svg-icon
        @click="canForward && $emit('backOrForward', 1)"
        style="cursor: pointer"
        :style="{ color: `${canForward ? 'rgba(0,0,0)' : 'rgba(125,125,125)'}` }"
        icon-class="forward"
      ></svg-icon>
      <svg-icon @click="$emit('selectDir', '../')" style="cursor: pointer;" icon-class="up"></svg-icon>
      <span>当前文件夹:</span>
      <input
        @keyup.enter="(e) => $emit('selectDir', e.target.value)"
        @blur="(e) => e.target.value = dir"
        style="width: 300px;overflow: hidden;white-space: nowrap;"
        :value="dir"
      />
      <div>
        <input :placeholder="`搜索 ${dirBaseName}`" v-model="searchStr" type="text" />
      </div>
    </div>
    <div class="items-wrapper">
      <div
        @dblclick="handleDblclick(item)"
        class="file-item"
        :class="[activeItem.has(item.name) && 'active', latestActiveItem === item.name && 'latest']"
        :data-file="item.name"
        draggable="true"
        @dragstart="draggingFile = item.name"
        v-for="item in files"
        v-show="searchStr ? item.name.includes(searchStr) : true"
        @mousedown.stop="(e) => handleClick(e, item.name)"
      >
        <div :data-file="item.name" class="top">
          <svg-icon icon-class="txt" v-if="item.name.endsWith('.txt')"></svg-icon>
          <svg-icon icon-class="zip" v-else-if="item.name.match(/\.(zip|rar)$/)"></svg-icon>
          <svg-icon icon-class="directory" v-else-if="item.isDirectory"></svg-icon>
          <svg-icon icon-class="js" v-else-if="item.name.endsWith('.js')"></svg-icon>
          <svg-icon icon-class="ts" v-else-if="item.name.endsWith('.ts')"></svg-icon>
          <svg-icon icon-class="json" v-else-if="item.name.endsWith('.json')"></svg-icon>
          <svg-icon icon-class="html" v-else-if="item.name.endsWith('.html')"></svg-icon>
          <svg-icon icon-class="vue" v-else-if="item.name.endsWith('.vue')"></svg-icon>
          <div v-else-if="imgMap[item.name]" :data-file="item" class="img-box">
            <img :src="getIcon(item.name)" />
          </div>
          <svg-icon icon-class="unknown" v-else></svg-icon>
        </div>

        <div @dblclick="editModeMap[item.name] = true" class="label">
          <textarea
            class="textarea"
            :cols="1"
            @mouseenter="autoTextAreaHeight"
            @input="(e) => autoTextAreaHeight(e)"
            @keyup.enter.capture="(e) => e.target.blur()"
            @blur="(e) => { rename(item.name, e.target.value), editModeMap[item.name] = false }"
            v-clickOutside="() => { editModeMap[item.name] = false }"
            v-if="editModeMap[item.name]"
            :value="item.name"
          />
          <div class="text" v-else>{{ item.name }}</div>
        </div>
      </div>
    </div>
  </div>
  <ContextMenu v-show="showContextMenu" root :menus="menus" @close="showContextMenu = false"></ContextMenu>
  <ContextMenu
    v-show="showFileContextMenu"
    root
    :menus="fileMenus"
    @close="showFileContextMenu = false"
  ></ContextMenu>
  <Window title="zip预览" @close="showZipPreview = false" v-if="showZipPreview">
    <div v-for="item in zipPreviewItems">{{ item.name }}</div>
  </Window>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref, defineProps, defineEmit } from "vue";
import type { PropType } from "vue"
import { socket } from "../utils/socket"
import ContextMenu from "../components/ContextMenu.vue";
import { useEventListener } from "@vueuse/core"
import Selecto from "selecto";
import Window from "../components/Window.vue"
import { emitTypes } from "../hooks/useSocket";
import { noop } from "../utils";

let selecto: Selecto

const emit = defineEmit(
  { ...emitTypes }
)


onMounted(() => {
  selecto = new Selecto({
    // The container to add a selection element
    container: container.value,
    // The area to drag selection element (default: container)
    // dragContainer: container.value,
    // Targets to select. You can register a queryselector or an Element.
    selectableTargets: [".file-item"],
    // Whether to select by click (default: true)
    selectByClick: true,
    // Whether to select from the target inside (default: true)
    selectFromInside: true,
    // After the select, whether to select the next target with the selected target (deselected if the target is selected again).
    continueSelect: false,
    // Determines which key to continue selecting the next target via keydown and keyup.
    toggleContinueSelect: [["shift"], ["ctrl"]],
    // The container for keydown and keyup events
    keyContainer: window,
    // The rate at which the target overlaps the drag area to be selected. (default: 100)
    hitRate: 0,
  });

  selecto.on("select", e => {
    e.added.forEach(el => {
      el.classList.add("active");
      const file = el.dataset.file
      if (file) {
        activeItem.value.add(file)
      }
    });
    e.removed.forEach(el => {
      el.classList.remove("active");
      const file = el.dataset.file
      if (file) {
        activeItem.value.delete(file)
      }
    });
  });
})

const showZipPreview = ref(false)
const showFileContextMenu = ref(false)
const fileMenus = ref<Menu[]>([
  {
    label: '打开', handle() {
      document.querySelectorAll<HTMLDivElement>('.file-item').forEach((item) => {
        if (item.dataset.file === latestActiveItem.value) {
          item.dispatchEvent(new MouseEvent('dblclick'))
        }
      })
    }
  },
  {
    label: '压缩',
    handle() {
      emit('picker', [...activeItem.value])
    }
  },
  { label: '解压', show: () => latestActiveItem.value.endsWith('.zip') },
  {
    label: '重命名',
    handle() {
      editModeMap[latestActiveItem.value] = true
    }
  },
  {
    label: '删除',
    handle() {
      emit('delete', [latestActiveItem.value])
    }
  },
])




const imgMap = reactive<Record<string, string>>({})
const editModeMap = reactive<Record<string, boolean>>({})

const img = ref('')
const showContextMenu = ref(false)


useEventListener(document, 'keydown', (e) => {
  if (e.key === 'd' && e.ctrlKey) {
    emit('delete', [...activeItem.value])
    e.preventDefault()
  }
})

const menus = ref<Menu[]>([
  {
    label: '查看(V)'
  },
  {
    label: '排序方式(O)'
  },
  {
    label: '分组依据(P)'
  },
  {
    label: '选择文件夹',
    handle() {
    }
  },
  {
    label: '新建',
    children: [
      {
        label: '文本文档',
        handle() {
          emit('createFile', 'txt')
        }
      }
    ]
  },
  {
    show: () => activeItem.value.size,
    label: '删除',
    handle() {
      emit('delete', [...activeItem.value])
    }
  }
])



useEventListener(document, 'keyup', (e) => {
  if (e.code === 'Delete') {
    emit('delete', [...activeItem.value])
  }
})

const searchStr = ref('')

const latestActiveItem = ref('')
const zipPreviewItems = ref<FileItem[]>([])
socket.on('zipPreviewCallBack', (items: FileItem[]) => {
  zipPreviewItems.value = items
  showZipPreview.value = true
})
onMounted(() => {
  // emit('getInfo')
})
const props = defineProps({
  dir: { type: String, required: true },
  files: { type: Array as PropType<FileItem[]>, required: true },
  dirHistory: { type: Array as PropType<readonly string[]>, required: true }
})


const canForward = computed(() => {
  const latest = props.dirHistory[props.dirHistory.length - 1]
  return latest ? latest !== props.dir : false
})


const dirBaseName = computed(() => {
  return props.dir.match(/[^\\\/]*?$/)?.[0] || ''
})



socket.on('blob', (e: ArrayBuffer, filename: string) => {
  function blobToDataURL(blob: Blob, callback: any) {
    let a = new FileReader();
    a.onload = function(e) { callback(e.target?.result); }
    a.readAsDataURL(blob);
  }
  blobToDataURL(new Blob([e]), (url: string) => {
    imgMap[filename] = url
  })
})

const container = ref<HTMLDivElement | null>(null)
function handleDrop(e: DragEvent) {
  const endItem = e.target as HTMLDivElement | null
  const file1 = draggingFile.value
  const file2 = endItem?.dataset.file
  if (file1 && file2) {
    emit('dragend', [file1, file2])
  }
}

function getIcon(item: string) {
  const fileType = item.match(/\.([A-z]+)$/)?.[1]
  if (!fileType) return
  if (['png', 'jpg'].includes(fileType)) {
    return imgMap[item]
  }
}

const draggingFile = ref('')

function handleDblclick(item: FileItem) {
  if (item.name.endsWith('.zip')) {
    emit('zipPreview', item.name)
  }
  if (item.isDirectory) {
    emit('selectDir', item.name)
  }
}

useEventListener(window, 'mousedown', (e) => {
  if (e.buttons === 2) {
    showContextMenu.value = true
  }
}, false)





document.oncontextmenu = function() {
  return false
}
const activeItem = ref<Set<string>>(new Set())
function rename(file: string, newName: string) {
  if (file && newName) {
    emit('rename', file.trim(), newName.replace(/[\r\n]/g, ''))
  }
}


function handleClick(e: MouseEvent, item: string) {
  selecto.clickTarget(e, e.target as Element)
  if (e.buttons === 2) {
    showFileContextMenu.value = true
  }
  latestActiveItem.value = item
}

function autoTextAreaHeight(e: Event) {
  const target = e.target as HTMLElement | null
  if (!target) return
  target.style.height = target.scrollTop + target.scrollHeight + 'px'
}
</script>
<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  * {
    user-select: none;
  }
  .items-wrapper {
    overflow-y: auto;
    flex: 1;
    padding: 10px;
  }

  .file-item {
    width: 110px;
    padding: 3px;
    margin-right: 15px;
    flex-direction: column;
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    border: 1px solid transparent;
    margin-bottom: 3px;
    &:hover {
      background: rgba(110, 190, 243, 0.195);
    }
    &.active {
      background: rgba(110, 190, 243, 0.335);
    }
    &.latest {
      border: 1px solid rgba(110, 190, 243, 0.735);
    }
    .top {
      width: 100%;
      height: 80px;
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: flex-end;
      svg {
        width: 80%;
        height: 80%;
        pointer-events: none;
      }
      .img-box {
        pointer-events: none;
        margin: 0 15px;
        max-height: 60px;
        box-shadow: 1px 1px 2px 1px #c0bfbf;
        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }
    }

    .label {
      width: 100%;
      text-align: center;
      margin-top: 3px;
      font-size: 13px;
      .text {
        padding: 1px 2px;
        outline: 2px transparent solid;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
      .textarea {
        width: 95%;
        text-align: center;
        resize: none;
        overflow: hidden;
        &:focus {
          outline: none;
        }
      }
    }
  }
}
</style>
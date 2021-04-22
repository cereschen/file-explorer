<template>
  <Window title="文件管理">
    <Home :dirHistory="history" :files="files" :dir="dir" v-on="on"></Home>
  </Window>
</template>
<script setup lang="ts">
import { ref, readonly } from "vue";
import Home from "./views/home.vue"
import Window from "./components/Window.vue"
import { socket } from "./utils/socket";
import { useSocket } from "./hooks/useSocket";
const dir = ref('')
const history = ref<readonly string[]>(readonly([]))
socket.on('dirChange', (e: string, cacheHistory: string[]) => {
  dir.value = e
  history.value = readonly(cacheHistory)
})
const files = ref<FileItem[]>([])

socket.on('filesChange', (e) => {
  files.value = e
})

const { on } = useSocket()

</script>
<style lang="scss">
* {
  box-sizing: border-box;
}
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
import { reactive, watch } from "@vue/composition-api"

export interface StyleData {
  id: string,
  x?: number,
  y?: number,
  w?: number,
  h?: number,
  z?: number,
  path?: string
}
export const store = reactive<{ current: StyleData }>({
  current: {
    id: '',
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    z: 0,
    path: ''
  }
})



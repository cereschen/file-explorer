import { socket } from "../utils/socket";
export const emitTypes = {
  selectDir: (dir: string) => true,
  zipPreview: (val: string) => true,
  picker: (val: string[]) => true,
  createFile: (val: string) => true,
  delete: (val: string[]) => true,
  getInfo: () => true,
  dragend: (val: [string, string]) => true,
  rename: (val: string, newVal: string) => true,
  backOrForward: (val: 0 | 1) => true,
}
export function useSocket() {

  const on = {} as typeof emitTypes
  Object.keys(emitTypes).map((item) => {
    on[item as keyof typeof emitTypes] = (...args: any[]) => handleSocket(item, ...args)
  })

  function handleSocket(type: string, ...args: any[]) {
    socket.emit(type, ...args)
    return true
  }

  return { on, handleSocket }
}
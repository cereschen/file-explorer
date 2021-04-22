import { Directive } from "vue"
const events = ['mousedown', 'touchstart', 'pointerdown'];

let unbindFns: WeakMap<HTMLElement, Function[]> = new WeakMap()
export const clickOutside: Directive<HTMLElement> = {
  mounted(el, { value, arg }) {
    let fn = (e: PointerEvent) => {
      if (!e.composedPath().slice(arg ? +arg : 0).includes(el)) {
        value()
      }
    }
    let fns = unbindFns.get(el)
    if (!fns) {
      fns = []
    }
    fns.push(() => document.removeEventListener('pointerdown', fn))
    unbindFns.set(el, fns)
    document.addEventListener('pointerdown', fn)
  },
  unmounted(el, { value }) {
    let fns = unbindFns.get(el)
    if (fns) {
      fns.map(fn => fn())
      unbindFns.delete(el)
    }
  }
}
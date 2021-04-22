declare type FileItem = { name: string, isDirectory: boolean }

declare type Menu = {
  label: string,
  show?: () => any,
  children?: Menu[],
  handle?: Function
}
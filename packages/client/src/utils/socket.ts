
import { io } from "socket.io-client"
export const socket = io('ws://localhost:4000')
// 绑定监听, 接收服务器发送的消息
socket.on('receiveMsg', function (data: any) {
  console.log('客户端接收服务器发送的消息', data)
})
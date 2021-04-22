import fs from "fs-extra"
import { Socket, Server } from "socket.io"
import path from "path"
import chokidar from "chokidar"
import { packer, preview } from "./utils/zip"

export function runServer(dir: string) {
  const cacheHistory: string[] = [dir]

  const io = new Server(4000, { cors: { origin: true } });
  io.on("connect", (socket: Socket) => {
    socket.on('selectDir', (e) => {
      const target = path.resolve(dir, e)
      if (target !== cacheHistory[cacheHistory.length - 1]) {
        if (cacheHistory.length > 10) {
          cacheHistory.shift()
        }
        cacheHistory.push(target)
      }
      onDirChange(target)

    })

    socket.on('backOrForward', (e: 0 | 1) => {
      let target: string = ''
      const index = cacheHistory.lastIndexOf(dir)
      if (index === -1) return
      if (e === 0) {
        target = cacheHistory[index - 1]
      } else {
        target = cacheHistory[index + 1]
      }
      if (target) {
        onDirChange(target)
      }
    })

    let fsWatch: chokidar.FSWatcher
    function onDirChange(e: string) {
      dir = e
      onGetInfo()
      if (fsWatch) {
        fsWatch.close()
      }
      fsWatch = chokidar.watch([dir, `!*.sys`, '!Recovery', '!System Volume Information'], { depth: 0 }).on('all', (event, path) => {
        getFiles()
      }).on('error', (error) => {
      })
    }

    onDirChange(dir)



    socket.on('delete', (items: string[]) => {
      items.map(item => {
        if (fs.existsSync(path.join(dir, item))) {
          fs.unlinkSync(path.join(dir, item))
        }
      })
    })
    socket.on('picker', (items: string[]) => {
      packer({ files: items.map(item => path.join(dir, item)), filepath: path.join(dir, testFileExists('存档1', 'zip') + '.zip') })
    })

    socket.on('zipPreview', (item: string) => {
      preview(path.join(dir, item)).then(items => {
        socket.emit('zipPreviewCallBack', items)
      })
    })
    function testFileExists(filename: string, type: string): string {
      if (fs.existsSync(path.join(dir, `${filename}.${type}`))) {
        return testFileExists(filename.replace(/\d+$/, (val) => `${+val + 1}`), type)
      } else {
        return filename
      }
    }

    socket.on('createFile', (type) => {

      const filename = testFileExists('新建文件1', type)
      console.log(filename);

      fs.createFileSync(path.join(dir, `${filename}.${type}`))

    })
    function getFiles() {
      const files = fs.readdirSync(dir)
      const res: { name: string, isDirectory: boolean }[] = []
      files.map(file => {
        // if (file.match(/(msi|sys)$/i)) {
        //   return
        // }
        // if (['Recovery', 'System Volume Information'].includes(file)) {
        //   return
        // }
        let stat: fs.Stats
        try {
          stat = fs.statSync(path.join(dir, file))
          if (file.endsWith('.png')) {
            socket.emit('blob', fs.readFileSync(path.join(dir, file)), file)
          }
          res.push({ name: file, isDirectory: stat.isDirectory() })
        } catch (error) {
        }
      })

      socket.emit('filesChange', res)
    }




    socket.on('getInfo', onGetInfo)

    function onGetInfo() {
      getFiles()
      socket.emit('dirChange', dir, cacheHistory)
    }


    console.log(`connect ${socket.id}`);
    socket.on("dragend", (data: string[]) => {
      if (data[0] === data[1]) {
        return
      }
      const file2 = path.join(dir, data[1])
      fs.unlinkSync(file2)
      fs.renameSync(path.join(dir, data[0]), file2)
      getFiles()
    });

    socket.on('rename', (file: string, newName: string) => {
      if (fs.existsSync(path.join(dir, file))) {
        fs.renameSync(path.join(dir, file), path.join(dir, newName))
      }
    })

    socket.on("disconnect", () => {
      console.log(`disconnect ${socket.id}`);
    });
  });


}





"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runServer = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const chokidar_1 = __importDefault(require("chokidar"));
const zip_1 = require("./utils/zip");
function runServer(dir) {
    const cacheHistory = [dir];
    const io = new socket_io_1.Server(4000, { cors: { origin: true } });
    io.on("connect", (socket) => {
        socket.on('selectDir', (e) => {
            const target = path_1.default.resolve(dir, e);
            if (target !== cacheHistory[cacheHistory.length - 1]) {
                if (cacheHistory.length > 10) {
                    cacheHistory.shift();
                }
                cacheHistory.push(target);
            }
            onDirChange(target);
        });
        socket.on('backOrForward', (e) => {
            let target = '';
            const index = cacheHistory.lastIndexOf(dir);
            if (index === -1)
                return;
            if (e === 0) {
                target = cacheHistory[index - 1];
            }
            else {
                target = cacheHistory[index + 1];
            }
            if (target) {
                onDirChange(target);
            }
        });
        let fsWatch;
        function onDirChange(e) {
            dir = e;
            onGetInfo();
            if (fsWatch) {
                fsWatch.close();
            }
            fsWatch = chokidar_1.default.watch([dir, `!*.sys`, '!Recovery', '!System Volume Information'], { depth: 0 }).on('all', (event, path) => {
                getFiles();
            }).on('error', (error) => {
            });
        }
        onDirChange(dir);
        socket.on('delete', (items) => {
            items.map(item => {
                if (fs_extra_1.default.existsSync(path_1.default.join(dir, item))) {
                    fs_extra_1.default.unlinkSync(path_1.default.join(dir, item));
                }
            });
        });
        socket.on('picker', (items) => {
            zip_1.packer({ files: items.map(item => path_1.default.join(dir, item)), filepath: path_1.default.join(dir, testFileExists('存档1', 'zip') + '.zip') });
        });
        socket.on('zipPreview', (item) => {
            zip_1.preview(path_1.default.join(dir, item)).then(items => {
                socket.emit('zipPreviewCallBack', items);
            });
        });
        function testFileExists(filename, type) {
            if (fs_extra_1.default.existsSync(path_1.default.join(dir, `${filename}.${type}`))) {
                return testFileExists(filename.replace(/\d+$/, (val) => `${+val + 1}`), type);
            }
            else {
                return filename;
            }
        }
        socket.on('createFile', (type) => {
            const filename = testFileExists('新建文件1', type);
            console.log(filename);
            fs_extra_1.default.createFileSync(path_1.default.join(dir, `${filename}.${type}`));
        });
        function getFiles() {
            const files = fs_extra_1.default.readdirSync(dir);
            const res = [];
            files.map(file => {
                // if (file.match(/(msi|sys)$/i)) {
                //   return
                // }
                // if (['Recovery', 'System Volume Information'].includes(file)) {
                //   return
                // }
                let stat;
                try {
                    stat = fs_extra_1.default.statSync(path_1.default.join(dir, file));
                    if (file.endsWith('.png')) {
                        socket.emit('blob', fs_extra_1.default.readFileSync(path_1.default.join(dir, file)), file);
                    }
                    res.push({ name: file, isDirectory: stat.isDirectory() });
                }
                catch (error) {
                }
            });
            socket.emit('filesChange', res);
        }
        socket.on('getInfo', onGetInfo);
        function onGetInfo() {
            getFiles();
            socket.emit('dirChange', dir, cacheHistory);
        }
        console.log(`connect ${socket.id}`);
        socket.on("dragend", (data) => {
            if (data[0] === data[1]) {
                return;
            }
            const file2 = path_1.default.join(dir, data[1]);
            fs_extra_1.default.unlinkSync(file2);
            fs_extra_1.default.renameSync(path_1.default.join(dir, data[0]), file2);
            getFiles();
        });
        socket.on('rename', (file, newName) => {
            if (fs_extra_1.default.existsSync(path_1.default.join(dir, file))) {
                fs_extra_1.default.renameSync(path_1.default.join(dir, file), path_1.default.join(dir, newName));
            }
        });
        socket.on("disconnect", () => {
            console.log(`disconnect ${socket.id}`);
        });
    });
}
exports.runServer = runServer;

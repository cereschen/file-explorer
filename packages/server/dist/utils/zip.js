"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unPacker = exports.preview = exports.packer = void 0;
// 文件压缩与解压
const adm_zip_1 = __importDefault(require("adm-zip"));
const path_1 = __importDefault(require("path"));
const packer = async ({ folder, filepath, files }) => {
    console.log(filepath, files);
    const zip = new adm_zip_1.default();
    if (folder) {
        zip.addLocalFolder(path_1.default.join(folder));
    }
    if (files) {
        files.map(file => {
            zip.addLocalFile(file);
        });
    }
    // update file headers
    zip.getEntries().forEach((entry) => {
        entry.header.flags |= 0x0800; // Set bit 11 - APP Note 4.4.4 Language encoding flag (EFS)
    });
    // save file (we generate our content again)
    return new Promise(r => {
        zip.writeZip(path_1.default.join(filepath), r);
    });
};
exports.packer = packer;
const preview = async (filepath) => {
    const zip = new adm_zip_1.default(filepath);
    const items = [];
    zip.getEntries().forEach((entry) => {
        // entry.header.flags |= 0x0800;   
        items.push({ name: entry.name, isDirectory: entry.isDirectory });
    });
    return items;
};
exports.preview = preview;
const unPacker = ({ folder, filepath }) => {
    const zip = new adm_zip_1.default(filepath);
    zip.getEntries().forEach((entry) => {
        entry.header.flags |= 0x0800; // Set bit 11 - APP Note 4.4.4 Language encoding flag (EFS)
    });
    zip.extractAllToAsync(folder);
};
exports.unPacker = unPacker;

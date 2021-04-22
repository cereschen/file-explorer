// 文件压缩与解压
import AdmZip from "adm-zip"
import path from "path"

export const packer = async ({ folder, filepath, files }: { folder?: string, filepath: string, files?: string[] }) => {
  console.log(filepath, files);

  const zip = new AdmZip();
  if (folder) {
    zip.addLocalFolder(path.join(folder));
  }

  if (files) {
    files.map(file => {
      zip.addLocalFile(file)
    })
  }

  // update file headers
  zip.getEntries().forEach((entry: any) => {
    entry.header.flags |= 0x0800;                                          // Set bit 11 - APP Note 4.4.4 Language encoding flag (EFS)
  });
  // save file (we generate our content again)
  return new Promise(r => {
    zip.writeZip(path.join(filepath), r);
  })
}

export const preview = async (filepath: string) => {
  const zip = new AdmZip(filepath);
  const items: { name: string, isDirectory: boolean }[] = []
  zip.getEntries().forEach((entry) => {
    // entry.header.flags |= 0x0800;   
    items.push({ name: entry.name, isDirectory: entry.isDirectory })
  });

  return items

}

export const unPacker = ({ folder, filepath }: { folder: string, filepath: string }) => {
  const zip = new AdmZip(filepath);
  zip.getEntries().forEach((entry: any) => {
    entry.header.flags |= 0x0800;                                          // Set bit 11 - APP Note 4.4.4 Language encoding flag (EFS)
  });
  zip.extractAllToAsync(folder)
}
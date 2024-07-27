import { nanoid } from "nanoid";

export async function copyEntry(entryHandle: FileSystemHandle, targetFolderHandle: FileSystemDirectoryHandle, newName?: string) {
    newName ??= entryHandle.name;
    if (isFolder(entryHandle)) {
        return await _copyFolder(entryHandle as FileSystemDirectoryHandle, targetFolderHandle, newName);
    } else {
        return await _copyFile(entryHandle as FileSystemFileHandle, targetFolderHandle, newName);
    }
}

export async function addNewFile(parentHandle: FileSystemDirectoryHandle, newFileName: string) {
    return await parentHandle.getFileHandle(newFileName, {
        create: true,
    });
}

async function _copyFile(fileHandle: FileSystemFileHandle, targetFolderHandle: FileSystemDirectoryHandle, newName: string) {
    const fileData = await fileHandle.getFile();
    const newFileHandle = await addNewFile(targetFolderHandle, newName);
    const writable = await newFileHandle.createWritable();
    await writable.write(fileData);
    await writable.close();
    return newFileHandle;
}

export function isFolder(entryHandle: FileSystemHandle) {
    return entryHandle.kind === "directory";
}

export async function addNewFolder(parentHandle: FileSystemDirectoryHandle, newFolderName: string) {
    return await parentHandle.getDirectoryHandle(newFolderName, {
        create: true,
    });
}


export async function _copyFolder(folderHandle: FileSystemDirectoryHandle, targetFolderHandle: FileSystemDirectoryHandle, newName: string) {
    const newFolderHandle = await addNewFolder(targetFolderHandle, newName);
    await backupFolder(folderHandle, newFolderHandle);
    return newFolderHandle;
}

export async function backupFolder(folderHandle: FileSystemDirectoryHandle, newFolderHandle: FileSystemDirectoryHandle, clean = false, skipHidden = true) {
    if (clean) {
        await cleanFolder(newFolderHandle);
    }
    for (const entry of await getFolderContent(folderHandle)) {
        if (skipHidden) {
            if (entry.name.startsWith(".")) {
                continue;
            }
        }
        await copyEntry(entry, newFolderHandle, entry.name);
    }
}

export async function cleanFolder(parentHandle: FileSystemDirectoryHandle) {
    const folder_content = await getFolderContent(parentHandle);
    folder_content.sort((a, b) => {
        if (a.name.startsWith(".")) {
            return -1;
        }
        if (b.name.startsWith(".")) {
            return 1;
        }
        return 0;
    });
    for (var i = 0; i < folder_content.length; i++) {
        await removeEntry(parentHandle, folder_content[i]);
    }
}

export async function removeEntry(parentHandle: FileSystemDirectoryHandle, entryHandle: FileSystemHandle) {
    // Will not work without https
    if (isFolder(entryHandle)) {
        await _removeFolder(parentHandle, entryHandle as FileSystemDirectoryHandle);
    } else {
        await _removeFile(parentHandle, entryHandle as FileSystemFileHandle);
    }
}

export async function _removeFile(parentHandle: FileSystemDirectoryHandle, fileHandle: FileSystemFileHandle) {
    await parentHandle.removeEntry(fileHandle.name);
}

export async function _removeFolder(parentHandle: FileSystemDirectoryHandle, folderHandle: FileSystemDirectoryHandle) {
    await cleanFolder(folderHandle);
    await parentHandle.removeEntry(folderHandle.name);
}

type FSAHandleEx<T extends FileSystemHandle> = T & { parent?: FSAHandleEx<T>, isParent?: boolean, fullPath?: string, extension?: string }

export async function getFolderContent(folderHandle: FSAHandleEx<FileSystemDirectoryHandle>, withParent = false) {
    const layer = [];
    if (withParent && folderHandle.parent) {
        const parentEntry = folderHandle.parent;
        parentEntry.isParent = true;
        layer.push(parentEntry);
    }
    for await (const _entry of await folderHandle.values()) {
        const entry: FSAHandleEx<FileSystemHandle> = _entry
        const matchExtension = entry.name.match(/\.([^\.]+)$/i);

        entry.parent = folderHandle;
        entry.isParent = false;
        entry.fullPath = (folderHandle.fullPath || "") + "/" + entry.name;
        entry.extension = matchExtension ? matchExtension[1].toLowerCase() : undefined;

        layer.push(entry);
    }
    return layer;
}

export async function checkFileExists(parentHandle: FileSystemDirectoryHandle, fileName: string) {
    try {
        const v = await parentHandle.getFileHandle(fileName);
        return v;
    } catch {
        return null;
    }
}

export async function checkFolderExists(parentHandle: FileSystemDirectoryHandle, folderName: string) {
    try {
        const v = await parentHandle.getDirectoryHandle(folderName);
        return v;
    } catch {
        return null;
    }
}

export async function checkEntryExists(parentHandle: FileSystemDirectoryHandle, entryName: string) {
    return (await checkFileExists(parentHandle, entryName)) || (await checkFolderExists(parentHandle, entryName));
}

export async function moveEntry(parentHandle?: FileSystemDirectoryHandle, entryHandle?: FileSystemHandle, targetFolderHandler?: FileSystemDirectoryHandle) {
    if (!parentHandle || !entryHandle || !targetFolderHandler) {
        return
    }

    const possibleEntry = await checkEntryExists(targetFolderHandler, entryHandle.name) != null;

    const newEntryHandle = await copyEntry(entryHandle, targetFolderHandler, possibleEntry ? `${entryHandle.name}-${nanoid()}` : `${entryHandle.name}`);
    await removeEntry(parentHandle, entryHandle);
    return newEntryHandle;
}
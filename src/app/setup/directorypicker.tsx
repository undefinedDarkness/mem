'use client'
import { FolderIcon } from "@heroicons/react/16/solid";
import { Button } from "@radix-ui/themes";
import { set } from "idb-keyval";
import { nanoid } from "nanoid";
import { useState } from "react";


export function DirectoryPicker({ ...props }) {
    // TODO: Figure out how to validate this
    const [dirId, setDirId] = useState('');
    const askForFolder = async () => {

        const dir = await showDirectoryPicker({
            mode: "readwrite",
            startIn: "documents"
        });

        const id = nanoid();
        setDirId(id);
        set(`${id}`, dir);
    };

    return <>
        <Button {...props} onClick={askForFolder} className="cursor-pointer"><FolderIcon className="size-5"></FolderIcon> Open Folder</Button>
        <input required type="text" name="workspaceDirectory" hidden value={dirId} readOnly />
    </>;
}

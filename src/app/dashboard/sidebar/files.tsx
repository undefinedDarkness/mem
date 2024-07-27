'use client'
import { Tree, TreeDragDropEvent, TreePassThroughOptions } from 'primereact/tree'
import { TreeNode } from 'primereact/treenode'
import { useMountEffect } from 'primereact/hooks'
import { useState } from 'react'
import { getWorkspaceDirectory } from '@/utils/db'

import 'bootstrap-icons/font/bootstrap-icons.css'
import './tree.css'
import { moveEntry } from '@/utils/fs_utils'
import { dirname } from '@/utils/fs'


function getIconForFile(f: string) {
    const ext = f.includes('.') ? f.split('.').pop() ?? 'any' : 'any'
    // console.log(f, ext)
    return `bi ` + ({
        'pdf': 'bi-file-earmark-pdf',
        'png': 'bi-file-earmark-image',
        'jpg': 'bi-file-earmark-image',
        'jpeg': 'bi-file-earmark-image',
        'tiptap': 'bi-file-earmark-text',
        'tldraw': 'bi-pencil',
        'any': 'bi-file-earmark',
        'svg': 'bi-bezier2'
    })[ext]
}

type TreeNodeEx = TreeNode & { handle?: FileSystemHandle, parent?: FileSystemHandle }

async function walkDirectoryToTree(dir: FileSystemDirectoryHandle, stem: string = '', parent?: FileSystemHandle) {
    const result: TreeNodeEx[] = []
    for await (const entry of dir.values()) {
        if (entry.kind == 'file') {
            result.push({
                id: `${stem}/${entry.name}`,
                label: entry.name,
                icon: getIconForFile(entry.name),
                droppable: false,
                handle: entry,
                parent: parent
            })
        } else {
            result.push({
                id: `${stem}/${entry.name}`,
                label: entry.name,
                children: await walkDirectoryToTree(entry, `${stem}/${entry.name}`, entry),
                handle: entry,
                parent: parent
            })
        }
    }
    // console.log(result)
    return result


}

const treeStyling: TreePassThroughOptions = {
    container: { className: '' },
    content: { className: 'whitespace-nowrap px-2' },
    nodeIcon: { className: 'text-xl' },
    label: { className: 'ml-2' },
    filterContainer: { className: 'flex flex-nowrap p-2 gap-2 items-center max-w-fit rounded-md border m-2' },
    input: { className: 'bg-inherit border-none', placeholder: 'Search' },
    searchIcon: { className: '' }
}


export default function Files() {
    const [nodes, setNodes] = useState<TreeNode[]>()

    useMountEffect(() => {
        getWorkspaceDirectory().then(dir => dir && dir.handle && walkDirectoryToTree(dir.handle, '', dir.handle)).then(dirNodes => {
            setNodes(dirNodes)
        })
    })

    const onDrop = async (e: TreeDragDropEvent) => {
        
        const dragHandle = await (e.dragNode as TreeNodeEx).handle
        const dropHandle = await (e.dropNode as TreeNodeEx).handle
        const dragParentHandle = await (e.dragNode as TreeNodeEx).parent

        ;(e.dragNode as TreeNodeEx).parent = dropHandle

        console.log(`[file-tree/drop] Moving ${dragHandle?.name} from ${dragParentHandle?.name} to folder ${dropHandle?.name}`)
        // TODO Queue file moving operations to a worker
        ;(e.dragNode as TreeNodeEx).handle = await moveEntry(dragParentHandle as FileSystemDirectoryHandle, dragHandle as FileSystemHandle, dropHandle as FileSystemDirectoryHandle);   
        
        // TODO We are requesting a new walk to fix id's
        // TODO Either store handles in the nodes
        setNodes(e.value)
    }

    return <>
        <Tree filter filterMode='lenient' dragdropScope='fileTree' onDragDrop={onDrop} expandIcon={'bi bi-folder2 text-xl'} collapseIcon={'bi bi-folder2-open text-xl'} value={nodes} className='max-h-[96vh] overflow-y-auto' pt={treeStyling}></Tree>
    </>
}
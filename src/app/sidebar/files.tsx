'use client'
import { RichTreeView, TreeItem2, TreeItem2Label, TreeViewBaseItem } from '@mui/x-tree-view'
import { get } from 'idb-keyval'
import { Workspace } from '../setup/page'
import { useState, useEffect, ReactNode, ReactElement, ElementType } from 'react'
import { DocumentIcon, DocumentTextIcon, FolderOpenIcon, FolderIcon, PresentationChartBarIcon, XMarkIcon } from '@heroicons/react/16/solid'
import { AlertDialog, Button, Flex } from '@radix-ui/themes'
import Link from 'next/link'

async function walkDirectory(dir: FileSystemDirectoryHandle, stem: string = '') {

    const result: TreeViewBaseItem[] = []
    for await (const entry of dir.values()) {
        if (entry.kind == 'file') {
            result.push({
                id: `${stem}/${entry.name}`,
                label: entry.name,
                children: []
            })
        } else {
            result.push({
                id: `${stem}/${entry.name}`,
                label: entry.name,
                children: await walkDirectory(entry, `${stem}/${entry.name}`)
            })
        }
    }

    return result
}

function CustomTreeItem({ itemId, label,  ...props }: { itemId: string, label: string }) {
    let icon: ElementType<any, keyof JSX.IntrinsicElements> | undefined;
    const extension = itemId.split('.').pop() ?? 'unknown';

    const iconMap: Record<string, ElementType<any, keyof JSX.IntrinsicElements> | undefined> = {
        'pdf': DocumentIcon,
        'djvu': DocumentIcon,
        'pptx': PresentationChartBarIcon,
        'odp': PresentationChartBarIcon,
        'docx': DocumentTextIcon,
        'unknown': undefined
    }
    const newURL = new URL(window.location.href);
    newURL.searchParams.set('tryOpenFile', itemId);
    const treeLabel = () => <TreeItem2Label><Link className='whitespace-nowrap' href={newURL}>{label}</Link></TreeItem2Label>

    return <TreeItem2 className='[&_.MuiTreeItem-label]:!font-sans' slots={{ icon: iconMap[extension], label: treeLabel }} itemId={itemId} {...props}>
    </TreeItem2>
}

async function verifyPermission(d: FileSystemDirectoryHandle) {
    if (await d.queryPermission({ mode: 'readwrite' }) == 'granted')
        return true

    if (await d.requestPermission({ mode: 'readwrite' }) == 'granted')
        return true

    return false
}

export default function Files({ workspaceId }: { workspaceId: string }) {

    const [wantPermissionFor, setWantPermissionFor] = useState<FileSystemDirectoryHandle | undefined>(undefined)
    const [treeItems, setTreeItems] = useState<TreeViewBaseItem[]>([]);
    useEffect(() => {

        if (!workspaceId) return
        (async () => {
            const workspace: Workspace | undefined = await get(workspaceId)
            if (!workspace) {
                console.error(`[files] cannot find workspace with id: ${workspaceId}`)
                return
            }

            const workspaceDirectory: FileSystemDirectoryHandle | undefined = await get(workspace.directoryId)
            if (!workspaceDirectory) return

            if ('granted' != await workspaceDirectory.queryPermission({ mode: 'readwrite' })) {
                setWantPermissionFor(workspaceDirectory)
            }


            setTreeItems(await walkDirectory(workspaceDirectory))
        })()

        return () => {
            setTreeItems([])
        }
    }, [workspaceId]);

    return <>
        <AlertDialog.Root open={wantPermissionFor != undefined}>
            <AlertDialog.Content>
                <AlertDialog.Title>Need permission to be granted</AlertDialog.Title>
                <AlertDialog.Description>Permissions to the directory need to be granted again manually</AlertDialog.Description>
                <Flex gap="3">
                    <AlertDialog.Cancel>
                        <Button color='red'><XMarkIcon className='size-5'></XMarkIcon> Cancel</Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action>
                        <Button onClick={() => {
                            wantPermissionFor?.requestPermission({ mode: 'readwrite' })
                            wantPermissionFor?.queryPermission({ mode: 'readwrite' }).then(v => {
                                if (v == 'granted') {
                                    setWantPermissionFor(undefined)
                                    // window.location.reload()
                                }
                            })
                        }} color='green'><FolderOpenIcon className='size-5'></FolderOpenIcon> Grant Permission</Button>
                    </AlertDialog.Action>
                </Flex>
            </AlertDialog.Content>
        </AlertDialog.Root>
        <RichTreeView disableSelection items={treeItems} slots={{
            item: CustomTreeItem,
            collapseIcon: () => <FolderOpenIcon className="text-yellow-500"></FolderOpenIcon>,
            expandIcon: () => <FolderIcon className="text-yellow-500"></FolderIcon>
        }}></RichTreeView>
    </>
}
'use client'
import { RichTreeView, TreeItem2, TreeItem2Label, TreeViewBaseItem } from '@mui/x-tree-view'
import { get } from 'idb-keyval'
import { Workspace, getWorkspaceDirectory } from "../utils/db"
import { useState, useEffect, ReactNode, ReactElement, ElementType, useCallback } from 'react'
import { DocumentIcon, DocumentTextIcon, FolderOpenIcon, FolderIcon, PresentationChartBarIcon, XMarkIcon, CloudArrowDownIcon } from '@heroicons/react/16/solid'
import { AlertDialog, Box, Button, Flex, IconButton, Separator, Text } from '@radix-ui/themes'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { CheckmarkIcon, toast, ErrorIcon } from 'react-hot-toast'

async function walkDirectory(dir: FileSystemDirectoryHandle, stem: string = '') {

    const result: TreeViewBaseItem[] = []
    for await (const entry of dir.values()) {
        if (entry.kind == 'file') {
            result.push({
                id: `${stem}/${entry.name}`,
                label: entry.name,
                children: [],
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

function CustomTreeItem({ itemId, label, ...props }: { itemId: string, label: string }) {
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

    let onDragStart = null
    let treeLabel: ElementType<any, keyof JSX.IntrinsicElements> = () => <TreeItem2Label>{label}</TreeItem2Label>
    if (extension == 'pdf') {
        const newURL = new URL(window.location.href);
        newURL.searchParams.set('documentWorkspacePath', itemId);
        newURL.searchParams.set('sidebarCurrentActiveTab', 'document')
        treeLabel = () => <TreeItem2Label><Link className='whitespace-nowrap' href={newURL}>{label}</Link></TreeItem2Label>
    } else {
        // onDragStart = (ev) => {

        // }
    }

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

    const onDrop = (files: File[]) => {
        getWorkspaceDirectory().then(dir => {
            for (const file of files) {
                if (!dir?.handle) return
                toast.promise(dir.handle.getFileHandle(file.name, { create: true }).then(fileHandle => {
                    fileHandle.createWritable().then(writer => {
                        writer.write(file)
                        writer.close()
                    })
                }), {
                    loading: `Copying ${file.name}...`,
                    success: <Text>Successfully Copied {file.name}</Text>,
                    error: (err: Error) => <Text>Encountered error while copying {file.name}, {err.toString()}</Text>
                })
            }
        })
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return <section >
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            <Box className='border-dashed mb-4 rounded-md border-4 flex justify-center items-center p-6'>
                <CloudArrowDownIcon className='size-5 mx-auto'></CloudArrowDownIcon>
                <Text size="2" className='font-bold block text-center'>Drop Here To Import!</Text>
            </Box>
        </div>
        <AlertDialog.Root open={wantPermissionFor != undefined}>
            <AlertDialog.Content>
                <AlertDialog.Title>Need permission to be granted</AlertDialog.Title>
                <AlertDialog.Description>Permissions to the directory need to be granted again manually</AlertDialog.Description>
                <Flex gap="3">
                    <AlertDialog.Cancel>
                        <IconButton color='red'><XMarkIcon className='size-5'></XMarkIcon> Cancel</IconButton>
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
            // @ts-ignore 
            item: CustomTreeItem,
            collapseIcon: () => <FolderOpenIcon className="text-yellow-500"></FolderOpenIcon>,
            expandIcon: () => <FolderIcon className="text-yellow-500"></FolderIcon>
        }} className='overflow-y-auto h-[100vh]'></RichTreeView>
    </section>
}
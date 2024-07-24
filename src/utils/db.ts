'use client'

import { get, createStore, clear, UseStore } from 'idb-keyval'
import Cookies from 'js-cookie'

let temporaryStore: UseStore;

export function getTemporaryStore() {
    if (!temporaryStore) {
        const store = createStore('tmp', 'tmp')
        window.onbeforeunload = () => {
            clear(store)
        }
        temporaryStore = store
    }
    return temporaryStore
}

export interface Workspace {
    id: string;
    icon: string;
    directoryId: string;
    directoryPath: string;
    name: string;
}


export async function getCurrentWorkspaceId(): Promise<string> {
    const cookieId = Cookies.get('currentWorkspaceId')
    if (cookieId)
        return (cookieId)
    else {
        const workspaces = await get<Set<Workspace>>('workspaces') ?? new Set([])
        // console.log(workspaces)
        if (workspaces.size >= 1) {
            return (workspaces.values().next().value.id)
        } else {
            console.error(`[db] No workspace found!`)
            //   useRouter().push('/setup')
            return ""
        }
    }
}

export async function getWorkspace(id?: string) {
    id = id ?? await getCurrentWorkspaceId()
    return (await get<Workspace>(id))
}

export interface FileHandleWithPath {
    handle?: FileSystemFileHandle,
    path: string
}

export async function getWorkspaceDirectory(id?: string) {
    const workspace = await getWorkspace(id)
    if (workspace) {
        return {
            handle: await get<FileSystemDirectoryHandle>(workspace.directoryId),
            path: workspace.directoryPath
        }
    }
    return undefined
}


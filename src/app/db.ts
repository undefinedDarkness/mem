'use client'

import { get } from 'idb-keyval'
import Cookies from 'js-cookie'

export interface Workspace {
    id: string;
    icon: string;
    directoryId: string;
    directoryPath: string;
    name: string;
}


export async function getCurrentWorkspace() {
    const cookieId = Cookies.get('currentWorkspaceId')
    if (cookieId)
      return (cookieId)
    else {
      const workspaces = await get<Workspace[]>('workspaces') ?? []
      if (workspaces.length > 1) {
       return (workspaces.pop()!.id)
      } else {
        return ""
      }
    }
}

export async function getWorkspace(id?: string) {
    id = id ?? await getCurrentWorkspace()
    return (await get<Workspace>(id))
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


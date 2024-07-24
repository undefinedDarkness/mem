import { get, set } from 'https://esm.sh/idb-keyval@6.2.1?target=es2022'

// @ts-check
/// <reference lib="webworker" />

/** @type {ServiceWorkerGlobalScope}  */
// @ts-ignore
const me = self


export async function getFileHandleFromPath(path, dir, create = false) {
    try {
        // Get the root directory handle
        const root = dir ?? (await getWorkspaceDirectory())?.handle;

        // Split the path, but keep the last segment (file name) as is
        const segments = path.split('/');
        const fileName = segments.pop(); // Remove and store the last segment
        if (!fileName) throw new Error("Path does not contain string");
        const directories = segments.filter(segment => segment.length > 0);

        let currentHandle = root;

        // Traverse the directory structure
        for (const segment of directories) {
            currentHandle = await currentHandle.getDirectoryHandle(segment, { create });
        }

        // Get the file handle for the file name (which may contain spaces)
        const fileHandle = await currentHandle.getFileHandle(fileName, { create });

        return fileHandle;
    } catch (error) {
        console.error('Error opening file:', error);
        throw error;
    }
}


export async function getWorkspaceDirectory(id) {
    const workspace = await getWorkspace(id)
    if (workspace) {
        return {
            handle: await get(workspace.directoryId),
            path: workspace.directoryPath
        }
    }
    return undefined
}

export async function getCurrentWorkspaceId() {
    const workspaces = await get('workspaces') ?? new Set([])
    // console.log(workspaces)
    if (workspaces.size >= 1) {
        console.log(`[sw] Current Workspace Id`, workspaces.values().next().value.id)
        return (workspaces.values().next().value.id)
    } else {
        console.error(`[db] No workspace found!`)
        //   useRouter().push('/setup')
        return ""
    }
}

export async function getWorkspace(id) {
    id = id ?? await getCurrentWorkspaceId()
    return (await get(id))
}


me.oninstall = event => {
    console.log("[fsproxy/sw] Installed! 💃")
    event.waitUntil(self.skipWaiting())
}

me.onactivate = event => {
    console.log(`[fsproxy/sw] Activated`)
    event.waitUntil(me.clients.claim())
}


me.onfetch = event => {

    if (event.request.url.includes('/fsproxy/')) {
        console.log(`[fsproxy/sw] Intercepting fetch request ${event.request.url}`)
        event.respondWith(caches.open('FILE_CACHE').then(async cache => {
            const res = await cache.match(event.request)
            if (res) return (res)
            else {
                const dir = await getWorkspaceDirectory()
                const path = event.request.url.split('/fsproxy/').pop()
                console.log(`[fsproxy/sw] Using path ${path}`)
                const fileHandle = await getFileHandleFromPath(path, dir.handle)
                const file = await fileHandle.getFile()
                const fileStream = file.stream()
                const resp = new Response(fileStream, {
                    headers: {
                        'Content-Type': file.type
                    }
                })
                cache.put(event.request.url, resp);
                return resp
            }
        }).catch(() => {
            return (new Response(null, {
                status: 500
            }))
        }))
    }
}
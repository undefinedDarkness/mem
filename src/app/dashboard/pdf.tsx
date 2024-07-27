'use client'

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react";
import { getWorkspaceDirectory } from "../../utils/db";
import { getHandleFromPath, toReadableStream } from "../../utils/fs";
import toast from "react-hot-toast";
import { ArrowTopRightIcon, FileIcon } from "@radix-ui/react-icons";
import { Button, Text } from "@radix-ui/themes";
import { clearUrlParam } from "@/utils/utils";
// import { PDFViewerApplication } from "../../../public/pdfjs/web/viewer.mjs";

export default function PDFWindow(props: object) {
    const urlParams = useSearchParams();
    const iframe = useRef<HTMLIFrameElement>(null)
    const [iframeReadyForData, setIframeReadyForData] = useState(false);

    const writeToFileSystem = async ({ blob, documentWorkspacePath, documentName }: { blob: Uint8Array, documentWorkspacePath: string, documentName: string }) => {
        // const dir = await getWorkspaceDirectory()
        // if (!dir?.handle || !documentWorkspacePath) {
        //     throw new Error(`[pdf] Encountered invalid handle or empty path while saving ${dir?.handle} ${documentWorkspacePath}`)
        // }
        console.log(`[pdf] Saving file ${documentWorkspacePath}`)
        // iframe?.current?.contentWindow?.postMessage('pdf-want-download', '*')
        const { fileHandle } = await getHandleFromPath(documentWorkspacePath)
        const writable = await fileHandle!.createWritable()
        toast.promise(toReadableStream(blob).pipeTo(writable), {
            error: `[pdf] Failed to write to ${documentWorkspacePath}`,
            success: `[pdf] Wrote to ${documentWorkspacePath}`,
            loading: '[pdf] Saving...'
        });
    }


    const [anyDocumentLoaded, setAnyDocumentLoaded] = useState(false)
    const onMessage = (ev: MessageEvent<{ id?: string, data?: any }>) => {
        ev.data.id == 'pdf-ready-for-data' && setIframeReadyForData(true)
        ev.data.id == 'pdf-loaded-new' && setAnyDocumentLoaded(true)
        if (ev.data.id == 'pdf-save-pdf' && ev.data.data) {
            writeToFileSystem(ev.data.data).catch(err => {
                console.error(`[pdf] ${err}`)
                iframe.current?.contentWindow?.postMessage(`pdf-want-download`, '*')
            })
        }
    }

    useEffect(() => {
        window.addEventListener('message', onMessage)
        return () => window.removeEventListener('message', onMessage);
    }, [])


    let currentDocumentPath = "-"
    const [pageParams, setPageParams] = useState<{ pageNo: number, pageBlob: Blob, pagePath: string } | undefined>()
    useEffect(() => {
        if (!pageParams) return;
        const workspaceDocumentPath = pageParams.pagePath
        if (iframeReadyForData && workspaceDocumentPath != currentDocumentPath) {
            currentDocumentPath = workspaceDocumentPath
            setAnyDocumentLoaded(true)
            const app = ((iframe.current?.contentWindow as any)["PDFViewerApplication"]);
            const path = workspaceDocumentPath
            console.log(`[pdf] Opening file ${path}`);
            (iframe.current?.contentWindow as any).documentWorkspacePath = path;
            (async () => {
                app.open({
                    data: new Uint8Array(await pageParams.pageBlob.arrayBuffer())
                })
                app.page = pageParams.pageNo;
            })()
        }
    }, [iframeReadyForData, pageParams])

    const openFilePicker = () => {
        window.showOpenFilePicker({
            startIn: 'documents',
            types: [{
                description: "PDF Documents",
                accept: {
                    "application/pdf": ['.pdf', '.PDF']
                }
            }]
        }).then(async ([fileHandle]) => fileHandle && setPageParams({
            pageNo: 1,
            pageBlob: await fileHandle.getFile(),
            pagePath: fileHandle.name
        })).catch(err => {
            console.error(`[pdf] ${err}`)
        })
    }

    const router = useRouter()
    useEffect(() => {
        const documentWorkspacePath = urlParams.get('documentWorkspacePath')
        if (!documentWorkspacePath) return
        (async () => {
            setPageParams({ pageNo: Number(urlParams.get('documentPageNo') ?? '1'), pageBlob: await (await getHandleFromPath(documentWorkspacePath)).getFile(), pagePath: documentWorkspacePath })
        })()
        clearUrlParam(['documentWorkspacePath', 'documentPageNo'], router)
    }, [urlParams])

    return <div className="h-full relative">
        <iframe className="pointer-events-[all]" ref={iframe} src={`/pdfjs/web/viewer.html`} width={"100%"} height={"100%"}></iframe>
        <div style={{ display: anyDocumentLoaded ? 'none' : 'block' }} className="pointer-events-none p-4 text-xl absolute inset-0 bg-zinc-900">
            <div className="border-2 flex-col gap-2 p-4 flex items-center rounded-md text-center justify-center font-bold border-dashed border-zinc-600 h-full">
                <FileIcon className="size-12"></FileIcon>
                <div className="space-x-3">
                    <Text>Drop a file or select from tree or</Text><Button onClick={openFilePicker} className="inline-block" style={{ pointerEvents: 'auto' }}>
                        <ArrowTopRightIcon></ArrowTopRightIcon>
                        Pick a file</Button>
                </div>
            </div>
        </div>
    </div>
}
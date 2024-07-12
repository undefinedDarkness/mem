'use client'

import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react";
import { getWorkspaceDirectory } from "../../utils/db";
import { getFileHandleFromPath, toReadableStream } from "../../utils/fs";
import toast from "react-hot-toast";
// import { PDFViewerApplication } from "../../../public/pdfjs/web/viewer.mjs";

export default function PDFWindow(props: object) {
    const params = useSearchParams();
    const iframe = useRef<HTMLIFrameElement>(null)
    const [iframeReadyForData, setIframeReadyForData] = useState(false);

    const writeToFileSystem = async (stream: ReadableStream) => {
        const dir = await getWorkspaceDirectory()
        const documentWorkspacePath = params.get('documentWorkspacePath')
        if (!dir?.handle || !documentWorkspacePath) return
        console.log(`[pdf] Saving file ${documentWorkspacePath}`)
        const file = await getFileHandleFromPath(documentWorkspacePath, dir.handle)
        const writable = await file.createWritable()
        toast.promise(stream.pipeTo(writable), {
            error: `Failed to write to ${documentWorkspacePath}`,
            success: `Wrote to ${documentWorkspacePath}`,
            loading: 'Saving...'
        });
    }


    // useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
        ev.data == 'pdf-ready-for-data' && setIframeReadyForData(true)

        if (ArrayBuffer.isView(ev.data)) {
            writeToFileSystem(toReadableStream(ev.data))
        }
    }

    useEffect(() => {
        window.addEventListener('message', onMessage)
        return () => window.removeEventListener('message', onMessage);
    }, [])


    let currentDocumentPath = "-"
    useEffect(() => {
        const workspaceDocumentPath = params.get('documentWorkspacePath')
        if (iframeReadyForData && workspaceDocumentPath && workspaceDocumentPath != currentDocumentPath) {
            currentDocumentPath = workspaceDocumentPath
            const app = ((iframe.current?.contentWindow as any)["PDFViewerApplication"]);
            const path = params.get('documentWorkspacePath') ?? ''
            if (!path) return;
            console.log(`[pdf] Opening file ${path}`);
            (iframe.current?.contentWindow as any).documentWorkspacePath = path;
            (async () => {
                const dir = await getWorkspaceDirectory()
                if (!dir?.handle) return
                const file = await getFileHandleFromPath(path, dir.handle)
                if (file) {
                    const fileData = await file.getFile()
                    app.open({
                        data: new Uint8Array(await fileData.arrayBuffer())
                    })
                    app.page = parseInt(params.get('documentPageNo') ?? '1')
                }
            })()
        }
    }, [iframeReadyForData, params])

    return <iframe ref={iframe} src={`/pdfjs/web/viewer.html`} width={"100%"} height={"100%"} ></iframe>
}
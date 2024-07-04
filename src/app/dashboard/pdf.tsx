'use client'

import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react";
import { getWorkspaceDirectory } from "../utils/db";
import { getFileHandleFromPath } from "../utils/fs";
// import { PDFViewerApplication } from "../../../public/pdfjs/web/viewer.mjs";

export default function PDFWindow(props: object) {
    const params = useSearchParams();
    const iframe = useRef<HTMLIFrameElement>(null)
    const [iframeReadyForData, setIframeReadyForData] = useState(false);

    // useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
        ev.data == 'pdf-ready-for-data' && setIframeReadyForData(true)
    }
    window.addEventListener('message', onMessage)

    // return () => {
    // window.removeEventListener('message', onMessage)
    // }
    // }, [iframe])

    useEffect(() => {
        if (iframeReadyForData && params.get('documentWorkspacePath')) {
            const app = ((iframe.current?.contentWindow as any)["PDFViewerApplication"]);
            (async () => {
                const path = params.get('documentWorkspacePath') ?? ''
                if (!path) return;
                console.log(`[pdf] Opening file ${path}`);
                (
                    iframe.current?.contentWindow as any
                ).documentWorkspacePath = path
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
// import { PDFViewerApplication } from "./web/viewer.mjs";

document.addEventListener("DOMContentLoaded", function () {
    console.log(`[pdf-iframe] Web Viewer Loaded`)

    PDFViewerApplication.initializedPromise.then(async () => {
        // This function is called whenever a new PDF is opened!

        /** @type {import("./web/viewer.mjs").PDFViewerApplication} */
        const app = PDFViewerApplication

        console.log(`[pdf-iframe] New PDF initialized!`);
        window.top.postMessage('pdf-ready-for-data', '*')

        app.eventBus.on('pagesinit', () => {
            for (const pageEl of document.querySelectorAll('.page')) {
                let canvasElem = undefined
                //  = pageEl.querySelector('canvas')
                pageEl.addEventListener('dragstart', (_evt) => {
                    canvasElem = pageEl.querySelector('canvas')
                    const pageNo = parseInt(pageEl.getAttribute('data-page-number'))
                    _evt.dataTransfer.setDragImage(canvasElem, 50, 50)
                    _evt.dataTransfer.setData('custom/pdf-page', JSON.stringify({
                        dataUrl: canvasElem.toDataURL(),
                        pageNo: pageNo,
                        width: parseInt(canvasElem.getAttribute('width')),
                        height: parseInt(canvasElem.getAttribute('height')),
                    }))
                    const documentWorkspacePath = window.documentWorkspacePath

                    const newUrl = new URL(window.top.location.href);

                    
                    newUrl.searchParams.set('documentPageNo', pageNo);
                    
                    // console.log(app.info)
                    _evt.dataTransfer.setData('custom/link-insert', JSON.stringify({
                        name: app.documentInfo['Title']?.trim() ?? documentWorkspacePath.split('/').pop(),
                        url: newUrl,
                        kind: 'document', 
                    }))
                })
                pageEl.setAttribute("draggable", "true")
            }
        })
    })
});

// async function sendToParent(canvasElem, pageEl) {
//     /** @type {HTMLCanvasElement} */
//     // const canvasElem = pageEl.querySelector('canvas')
//     // const blob = await new Promise(resolve => canvasElem.toBlob(resolve));
//     window.top.postMessage({
//         transferId: "nes",
//         dataUrl: canvasElem.toDataURL(),
//         pageNo: parseInt(pageEl.getAttribute('data-page-number')),
//         width: canvasElem.offsetWidth,
//         height: canvasElem.offsetWidth,
//     }, '*')
//     console.log(`Sent page to parent!`)
// }
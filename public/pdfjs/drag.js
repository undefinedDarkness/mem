
document.addEventListener("DOMContentLoaded", function () {
    console.log(`Web Viewer Loaded`)
    PDFViewerApplication.initializedPromise.then(() => {

        /** @type {import("./pdfjs-viewer").PDFViewerApplication} */
        const app = PDFViewerApplication

        console.log(`PDF initialized!`)
        console.log(app.eventBus)

        app.eventBus.on('pagesinit', () => {
            for (const pageEl of document.querySelectorAll('.page')) {
                let canvasElem = undefined
                //  = pageEl.querySelector('canvas')
                pageEl.addEventListener('dragstart', (_evt) => {
                    canvasElem = pageEl.querySelector('canvas')
                    _evt.dataTransfer.setDragImage(canvasElem, 50, 50)
                    _evt.dataTransfer.setData('custom/pdf-page', JSON.stringify({
                        dataUrl: canvasElem.toDataURL(),
                        pageNo: parseInt(pageEl.getAttribute('data-page-number')),
                        width: parseInt(canvasElem.getAttribute('width')),
                        height: parseInt(canvasElem.getAttribute('height')),
                    }))
                })
                pageEl.setAttribute("draggable", "true")
            }
        })
    })
});

async function sendToParent(canvasElem, pageEl) {
    /** @type {HTMLCanvasElement} */
    // const canvasElem = pageEl.querySelector('canvas')
    // const blob = await new Promise(resolve => canvasElem.toBlob(resolve));
    window.top.postMessage({
        transferId: "nes",
        dataUrl: canvasElem.toDataURL(),
        pageNo: parseInt(pageEl.getAttribute('data-page-number')),
        width: canvasElem.offsetWidth,
        height: canvasElem.offsetWidth,
    }, '*')
    console.log(`Sent page to parent!`)
}
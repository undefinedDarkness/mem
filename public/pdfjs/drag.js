document.addEventListener("DOMContentLoaded", function () {
    console.log(`[pdf-iframe] Web Viewer Loaded`);
    PDFViewerApplication.downloadOrSave = onSave
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

async function onSave() {
    if (PDFViewerApplication._saveInProgress) {
        return;
      }
      PDFViewerApplication._saveInProgress = true;
      await PDFViewerApplication.pdfScriptingManager.dispatchWillSave();
      const url = PDFViewerApplication._downloadUrl;
      const filename = PDFViewerApplication._docFilename;
      try {
        PDFViewerApplication._ensureDownloadComplete();
        /** @type Uint8Array */
        const data = await PDFViewerApplication.pdfDocument.saveDocument();
        console.log(data)
        // const blob = new Blob([data], {
        //   type: "application/pdf",
        // });
        // console.log('[pdf-iframe]', blob, data, url, filename);
        window.top.postMessage(data, '*', [data.buffer])
       
      } catch (reason) {
        console.error(`Error when saving the document: ${reason.message}`);
        await PDFViewerApplication.download({});
      } finally {
        await PDFViewerApplication.pdfScriptingManager.dispatchDidSave();
        PDFViewerApplication._saveInProgress = false;
      }
}
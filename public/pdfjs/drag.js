let initializedDefaultFile = false;

document.addEventListener("DOMContentLoaded", initializePDFViewer);

async function initializePDFViewer() {
    console.log(`[pdf-iframe] Web Viewer Loaded`);
    PDFViewerApplication.downloadOrSave = onSave;
    await PDFViewerApplication.initializedPromise;
    console.log(`[pdf-iframe] New PDF initialized!`);
    notifyParentPDFReady();
    PDFViewerApplication.eventBus.on('pagesinit', handlePagesInit);
}

function notifyParentPDFReady() {
    window.top.postMessage({ id: 'pdf-ready-for-data' }, '*');
}

function handlePagesInit() {
    notifyParentPDFLoaded();
    addPageDragHandlers();
}

function notifyParentPDFLoaded() {
    if (initializedDefaultFile) {
        window.top.postMessage({ id: 'pdf-loaded-new' }, '*');
    } else {
        initializedDefaultFile = true;
    }
}

function addPageDragHandlers() {
    const pages = document.querySelectorAll('.page');
    pages.forEach(pageEl => {
        pageEl.addEventListener('dragstart', createDragHandler(pageEl));
        pageEl.setAttribute("draggable", "true");
    });
}

function createDragHandler(pageEl) {
    return (event) => {
        const canvasElem = pageEl.querySelector('canvas');
        const pageNo = parseInt(pageEl.getAttribute('data-page-number'));
        const { width, height } = canvasElem;
        const dataUrl = canvasElem.toDataURL();

        event.dataTransfer.setDragImage(canvasElem, 50, 50);
        event.dataTransfer.setData('custom/pdf-page', JSON.stringify({ dataUrl, pageNo, width, height }));
        event.dataTransfer.setData('custom/link-insert', JSON.stringify(createLinkInsertData(pageNo)));
    };
}

function createLinkInsertData(pageNo) {
    const newUrl = new URL(window.top.location.href);
    newUrl.searchParams.set('documentWorkspacePath', window.documentWorkspacePath);
    newUrl.searchParams.set('documentPageNo', pageNo);

    return {
        name: PDFViewerApplication.documentInfo['Title']?.trim() ?? window.documentWorkspacePath.split('/').pop(),
        url: newUrl.toString(),
        kind: 'document',
    };
}

async function onSave() {
    if (PDFViewerApplication._saveInProgress) return;

    PDFViewerApplication._saveInProgress = true;
    try {
        await PDFViewerApplication.pdfScriptingManager.dispatchWillSave();
        const { data } = await PDFViewerApplication.pdfDocument.saveDocument();
        const documentName = PDFViewerApplication.documentInfo['Title']?.trim() ?? window.documentWorkspacePath.split('/').pop();

        console.log('[pdf-iframe] Sending data to parent for save o/p');
        window.top.postMessage({
            id: 'pdf-save-pdf',
            data: {
                blob: data,
                documentName,
                documentWorkspacePath: window.documentWorkspacePath
            }
        }, '*', [data.buffer]);
    } catch (error) {
        console.error(`Error when saving the document: ${error.message}`);
        await PDFViewerApplication.download({});
    } finally {
        await PDFViewerApplication.pdfScriptingManager.dispatchDidSave();
        PDFViewerApplication._saveInProgress = false;
    }
}

window.addEventListener('message', (event) => {
    if (event.data === 'pdf-want-download') {
        PDFViewerApplication.download({});
    }
});
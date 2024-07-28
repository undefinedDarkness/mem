import { AssetRecordType, Editor } from "tldraw"
import { LinkInsert } from "../sidebar/bookmarks"

function displayDataTransfer(d: DataTransfer) {
  const r: Record<string, string> = {  }
  for (const t of d.types) {
    r[t] = d.getData(t)
  }
  return r
}

export const handleDropEvents = (ev: DragEvent, editor: Editor) => {
  ev.stopImmediatePropagation()
  const eventPoint = editor.screenToPage({ x: ev.clientX, y: ev.clientY })

  console.log(`[editor] got dropped on!`)
  console.log(displayDataTransfer(ev.dataTransfer!))
    const pdfPage = ev.dataTransfer?.getData("custom/pdf-page")
    // console.log(ev.dataTransfer?.getData('text/plain'))
    // console.log(pdfPage)
    if (pdfPage) {
      console.log(`[editor] intercepting pdf paste`)
      ev.stopImmediatePropagation()
      const data = JSON.parse(pdfPage)
      const assetId = AssetRecordType.createId()
      editor.createAssets([{
        type: 'image',
        typeName: 'asset',
        props: {
          src: data.dataUrl,
          name: `${data.pageNo}.png`,
          w: data.width,
          h: data.height,
          fileSize: -1,
          mimeType: 'image/png',
          isAnimated: false
        },
        meta: {},
        id: assetId
      }])
  
      // const pt = editor.screenToPage({ x: ev.clientX, y: ev.clientY })
      editor.createShape({
        type: 'image',
        x: eventPoint.x,
        y: eventPoint.y,
        props: {
          assetId: assetId,
          w: data.width,
          h: data.height,
        }
      })
    }

    const link = ev.dataTransfer?.getData("custom/link-insert")
    if (link) {
      console.log(`[editor] intercepting link paste`)
      ev.stopImmediatePropagation()
      const data: LinkInsert = JSON.parse(link)
      editor.createShape({
        type: 'internal-link-shape',
        x: eventPoint.x,
        y: eventPoint.y,
        props: {
          url: data.url,
          text: data.name,
          kind: data.kind
        }
      })
    }
  }
  
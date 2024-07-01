import { AssetRecordType, Editor } from "tldraw"
import { LinkInsert } from "../sidebar/bookmarks"

export const handleDropEvents = (ev: DragEvent, editor: Editor) => {

  const eventPoint = editor.pageToScreen({ x: ev.clientX, y: ev.clientY })

  console.log(`[editor] got dropped on!`)
  console.log(ev.dataTransfer)
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
        type: 'text',
        x: eventPoint.x,
        y: eventPoint.y,
        props: {
          text: data.url
        }
      })
    }
  }
  
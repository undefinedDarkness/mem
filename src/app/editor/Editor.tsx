'use client'

// @deno-types="npm:tldraw"
import { Tldraw, Editor, TLUiOverrides, TLUiComponents, TLEditorComponents, useTools, DefaultToolbar, TldrawUiMenuItem, useIsToolSelected, DefaultToolbarContent, createShapeId } from "tldraw";
import { useCallback, useState, useEffect } from 'react'
import { createAssetFromUrl } from "./createAssetFromUrl";
import { handleDropEvents } from "./handleDropEvents";
import 'tldraw/tldraw.css'
import { PageBookmarkTool, PageBookmarkUtil } from "./bookmarkShape";
import { useSearchParams } from "next/navigation";
import { zoomToShape } from "../sidebar/bookmarks";


const overrides: TLUiOverrides = {
  tools(editor, schema) {
    schema['page-bookmark-tool'] = {
      id: 'page-bookmark-tool',
      label: "Page Bookmark",
      icon: 'heart-icon', // TODO: Figure out what icons can be used!
      onSelect: () => {
        editor.setCurrentTool('page-bookmark-tool')
      }
    }

    return schema
  }
}

const components: TLUiComponents & TLEditorComponents = {
  Toolbar: (...props) => {
    const pin = useTools()['page-bookmark-tool']
    const isPinSelected = useIsToolSelected(pin)
    return (
      <DefaultToolbar {...props}>
        <TldrawUiMenuItem {...pin} isSelected={isPinSelected} />
        <DefaultToolbarContent />
      </DefaultToolbar>
    )
  },
}
export default function CanvasEditor({ setEditor, ...props }: { setEditor: React.Dispatch<React.SetStateAction<Editor | undefined>> }) {
  const params = useSearchParams()
  
  const onMount = useCallback((editor: Editor) => {
    (window as any).editor = editor
    editor.registerExternalAssetHandler('url', createAssetFromUrl)

    // @ts-ignore
    const defaultFileHandler = editor.externalContentHandlers['files']
    editor.registerExternalContentHandler('files', async content => {
      console.log(content)
      await defaultFileHandler?.(content)
    })

    const fn = (ev: DragEvent) => handleDropEvents(ev, editor)
    editor.getContainer().addEventListener('drop', fn)
    setEditor(editor)

    if (params.get('zoomToShape')) {
      try { zoomToShape(editor, createShapeId(params.get('zoomToShape')!)) }
      catch (err) {
        console.warn(`Failed to zoom to shape: ${err}`)
      }
    }

    return () => {
      setEditor(undefined)
      editor.getContainer().removeEventListener('drop', fn)
    }
  }, [])

  return (
    <>
      <Tldraw tools={[PageBookmarkTool]} components={components} overrides={overrides} shapeUtils={[PageBookmarkUtil]} {...props} onMount={onMount} inferDarkMode={true} persistenceKey="nes">
      </Tldraw>
    </>
  );
}

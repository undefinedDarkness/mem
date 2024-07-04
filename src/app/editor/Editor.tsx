'use client'

// @deno-types="npm:tldraw"
import { Tldraw, Editor, TLUiOverrides, TLUiComponents, TLEditorComponents, useTools, DefaultToolbar, TldrawUiMenuItem, useIsToolSelected, DefaultToolbarContent, createShapeId, useEditor } from "tldraw";
import { useCallback, useState, useEffect } from 'react'
import { createAssetFromUrl } from "./createAssetFromUrl";
import { handleDropEvents } from "./handleDropEvents";
import 'tldraw/tldraw.css'
import { PageBookmarkTool, PageBookmarkUtil } from "./bookmarkShape";
import { usePathname, useSearchParams } from "next/navigation";
import { zoomToShape } from "../sidebar/bookmarks";
import { InternalLinkUtil } from "./internalLink";
import { useRouter } from "next/navigation";
import { clearUrlParam } from "../utils/utils";


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

function QueryState() {
  const editor = useEditor()
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const shapeId = params.get('zoomToShape')
    if (shapeId) {
      zoomToShape(editor, createShapeId(shapeId))
      clearUrlParam('zoomToShape', router)
    }
  }, [params])

  return <></>
}
export default function CanvasEditor({ workspaceId, setEditor, ...props }: { workspaceId: string, setEditor: React.Dispatch<React.SetStateAction<Editor | undefined>> }) {

  const onMount = (editor: Editor) => {
    editor.registerExternalAssetHandler('url', createAssetFromUrl)

    // @ts-ignore
    // const defaultFileHandler = editor.externalContentHandlers['files']
    // editor.registerExternalContentHandler('files', async content => {
    //   console.log(content)
    //   await defaultFileHandler?.(content)
    // })

    const fn = (ev: DragEvent) => handleDropEvents(ev, editor)
    editor.getContainer().addEventListener('drop', fn)
    setEditor(editor)
  }

  return (
    <>
      <Tldraw tools={[PageBookmarkTool]} components={components} overrides={overrides} shapeUtils={[PageBookmarkUtil, InternalLinkUtil]} {...props} onMount={onMount} inferDarkMode={true} persistenceKey={workspaceId}>
        <QueryState />
      </Tldraw>
    </>
  );
}

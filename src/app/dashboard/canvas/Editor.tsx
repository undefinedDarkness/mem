'use client'
import { debounce, Tldraw, Editor, TLUiOverrides, TLUiComponents, TLEditorComponents, useTools, DefaultToolbar, TldrawUiMenuItem, useIsToolSelected, DefaultToolbarContent, createShapeId, useEditor, TLPageId } from "tldraw";
import { useEffect } from 'react'
import { createAssetFromUrl } from "./createAssetFromUrl";
import { handleDropEvents } from "./handleDropEvents";
import 'tldraw/tldraw.css'
import { PageBookmarkTool, PageBookmarkUtil } from "./bookmarkShape";
import { useSearchParams } from "next/navigation";
import { zoomToShape } from "../sidebar/bookmarks";
import { InternalLinkUtil } from "./internalLink";
import { useRouter } from "next/navigation";
import { clearUrlParam } from "../../../utils/utils";
import { saveCanvasToFilesystem } from "../../../utils/fs";


import renderMathInElement from 'katex/contrib/auto-render';
import 'katex/dist/katex.min.css'

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
  },

  actions(editor, actions) {
    // console.log(actions)
    return {
      ...actions,
      'exit-pen-mode': { ...actions['exit-pen-mode'], kbd: "Escape" }
    }
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

function RenderLatex() {
    useEffect(() => {
    const updateMath = () => {
      // TODO: Try optimizing this further!
      console.log(`[math] Updated expressions`)
      document.querySelectorAll('div.tl-text-content').forEach(el => renderMathInElement(el as HTMLElement, {
        displayMode: false,
        delimiters: [
          {left: "\\(", right: "\\)", display: false},
        ]
      }))
    }

    const id = setInterval(updateMath, 9_000) 

    return () => {
      clearInterval(id)
    }
  }, [  ])

  return <></>
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

    const canvasPage = params.get('canvasPage')
    if (canvasPage) {
      editor.setCurrentPage(canvasPage as TLPageId)
    }
  }, [params])

  return <></>
}

// TODO: See if a save is required at all, https://tldraw.dev/docs/persistence#Listening-for-changes
function SaveStateToFilesystem() {
  const editor = useEditor()

  useEffect(() => {
    const onVisibilityChanged = debounce(() => {
      if (document.visibilityState != "hidden") return
      saveCanvasToFilesystem(editor)
    }, 5000)

    document.addEventListener('visibilitychange', onVisibilityChanged);
    // const id = setInterval(onVisibilityChanged, 9_000)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChanged)
      // clearInterval(id)
    }
  }, [])

  return <></>
}

export default function CanvasEditor({ workspaceId, setEditor, ...props }: { workspaceId: string, setEditor: React.Dispatch<React.SetStateAction<Editor | undefined>> }) {

  const onMount = (editor: Editor) => {
    editor.registerExternalAssetHandler('url', createAssetFromUrl)

    const fn = (ev: DragEvent) => handleDropEvents(ev, editor)
    editor.getContainer().addEventListener('drop', fn)
    setEditor(editor)
  }

  return (
    <>
      <Tldraw tools={[PageBookmarkTool]} components={components} overrides={overrides} shapeUtils={[PageBookmarkUtil, InternalLinkUtil]} {...props} onMount={onMount} inferDarkMode={true} persistenceKey={workspaceId}>
        <QueryState />
        <SaveStateToFilesystem />
        <RenderLatex />
      </Tldraw>
    </>
  );
}

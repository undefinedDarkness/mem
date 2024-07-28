'use client'
import { debounce, Tldraw, Editor, TLUiOverrides, TLUiComponents, TLEditorComponents, useTools, DefaultToolbar, TldrawUiMenuItem, useIsToolSelected, DefaultToolbarContent, createShapeId, useEditor, TLPageId, LineToolbarItem, TLUiAssetUrlOverrides, throttle } from "tldraw";
import { useCallback, useEffect } from 'react'
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
import saveFileToFilesystem from "./saveFileToFilesystem";

// TODO: Maybe register to side effects of create & update of shapes

const overrides: TLUiOverrides = {
  tools(editor, schema) {
    schema['page-bookmark-tool'] = {
      id: 'page-bookmark-tool',
      label: "Page Bookmark",
      icon: 'bookmark-filled', // TODO: Figure out what icons can be used!
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

const customAssetUrls: TLUiAssetUrlOverrides = {
  icons: {
    'bookmark-filled': '/bookmarkFilled.svg'
  }
}

const components: TLUiComponents & TLEditorComponents = {
  Toolbar: (...props) => {
    const pin = useTools()['page-bookmark-tool']
    const isPinSelected = useIsToolSelected(pin)
    return (
      <DefaultToolbar {...props}>
        <TldrawUiMenuItem {...pin} isSelected={isPinSelected} />
        <LineToolbarItem></LineToolbarItem>
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
          { left: "\\(", right: "\\)", display: false },
        ]
      }))
    }

    const id = setInterval(updateMath, 9_000)

    return () => {
      clearInterval(id)
    }
  }, [])

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
    const onVisibilityChanged = (() => {
      if (document.visibilityState != "hidden") return
      saveCanvasToFilesystem(editor)
    })

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

  // TODO: Move to composable component
  const onMount = useCallback((editor: Editor) => {
    editor.registerExternalAssetHandler('url', createAssetFromUrl)
    editor.registerExternalAssetHandler('file', saveFileToFilesystem)

    // TODO: This function is called repeatedly, for whatever reason, try to prevent that somehow
    const fn = (ev: DragEvent) => handleDropEvents(ev, editor)
    editor.getContainer().addEventListener('drop', fn)
    setEditor(editor)
  }, [])

  useEffect(() => {
    // TODO: this could bite my ass if I need the service worker for something else
    navigator.serviceWorker.register('fsProxy-sw.js', { type: 'module' })
  })

  return (
    <>
      <Tldraw assetUrls={customAssetUrls} tools={[PageBookmarkTool]} components={components} overrides={overrides} shapeUtils={[PageBookmarkUtil, InternalLinkUtil]} {...props} onMount={onMount} inferDarkMode={true} persistenceKey={workspaceId}>
        <QueryState />
        <SaveStateToFilesystem />
        <RenderLatex />
      </Tldraw>
    </>
  );
}

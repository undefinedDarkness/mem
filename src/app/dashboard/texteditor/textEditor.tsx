import { useState, useEffect, FormEvent, useRef } from 'react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline'
import { TiptapToolbar } from './toolbar';
import { TextStyle } from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import { toast } from 'react-hot-toast'
import { EditorProvider, useCurrentEditor } from '@tiptap/react';

import './textEditor.css'

const extensions = [
  StarterKit,
  Underline,
  TextStyle,
  FontFamily
]

import clsx from 'clsx'
import { IconButton, Text, TextField } from '@radix-ui/themes';
import { PinBottomIcon, ArrowTopRightIcon, DownloadIcon } from '@radix-ui/react-icons';
import { getWorkspaceDirectory, FileHandleWithPath } from '@/utils/db';
import { debounce } from 'tldraw';
import { getHandleFromPath, toReadableStream } from '@/utils/fs';
import humanId from 'human-id';

const SaveLocationUI = ({ saveFilePath, setSaveFilePath, className, ...props }: { saveFilePath: FileHandleWithPath, setSaveFilePath: (path: FileHandleWithPath) => void, className: string }) => {

  const { editor } = useCurrentEditor()

  const onClick = () => {
    getWorkspaceDirectory().then(async dir => {
      try {
        const f = await window.showSaveFilePicker({
          startIn: dir?.handle
        })
        setSaveFilePath({ handle: f, path: f.name })
      } catch (err) {
        console.error(`[text-editor/save-location] ${err}`)
      }
    })
  }

  const openOnClick = () => {
    getWorkspaceDirectory().then(async dir => {
      try {
        const [f] = await window.showOpenFilePicker({
          startIn: dir?.handle
        })
        setSaveFilePath({ handle: f, path: f.name })

        const content = await new Response((await f.getFile()).stream()
          .pipeThrough(new DecompressionStream('gzip'))).json()

        editor?.commands.setContent(content)

      } catch (err) {
        console.error(`[text-editor/save-location] ${err}`)
      }
    })
  }


  const saveFileInput = useRef<HTMLInputElement>(null);

  return <div {...props} className={clsx(className, 'flex gap-2 items-center text-nowrap')}>
    <TextField.Root ref={saveFileInput} className='flex-1' defaultValue={saveFilePath.path} onInput={debounce(() => setSaveFilePath({ path: saveFileInput.current?.value ?? "", handle: undefined }), 1000)}></TextField.Root>
    <IconButton title='Save to' onClick={onClick}><DownloadIcon></DownloadIcon></IconButton>
    <IconButton title='Open file' onClick={openOnClick}><ArrowTopRightIcon></ArrowTopRightIcon></IconButton>
  </div>
}

const SaveStateLocally = ({ saveFilePath }: { saveFilePath: FileHandleWithPath }) => {
  const { editor } = useCurrentEditor()

  useEffect(() => {
    const onVisibilityChanged = (async () => {
      if (document.visibilityState != "hidden" || !editor || editor.isEmpty || !saveFilePath.path) return
      const content = editor.getJSON()
      const fileHandle = saveFilePath.handle ?? (await getHandleFromPath(saveFilePath.path, undefined, true)).handle!
      const writable = await fileHandle.createWritable()
      toast.promise(toReadableStream(JSON.stringify(content))
        .pipeThrough(new TextEncoderStream())
        .pipeThrough(new CompressionStream('gzip'))
        .pipeTo(writable), {
        loading: '[t] Saving...',
        success: '[t] Saved',
        error: '[t] Failed to save'
      })
    })

    document.addEventListener('visibilitychange', onVisibilityChanged);
    // const id = setInterval(onVisibilityChanged, 9_000)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChanged)
      // clearInterval(id)
    }
  }, [saveFilePath])


  return <></>
}

export default function TextEditor() {

  const [saveFilePath, setSaveFilePath] = useState<FileHandleWithPath>({ path: `${humanId()}.tiptap`, handle: undefined })

  return <div className='h-full'>
    <EditorProvider editorProps={{ attributes: { class: `prose prose-md dark:prose-invert focus:outline-none p-2` } }}
      extensions={extensions} slotBefore={
        <>
          <SaveLocationUI className='m-2' saveFilePath={saveFilePath} setSaveFilePath={setSaveFilePath}></SaveLocationUI>
          <TiptapToolbar />
        </>
      }>
      <SaveStateLocally saveFilePath={saveFilePath} />
    </EditorProvider>
  </div>
}

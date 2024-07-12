import { useState} from 'react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline'
import { TiptapToolbar } from './toolbar';
import { TextStyle } from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import { nanoid } from 'nanoid';
import { EditorProvider } from '@tiptap/react';

const extensions = [
  StarterKit,
  Underline,
  TextStyle,
  FontFamily
]



function SaveLocationUI({ saveFilePath }: {saveFilePath: string}) {
  return <div>
    Saving to <code>{saveFilePath}</code>
  </div>
}

export default function TextEditor() {

  const [saveFilePath, setSaveFilePath] = useState(`${nanoid()}.tiptap`)

  return <div>
    <SaveLocationUI saveFilePath={saveFilePath}></SaveLocationUI>
    <EditorProvider editorProps={{ attributes: { class: `prose prose-md dark:prose-invert m-5 focus:outline-none` } }}
      extensions={extensions} slotBefore={<TiptapToolbar />} content={``}></EditorProvider>
  </div>
}

import React from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import { useEditor, EditorContent, useCurrentEditor, EditorProvider } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  FontBoldIcon,
  FontItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  TextAlignLeftIcon,
  LinkBreak2Icon,
  CodeIcon,
  MinusIcon,
  ResetIcon,
  ReloadIcon,
} from '@radix-ui/react-icons';
import { Heading1, Heading2, Heading3 } from '../utils/tinycomponents';

const TiptapToolbar = () => {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return <></>
  }

  const baseItemClass = 
    `m-0.5 p-1.5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`;

  const activeItemClass = 
    "bg-[rgba(255,255,255,0.12)]";

  const inactiveItemClass = 
    "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800";

  const disabledItemClass = 
    "text-gray-400 dark:text-gray-600 cursor-not-allowed";

  const getItemClass = (isActive: boolean, isDisabled: boolean) => {
    return `${baseItemClass} ${
      isDisabled ? disabledItemClass : isActive ? activeItemClass : inactiveItemClass
    }`;
  };

  return (
    <Toolbar.Root className="flex flex-wrap p-1 space-x-1 bg-white dark:bg-zinc-950 max-w-fit border border-gray-200 dark:border-gray-700 rounded-md shadow-sm">
      <Toolbar.Button
        className={getItemClass(false, !editor.can().chain().focus().undo().run())}
        aria-label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <ResetIcon className="w-5 h-5" />
      </Toolbar.Button>
      <Toolbar.Button
        className={getItemClass(false, !editor.can().chain().focus().redo().run())}
        aria-label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <ReloadIcon className="w-5 h-5" />
      </Toolbar.Button>
      <Toolbar.Separator className="w-px bg-gray-200 dark:bg-gray-700" />
      <Toolbar.ToggleGroup type="multiple" aria-label="Text formatting">
        <Toolbar.ToggleItem
          className={getItemClass(editor.isActive('bold'), false)}
          value="bold"
          aria-label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FontBoldIcon className="w-5 h-5" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          className={getItemClass(editor.isActive('italic'), false)}
          value="italic"
          aria-label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FontItalicIcon className="w-5 h-5" />
        </Toolbar.ToggleItem>
        {/* <Toolbar.ToggleItem
          className={getItemClass(editor.isActive('underline'), false)}
          value="underline"
          aria-label="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="w-5 h-5" />
        </Toolbar.ToggleItem> */}
      </Toolbar.ToggleGroup>
      <Toolbar.Separator className="w-px bg-gray-200 dark:bg-gray-700" />
      <Toolbar.ToggleGroup type="single" aria-label="List formatting">
        <Toolbar.ToggleItem
          className={getItemClass(editor.isActive('bulletList'), false)}
          value="bullet-list"
          aria-label="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListBulletIcon className="w-5 h-5" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          className={getItemClass(editor.isActive('orderedList'), false)}
          value="ordered-list"
          aria-label="Ordered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <TextAlignLeftIcon className="w-5 h-5" />
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>
      <Toolbar.Separator className="w-px bg-gray-200 dark:bg-gray-700" />
      <Toolbar.ToggleGroup type='single' aria-label='Block formatting'>
      <Toolbar.ToggleItem
        className={getItemClass(editor.isActive('codeBlock'), false)}
        value="code-block"
        aria-label="Code block"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <CodeIcon className="w-5 h-5" />
      </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>
      <Toolbar.Separator className="w-px bg-gray-200 dark:bg-gray-700" />
      <Toolbar.ToggleGroup type="single" aria-label="Heading level">
        <Toolbar.ToggleItem
          className={getItemClass(editor.isActive('heading', { level: 1 }), false)}
          value="h1"
          aria-label="Heading 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="w-5 h-5" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          className={getItemClass(editor.isActive('heading', { level: 2 }), false)}
          value="h2"
          aria-label="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-5 h-5" />
        </Toolbar.ToggleItem>
        <Toolbar.ToggleItem
          className={getItemClass(editor.isActive('heading', { level: 3 }), false)}
          value="h3"
          aria-label="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="w-5 h-5" />
        </Toolbar.ToggleItem>
      </Toolbar.ToggleGroup>
      <Toolbar.Separator className="w-px bg-gray-200 dark:bg-gray-700" />
      <Toolbar.Button
        className={getItemClass(false, false)}
        aria-label="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <MinusIcon className="w-5 h-5" />
      </Toolbar.Button>
    </Toolbar.Root>
  );
};

export default function TextEditor() {
    return <div>
        <EditorProvider editorProps={{ attributes: { class: `prose prose-md dark:prose-invert m-5 focus:outline-none` } }} 
                        extensions={[StarterKit]} slotBefore={<TiptapToolbar />} content={``}></EditorProvider>
    </div>
}

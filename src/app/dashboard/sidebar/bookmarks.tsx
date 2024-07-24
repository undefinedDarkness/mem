'use client'
import { IconButton, Text, TextField } from "@radix-ui/themes"
import { Editor, TLShapeId, createShapeId } from "tldraw"
import { ReactNode, useEffect, useState } from "react"
import { get } from "idb-keyval"
import { IPageBookmarkShape } from "../canvas/bookmarkShape"
import { FullLink } from "../../../utils/tinycomponents"
import { BookmarkFilledIcon, MagnifyingGlassIcon, ReloadIcon } from "@radix-ui/react-icons"
import { Command } from 'cmdk'
import { onBroadcast } from "@/utils/bc"

export function zoomToShape(editor: Editor, shapeId: TLShapeId) {
    const all = editor.getSelectedShapeIds()
    editor.selectNone()
    editor.select(shapeId)
    editor.zoomToSelection({
        animation: {
            duration: 200
        }
    })
    editor.deselect(shapeId)
    editor.select(...all)
}

export interface LinkInsert {
    workspaceId?: string,
    url: string
    kind: 'bookmark' | 'document' | 'web',
    name: string
}

async function getBookmarks(editor: Editor) {
    const bookmarkIds: string[] | undefined = await get('bookmarks')
    const newBookmarks: string[] = []
    const v = await Promise.all(bookmarkIds?.map(id => {
        let shape = editor.getShape(createShapeId(id)) as IPageBookmarkShape | undefined
        if (shape) newBookmarks.push(id)
        return { bookmark: shape, internalId: id }
    }) ?? [])
    return v
}

export default function Bookmarks({ editor, workspaceId }: { editor: Editor | undefined, workspaceId: string }) {

    const [bookmarkEl, setBookmarksEl] = useState<ReactNode[]>([])
    const [bookmarks, setBookmarks] = useState<Awaited<ReturnType<typeof getBookmarks>>>([])

    // TODO: Add groups of each tag!
    useEffect(() => {
        if (!editor) return

        setBookmarksEl(bookmarks.map(({ bookmark, internalId }) => {
            if (!bookmark) return;
            const bookmarkText = bookmark.props.text
            const bookmarkPage = editor.getAncestorPageId(bookmark.id)!;
            const bookmarkUrl = new URL(window.location.href)
            bookmarkUrl.searchParams.set('zoomToShape', internalId)
            bookmarkUrl.searchParams.set('canvasPage', bookmarkPage)
            return <Command.Item value={bookmarkText} key={internalId}>
                <FullLink href={bookmarkUrl.href} className="space-x-4 text-nowrap"><BookmarkFilledIcon className="!inline-block" style={{ color: bookmark.props.color }}></BookmarkFilledIcon><Text>{bookmarkText}</Text></FullLink>
            </Command.Item>
        }))

        return () => {
            setBookmarksEl([])
        }
    }, [bookmarks])

    useEffect(() => {
        if (!editor) return
        getBookmarks(editor).then(r => setBookmarks(r)).catch(err => {
            console.error(`[bookmarks] ${err}`)
        })

        onBroadcast('bookmark-update', () => {
            editor && getBookmarks(editor).then(r => setBookmarks(r))
        })

        return () => {
        }
    }, [])

    return <Command className="p-2 space-y-2">
        <Command.Input asChild>
            <div className="flex gap-2">
                <TextField.Root className="max-w-[35vw] flex-1">
                    <TextField.Slot><MagnifyingGlassIcon></MagnifyingGlassIcon></TextField.Slot>
                </TextField.Root>
                <IconButton onClick={_ => editor && getBookmarks(editor).then(setBookmarks)}><ReloadIcon></ReloadIcon></IconButton>
            </div>
        </Command.Input>
        <Command.List >
            <Command.Empty className="text-center italic">No results found</Command.Empty>
            {
                bookmarkEl
            }
        </Command.List>
    </Command>
}

'use client'
import { Box, Flex, Text, TextField } from "@radix-ui/themes"
import { Editor, TLParentId, TLShape, TLShapeId, createShapeId } from "tldraw"
import { ReactNode, useCallback, useEffect, useState } from "react"
import { get } from "idb-keyval"
import { IPageBookmarkShape, PageBookmarkUtil } from "../canvas/bookmarkShape"
import { nanoid } from "nanoid"
import Link from "next/link"
import { FullLink } from "../../../utils/tinycomponents"
import { BookmarkFilledIcon, BookmarkIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons"
import { Command } from 'cmdk'


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
    return await Promise.all(bookmarkIds?.map(id => {
        let shape = editor.getShape(createShapeId(id)) as IPageBookmarkShape | undefined
        return { bookmark: shape, internalId: id }
    }) ?? [])
}

export default function Bookmarks({ editor, workspaceId }: { editor: Editor | undefined, workspaceId: string }) {

    const [bookmark, setBookmarks] = useState<ReactNode[]>([])

    // TODO: Add groups of each tag!
    useEffect(() => {
        if (!editor) return

        getBookmarks(editor).then(bookmarks => setBookmarks(bookmarks.map(({ bookmark, internalId }) => {
            if (!bookmark) return;
            const bookmarkText = bookmark.props.text
            const bookmarkPage = editor.getAncestorPageId(bookmark.id)!;
            const bookmarkUrl = new URL(window.location.href)
            bookmarkUrl.searchParams.set('zoomToShape', internalId)
            bookmarkUrl.searchParams.set('canvasPage', bookmarkPage)
            return <Command.Item value={bookmarkText}>
                <FullLink href={bookmarkUrl.href} className="space-x-4 text-nowrap"><BookmarkFilledIcon className="!inline-block" style={{ color: bookmark.props.color }}></BookmarkFilledIcon><Text>{bookmarkText}</Text></FullLink>
            </Command.Item>
        })))

        return () => {
            setBookmarks([])
        }
    }, [])

    return <Command className="p-2 space-y-2">
        <Command.Input asChild>
            <TextField.Root className="max-w-[35vw]">
                <TextField.Slot><MagnifyingGlassIcon></MagnifyingGlassIcon></TextField.Slot>
            </TextField.Root>
        </Command.Input>
        <Command.List >
            <Command.Empty>No results found</Command.Empty>
            {
                bookmark
            }
        </Command.List>
    </Command>
}

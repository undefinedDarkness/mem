'use client'
import { Box, Flex, Text, Link as RadixLink } from "@radix-ui/themes"
import { Editor, TLParentId, TLShapeId, createShapeId } from "tldraw"
import { ReactNode, useCallback, useEffect, useState } from "react"
import { get } from "idb-keyval"
import { IPageBookmarkShape, PageBookmarkUtil } from "../editor/bookmarkShape"
import { nanoid } from "nanoid"
import Link from "next/link"


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
    workspaceId: string,
    url: string
    kind: 'bookmark',
    name: string
}

export default function Bookmarks({ editor, workspaceId }: { editor: Editor | undefined, workspaceId: string }) {

    const [bookmark, setBookmarks] = useState<ReactNode[]>([])

    useEffect(() => {
        if (!editor) return

        (async () => {
            const bookmarkIds: string[] | undefined = await get('bookmarks')
            setBookmarks([])
            const bookmarksEl = []
            for (const id of bookmarkIds ?? []) {
                const shapeId = createShapeId(id)
                const bookmark = await editor.getShape(shapeId) as IPageBookmarkShape
                if (!bookmark) continue
                // TODO: Clear out invalid bookmarks from IDB
                const bookmarkText = bookmark?.props.text
                const pt = editor.pageToScreen({ x: bookmark.x, y: bookmark.y })
                const bookmarkUrl = new URL(window.location.href)
                bookmarkUrl.searchParams.set('zoomToShape', id)
                bookmarksEl.push(
                    <Link key={id} draggable href={bookmarkUrl} onDragStart={(ev) => {
                        ev.dataTransfer.setData('custom/link-insert', JSON.stringify({
                            url: bookmarkUrl.toString(),
                            workspaceId: workspaceId,
                            kind: 'bookmark',
                            name: bookmarkText
                        } as LinkInsert))
                    }}><RadixLink>{bookmarkText}</RadixLink></Link>
                )
                //setBookmarks(prev => [...prev, <Text key={id}>{i}</Text>])
            }
            setBookmarks(bookmarksEl)
        })()

        return () => {
            setBookmarks([])
        }
    }, [])

    return <Flex gap="2" py="2" px="2" direction={"column"}>
        {bookmark}
    </Flex>
}
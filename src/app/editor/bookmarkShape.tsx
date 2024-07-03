import {
    Geometry2d,
    HTMLContainer,
    RecordProps,
    Rectangle2d,
    ShapeUtil,
    StateNode,
    T,
    TLBaseShape,
    TLOnResizeHandler,
    Tldraw,
    createShapeId,
    resizeBox,
    stopEventPropagation,
} from 'tldraw'
import { nanoid } from 'nanoid'
import { update } from 'idb-keyval'
import { BookmarkIcon } from '@heroicons/react/16/solid'
import { Button, Flex, Text, TextField, } from '@radix-ui/themes'
import { KeyboardEventHandler } from 'react'

export type IPageBookmarkShape = TLBaseShape<
    'page-bookmark-shape',
    {
        w: number,
        h: number,
        text: string
    }
>

export class PageBookmarkUtil extends ShapeUtil<IPageBookmarkShape> {
    static override type = 'page-bookmark-shape' as const
    static override props: RecordProps<IPageBookmarkShape> = {
        text: T.string,
        w: T.number,
        h: T.number,
    }

    getDefaultProps(): IPageBookmarkShape['props'] {
        return {
            text: 'New Bookmark',
            w: 250,
            h: 100,
        }
    }

    override canEdit = () => true
    override canResize = () => true
    override isAspectRatioLocked = () => false

    getGeometry(shape: IPageBookmarkShape): Geometry2d {
        return new Rectangle2d({
            width: shape.props.w,
            height: shape.props.h,
            isFilled: false
        })
    }

    override onResize: TLOnResizeHandler<any> = (shape, info) => {
        return resizeBox(shape, info)
    }

    component(shape: IPageBookmarkShape) {
        const isEditing = this.editor.getEditingShapeId() === shape.id
        const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (ev) => {
            if (ev.key === 'Enter') {
                this.editor.updateShape({
                    id: shape.id,
                    type: 'page-bookmark-shape',
                    props: {
                        text: (ev.target as HTMLInputElement)?.value ?? shape.props.text
                    }
                })
                this.editor.complete()
            }
        }

        return <HTMLContainer className='rounded-md bg-zinc-800 p-2 font-sans'>
            <Flex gap="2">
                <BookmarkIcon className='text-blue-500 size-4'></BookmarkIcon>
                {isEditing ? <TextField.Root onPointerDown={e => e.stopPropagation()} style={{
                    pointerEvents:
                        'all'
                }} placeholder={shape.props.text} onKeyDown={handleKeyDown}></TextField.Root> : <Text>{shape.props.text}</Text>}
            </Flex>
        </HTMLContainer>
    }

    indicator(shape: IPageBookmarkShape) {
        return <rect width={shape.props.w} height={shape.props.h} />
    }


}

export class PageBookmarkTool extends StateNode {
    static override id = 'page-bookmark-tool'

    override onEnter = () => {
        this.editor.setCursor({ type: 'cross', rotation: 0 })
    }

    // [b]
    override onPointerDown = async () => {
        const { currentPagePoint } = this.editor.inputs
        const id = nanoid()
        // TODO: Make this unique to a workspace
        await update('bookmarks', (r: string[] | undefined) => {
            r?.push(id)
            return r ?? [id]
        })
        this.editor.createShape({
            id: createShapeId(id),
            type: 'page-bookmark-shape',
            x: currentPagePoint.x,
            y: currentPagePoint.y,
            props: { text: 'NEW BOOKMARK' },
        })
    }
}
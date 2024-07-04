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
import { ArrowRightIcon, BookmarkIcon, DocumentTextIcon, PaperClipIcon } from '@heroicons/react/16/solid'
import { Button, Flex, Text, TextField } from '@radix-ui/themes'
import { KeyboardEventHandler } from 'react'
import Link from 'next/link'
import { LinkInsert } from '../sidebar/bookmarks'

export type IInternalLink = TLBaseShape<
    'internal-link-shape',
    {
        w: number,
        h: number,
        url: string,
        text: string,
        kind: string
    }
>

export class InternalLinkUtil extends ShapeUtil<IInternalLink> {
    static override type = 'internal-link-shape' as const
    static override props: RecordProps<IInternalLink> = {
        url: T.string,
        w: T.number,
        h: T.number,
        text: T.string,
        kind: T.string
    }

    getDefaultProps(): IInternalLink['props'] {
        return {
            url: 'https://example.com',
            w: 250,
            h: 50,
            text: 'example.com',
            kind: 'web'
        }
    }

    override canEdit = () => false
    override canResize = () => true
    override isAspectRatioLocked = () => false

    getGeometry(shape: IInternalLink): Geometry2d {
        return new Rectangle2d({
            width: shape.props.w,
            height: shape.props.h,
            isFilled: false
        })
    }

    override onResize: TLOnResizeHandler<any> = (shape, info) => {
        return resizeBox(shape, info)
    }

    component(shape: IInternalLink) {

        const Icon = ({
            'web': PaperClipIcon,
            'bookmark': BookmarkIcon,
            'document': DocumentTextIcon
        }[shape.props.kind] ?? PaperClipIcon)

        return <HTMLContainer className='rounded-md bg-zinc-800 p-3 font-sans'>
            <Flex gap="4" align={"center"}>
                <ArrowRightIcon className='size-5 text-zinc-500'></ArrowRightIcon>
                <Icon className='size-5'></Icon>
                <Link onPointerDown={_ => _.stopPropagation()} style={{pointerEvents: 'all'}} href={shape.props.url}>{shape.props.text}</Link>
            </Flex>
        </HTMLContainer>
    }

    indicator(shape: IInternalLink) {
        return <rect width={shape.props.w} height={shape.props.h} />
    }


}

// export class PageBookmarkTool extends StateNode {
//     static override id = 'page-bookmark-tool'

//     override onEnter = () => {
//         this.editor.setCursor({ type: 'cross', rotation: 0 })
//     }

//     // [b]
//     override onPointerDown = async () => {
//         const { currentPagePoint } = this.editor.inputs
//         const id = nanoid()
//         // TODO: Make this unique to a workspace
//         await update('bookmarks', (r: string[] | undefined) => {
//             r?.push(id)
//             return r ?? [id]
//         })
//         this.editor.createShape({
//             id: createShapeId(id),
//             type: 'page-bookmark-shape',
//             x: currentPagePoint.x,
//             y: currentPagePoint.y,
//             props: { text: 'NEW BOOKMARK' },
//         })
//     }
// }
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
    createShapeId,
    resizeBox,
} from 'tldraw'
import { nanoid } from 'nanoid'
import { get, set, update } from 'idb-keyval'
import { BookmarkIcon } from '@heroicons/react/16/solid'
import { Badge, Button, Flex, IconButton, Popover, Separator, Text, TextField, } from '@radix-ui/themes'
import { KeyboardEventHandler, useEffect, useRef, useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { ArrowRightIcon, Cross1Icon, Cross2Icon, PlusIcon } from '@radix-ui/react-icons'

export type IPageBookmarkShape = TLBaseShape<
    'page-bookmark-shape',
    {
        w: number,
        h: number,
        text: string,
        color: string,
        tags: string[]
    }
>

export class PageBookmarkUtil extends ShapeUtil<IPageBookmarkShape> {
    static override type = 'page-bookmark-shape' as const
    static override props: RecordProps<IPageBookmarkShape> = {
        text: T.string,
        w: T.number,
        h: T.number,
        color: T.string,
        tags: T.arrayOf(T.string)
    }

    getDefaultProps(): IPageBookmarkShape['props'] {
        return {
            text: 'New Bookmark',
            w: 250,
            h: 100,
            color: 'blue',
            tags: []
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
        let isEditing = this.editor.getEditingShapeId() === shape.id
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

        const [bookmarkOptions, setBookmarkOptions ] = useState<string[]>([])
        useEffect(() => {
            get<Set<string>>('bookmark-tags').then(v => setBookmarkOptions(Array.from(v ?? new Set())))

            return () => setBookmarkOptions([])
        }, [])

        const updateColor = (color: string) => {
            this.editor.updateShape({
                id: shape.id,
                type: 'page-bookmark-shape',
                props: {
                    color
                }
            })
        }

        const updateTags = (tags: string[]) => {
            tags = tags.filter(t => !!t)
            this.editor.updateShape({
                id: shape.id,
                type: 'page-bookmark-shape',
                props: {
                    tags
                }
            })
            set('bookmark-tags', new Set(tags))
        }

        return <HTMLContainer className='rounded-md bg-zinc-800 p-2 font-sans space-y-3' style={{ pointerEvents: 'all' }}>
            <Flex direction={'column'} gap='2'>
                <Flex gap="2" align={'center'}>
                    <BookmareColourIcon isEditing={isEditing} updateColor={updateColor} color={shape.props.color} />
                    {isEditing ?
                        <TextField.Root size='1' onPointerDown={e => e.stopPropagation()} placeholder={shape.props.text} onKeyDown={handleKeyDown}></TextField.Root> :
                        <Text className='text-lg'>{shape.props.text}</Text>}
                </Flex>
                <Separator size='4' />
                <Flex justify={'between'}>
                    <Flex gap="2" wrap="wrap">{
                        [...new Set(shape.props.tags)].map(t => <Badge key={t} size='1' className='text-sm space-x-3'>
                            {t}
                            <IconButton onPointerDown={e => e.stopPropagation()} onClick={_ => updateTags(shape.props.tags.filter(_t => _t != t))} className='cursor-pointer' variant='ghost'>
                                <Cross2Icon ></Cross2Icon>
                            </IconButton>
                        </Badge>)
                    }</Flex>

                    <AddTagMenu updateTags={updateTags} currentTags={shape.props.tags}></AddTagMenu>
                    <datalist id='allCurrentTags'>
                        {
                            bookmarkOptions.map(t => <option key={t} value={t}></option>)
                        }
                    </datalist>
                </Flex>
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

function BookmareColourIcon({ color, updateColor, isEditing }: { isEditing: boolean, color: string, updateColor: (color: string) => void }) {
    return <div onPointerDown={e => e.stopPropagation()}><Popover.Root>
        <Popover.Trigger>
            <BookmarkIcon className='size-4 cursor-pointer' style={{ color: color }} />
        </Popover.Trigger>
        <Popover.Content>
            <HexColorPicker color={color} onChange={updateColor}></HexColorPicker>
        </Popover.Content>
    </Popover.Root></div>
}

// TODO: Consider using react-select or replacing with a combobox when that comes out
function AddTagMenu({ updateTags, currentTags }: { currentTags: string[], updateTags: (tags: string[]) => void }) {
    const [tagInputOpen, setTagInputOpen] = useState(false)
    const tagInput = useRef(null)
    return <Popover.Root open={tagInputOpen} onOpenChange={setTagInputOpen}>
        <Popover.Trigger onPointerDown={e => e.stopPropagation()}>
            <IconButton size='1' variant='soft'><PlusIcon></PlusIcon></IconButton>
        </Popover.Trigger>
        <Popover.Content className='space-x-2 flex'>
            <TextField.Root minLength={1} ref={tagInput} size='1' list='allCurrentTags' onPointerDown={e => e.stopPropagation()} onKeyDown={e => {
                if (e.key == 'Enter') { setTagInputOpen(false); updateTags([...currentTags, (e.target as HTMLInputElement).value]) }
            }}></TextField.Root>
            <Popover.Close>
                <IconButton onPointerDown={e => e.stopPropagation()} onClick={_ => (tagInput.current) && updateTags([...currentTags, (tagInput.current as HTMLInputElement).value])} className='cursor-pointer' variant='ghost' size='1'><ArrowRightIcon></ArrowRightIcon></IconButton>
            </Popover.Close>
        </Popover.Content>
    </Popover.Root>
}
import { Box, Button, Flex, Tabs } from "@radix-ui/themes";
import { FolderOpenIcon, BookmarkIcon, DocumentIcon, CubeIcon, PlusCircleIcon, Cog8ToothIcon, PresentationChartLineIcon, GlobeAmericasIcon, DocumentTextIcon, PencilIcon } from '@heroicons/react/16/solid'
import Files from "./files";
import { Editor } from "tldraw";
import Bookmarks from "./bookmarks";
import { useSearchParams } from "next/navigation";
import dynamic from 'next/dynamic'
import Settings from "../dashboard/Settings";
import EmbeddedWebsites from "../dashboard/embeddedwebsites";
import TextEditor from "../dashboard/textEditor";

const PDFWindow = dynamic(() => import('../dashboard/pdf'), { ssr: false })

export function Sidebar({ workspaceId, editor }: { workspaceId: string, editor: Editor | undefined }) {
    const params = useSearchParams()
    return <Box className="bg-zinc-900 h-full">
        <Tabs.Root defaultValue={params.get('sidebarCurrentActiveTab') ?? "files"} className="h-full">
            <Tabs.List>
                <Tabs.Trigger value="files"><FolderOpenIcon className="size-5"></FolderOpenIcon></Tabs.Trigger>
                <Tabs.Trigger value="bookmarks"><BookmarkIcon className="size-5"></BookmarkIcon></Tabs.Trigger>
                <Tabs.Trigger value="document"><DocumentIcon className="size-5" /></Tabs.Trigger>
                <Tabs.Trigger value="text"><PencilIcon className="size-5"></PencilIcon></Tabs.Trigger>
                <Tabs.Trigger value="websites"><GlobeAmericasIcon className="size-5"></GlobeAmericasIcon></Tabs.Trigger>
                <Tabs.Trigger value="actions"><Cog8ToothIcon className="size-5"></Cog8ToothIcon></Tabs.Trigger>
            </Tabs.List>

            <Box pt="3" className="h-full">
                <Tabs.Content value="files" className="p-4">
                    <Files workspaceId={workspaceId}></Files>
                </Tabs.Content>
                <Tabs.Content value="bookmarks">
                    <Bookmarks workspaceId={workspaceId} editor={editor}></Bookmarks>
                </Tabs.Content>
                <Tabs.Content value="document" className="h-full">
                    <PDFWindow></PDFWindow>
                </Tabs.Content>
                <Tabs.Content value="actions">
                    <Settings></Settings>
                </Tabs.Content>
                <Tabs.Content value='websites' className="h-full">
                    <EmbeddedWebsites></EmbeddedWebsites>
                </Tabs.Content>
                <Tabs.Content value='text' className="h-full p-4">
                    <TextEditor />
                </Tabs.Content>
            </Box>
        </Tabs.Root>
    </Box>
}
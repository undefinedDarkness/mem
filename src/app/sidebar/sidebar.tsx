import { Box, Flex, Tabs } from "@radix-ui/themes";
import { FolderOpenIcon, BookmarkIcon, DocumentIcon } from '@heroicons/react/16/solid'
import Files from "./files";
import { Editor } from "tldraw";
import Bookmarks from "./bookmarks";
import PDFWindow from "../dashboard/pdf";

export function Sidebar({ workspaceId, editor }: { workspaceId: string, editor: Editor | undefined }) {
    return <Box className="bg-zinc-900 h-full">
        <Tabs.Root defaultValue="files" className="h-full">
            <Tabs.List>
                <Tabs.Trigger value="files"><FolderOpenIcon className="size-5"></FolderOpenIcon></Tabs.Trigger>
                <Tabs.Trigger value="bookmarks"><BookmarkIcon className="size-5"></BookmarkIcon></Tabs.Trigger>
                <Tabs.Trigger value="document"><DocumentIcon className="size-5" /></Tabs.Trigger>
            </Tabs.List>

            <Box pt="3" className="h-full">
                <Tabs.Content value="files" className="p-2">
                    <Files workspaceId={workspaceId}></Files>
                </Tabs.Content>
                <Tabs.Content value="bookmarks">
                    <Bookmarks workspaceId={workspaceId} editor={editor}></Bookmarks>
                </Tabs.Content>
                <Tabs.Content value="document" className="h-full">
                    <PDFWindow></PDFWindow>
                </Tabs.Content>
            </Box>
        </Tabs.Root>
    </Box>
}
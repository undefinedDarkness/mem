import { Box, Flex, Tabs } from "@radix-ui/themes";
import { FolderOpenIcon, BookmarkIcon } from '@heroicons/react/16/solid'
import Files from "./files";
import { Editor } from "tldraw";
import Bookmarks from "./bookmarks";

export function Sidebar({ workspaceId, editor }: { workspaceId: string, editor: Editor | undefined }) {
    return <Box className="bg-zinc-900 h-full">
        <Tabs.Root defaultValue="files">
            <Tabs.List>
                <Tabs.Trigger value="files"><FolderOpenIcon className="size-5"></FolderOpenIcon></Tabs.Trigger>
                <Tabs.Trigger value="bookmarks"><BookmarkIcon className="size-5"></BookmarkIcon></Tabs.Trigger>
            </Tabs.List>

            <Box pt="3">
                <Tabs.Content value="files" className="p-2">
                    <Files workspaceId={workspaceId}></Files>
                </Tabs.Content>
                <Tabs.Content value="bookmarks">
                    <Bookmarks workspaceId={workspaceId} editor={editor}></Bookmarks>
                </Tabs.Content>
            </Box>
        </Tabs.Root>
    </Box>
}
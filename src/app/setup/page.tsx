'use client'
// uses javascript to store result in IDB
// and for the directory picker to run
import { Card, Flex, Grid, Heading, Text, TextField, Button } from "@radix-ui/themes";
import { HomeIcon } from "@heroicons/react/16/solid";
import { set, update } from 'idb-keyval'
import { IconPicker } from "./iconpicker";
import { DirectoryPicker } from "./directorypicker";
import Cookies from 'js-cookie'


export interface Workspace {
    id: string,
    icon: string,
    directoryId: string
}

export default function Setup() {

    const workspaceId = crypto.randomUUID()

    /**
     * Let's assume this is a fresh setup!
     * So everything is new, we don't have to check for any existing state, but we shouldn't
     * override anything
     */

    const onSubmit = async (e: FormData) => {
        const workspace: Workspace = {
            id: e.get('workspaceId') as string,
            icon: e.get('workspaceIcon') as string,
            directoryId: e.get('workspaceDirectory') as string
        }

        set(workspace.id, workspace)
        update('workspaces', (wks: Workspace[] | undefined) => {
            wks?.push(workspace)
            return wks ?? [workspace]
        })
        set('currentWorkspaceId', workspace.id)
        Cookies.set('currentWorkspaceId', workspace.id)
    }

    return <main className="w-[100vw] h-[100vh]">
        <Flex direction={"column"} justify={"center"} className="h-full">
            <Flex direction={"row"} justify={"center"} className="w-full">
                <Card>
                    <Flex px="4" py="2" gap="4" direction={"column"}>
                        <Heading>Setup</Heading>
                        <form action={onSubmit}>
                            <Grid columns="2" gap="3">
                                <input type="text" name="workspaceId" value={workspaceId} hidden readOnly />

                                <label htmlFor="workspaceIcon" className="flex items-center"><Text>Icon</Text></label>
                                <IconPicker></IconPicker>

                                <label htmlFor="workspaceName" className="flex items-center"><Text>Workspace Name</Text></label>
                                <TextField.Root required minLength={10} pattern="[a-zA-Z0-9 ]+" size="3" name="workspaceName"></TextField.Root>

                                <label htmlFor="workspaceDirectory" className="flex items-center"><Text>Directory</Text></label>
                                <DirectoryPicker></DirectoryPicker>

                                <div></div><Button type="submit" color="green" className="cursor-pointer">Submit</Button>
                            </Grid>
                        </form>
                    </Flex>
                </Card>
            </Flex>
        </Flex>
    </main>
}
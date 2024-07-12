'use client'
// uses javascript to store result in IDB
// and for the directory picker to run
import { Card, Flex, Grid, Heading, Text, TextField, Button, Select } from "@radix-ui/themes";
import { HomeIcon } from "@heroicons/react/16/solid";
import { set, update, get } from 'idb-keyval'
import { IconPicker } from "./iconpicker";
import { useState, useEffect } from "react";
import { DirectoryPicker } from "./directorypicker";
import Cookies from 'js-cookie'
import { nanoid } from "nanoid";
import { Workspace } from "../../utils/db";


export default function Setup() {

    const [ currentWorkspaces, setCurrentWorkspaces ] = useState<Set<Workspace>>(new Set([]));
    useEffect(() => {
        (async () => { setCurrentWorkspaces(await get('workspaces') ?? new Set([])) })()

        return () => setCurrentWorkspaces(new Set([]))
    }, [])

    /**
     * Let's assume this is a fresh setup!
     * So everything is new, we don't have to check for any existing state, but we shouldn't
     * override anything
     */

    const onSubmit = async (e: FormData) => {
        const id = e.get('workspaceId') as string
        const workspace: Workspace = {
            id: id == 'new-workspace' ? nanoid() : id,
            icon: e.get('workspaceIcon') as string,
            directoryId: e.get('workspaceDirectory') as string,
            directoryPath: e.get('workspaceDirectoryPath') as string,
            name: e.get('workspaceName') as string
        }

        set(workspace.id, workspace)
        set('workspaces', new Set([...currentWorkspaces, workspace]))
        set('currentWorkspaceId', workspace.id)
        Cookies.set('currentWorkspaceId', workspace.id)
    }

    return <main className="w-[100vw] h-[100vh]">
        <Flex direction={"column"} justify={"center"} className="h-full">
            <Flex direction={"row"} justify={"center"} className="w-full">
                <Card className="max-w-[40vw]">
                    <Flex px="4" py="2" gap="4" direction={"column"}>
                        <Heading>Setup</Heading>
                        <form action={onSubmit}>
                            <Grid columns="2" gap="3">
                                <label htmlFor="workspaceId" className="flex items-center"><Text>Workspace</Text></label>
                                {/* <input type="text" name="workspaceId" value={workspaceId} hidden readOnly /> */}
                                <Select.Root name="workspaceId" defaultValue={"new-workspace"}>
                                    <Select.Trigger />
                                    <Select.Content>
                                        <Select.Group>
                                            {
                                                [...currentWorkspaces].map(workspace => workspace.id && <Select.Item key={workspace.id} value={workspace.id}>{workspace.name ?? "MISSING NAME"}</Select.Item>)
                                            } 
                                            <Select.Item value={"new-workspace"}>New Workspace</Select.Item>
                                        </Select.Group>
                                    </Select.Content>
                                </Select.Root>

                                <label htmlFor="workspaceIcon" className="flex items-center"><Text>Icon</Text></label>
                                <IconPicker name="workspaceIcon"></IconPicker>

                                <label htmlFor="workspaceName" className="flex items-center"><Text>Workspace Name</Text></label>
                                <TextField.Root required  pattern="[a-zA-Z0-9 ]+" size="3" name="workspaceName"></TextField.Root>

                                <label htmlFor="workspaceDirectory" className="flex items-center"><Text>Directory</Text></label>
                                <DirectoryPicker></DirectoryPicker>

                                <label htmlFor="workspaceDirectoryPath" className="flex items-center"><Text>Directory Path<sup>*</sup></Text></label>
                                <TextField.Root placeholder="C:/Users/USERNAME/..." required minLength={10} size="3" name="workspaceDirectoryPath"></TextField.Root>

                                <Text className="col-span-2" wrap="wrap" size={"1"}>*: Used only for allow files to be opened with local applications eg: (word, powerpoint), Please use a full path like C:/Users/USERNAME/... or /home/USERNAME/...</Text>
                                <div></div><Button type="submit" color="green" className="cursor-pointer">Submit</Button>
                            </Grid>
                        </form>
                    </Flex>
                </Card>
            </Flex>
        </Flex>
    </main>
}
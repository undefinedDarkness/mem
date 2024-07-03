'use client'
import { XMarkIcon } from "@heroicons/react/16/solid";
import { Flex, Grid, Heading, IconButton, Popover } from "@radix-ui/themes";
import { PossibleIcons, lookupIcon } from "heroicons-lookup";
import { useMemo, useState } from "react";

export function IconPicker({ ...props }) {
    const [chosenIcon, setChosenIcon] = useState<PossibleIcons>(`HomeIcon`);
    const chosenIconComponent = useMemo(() => {
        const Icon = lookupIcon(chosenIcon, 'mini');
        return <Icon className="size-5"></Icon>;
    }, [chosenIcon]);
    return <>
        <input {...props} type="text"  value={chosenIcon} hidden readOnly />
        <Popover.Root>
            <Popover.Trigger>
                <IconButton className="cursor-pointer">
                    {chosenIconComponent}
                </IconButton>
            </Popover.Trigger>
            <Popover.Content>
                <Flex justify={"between"} pt="2">
                    <Heading size={"4"}>Icons</Heading>
                    <Popover.Close>
                        <XMarkIcon className="size-5"></XMarkIcon>
                    </Popover.Close>
                </Flex>
                <Grid columns={"5"} gap="2" rows="3">
                    {[
                        "HomeIcon",
                        "AcademicCapIcon",
                        "FolderIcon",
                        "ArchiveBoxIcon",
                        "BeakerIcon",
                        "BookOpenIcon",
                        "BuildingLibraryIcon",
                        "CameraIcon",
                        "CubeIcon",
                        "FlagIcon",
                        "GlobeAmericasIcon",
                        "MapIcon",
                        "LanguageIcon",
                        "MapPinIcon",
                        "MusicalNoteIcon"
                    ].map(r => {
                        const Icon = lookupIcon(r as PossibleIcons, 'mini');
                        return <Icon key={r} className="cursor-pointer size-10 hover:bg-[rgba(255,255,255,0.1)] p-2 rounded-md" onClick={_ => setChosenIcon(r as PossibleIcons)}></Icon>;
                    })}
                </Grid>
            </Popover.Content>
        </Popover.Root></>;
}

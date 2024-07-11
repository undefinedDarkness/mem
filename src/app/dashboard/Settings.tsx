import { Flex, Heading, TextField, Text, Button, IconButton } from "@radix-ui/themes";
import { GlobeAsiaAustraliaIcon, PlusIcon } from "@heroicons/react/16/solid";
import { get, update } from "idb-keyval";
import { FormEvent, ReactNode, useEffect, useState } from "react";

export interface WebsiteDescription {
    url: string,
    favicon: Blob,
    name: string
}

export default function Settings() {

    const [currentWebsites, setCurrentWebsites] = useState<ReactNode[]>([]);
    const WebsiteEl = ({ website }: { website: WebsiteDescription }) => <li key={website.url} className="space-x-4">
        <img src={URL.createObjectURL(website.favicon)} className="size-5 inline-block" alt={`Favicon for ${website.name}`} />
        <Text>{website.name}</Text>
    </li>

    useEffect(() => {
        get<WebsiteDescription[]>('embedded-websites').then(websites => {
            setCurrentWebsites(websites?.map(website => <WebsiteEl website={website}></WebsiteEl>) ?? [])
        })

        return () => setCurrentWebsites([])
    }, [])

    const onSubmit = async (ev: FormData) => {
        const url = ev.get('url') as string
        const pretendName = (new URL(url)).hostname.replace(/www\.?/, ``)
        const faviconDataURL = await fetch(`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`).then(res => res.blob())
        const websiteDesc: WebsiteDescription = { url, favicon: faviconDataURL, name: pretendName }
        await update<WebsiteDescription[]>('embedded-websites', websites => [...(websites ?? []), websiteDesc])
        setCurrentWebsites([<WebsiteEl website={websiteDesc}></WebsiteEl>, ...currentWebsites])
    }

    return <article><Flex gap="3" p="4" className="w-full" direction={"column"}>
        <section className="space-y-4">
            <Heading>Embedded Website</Heading>
            <ul>
                {currentWebsites}
            </ul>
            <form action={onSubmit}>
                <Flex gap="2">
                    <TextField.Root name="url" required minLength={10} className="flex-1">
                        <TextField.Slot>
                            <GlobeAsiaAustraliaIcon className="size-5"></GlobeAsiaAustraliaIcon>
                        </TextField.Slot>
                    </TextField.Root>
                    <IconButton><PlusIcon className="size-5"></PlusIcon></IconButton>
                </Flex></form>
        </section>
    </Flex></article>
}
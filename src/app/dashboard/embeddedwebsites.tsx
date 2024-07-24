import { IconButton, Tabs, TextField } from "@radix-ui/themes"
import { useState, ReactNode, useEffect, memo, useRef } from "react"
import { get, update } from "idb-keyval"
export interface WebsiteDescription {
    url: string,
    favicon: Blob,
    name: string
}

async function newWebsite(url: string) {
    const pretendName = (new URL(url)).hostname.replace(/www\.?/, ``)
    const faviconDataURL = await fetch(`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`).then(res => res.blob()).catch(err =>{
        console.error(`[new-website/favicon] ${err}`)
        return new Blob([`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='currentColor' class='size-6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z' /%3E%3C/svg%3E%0A`], { type: '' })
    })
    const websiteDesc: WebsiteDescription = { url, favicon: faviconDataURL, name: pretendName }
    await update<WebsiteDescription[]>('embedded-websites', websites => [...(websites ?? []), websiteDesc])
    return websiteDesc
}
import { Cross1Icon, Cross2Icon, PlusIcon } from "@radix-ui/react-icons"
import { nanoid } from "nanoid"
const WebsiteFrame = ({ website }: { website: WebsiteDescription }) => {
    return <Tabs.Content value={website.url} forceMount className='h-full w-full pt-4 data-[state=inactive]:hidden'>
        <iframe width="100%" height="100%" src={website.url}></iframe>
    </Tabs.Content>
}
export default function EmbeddedWebsites() {

    const [websiteButtons, setWebsiteButtons] = useState<ReactNode[]>([])
    const [websiteIframes, setWebsiteIframes] = useState<ReactNode[]>([])
    const [websites, setWebsites] = useState<WebsiteDescription[]>([])

    useEffect(() => {
        try {
        setWebsiteButtons(websites?.map(w => <Tabs.Trigger value={w.url} key={nanoid()}>
            <img src={URL.createObjectURL(w.favicon)} className="size-5" alt="" />
        </Tabs.Trigger>) ?? [])
        setWebsiteIframes(websites?.map(w => <WebsiteFrame key={nanoid()} website={w}></WebsiteFrame>) ?? [])
        } catch (err) {}

        return () => {
            setWebsiteButtons([])
            setWebsiteIframes([])
        }
    }, [websites])

    useEffect(() => {
        get<WebsiteDescription[]>('embedded-websites').then(v => v && setWebsites(v))

        return () => setWebsites([])
    }, [])

    const websiteUrlEntry = useRef<HTMLInputElement>(null)

    return <Tabs.Root className="h-full px-1" >
        <Tabs.List className="flex flex-wrap">

            <div className="flex gap-2 p-2">
                <TextField.Root ref={websiteUrlEntry} placeholder="https://"></TextField.Root>
                <IconButton variant="soft" onClick={async () => setWebsites([...websites, await newWebsite((websiteUrlEntry.current as HTMLInputElement).value)])}><PlusIcon className="size-5"></PlusIcon></IconButton>
                {/* <IconButton variant="soft" onClick={async () => setWebsites(websites.filter(w => w.url !== (websiteUrlEntry.current as HTMLInputElement).value))}><Cross2Icon className="size-5"></Cross2Icon></IconButton> */}
            </div>            {
                websiteButtons
            }
        </Tabs.List>

        {websiteIframes}
    </Tabs.Root>
}
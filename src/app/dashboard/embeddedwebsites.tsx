import { Tabs } from "@radix-ui/themes"
import { useState, ReactNode, useEffect, memo } from "react"
import { get } from "idb-keyval"

import { WebsiteDescription } from "./Settings"
import { nanoid } from "nanoid"
import { StaticIframe } from "../utils/tinycomponents"

export default function EmbeddedWebsites() {

    const [websiteButtons, setWebsiteButtons] = useState<ReactNode[]>([])
    const [websiteIframes, setWebsiteIframes] = useState<ReactNode[]>([])

    const WebsiteFrame = ({ website }: { website: WebsiteDescription }) => {
        return <Tabs.Content value={website.url} forceMount className='h-full w-full pt-4 data-[state=inactive]:hidden'>
                <iframe width="100%" height="100%" src={website.url}></iframe>
            </Tabs.Content>
    }

    useEffect(() => {
        get<WebsiteDescription[]>('embedded-websites').then(websites => {
            setWebsiteButtons(websites?.map(w => <Tabs.Trigger  value={w.url}>
                <img src={URL.createObjectURL(w.favicon)} className="size-5" alt="" />
            </Tabs.Trigger>) ?? [])
            setWebsiteIframes(websites?.map(w => <WebsiteFrame website={w}></WebsiteFrame>) ?? [])
        })

        return () => {
            setWebsiteButtons([])
            setWebsiteIframes([])
        }
    }, [])

    return <Tabs.Root className="h-full" >
        <Tabs.List>
            {
                websiteButtons
            }
        </Tabs.List>

            { websiteIframes }
    </Tabs.Root>
}
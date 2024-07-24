import { Select } from "@radix-ui/themes";
import { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { get, set } from 'idb-keyval'

export default function FontPicker({ editor }: { editor: Editor}) {
    const [systemFonts, setFonts] = useState<string[]>([]);

    const queryFonts = (v: boolean) => {
        if (!v || !('queryLocalFonts' in window) || systemFonts.length > 0) return;
        try {
            (window as any).queryLocalFonts().then((fonts: any) => {
                const fontsList = [...new Set<string>(fonts.map((fnt: any) => fnt.family as string))]
                setFonts(fontsList)
                set('system-fonts', fontsList) 
            })
        } catch (err) {
            console.error(`[font-picker] ${err}`)
        }
    }

    useEffect(() => {
        get('system-fonts').then(v => v && setFonts(v))
    }, [])


    return <Select.Root defaultValue="system-ui" onOpenChange={queryFonts} onValueChange={e => editor.chain().focus().setFontFamily(e).run()}>
        <Select.Trigger></Select.Trigger>
        <Select.Content>
            <Select.Item value="system-ui">System UI</Select.Item>
            <Select.Item value="sans-serif">Sans Serif</Select.Item>
            {systemFonts.map(fntName => <Select.Item key={fntName} value={fntName} style={{ fontFamily: fntName }}>
                {fntName}
                </Select.Item>)}
        </Select.Content>
    </Select.Root>
}
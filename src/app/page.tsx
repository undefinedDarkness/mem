'use client'
import CanvasEditor from "./editor/Editor";
import { LayoutContainer } from "./dashboard/layoutcontainer";
import { Sidebar } from "./sidebar/sidebar";
import Cookies from "js-cookie";
import { Editor } from "tldraw";
import { useEffect, useState } from "react";
import { get } from "idb-keyval";
import { Workspace } from "./utils/db";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";

import 'katex/dist/katex.min.css'
import renderMathInElement from 'katex/contrib/auto-render';

export default function Home() {

  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [editor, setEditor] = useState<Editor | undefined>(undefined)

  useEffect(() => {
    (async () => {
      const cookieId = Cookies.get('currentWorkspaceId')
      if (cookieId)
        setWorkspaceId(cookieId)
      else {
        const workspaces = await get<Set<Workspace>>('workspaces') ?? new Set([])
        // console.log(workspaces)
        if (workspaces.size >= 1) {
          setWorkspaceId(workspaces.values().next().value.id)
        } else {
          console.error(`[/] No workspace found!`)
          useRouter().push('/setup')
        }
      }
    })()
  })

  useEffect(() => {
    // console.log(`wtf`)
    const id = setInterval(() => {
      console.log(`[math] Updated expressions`)
      renderMathInElement(document.body, {
        displayMode: false,
        delimiters: [
          {left: "\\(", right: "\\)", display: false},
        ]
      })
    }, 30000)

    return () => {
      clearInterval(id)
    }
  }, [  ])

  return (
    <main>
      <LayoutContainer layout="sidepanel" mainCanvas={<CanvasEditor workspaceId={workspaceId} setEditor={setEditor}></CanvasEditor>} sideBar={<Sidebar workspaceId={workspaceId!} editor={editor}></Sidebar>}></LayoutContainer>
      <Toaster></Toaster>
    </main>
  );
}

'use client'
import CanvasEditor from "./dashboard/canvas/Editor";
import { LayoutContainer } from "./dashboard/layoutcontainer";
import { Sidebar } from "./dashboard/sidebar/sidebar";
import Cookies from "js-cookie";
import { debounce, Editor } from "tldraw";
import { useEffect, useState } from "react";
import { get, update } from "idb-keyval";
import { Workspace } from "../utils/db";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { initBroadcastChannel } from "@/utils/bc";


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

    initBroadcastChannel()

    return () => { }
  }, [])



  return (<>
    <main>
      {/* <PrimeReactProvider> */}
      <LayoutContainer layout="sidepanel" mainCanvas={<CanvasEditor workspaceId={workspaceId} setEditor={setEditor}></CanvasEditor>} sideBar={<Sidebar workspaceId={workspaceId!} editor={editor}></Sidebar>}></LayoutContainer>
      <Toaster position="bottom-left"></Toaster>
      {/* </PrimeReactProvider> */}
    </main>
  </>);
}

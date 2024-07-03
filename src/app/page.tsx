'use client'
import CanvasEditor from "./editor/Editor";
import { LayoutContainer } from "./dashboard/layoutcontainer";
import PDFWindow from "./dashboard/pdf";
import { Sidebar } from "./sidebar/sidebar";
import Cookies from "js-cookie";
import { Editor } from "tldraw";
import { useEffect, useState } from "react";
import { get } from "idb-keyval";
import { Workspace } from "./setup/page";

export default function Home() {

  const [ workspaceId, setWorkspaceId] = useState<string | undefined>();
  const [ editor, setEditor ] = useState<Editor | undefined>(undefined)

  useEffect(() => {
    (async () => {
      const cookieId = Cookies.get('currentWorkspaceId')
      if (cookieId)
        setWorkspaceId(cookieId)
      else {
        const workspaces = await get<Workspace[]>('workspaces') ?? []
        if (workspaces.length > 1) {
          setWorkspaceId(workspaces.pop()!.id)
        } else {
          window.location.href = '/setup'
        }
      }
    })()
  })

  return (
   <main>
      <LayoutContainer layout="sidepanel" mainCanvas={<CanvasEditor workspaceId={workspaceId} setEditor={setEditor}></CanvasEditor>} sideBar={<Sidebar workspaceId={workspaceId!} editor={editor}></Sidebar>}></LayoutContainer>
    </main>
  );
}

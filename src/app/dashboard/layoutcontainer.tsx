'use client'

import { cookies } from 'next/headers'
import { ReactElement, ReactNode } from 'react'
import { Allotment } from 'allotment'
// import { Rnd } from 'react-rnd'
import "allotment/dist/style.css";

export function LayoutContainer({ layout, sideBar, mainCanvas, ...props }: { layout: "sidepanel" | "floatingwindow", sideBar: ReactNode, mainCanvas: ReactNode }) {

    const layoutComponent = layout == 'sidepanel' ?
        <Allotment className='!w-[100vw] !h-[100vh] fixed inset-0 overflow-hidden'>
            <Allotment.Pane preferredSize={"15%"}>{sideBar}</Allotment.Pane>
            <Allotment.Pane className='w-full h-full'>{mainCanvas}</Allotment.Pane>
        </Allotment> :
        <div className='w-[100vw] h-[100vh] overflow-hidden'>
            {/* <Rnd default={{ width: '30vw', height: '50vh', x: 50, y: 50 }} className="z-10 p-2 border rounded-md [&:not(:hover)]:border-transparent">
                {sideBar}
            </Rnd> */}
            <div className='fixed inset-0'>{mainCanvas}</div>
        </div>

    return layoutComponent

}
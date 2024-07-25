import { Allotment } from 'allotment'
import "allotment/dist/style.css";
import { ReactNode } from 'react';

export function LayoutContainer({ layout, sideBar, mainCanvas, ...props }: { layout: "sidepanel" | "floatingwindow", sideBar: ReactNode, mainCanvas: ReactNode }) {

    const layoutComponent = layout == 'sidepanel' ?
        <Allotment className='!w-[100vw] !h-[100vh] fixed inset-0 overflow-hidden'>
            <Allotment.Pane preferredSize={"15%"}>{sideBar}</Allotment.Pane>
            <Allotment.Pane className='w-full h-full'>{mainCanvas}</Allotment.Pane>
        </Allotment> :
        <div className='w-[100vw] h-[100vh] overflow-hidden'>
            <div className='fixed inset-0'>{mainCanvas}</div>
        </div>

    return layoutComponent

}
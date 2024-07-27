import { getWorkspaceDirectory } from "@/utils/db";
import { getHandleFromPath } from "@/utils/fs";
import { nanoid } from "nanoid";
import { TLAssetId, AssetRecordType, getHashForString, MediaHelpers, TLAsset } from "tldraw";

// TODO: Should this be done in the service worker too????
async function saveFile(file: File) {
    const id = nanoid()
    const objectName = `${id}-${file.name}`.replaceAll(/[^a-zA-Z0-9.]/g, '-')

    const { fileHandle } = await getHandleFromPath(`assets/${objectName}`, undefined, true)
    await fileHandle!.createWritable().then(writer => {
        file.stream()
            .pipeTo(writer)
    })

    const url = `${window.location.href}/fsproxy/assets/${objectName}` 
    console.log(`[canvas/fs] Saving to ${url}`)
    return url
}



export default async function saveFileToFilesystem({ file }: { type: 'file', file: File }) {
    const url = (await saveFile(file))

    const assetId: TLAssetId = AssetRecordType.createId(getHashForString(url))

    let size: {
        w: number
        h: number
    }
    let isAnimated: boolean
    let shapeType: 'image' | 'video'

    //[c]
    if (MediaHelpers.isImageType(file.type)) {
        shapeType = 'image'
        size = await MediaHelpers.getImageSize(file)
        isAnimated = await MediaHelpers.isAnimated(file)
    } else {
        shapeType = 'video'
        isAnimated = true
        size = await MediaHelpers.getVideoSize(file)
    }
    //[d]
    const asset: TLAsset = AssetRecordType.create({
        id: assetId,
        type: shapeType,
        typeName: 'asset',
        props: {
            name: file.name,
            src: url,
            w: size.w,
            h: size.h,
            fileSize: file.size,
            mimeType: file.type,
            isAnimated,
        },
    })

    return asset
}
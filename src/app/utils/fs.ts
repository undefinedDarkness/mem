import { Editor } from 'tldraw';
import { getWorkspaceDirectory } from './db'
import toast from 'react-hot-toast';

export async function getFileHandleFromPath(path: string, dir: FileSystemDirectoryHandle) {
    try {
      // Get the root directory handle
      const root = dir;

      // Split the path, but keep the last segment (file name) as is
      const segments = path.split('/');
      const fileName = segments.pop(); // Remove and store the last segment
      if (!fileName) throw new Error("Path does not contain string");
      const directories = segments.filter(segment => segment.length > 0);
      
      let currentHandle = root;
      
      // Traverse the directory structure
      for (const segment of directories) {
        currentHandle = await currentHandle.getDirectoryHandle(segment, { create: false });
      }
      
      // Get the file handle for the file name (which may contain spaces)
      const fileHandle = await currentHandle.getFileHandle(fileName, { create: false });
      
      return fileHandle;
    } catch (error) {
      console.error('Error opening file:', error);
      throw error;
    }
  }

  export function toReadableStream(str: any) {
    return new ReadableStream({
      start: (controller) => {
        controller.enqueue(str);
        controller.close();
      }
    })
  }

export async function saveToFilesystem(editor: Editor) {
    const dir = await getWorkspaceDirectory();
    const fileHandle = await dir?.handle?.getFileHandle('Drawing.tldraw', { create: true });

    if (fileHandle) {
      // TODO: Attempt offloading
      const writable = await fileHandle.createWritable();
      const snapshot = JSON.stringify(editor.getSnapshot());
      toast.promise(
        toReadableStream(snapshot)
          .pipeThrough(new TextEncoderStream())
          .pipeThrough(new CompressionStream('gzip'))
          .pipeTo(writable),
        {
          loading: 'Saving...',
          success: `Saved`,
          error: (err: Error) => {
            console.error(err);
            return `Encountered error while saving, ${err.toString()}`;
          }
        });
    } else {
      // toast.error("Failed to get file handle to Drawing.tldraw in works")
    }
  }
import { Editor } from 'tldraw';
import { getWorkspaceDirectory } from './db'
import toast from 'react-hot-toast';

export function dirname(path: string) {
  // Remove trailing slashes
  path = path.replace(/[/\\]+$/, '');
  
  // Find the last occurrence of / or \
  const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
  
  if (lastSlash === -1) {
      // No slash found, return '.' for current directory
      return '.';
  } else if (lastSlash === 0) {
      // Slash is at the beginning, return '/' for root directory
      return '/';
  } else {
      // Return everything before the last slash
      return path.slice(0, lastSlash);
  }
}

export async function getHandleFromPath(path: string, dir?: FileSystemDirectoryHandle, create = false) {
  try {
    // Get the root directory handle
    const root = dir ?? (await getWorkspaceDirectory())?.handle!;

    // Split the path, but keep the last segment (file name) as is
    const segments = path.split('/');
    const lastSegment = segments.pop() ?? ''; // Remove and store the last segment
    // if (!fileName) throw new Error("Path does not contain filename");
    const directories = segments.filter(segment => segment.length > 0);


    let currentHandle = root;

    // Traverse the directory structure
    for (const segment of directories) {
      currentHandle = await currentHandle.getDirectoryHandle(segment, { create });
    }

    // Get the file handle for the file name (which may contain spaces)
    
    // 1. No file specified, return last directory found
    // example: A/B/C/
    if (!lastSegment) return { parentDir: currentHandle, handle: currentHandle }

    try {
      // 2. File exists, return it
      // example: A/B/C/D (D is a file)
      return { parentDir: currentHandle, handle: await currentHandle.getFileHandle(lastSegment, { create }) };
    } catch {
      try {
        // 3. File does not exist, but a directory does
        // example: A/B/C/D (D is a folder)
        return { parentDir: currentHandle, handle: await currentHandle.getDirectoryHandle(lastSegment, { create }) };
      } catch {
        // 4. File and directory do not exist
        // example: A/B/C/D (D doesn't exist)
        return { parentDir: currentHandle, handle: undefined }
      }
    }


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


export async function saveCanvasToFilesystem(editor: Editor) {
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
        loading: '[c] Saving...',
        success: `[c] Saved`,
        error: (err: Error) => {
          console.error(err);
          return `[c] Encountered error while saving, ${err.toString()}`;
        }
      });
  } else {
    // toast.error("Failed to get file handle to Drawing.tldraw in works")
  }
}
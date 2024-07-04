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
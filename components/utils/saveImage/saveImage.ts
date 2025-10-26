import { File, Paths } from 'expo-file-system';

export const saveImage = (uri: string) => {
    const filename = uri.split('/').pop();

    if (!filename) {
        return null
    }

    try {
        const originalFile = new File(uri);
        const copiedFile = new File(Paths.document, filename)

        originalFile.copy(copiedFile)

        return copiedFile.uri;

    } catch (err) {
        console.error('Error copying file:', err);
        return null
    }
};
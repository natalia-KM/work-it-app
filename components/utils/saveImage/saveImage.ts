import { File, Paths } from 'expo-file-system';

const EXERCISE_IMAGE_PREFIX = 'exercise-image'

const getFileExtension = (uri: string) => {
    const filename = uri.split('?')[0].split('/').pop()
    const extension = filename?.split('.').pop()

    if (!extension || extension === filename) return 'jpg'

    return extension.toLowerCase()
}

const getUniqueImageFilename = (uri: string) => {
    const extension = getFileExtension(uri)
    return `${EXERCISE_IMAGE_PREFIX}-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
}

export const isStoredImage = (uri?: string | null) => {
    return Boolean(uri?.startsWith(Paths.document.uri))
}

export const saveImage = (uri: string) => {
    if (isStoredImage(uri)) {
        return uri
    }

    try {
        const originalFile = new File(uri);
        const copiedFile = new File(Paths.document, getUniqueImageFilename(uri))

        originalFile.copy(copiedFile)

        return copiedFile.uri;

    } catch (err) {
        console.error('Error copying file:', err);
        return null
    }
};

export const deleteStoredImage = (uri?: string | null) => {
    if (!uri || !isStoredImage(uri)) return

    try {
        const image = new File(uri)

        if (image.exists) {
            image.delete()
        }
    } catch (err) {
        console.error('Error deleting stored image:', err);
    }
}

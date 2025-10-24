const exerciseImages: Record<string, any> = {
    placeholder: require('@/assets/images/exercises/placeholder-image.png')
};

export const getImageSource = (photo?: string | null) => {
    if (!photo) return exerciseImages.placeholder;
    if (photo.startsWith('file://') || photo.startsWith('http')) {
        return { uri: photo };
    }
    return exerciseImages[photo] ?? exerciseImages.placeholder;
};
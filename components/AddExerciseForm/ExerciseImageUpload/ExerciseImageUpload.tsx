import { Button, Card, Icon, IconButton, Text } from 'react-native-paper'
import { View } from '@/components/Themed'
import { Image, StyleSheet } from 'react-native'
import { useController } from 'react-hook-form'
import { useState } from 'react'
import { AddExerciseFormValues } from '@/components/AddExerciseForm/AddExerciseValidationSchema'
import * as ImagePicker from 'expo-image-picker';
import { getImageSource } from '@/components/utils/getImageSource'

export const ExerciseImageUpload = () => {
    const { field: { value, onChange } } = useController<AddExerciseFormValues>({ name: 'photo' })

    const [preview, setPreview] = useState<string | null>(value as string ?? null);

    const pickMedia = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1
        });

        if (result.canceled) return;

        const asset = result.assets[0];

        setPreview(asset.uri);
        onChange(asset.uri);
    }

    const clearSelection = () => {
        setPreview(null)
        onChange(null)
    }

    return (
        <Card mode={'contained'} style={styles.card}>
            <Card.Content style={styles.cardContent}>
                {preview ? (
                    <View style={styles.previewContainer}>
                        <Image
                            source={getImageSource(preview)}
                            style={styles.imagePreview}
                            resizeMode="cover"
                        />

                        <IconButton
                            mode={'outlined'}
                            icon="close"
                            size={20}
                            onPress={clearSelection}
                            style={styles.removeButton}
                        />
                    </View>
                ) : (
                    <>
                        <Icon
                            source="cloud-arrow-up-outline"
                            size={48}
                        />

                        <View style={styles.cardText}>
                            <Text>Upload Exercise Cover Image</Text>
                        </View>

                        <Button icon={'tray-arrow-up'} mode={'contained'} onPress={pickMedia}>
                            Select File
                        </Button>
                    </>
                )}
            </Card.Content>
        </Card>
    )
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'transparent'
    },
    cardText: {
        alignItems: 'center'
    },
    cardContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    previewContainer: {
        position: 'relative'
    },
    imagePreview: {
        width: 200,
        height: 200,
        borderRadius: 12
    },
    removeButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: 'white'
    }
});

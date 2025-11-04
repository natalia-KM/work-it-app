import { Button, Modal, Portal } from 'react-native-paper'
import { Pressable, StyleSheet } from 'react-native';
import { View } from '@/components/Themed'

interface ColorPickerProps {
    isOpen: boolean
    onConfirm: (color: string) => void
    selectedColor: string
    setSelectedColor: (color: string) => void
}

const COLORS = [
    '#FF0000',
    '#FFA500',
    '#FFFF00',
    '#00FF00',
    '#0000FF',
    '#4B0082',
    '#8B00FF',
    '#0C0908'
]

export const ColorPicker = ({
    isOpen,
    onConfirm,
    selectedColor,
    setSelectedColor
}: ColorPickerProps) => {

    return (
        <Portal>
            <Modal
                visible={isOpen}
                contentContainerStyle={styles.modal}
                dismissable={false}
            >
                <View style={styles.colorsContainer}>
                    {COLORS.map((color) => (
                        <Pressable
                            key={color}
                            style={{
                                width: 45,
                                height: 45,
                                borderRadius: 25,
                                backgroundColor: color,
                                margin: 5,
                                borderWidth: 2,
                                borderColor: color === selectedColor ? 'black' : 'transparent'
                            }}
                            onPress={() => setSelectedColor(color)}
                        />
                    ))}
                </View>
                <Button
                    mode={'outlined'}
                    onPress={() => onConfirm(selectedColor)}
                >
                    OK
                </Button>
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    modal: {
        backgroundColor: 'white',
        padding: 30,
        margin: 30,
        borderRadius: 12,
        gap: 15
    },
    colorsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5
    }
});
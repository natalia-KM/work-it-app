import { Button, Modal, Portal } from 'react-native-paper'
import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { AddWorkoutForm } from '@/components/AddWorkoutForm/AddWorkoutForm'
import { palette } from '@/constants/theme'

interface AddWorkoutButtonProps {
    compact?: boolean
}

export const AddWorkoutButton = ({ compact = false }: AddWorkoutButtonProps) => {
    const [visible, setVisible] = useState(false);

    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);

    return (
        <>
            <Portal>
                <Modal
                    visible={visible}
                    onDismiss={hideModal}
                    contentContainerStyle={styles.modal}
                >
                    <AddWorkoutForm onClose={hideModal}/>
                </Modal>
            </Portal>
            <Button
                mode={'contained'}
                icon="plus"
                compact={compact}
                style={[styles.submitButton, compact && styles.compactButton]}
                contentStyle={compact ? styles.compactContent : undefined}
                onPress={showModal}
            >
                {compact ? 'Create' : 'Create workout'}
            </Button>
        </>
    )
}

const styles = StyleSheet.create({
    modal: {
        backgroundColor: palette.surface,
        padding: 24,
        margin: 20,
        borderRadius: 12
    },
    submitButton: {
        marginBottom: 10
    },
    compactButton: {
        marginBottom: 0
    },
    compactContent: {
        minHeight: 40
    }
});

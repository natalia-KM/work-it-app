import { Button, Modal, Portal } from 'react-native-paper'
import { useState } from 'react'
import { StyleSheet } from 'react-native'
import { AddWorkoutForm } from '@/components/AddWorkoutForm/AddWorkoutForm'

export const AddWorkoutButton = () => {
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
                style={styles.submitButton}
                onPress={showModal}
            >
                Create workout
            </Button>
        </>
    )
}

const styles = StyleSheet.create({
    modal: {
        backgroundColor: 'white',
        padding: 30,
        margin: 20,
        borderRadius: 12
    },
    submitButton: {
        marginBottom: 10
    }
});
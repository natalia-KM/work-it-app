import { View } from '@/components/Themed'
import { StyleSheet } from 'react-native'
import { AddExerciseForm } from '@/components/AddExerciseForm'
import { Appbar } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddExercise() {
    return (
        <>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => {
                }}/>
                <Appbar.Content title={'Add Exercise'}/>
            </Appbar.Header>
            <SafeAreaView style={styles.screen}>
                <View style={styles.container}>
                    <AddExerciseForm/>
                </View>
            </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white'
    },
    container: {
        paddingVertical: 0,
        paddingHorizontal: 25
    }
});

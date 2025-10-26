import { View } from '@/components/Themed'
import { StyleSheet } from 'react-native'
import { AddExerciseForm } from '@/components/AddExerciseForm'
import { Appbar } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AddExerciseFormValues, formSchema } from '@/components/AddExerciseForm/AddExerciseValidationSchema'
import { useGetExercises } from '@/hooks/exercises/useGetExercises'
import { useRouter } from 'expo-router'

export default function AddExercise() {
    const { data: exercises = [] } = useGetExercises()
    const router = useRouter();

    const methods = useForm<AddExerciseFormValues>({
        resolver: zodResolver(formSchema({ exercises })),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            title: '',
            muscleTags: [],
            photo: null,
            isCustom: true
        }
    });

    return (
        <>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.navigate('/exercises')}/>
                <Appbar.Content title={'Add Exercise'}/>
            </Appbar.Header>
            <SafeAreaView style={styles.screen}>
                <View style={styles.container}>
                    <FormProvider {...methods}>
                        <AddExerciseForm/>
                    </FormProvider>
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

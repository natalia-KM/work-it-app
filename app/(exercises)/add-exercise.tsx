import { ScrollView, StyleSheet } from 'react-native'
import { AddExerciseForm } from '@/components/AddExerciseForm'
import { Appbar } from 'react-native-paper'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AddExerciseFormValues, formSchema } from '@/components/AddExerciseForm/AddExerciseValidationSchema'
import { useGetExercises } from '@/hooks/exercises/useGetExercises'
import { useRouter } from 'expo-router'
import { AppScreen } from '@/components/ui/Screen'
import { palette } from '@/constants/theme'

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
            <Appbar.Header style={styles.appbar}>
                <Appbar.BackAction onPress={() => router.navigate('/exercises')}/>
                <Appbar.Content title={'Add exercise'}/>
            </Appbar.Header>
            <AppScreen contentStyle={styles.screenContent}>
                <ScrollView contentContainerStyle={styles.container}>
                    <FormProvider {...methods}>
                        <AddExerciseForm/>
                    </FormProvider>
                </ScrollView>
            </AppScreen>
        </>
    )
}

const styles = StyleSheet.create({
    appbar: {
        backgroundColor: palette.surface
    },
    screenContent: {
        paddingHorizontal: 0,
        paddingVertical: 0
    },
    container: {
        flexGrow: 1,
        padding: 20
    }
});

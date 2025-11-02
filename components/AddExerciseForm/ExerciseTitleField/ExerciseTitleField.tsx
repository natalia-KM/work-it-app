import { View } from '@/components/Themed'
import { useController, useWatch } from 'react-hook-form'
import { HelperText, TextInput } from 'react-native-paper'
import { AddExerciseFormValues } from '@/components/AddExerciseForm/AddExerciseValidationSchema'

export const ExerciseTitleField = () => {
    const { field, fieldState } = useController({ name: "title" });
    const isCustom = useWatch<AddExerciseFormValues>({ name: 'isCustom' })

    return (
        <View>
            <TextInput
                label={'Title'}
                mode={'outlined'}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                value={field.value}
                disabled={!isCustom}
                error={!!fieldState.error?.message}
                placeholder="Enter the title of the exercise"
            />
            {fieldState.error?.message && <HelperText type={'error'}>{fieldState.error.message}</HelperText>}
        </View>

    )
}
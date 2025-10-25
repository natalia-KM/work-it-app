import { View } from '@/components/Themed'
import { useController } from 'react-hook-form'
import { HelperText, TextInput } from 'react-native-paper'

export const ExerciseTitleField = () => {
    const { field, fieldState } = useController({ name: "title" });

    return (
        <View>
            <TextInput
                label={'Title'}
                mode={'outlined'}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                value={field.value}
                placeholder="Enter the title of the exercise"
            />
            {fieldState.error?.message && <HelperText type={'error'}>{fieldState.error.message}</HelperText>}
        </View>

    )
}
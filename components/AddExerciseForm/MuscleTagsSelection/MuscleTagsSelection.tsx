import { Controller, useFormContext } from "react-hook-form";
import { View } from '@/components/Themed'
import { Chip, HelperText, SegmentedButtons, Text } from 'react-native-paper'
import { predefinedMuscleTags } from '@/database/seeds/predefinedExercises'
import { useState } from 'react'
import { MuscleGroup } from '@/database/entities'
import { StyleSheet } from 'react-native'
import { AddExerciseFormValues } from '@/components/AddExerciseForm/AddExerciseValidationSchema'

const muscleGroupsArray = Object.values(MuscleGroup).map((muscleGroup) => ({
    value: muscleGroup.toLowerCase(),
    label: muscleGroup.toString()
}))

export const MuscleTagsSelection = () => {
    const { control, formState: { errors }, getValues } = useFormContext<AddExerciseFormValues>();
    const currentTags = getValues("muscleTags") || [];
    const isCustom = getValues('isCustom')

    const firstGroup =
        predefinedMuscleTags.find((tag) => tag.id === currentTags[0])?.muscleGroup ??
        MuscleGroup.UpperBody;

    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(firstGroup.toLowerCase())

    return (
        <View style={styles.tagsSection}>
            <Text variant={'titleMedium'}>Select muscles</Text>
            <SegmentedButtons
                buttons={muscleGroupsArray}
                value={selectedMuscleGroup}
                multiSelect={false}
                onValueChange={setSelectedMuscleGroup}
            />
            <Controller
                name="muscleTags"
                control={control}
                render={({ field: { value, onChange } }) => (
                    <View style={styles.tagsContainer}>
                        {predefinedMuscleTags.filter(tag => tag.muscleGroup.toLowerCase() === selectedMuscleGroup)
                            .map((tag) => {
                                const isSelected = value.some((t: number) => t === tag.id)

                                const newVal = isSelected
                                    ? value.filter((t: number) => t !== tag.id) // remove
                                    : [...value, tag.id]; // add

                                // needs sorting, as zod takes an account of array's order (isDirty)
                                const sorted = [...newVal].sort((a, b) => a - b);
                                return (
                                    <Chip
                                        key={tag.id}
                                        selected={isSelected}
                                        mode={isSelected ? 'flat' : 'outlined'}
                                        onPress={() => onChange(sorted)}
                                        disabled={!isCustom}
                                    >
                                        <Text style={{ flexWrap: 'wrap' }} numberOfLines={0}>
                                            {tag.name}
                                        </Text>
                                    </Chip>
                                )
                            })}
                    </View>
                )}
            />
            {errors.muscleTags?.message && <HelperText type={'error'}>{errors.muscleTags?.message}</HelperText>}
        </View>
    )
}

const styles = StyleSheet.create({
    tagsSection: {
        gap: 12
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    }
})
import { Controller, useFormContext } from "react-hook-form";
import { View } from '@/components/Themed'
import { Chip, SegmentedButtons, Text } from 'react-native-paper'
import { predefinedMuscleTags } from '@/database/seeds/predefinedExercises'
import { useState } from 'react'
import { MuscleGroup } from '@/database/entities'
import { StyleSheet } from 'react-native'

const muscleGroupsArray = Object.values(MuscleGroup).map((muscleGroup) => ({
    value: muscleGroup.toLowerCase(),
    label: muscleGroup.toString()
}))

export const MuscleTagsSelection = () => {
    const { control } = useFormContext();
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(MuscleGroup.UpperBody.toLowerCase())

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
                        {predefinedMuscleTags.filter(tag => tag.muscleGroup.toLowerCase() === selectedMuscleGroup).map((tag) => {
                            const isSelected = value.some((t: number) => t === tag.id)

                            return (
                                <Chip
                                    key={tag.id}
                                    selected={isSelected}
                                    mode={isSelected ? 'flat' : 'outlined'}
                                    onPress={() => {
                                        if (isSelected) {
                                            // remove
                                            onChange(value.filter((t: number) => t !== tag.id));
                                        } else {
                                            // add
                                            onChange([...value, tag.id]);
                                        }
                                    }}
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
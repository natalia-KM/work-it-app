import { useGetExercises } from '@/hooks/exercises/useGetExercises'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AddExerciseFormValues, formSchema } from '@/components/AddExerciseForm/AddExerciseValidationSchema'
import { Button, Card, Chip, HelperText, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { Icon } from 'react-native-paper/src'
import { View } from '@/components/Themed'
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import { predefinedMuscleTags } from '@/database/seeds/predefinedExercises'
import { MuscleGroup } from '@/database/entities'
import { useState } from 'react'

const muscleGroupsArray = Object.values(MuscleGroup).map((muscleGroup) => ({
    value: muscleGroup.toLowerCase(),
    label: muscleGroup.toString()
}))

export const AddExerciseForm = () => {
    const { data: exercises = [] } = useGetExercises()
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(MuscleGroup.UpperBody.toLowerCase())

    const {
        control,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm({
        resolver: zodResolver(formSchema(exercises)),
        defaultValues: {
            title: ''
        }
    });

    const onSubmit = (data: AddExerciseFormValues) => {
        console.log(data);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // different handling per OS
        >
            <View style={styles.content}>
                <Card mode={'outlined'} style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <Icon
                            source="cloud-arrow-up-outline"
                            size={48}
                        />

                        <View style={styles.cardText}>
                            <Text>Upload Exercise Cover Image</Text>
                            <Text variant={'labelMedium'}>(max 2MB)</Text>
                        </View>

                        <Button icon={'tray-arrow-up'} mode={'contained'} onPress={() => {
                        }}>
                            Select File
                        </Button>
                    </Card.Content>
                </Card>

                <View>
                    <Controller
                        name={'title'}
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                label={'Title'}
                                mode={'outlined'}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="Enter the title of the exercise"
                            />
                        )}
                    />
                    {errors.title?.message && <HelperText type={'error'}>{errors.title.message}</HelperText>}
                </View>

                <View style={styles.tagsSection}>
                    <Text variant={'titleMedium'}>Select muscles</Text>
                    <SegmentedButtons
                        buttons={muscleGroupsArray}
                        value={selectedMuscleGroup}
                        multiSelect={false}
                        onValueChange={setSelectedMuscleGroup}
                    />
                    <View style={styles.tagsContainer}>
                        {predefinedMuscleTags.map((tag) => {
                            if (tag.muscleGroup.toLowerCase() === selectedMuscleGroup) {
                                return (
                                    <Chip key={tag.id}>
                                        <Text style={{ flexWrap: 'wrap' }} numberOfLines={0}>
                                            {tag.name}
                                        </Text>
                                    </Chip>
                                )
                            }
                        })}
                    </View>
                </View>

            </View>
            <Button mode={'contained'} style={styles.submitButton} onPress={handleSubmit(onSubmit)} disabled={!isValid}>
                Create
            </Button>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        height: '100%',
        gap: 20
    },
    content: {
        flexGrow: 1,
        gap: 20
    },
    card: {
        backgroundColor: 'transparent'
    },
    cardText: {
        alignItems: 'center'
    },
    cardContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    tagsSection: {
        gap: 12
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    submitButton: {
        marginBottom: 10
    }
});

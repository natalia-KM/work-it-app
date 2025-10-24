import { StyleSheet } from 'react-native';
import { View } from '@/components/Themed';
import { ExerciseList } from '@/components/ExerciseList'
import { Searchbar } from 'react-native-paper'
import { useState } from 'react'

export default function TabTwoScreen() {
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Search"
                style={styles.searchBar}
                onChangeText={setSearchQuery}
                value={searchQuery}
            />
            <ExerciseList searchQuery={searchQuery}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10
    },
    searchBar: {
        width: '85%',
        marginVertical: 20
    }
});

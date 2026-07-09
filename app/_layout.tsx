import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Suspense, useEffect } from 'react';
import 'react-native-reanimated';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/config/queryClient'
import { openDatabaseSync, SQLiteProvider } from 'expo-sqlite'
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '@/drizzle/migrations'
import { ActivityIndicator } from 'react-native'
import { seedDatabase } from '@/database/seeds/useSeedDatabase'
import { DefaultTheme as PaperLightTheme, PaperProvider } from 'react-native-paper'

export {
    ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: '(tabs)'
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ...FontAwesome.font
    });

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return <RootLayoutNav/>;
}
export const DATABASE_NAME = 'work_it_db'

function RootLayoutNav() {
    const expoDb = openDatabaseSync(DATABASE_NAME);
    const db = drizzle(expoDb);
    const { success } = useMigrations(db, migrations);

    // const colorScheme = useColorScheme();

    useEffect(() => {
        const seedDb = async () => {
            await seedDatabase(db)
        }
        if (success) {
            seedDb()
        }
    }, [success, db]);

    // TODO: disallow rotation

    return (
        <Suspense fallback={<ActivityIndicator size="large"/>}>
            <SQLiteProvider
                databaseName={DATABASE_NAME}
                options={{ enableChangeListener: true }}
                useSuspense>
                <QueryClientProvider client={queryClient}>
                    <PaperProvider theme={PaperLightTheme}>
                        {/*<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>*/}
                        <ThemeProvider value={DefaultTheme}>
                            <Stack>
                                <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
                                <Stack.Screen name="(exercises)" options={{ headerShown: false }}/>
                                <Stack.Screen name="(workouts)" options={{ headerShown: false }}/>
                            </Stack>
                        </ThemeProvider>
                    </PaperProvider>
                </QueryClientProvider>
            </SQLiteProvider>
        </Suspense>
    );
}

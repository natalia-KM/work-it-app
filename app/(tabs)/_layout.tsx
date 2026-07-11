import React from 'react';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { IconButton, IconButtonProps } from 'react-native-paper'
import { palette } from '@/constants/theme'

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: IconButtonProps) {
    return <IconButton size={28} style={{ marginBottom: -1 }} {...props} />;
}

export default function TabLayout() {
    // const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: palette.primary,
                tabBarInactiveTintColor: palette.muted,
                tabBarStyle: {
                    backgroundColor: palette.surface,
                    borderTopColor: palette.line,
                    paddingTop: 6
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600'
                },
                headerStyle: {
                    backgroundColor: palette.surface
                },
                headerTintColor: palette.ink,
                // Disable the static render of the header on web
                // to prevent a hydration error in React Navigation v6.
                headerShown: useClientOnlyValue(false, true)
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <TabBarIcon icon="view-dashboard-outline" iconColor={color}/>
                }}
            />
            <Tabs.Screen
                name="workouts"
                options={{
                    headerShown: false,
                    title: 'Workouts',
                    tabBarShowLabel: true,
                    tabBarIcon: ({ color }) => <TabBarIcon icon="dumbbell" iconColor={color}/>
                }}
            />
            <Tabs.Screen
                name="import"
                options={{
                    title: 'Import',
                    tabBarShowLabel: true,
                    tabBarIcon: ({ color }) => <TabBarIcon icon="file-upload-outline" iconColor={color}/>
                }}
            />
            <Tabs.Screen
                name="data"
                options={{
                    title: 'Data',
                    tabBarShowLabel: true,
                    tabBarIcon: ({ color }) => <TabBarIcon icon="database-export-outline" iconColor={color}/>
                }}
            />
            <Tabs.Screen
                name="exercises"
                options={{
                    title: 'Exercises',
                    tabBarShowLabel: true,
                    tabBarIcon: ({ color }) => <TabBarIcon icon="format-list-bulleted-type" iconColor={color}/>,
                    headerRight: () => (
                        <Link href="/(exercises)/add-exercise" asChild>
                            <Pressable>
                                {({ pressed }) => (
                                    <IconButton
                                        icon={'plus-circle'}
                                        iconColor={palette.primary}
                                        size={25}
                                        style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                                    />
                                )}
                            </Pressable>
                        </Link>
                    )
                }}
            />
        </Tabs>
    );
}

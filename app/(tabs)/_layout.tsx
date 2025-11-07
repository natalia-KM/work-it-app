import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { IconButton, IconButtonProps } from 'react-native-paper'

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: IconButtonProps) {
    return <IconButton size={28} style={{ marginBottom: -1 }} {...props} />;
}

export default function TabLayout() {
    // const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors['light'].tint,
                // Disable the static render of the header on web
                // to prevent a hydration error in React Navigation v6.
                headerShown: useClientOnlyValue(false, true)
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <TabBarIcon icon="home-outline" iconColor={color}/>,
                    headerRight: () => (
                        <Link href="/modal" asChild>
                            <Pressable>
                                {({ pressed }) => (
                                    <FontAwesome
                                        name="info-circle"
                                        size={25}
                                        color={Colors['light'].text}
                                        style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                                    />
                                )}
                            </Pressable>
                        </Link>
                    )
                }}
            />
            <Tabs.Screen
                name="workouts"
                options={{
                    headerShown: false,
                    title: 'Workouts',
                    tabBarShowLabel: true,
                    tabBarIcon: ({ color }) => <TabBarIcon icon="walk" iconColor={color}/>
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

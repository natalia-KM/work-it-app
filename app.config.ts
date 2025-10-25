/** @type {import('expo/config').ExpoConfig} */
const config = {
    expo: {
        name: "work-it-app",
        slug: "work-it-app",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "workitapp",
        userInterfaceStyle: "automatic",
        newArchEnabled: true,
        splash: {
            image: "./assets/images/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/images/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false
        },
        web: {
            bundler: "metro",
            output: "static",
            favicon: "./assets/images/favicon.png"
        },
        plugins: [
            "expo-router",
            [
                "expo-sqlite",
                {
                    enableFTS: true,
                    useSQLCipher: false
                }
            ],
            [
                "expo-image-picker",
                {
                    "photosPermission": "The app accesses your photos."
                }
            ]
        ],
        experiments: {
            typedRoutes: true
        }
    }
};

export default config;

import { Stack } from "expo-router";
import queryClient from "./(services)/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import store from "./(redux)/store";
import { Provider } from "react-redux";
import AppNavigation from "./(redux)/AppNavigation";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export default function RootLayout() {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <GestureHandlerRootView>
                    <BottomSheetModalProvider>
                        <AppNavigation />
                    </BottomSheetModalProvider>
                </GestureHandlerRootView>
            </QueryClientProvider>
        </Provider>
    );
}

import { Stack } from "expo-router";
import queryClient from "./(services)/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import store from "./(redux)/store";
import { Provider } from "react-redux";
// import { StripeProvider } from '@stripe/stripe-react-native'
import AppNavigation from "./(redux)/AppNavigation";

export default function RootLayout() {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <AppNavigation />
            </QueryClientProvider>
        </Provider>
    );
}

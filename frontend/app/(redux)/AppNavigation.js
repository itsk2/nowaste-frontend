import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
// import { loadUser } from "./authSlice";
import { Stack } from "expo-router";
// import { ArticleProvider } from "../context/ArticleContext";
// import { loadCart } from "./cartSlice";

function AppNavigation() {
    const dispatch = useDispatch();

    // useEffect(() => {
    //     dispatch(loadUser());
    //     dispatch(loadCart());
    // }, [dispatch]);

    return (
        <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: "OnboardingScreen" }} />
            <Stack.Screen name="auth/login" options={{ title: "Login" }} />
            <Stack.Screen name="auth/register" options={{ title: "Register" }} />
            <Stack.Screen name="(tabs)" options={{ title: "Tabs" }} />
        </Stack>
    );
}

export default AppNavigation;

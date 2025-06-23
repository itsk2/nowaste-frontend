import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function AppNavigation() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { screen, roomId, targetRole } = response.notification.request.content.data || {};

      if (screen === "Chat" && roomId && targetRole) {
        switch (targetRole) {
          case "farmer":
            router.push(`/components/User/components/Chat/Chats?roomId=${roomId}`);
            break;
          case "composter":
            router.push(`/components/Composter/components/Chat/Chats?roomId=${roomId}`);
            break;
          case "vendor":
            router.push(`/components/Vendor/(tabs)/Chats?roomId=${roomId}`);
            break;
          default:
            console.warn("Unknown targetRole in push notification:", targetRole);
        }
      }
    });

    return () => subscription.remove();
  }, []);

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
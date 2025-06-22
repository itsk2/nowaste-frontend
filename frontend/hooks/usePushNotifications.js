import * as Notifications from 'expo-notifications';
import axios from 'axios';
import baseURL from '../assets/common/baseURL';

export const registerForPushNotificationsAsync = async (userId) => {
  let token;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission not granted for notifications.');
    return null;
  }

  try {
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Expo Push Token:', token);

    // Save to your backend
    await axios.put(`${baseURL}/push/update/token`, {
      userId,
      expoPushToken: token,
    });

    console.log('Push token successfully updated.');
  } catch (error) {
    console.error('Failed to register token:', error);
  }

  return token;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

import { Alert } from 'react-native';

const getNotifee = () => {
  try {
    const notifeeModule = require('@notifee/react-native');
    return notifeeModule;
  } catch (error) {
    return null;
  }
};

const Notifee = getNotifee();
const AndroidImportance = Notifee?.AndroidImportance ?? 4;
const AuthorizationStatus = Notifee?.AuthorizationStatus ?? {
  DENIED: 1,
};

export const setupNotifications = async () => {
  if (!Notifee) {
    return false;
  }

  try {
    const settings = await Notifee.requestPermission();

    if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
      return false;
    }

    await Notifee.createChannel({
      id: 'default',
      name: 'General notifications',
      importance: AndroidImportance,
    });

    return true;
  } catch (error) {
    console.log('NOTIFICATION SETUP ERROR:', error);
    return false;
  }
};

export const showNotification = async (title: string, message: string) => {
  if (!Notifee) {
    Alert.alert(title, message);
    return;
  }

  try {
    const settings = await Notifee.requestPermission();

    if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
      Alert.alert(title, message);
      return;
    }

    await Notifee.displayNotification({
      title,
      body: message,
      android: {
        channelId: 'default',
        importance: AndroidImportance,
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        sound: 'default',
        foregroundPresentationOptions: {
          alert: true,
          badge: true,
          sound: true,
        },
      },
    });
  } catch (error) {
    console.log('DISPLAY NOTIFICATION ERROR:', error);
    Alert.alert(title, message);
  }
};
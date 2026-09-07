import { Alert } from 'react-native';

import { showNotification } from '../services/notifications';

describe('showNotification', () => {
  it('shows the notification title and message', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    await showNotification('Welcome back', 'You have successfully logged in.');

    expect(alertSpy).toHaveBeenCalledWith('Welcome back', 'You have successfully logged in.');

    alertSpy.mockRestore();
  });
});

import React, { useEffect } from 'react';
import getBrowserFingerprint from 'get-browser-fingerprint';
import { useMutation, gql } from '@apollo/client';
import logo from './logo.svg';
import './App.css';

const SUBSCRIBE_USER = gql`
mutation($browserUniqueKey: String!, $subscription: JSONObject){
  subscribeNotification(browserUniqueKey: $browserUniqueKey, subscription: $subscription){
    data
  }
}
`;
const UNSUBSCRIBE_USER = gql`
mutation($browserUniqueKey: String!){
  unSubscribeNotification(browserUniqueKey: $browserUniqueKey){
      data
  }
}
`;

function App() {
  const publicVapidKey = 'BPsQ6mhuJZj2fLNbmSQhubbujE7koW9bi6RF-p6ZlxrGb4wMq_YCDb0LL_QAPRF3AWdZsdyCYK29QOi41ic_g5s';
  const subscriptionUrl = './custom-sw.js';
  const fingerprint = `${getBrowserFingerprint()}`;

  const [
    subscribePushNotification,
  ] = useMutation(SUBSCRIBE_USER);

  const [
    unSubscribePushNotification,
  ] = useMutation(UNSUBSCRIBE_USER);

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      // eslint-disable-next-line no-useless-escape
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i += 1) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeUser = async () => {
    const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);
    const registration = await navigator.serviceWorker.register(subscriptionUrl);
    const existedSubscription = await registration.pushManager.getSubscription();
    if (existedSubscription === null) {
      const newSubscription = await registration.pushManager.subscribe({
        applicationServerKey: convertedVapidKey,
        userVisibleOnly: true,
      });
      subscribePushNotification({
        variables: {
          browserUniqueKey: fingerprint,
          subscription: newSubscription,
        },
      });
    }
  };

  useEffect(() => {
    if ('serviceWorker' in navigator && typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') {
        subscribeUser();
      } else {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            subscribeUser();
          } else if (permission === 'denied') {
            unSubscribePushNotification({
              variables: {
                browserUniqueKey: fingerprint,
              },
            });
          }
        });
      }
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Push notification using React and GraphQl.
        </p>
      </header>
    </div>
  );
}

export default App;

import React from 'react'
import {View, Text, Pressable} from 'react-native'
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

export default function Profile(props, { navigation }) {
  const handleLogout = () => {
    firebase.auth().signOut();
  };

  return (
    <View>
      <Text>Profile</Text>

      <Pressable onPress={handleLogout}>
        <Text>Logout</Text>
      </Pressable>
    </View>
  );
}
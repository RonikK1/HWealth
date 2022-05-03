import { StatusBar } from 'expo-status-bar';
import React, { Component } from 'react';
import {View, Text} from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


import AddScreen from './components/main/Add'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './redux/reducers'
import thunk from 'redux-thunk'
const store = createStore(rootReducer, applyMiddleware(thunk))


// firebase

// import firebase,{ initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyDg_GvVwGkdbbp5bWkJFfhkqLK5GJzrsmY",
  authDomain: "hwealth-8854c.firebaseapp.com",
  projectId: "hwealth-8854c",
  storageBucket: "hwealth-8854c.appspot.com",
  messagingSenderId: "988547530225",
  appId: "1:988547530225:web:cab14f5d142c91e1501850",
  measurementId: "G-EFK2520QJ9"
};

if (firebase.apps.length === 0){
  firebase.initializeApp(firebaseConfig)
}

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from './components/auth/Landing'
import RegisterScreen from './components/auth/Register'
import LoginScreen from './components/auth/Login'
import MainScreen from './components/Main'
import SaveScreen from './components/main/Save'
import FoodTracker from "./components/foodtracker/foodtracker";
import ExerciseTracker from "./components/foodtracker/exercisetracker";

const Stack = createStackNavigator();


export class App extends Component {
  constructor(props){
    super(props);this.state = {
      loaded: false,

    }
  }
  componentDidMount(){
    firebase.auth().onAuthStateChanged((user) => {
      if(!user){
        this.setState({
          loggedIn: false,
          loaded: true,
        })
      }else{
        this.setState({
          loggedIn: true,
          loaded: true,
      })
    }
  })
  }
  render() {
    const{ loggedIn, loaded} = this.state;
    if(!loaded){
      return(
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Text>Loading</Text>
        </View>
      )
    }
    if(!loggedIn){
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Landing">
          <Stack.Screen name="Landing" component={LandingScreen} options={{headerShown: false}}/>
          <Stack.Screen name="Register" component={RegisterScreen}/>
          <Stack.Screen name="Login" component={LoginScreen}/>
        </Stack.Navigator>
      </NavigationContainer> 
     );
    }

    return (
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Main">
            <Stack.Screen
              name="Main"
              component={MainScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Add"
              component={AddScreen}
              navigation={this.props.navigation}
            />
            <Stack.Screen name="Save" component={SaveScreen} />
            <Stack.Screen name="FoodTracker" component={FoodTracker} />
            <Stack.Screen name="ExerciseTracker" component={ExerciseTracker} />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    );
  }
}

export default App

  




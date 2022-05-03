import React, { Component } from 'react'
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import { connect } from 'react-redux'
import {bindActionCreators} from 'redux'
import { fetchUser } from '../redux/actions/index';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import FeedScreen from './main/Feed'
import ProfileScreen from './main/Profile'
import FoodTracker from './foodtracker/foodtracker'
import ExerciseTracker from "./foodtracker/exercisetracker";
import Blog from "./blogs/blog";
import CalendarTracker from "./calendar/calendartracker";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import moment from "moment";
import tw from "twrnc";

const Tab = createMaterialBottomTabNavigator();

const EmptyScreen = () => {
  return(null)
}
export class Main extends Component {
  componentDidMount() {
    this.props.fetchUser();
  }
  render() {
    console.log(this.props.navigation);
    return (
      <View style={[tw`h-full`]}>
        
        <Tab.Navigator initialRouteName="FoodTracker" labeled={false}>
          <Tab.Screen
            name="Feed"
            component={FeedScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="home" color={color} size={26} />
              ),
            }}
          />

          <Tab.Screen
            name="TrackFood"
            component={FoodTracker}
            listeners={({ navigation }) => ({
              tabPress: (event) => {
                event.preventDefault();
                navigation.navigate("FoodTracker");
              },
            })}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="food" color={color} size={26} />
              ),
            }}
          />

          <Tab.Screen
            name="TrackExercise"
            component={ExerciseTracker}
            listeners={({ navigation }) => ({
              tabPress: (event) => {
                event.preventDefault();
                navigation.navigate("ExerciseTracker");
              },
            })}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="dumbbell"
                  color={color}
                  size={26}
                />
              ),
            }}
          />

          <Tab.Screen
            name="Blog"
            component={Blog}
            listeners={({ navigation }) => ({
              tabPress: (event) => {
                event.preventDefault();

                navigation.navigate("Blog");
              },
            })}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="plus-box"
                  color={color}
                  size={26}
                />
              ),
            }}
          />

          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            listeners={({ navigation }) => ({
              tabPress: (event) => {
                event.preventDefault();
                navigation.navigate("Profile");
              },
            })}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="account-circle"
                  color={color}
                  size={26}
                />
              ),
            }}
          />
        </Tab.Navigator>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  calendar: {
    marginBottom: 10,
    padding: 10,
  },
});

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ fetchUser }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Main);
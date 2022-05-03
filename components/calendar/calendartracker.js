import React, { useState, useEffect, useRef } from "react";
import {
    View,
    TextInput,
    Image,
    Button,
    SafeAreaView,
    FlatList,
    Text,
    StyleSheet,
    Pressable
} from "react-native";
import tw from "twrnc";
import { v4 as uuid } from "uuid";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import { useNavigation } from "@react-navigation/native";

import { Calendar, CalendarProps } from "react-native-calendars";
import moment from "moment";

export default function CalendarTracker(props) {

    
    const navigation = useNavigation();

  const [calendarData, setCalendarData] = useState({});
  const [exerciseData, setExerciseData] = useState({});

  const [calendarSelectedData, setCalendarSelectedData] = useState({});

  const [toggleMoreView , setToggleMoreView] = useState(false);

  const [pressedDate , setPressedDate] = useState();

  useEffect(async () => {
    let { success, data } = await firebaseFetchFoodtracker();
    let result = await firebaseFetchExercisetracker();
    
    console.log(data);
    console.log(result.data);
    
    let fetechedCalendarData = {};
    
    let fetchedData = {}
    data.forEach((element) => {
        fetechedCalendarData[element.date] = { marked: true, selected: true };
        fetchedData[element.date] = { food: element, exercise : []};
    });
    
    result.data.forEach((element) => {
      fetechedCalendarData[element.date] = { marked: true, selected: true };
      fetchedData[element.date].exercise = element;
    });

    console.log(fetchedData);

    setCalendarSelectedData(fetechedCalendarData);
    setCalendarData(fetchedData);

  }, []);



  const handleDayPressed = (date)=>{
    setPressedDate(date.dateString);
    setToggleMoreView(true);
  } 

  const handleOpenFoodTracker = ()=>{
      navigation.navigate("FoodTracker", { foodDate: pressedDate });
  }

    const handleOpenExerciseTracker = () => {
      navigation.navigate("ExerciseTracker", { exerciseDate: pressedDate });
    };

  const firebaseFetchFoodtracker = async () => {
    console.log("docid", firebase.auth().currentUser.uid);

    const dataRef = firebase.firestore().collection("foodtracker");
    const snapshot = await dataRef
      .where("uid", "==", firebase.auth().currentUser.uid)
      .get();

    if (snapshot.empty) {
      console.log("No matching food docs for user.");
      return { success: false, data: [] };
    } else {
      let data = [];
      snapshot.forEach((doc) => {
        if (doc.exists) {
          data.push(doc.data());
        }
      });
      return { success: true, data: data };
    }
  };

const firebaseFetchExercisetracker = async () => {
    console.log("docid", firebase.auth().currentUser.uid);

    const dataRef = firebase.firestore().collection("exercisetracker");
    const snapshot = await dataRef
      .where("uid", "==", firebase.auth().currentUser.uid)
      .get();

    if (snapshot.empty) {
      console.log("No matching exercises docs for user.");
      return { success: false, data: [] };
    } else {
      let data = [];
      snapshot.forEach((doc) => {
        if (doc.exists) {
          data.push(doc.data());
        }
      });
      return { success: true, data: data };
    }
  };

  const renderMoreInformationView = () => {
    
    let totalFoods = 0;
    let totalExercises = 0;
          
    if (pressedDate in calendarData) {
      let selectedDateData = calendarData[pressedDate].food;
      console.log(selectedDateData);
      let foodItems = JSON.parse(selectedDateData.data);
      totalFoods = foodItems.fooditems.list.length;

      let selectedExerciseDateData = calendarData[pressedDate].exercise;
      let exerciseItems = JSON.parse(selectedExerciseDateData.data);
      totalExercises = exerciseItems.exerciseitems.list.length;
    }


    
    return (
      <View style={[tw`flex flex-col bg-white rounded-5 m-5 p-5`]}>
        <Text style={[tw`text-center text-2xl font-bold`]}>
          Your activity for the day
        </Text>
        <View style={[tw`flex flex-col mt-3`]}>
          <Text style={[tw`font-bold text-xl`]}>Foods items tracked</Text>
          <Text style={[tw`text-xl`]}>{totalFoods}</Text>
          <Pressable
            style={[
              tw`border border-black rounded-5 p-2 bg-[#4da6ff] border-[#4da6ff]`,
            ]}
            onPress={handleOpenFoodTracker}
          >
            <Text style={[tw`text-white`]}>View all foods</Text>
          </Pressable>
        </View>

        <View style={[tw`flex flex-col mt-3`]}>
          <Text style={[tw`font-bold text-xl`]}>Exercises tracked</Text>
          <Text style={[tw`text-xl`]}>{totalExercises}</Text>
          <Pressable
            style={[
              tw`border border-black rounded-5 p-2 bg-[#4da6ff] border-[#4da6ff]`,
            ]}
            onPress={handleOpenExerciseTracker}
          >
            <Text style={[tw`text-white`]}>View all logs</Text>
          </Pressable>
        </View>
        <View></View>
      </View>
    );
  };

  const render = () => {
    let today = moment().format("YYYY-MM-DD");

    return (
      <SafeAreaView>
        <View styles={[tw`p-5`]}>
          <Calendar
            style={[styles.calendar]}
            hideExtraDays
            current={today}
            markingType={"custom"}
            markedDates={calendarSelectedData}
            onDayPress={handleDayPressed}
          />
        </View>
        {toggleMoreView && renderMoreInformationView()}
      </SafeAreaView>
    );
  };

  return render();
}

const styles = StyleSheet.create({
  calendar: {
    marginBottom: 10,
    padding: 10,
  },
});

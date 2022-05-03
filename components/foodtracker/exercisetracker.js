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

import moment from "moment";

export default function ExerciseTracker(props, { navigation }) {

    const exerciseDate = props.route.params
      ? props.route.params.exerciseDate
      : false;

    const exerciseList = useRef([]);
    const [flatExerciseList, setExerciseList] = useState([]);

    const [newItemName, setNewItemName] = useState();
    const [newItemSets, setNewItemSets] = useState();
    const [newItemReps, setNewItemReps] = useState();

    const [newItemView, setNewItemView] = useState(false);

    const toggleNewItemView = ()=>{
        setNewItemView(!newItemView);
    }

    useEffect(async ()=>{

      if (!exerciseDate) {
        let { success, data } = await firebaseFetchExercisetracker();
        console.log(data);
        if (success) {
          let parsedData = JSON.parse(data[0].data);
          exerciseList.current = parsedData.exerciseitems.list;
          setExerciseList(parsedData.exerciseitems.list);
        } else {
          console.log("No data found for today");
        }
      } else {
        let { success, data } = await firebaseFetchExercisetrackerDate(
          exerciseDate
        );
        if (success) {
          let parsedData = JSON.parse(data[0].data);
          exerciseList.current = parsedData.exerciseitems.list;
          setExerciseList(parsedData.exerciseitems.list);
        } else {
          console.log("No data found for selected date");
        }
      }

    },[]);

    const firebaseFetchExercisetrackerDate = async (date) => {
      console.log("docid", firebase.auth().currentUser.uid);

      const dataRef = firebase.firestore().collection("exercisetracker");
      const snapshot = await dataRef
        .where("date", "==", date)
        .where("uid", "==", firebase.auth().currentUser.uid)
        .get();

      if (snapshot.empty) {
        console.log("No matching exercise docs for user.");
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

    const firebaseFetchExercisetracker = async ()=>{
        let date = moment().format("YYYY-MM-DD");

        console.log("docid", firebase.auth().currentUser.uid + date);
        
        const dataRef = firebase
          .firestore()
          .collection("exercisetracker")

        const snapshot = await dataRef
          .where("date", "==", date)
          .where("uid", "==", firebase.auth().currentUser.uid)
          .get();

      if (snapshot.empty) {
        console.log("No matching exercise docs for user.");
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
    }

    const firebaseNewItemAdd = async () => {
      let date = moment().format("YYYY-MM-DD");
      let data = JSON.stringify({ exerciseitems: { list: exerciseList.current } });
      let uid = firebase.auth().currentUser.uid;

      console.log(date);
      console.log(firebase.auth().currentUser.uid);
      console.log(data);

      let {success, payload } = await firebaseFetchExercisetracker();

      if(success){
          // data needs to be updated instead
          console.log("need to update instead...");
        firebase
          .firestore()
          .collection("exercisetracker")
          .doc(firebase.auth().currentUser.uid + date)
          .set({
            date,
            data,
            uid,
          })
          .then(() => {
            setNewItemView(false);
          });
      }
      else{
        firebase
          .firestore()
          .collection("exercisetracker")
          .doc(firebase.auth().currentUser.uid + date)
          .set({
            date,
            data,
            uid,
          })
          .then(() => {
            setNewItemView(false);
          });
      }
    };

    const handleNewItemAdd = () => {
      console.log("adding new item");
      const items = exerciseList.current;
      let newItem = {
        id: uuid(),
        name: newItemName,
        sets: newItemSets,
        reps: newItemReps,
      };

      exerciseList.current = [...items, newItem];
      setExerciseList([...items, newItem]);
      firebaseNewItemAdd();
    };

    // const handleNewItemRemove = (id)=>{
    //   const items = foodList.current;
    //   let newItems = items.filter((food) => food.id !=id);
    //     foodList.current = newItems;
    // }

  const renderItem = ({ item }) => {
    return (
      <View
        style={[
          tw`flex flex-row bg-white border border-[#fff] rounded-5 justify-center mt-1`,
        ]}
      >
        <Text style={[tw`text-black font-bold m-2`]}>{item.name}</Text>
        <Text style={[tw`text-black font-bold m-2`]}>
          {item.sets} sets
        </Text>
        <Text style={[tw`text-black font-bold m-2`]}>
          {item.reps} reps
        </Text>
        {/* <Pressable
          style={[
            tw`border border-black rounded-5 p-2 bg-[#4da6ff] border-[#4da6ff]`,
          ]}
          onPress={handleNewItemRemove(item.id)}
        >
          <Text style={[tw`text-white text-center`]}>Remove</Text>
        </Pressable> */}
      </View>
    );
  };

  const renderTrackerView = () => {
    return (
      <SafeAreaView style={[tw`flex flex-col`]}>
        <Text style={[tw`text-xl font-bold text-center`]}>Exercises for today</Text>
        <View>
          <FlatList
            data={flatExerciseList}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      </SafeAreaView>
    );
  };

  const renderItemAdder = () => {
    return (
      <View style={[tw`flex flex-col`]}>
        <View style={[tw`flex flex-col`, { alignItems: "left" }]}>
          <Text style={[tw`text-xl ml-4`]}>Name</Text>
          <TextInput
            style={[styles.input, tw`rounded-1`]}
            onChangeText={(text)=>{setNewItemName(text);}}
            placeholder="Rice...Chicken..."
            keyboardType="ascii-capable"
          />
        </View>

        <View style={[tw`flex flex-col`, { alignItems: "left" }]}>
          <Text style={[tw`text-xl ml-4`]}>Sets</Text>
          <TextInput
            style={[styles.input, tw`rounded-1`]}
            onChangeText={(text)=>{setNewItemSets(text);}}
            placeholder="10"
            keyboardType="numeric"
          />
        </View>

        <View style={[tw`flex flex-col`, { alignItems: "left" }]}>
          <Text style={[tw`text-xl ml-4`]}>Reps</Text>
          <TextInput
            style={[styles.input, tw`rounded-1`]}
            onChangeText={(text)=>{setNewItemReps(text);}}
            placeholder="10"
            keyboardType="ascii-capable"
          />
        </View>

        <Pressable
          style={[
            tw`border border-black rounded-5 p-2 bg-[#4da6ff] border-[#4da6ff]`,
          ]}
          onPress={handleNewItemAdd}
        >
          <Text style={[tw`text-white text-center`]}>Add exercise</Text>
        </Pressable>
      </View>
    );
  };

  const renderNewItemButton = () => {
    return (
      <View style={[tw`flex flex-row m-5 justify-center`]}>
        <Pressable
          style={[
            tw`border border-black rounded-5 p-2 bg-[#4da6ff] border-[#4da6ff]`,
          ]}
          onPress={toggleNewItemView}
        >
          <Text style={[tw`text-white`]}>Add new item</Text>
        </Pressable>
      </View>
    );
  };

  const render = () => {
      return (
        <SafeAreaView>
          {renderNewItemButton()}
          {newItemView && renderItemAdder()}
          {renderTrackerView()}
        </SafeAreaView>
      );
  };

  return render();
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

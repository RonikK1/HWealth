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

export default function FoodTracker(props, { navigation }) {

  
    const foodDate = props.route.params ? props.route.params.foodDate : false;

    const foodList = useRef([]);
    const [flatFoodList, setFoodList] = useState([]);

    const [newItemName, setNewItemName] = useState();
    const [newItemCalories, setNewItemCalories] = useState();
    const [newItemFats, setNewItemFats] = useState();
    const [newItemProtein, setNewItemProtein] = useState();
    const [newItemCarbs, setNewItemCarbs] = useState();

    const [newItemView, setNewItemView] = useState(false);

    const toggleNewItemView = ()=>{
        setNewItemView(!newItemView);
    }

    useEffect(async ()=>{
      if (!foodDate) {
        let { success, data } = await firebaseFetchFoodtracker();
        console.log(data);
        if (success) {
          let parsedData = JSON.parse(data[0].data);
          foodList.current = parsedData.fooditems.list;
          setFoodList(parsedData.fooditems.list);
        } else {
          console.log("No data found for today");
        }
      } else {
        let { success, data } = await firebaseFetchFoodtrackerDate(foodDate);
        if (success) {
          let parsedData = JSON.parse(data[0].data);
          foodList.current = parsedData.fooditems.list;
          setFoodList(parsedData.fooditems.list);
        } else {
          console.log("No data found for selected date");
        }
      }
    },[]);

    
    const firebaseFetchFoodtrackerDate = async (date) => {
      console.log("docid", firebase.auth().currentUser.uid);

      const dataRef = firebase.firestore().collection("foodtracker");
      const snapshot = await dataRef
        .where("date", "==", date)
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

    const firebaseFetchFoodtracker = async () => {
      let date = moment().format("YYYY-MM-DD");

      console.log("docid", firebase.auth().currentUser.uid);

      const dataRef = firebase.firestore().collection("foodtracker");
      const snapshot = await dataRef
        .where("date", "==", date)
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

    const firebaseNewItemAdd = async () => {
      let date = moment().format("YYYY-MM-DD");
      let data = JSON.stringify({ fooditems: { list: foodList.current } });
      let uid = firebase.auth().currentUser.uid;

      console.log(date);
      console.log(data);
      console.log(firebase.auth().currentUser.uid);

      let {success, payload } = await firebaseFetchFoodtracker();

      if(success){
        // data needs to be updated instead
        console.log("need to update instead...");
        firebase
          .firestore()
          .collection("foodtracker")
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
          .collection("foodtracker")
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
      const items = foodList.current;
      let newItem = {
        id: uuid(),
        name: newItemName,
        calories: newItemCalories,
        fats: newItemFats,
        protein: newItemProtein,
        carbs: newItemCarbs,
      };

      foodList.current = [...items, newItem];
      setFoodList([...items, newItem]);
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
          {item.calories} kcal of calories
        </Text>
        <Text style={[tw`text-black font-bold m-2`]}>
          {item.fats} g of fats
        </Text>
        <Text style={[tw`text-black font-bold m-2`]}>
          {item.protein} g of protein
        </Text>
        <Text style={[tw`text-black font-bold m-2`]}>
          {item.carbs} g of carbs
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
        <Text style={[tw`text-xl font-bold text-center`]}>Food items for today</Text>
        <View>
          <FlatList
            data={flatFoodList}
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
          <Text style={[tw`text-xl ml-4`]}>Calories(kcal)</Text>
          <TextInput
            style={[styles.input, tw`rounded-1`]}
            onChangeText={(text)=>{setNewItemCalories(text);}}
            placeholder="10"
            keyboardType="numeric"
          />
        </View>

        <View style={[tw`flex flex-col`, { alignItems: "left" }]}>
          <Text style={[tw`text-xl ml-4`]}>Fats(g)</Text>
          <TextInput
            style={[styles.input, tw`rounded-1`]}
            onChangeText={(text)=>{setNewItemFats(text);}}
            placeholder="10"
            keyboardType="ascii-capable"
          />
        </View>

        <View style={[tw`flex flex-col`, { alignItems: "left" }]}>
          <Text style={[tw`text-xl ml-4`]}>Protein</Text>
          <TextInput
            style={[styles.input, tw`rounded-1`]}
            onChangeText={(text)=>{setNewItemProtein(text);}}
            placeholder="10"
            keyboardType="ascii-capable"
          />
        </View>

        <View style={[tw`flex flex-col`, { alignItems: "left" }]}>
          <Text style={[tw`text-xl ml-4`]}>Carbs</Text>
          <TextInput
            style={[styles.input, tw`rounded-1`]}
            onChangeText={(text)=>{setNewItemCarbs(text);}}
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
          <Text style={[tw`text-white text-center`]}>Add food</Text>
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

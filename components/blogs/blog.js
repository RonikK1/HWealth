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

export default function Blog(props, { navigation }) {

    const blogList = useRef([]);
    const [flatblogList, setBlogList] = useState([]);

    const [newBlogName, setNewBlogName] = useState();
    const [newBlogText, setNewBlogText] = useState();

    const [newItemView, setNewItemView] = useState(false);

    const toggleNewItemView = ()=>{
        setNewItemView(!newItemView);
    }

    useEffect(async ()=>{
      let { success, data } = await firebaseFetchAllBlogs();
      console.log(success,data);
      if(success && data.length>0){
        let parsedData = JSON.parse(data[0].dataupload);
        blogList.current = parsedData.blogitems.list;
        setBlogList(parsedData.blogitems.list);
      }
      else{
          console.log("No data found for today");
      }
    },[]);

    // doesnt integrate but function works
    const firebaseFetchUserDetails = async (uid) => {
      const dataRef  = firebase.firestore().collection("users").doc(`${uid}`);
      const doc = await dataRef.get();

      if (!doc.exists) {
        return { success: false, data: [] };
      } else {
        let userData = doc.data();
        return { success: true, data: userData };
      }

    }

    const firebaseFetchAllBlogs = async () => {
      const dataRef = firebase.firestore().collection("blog");

      const snapshot = await dataRef.get();

      if (snapshot.empty) {
        console.log("No matching documents.");
        return { success: false, data: [] };
      } else {
        let data1 = [];
        snapshot.forEach( async (doc) => {
          if (doc.exists) {
            let itemData = doc.data();
            data1.push(itemData);
          }
        });
        console.log(data1);

        return { success: true, data: data1 };
      }
    };

    const firebaseFetchBlogs = async ()=>{
      const dataRef = firebase.firestore().collection("blog");

      const snapshot = await dataRef
        .where("uid", "==", firebase.auth().currentUser.uid)
        .get();

      if (snapshot.empty) {
        console.log("No matching documents.");
        return { success: false, data: [] };
      }
      else{
        let data = [];

        snapshot.forEach((doc) => {
          data.push(doc.data());
        });

        return { success: true, data: data};
      }

    }

    const firebaseNewItemAdd = async () => {
      let today = moment().format("YYYY-MM-DD");
      let dataupload = JSON.stringify({ blogitems: { list: blogList.current } });
      let uid = firebase.auth().currentUser.uid;
      let username = firebase.auth().currentUser.displayName;

      console.log(today);
      console.log(firebase.auth().currentUser.uid);
      console.log(firebase.auth().currentUser);
      console.log(data);

      let { success, data } = await firebaseFetchBlogs();

      if(success){
          // data needs to be updated instead
          console.log("need to update instead...");
        firebase
          .firestore()
          .collection("blog")
          .doc(firebase.auth().currentUser.uid)
          .set({
            today,
            dataupload,
            uid,
            username
          })
          .then(() => {
            setNewItemView(false);
          });
      }
      else{
            firebase
              .firestore()
              .collection("blog")
              .doc(firebase.auth().currentUser.uid)
              .set({
                today,
                dataupload,
                uid,
                username
              })
              .then(() => {
                setNewItemView(false);
              });
      }
    };

    const handleNewItemAdd = () => {
      console.log("adding new blog");
      let timeNow = moment().format("YYYY-MM-DD hh:mm:ss");
      const items = blogList.current;
      let newItem = {
        id: uuid(),
        title: newBlogName,
        body: newBlogText,
        postTime: timeNow,
      };

      blogList.current = [...items, newItem];
      setBlogList([...items, newItem]);
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
          tw`flex flex-col bg-white border border-[#fff] rounded-5 justify-center mt-1`,
        ]}
      >
        <Text style={[tw`text-black font-bold m-2 text-xl`]}>{item.title}</Text>
        <Text style={[tw`text-black m-2`]}>{item.body}</Text>
        <Text style={[tw`text-black m-2`]}>{moment(item.postTime).format("DD-MM-YYYY")}</Text>
        <Text style={[tw`text-black m-2`]}>{item.name}</Text>
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
        <Text style={[tw`text-xl font-bold text-center`]}>Blog for today</Text>
        <View>
          <FlatList
            data={flatblogList}
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
          <Text style={[tw`text-xl ml-4`]}>Blog title</Text>
          <TextInput
            style={[styles.input, tw`rounded-1`]}
            onChangeText={(text) => {
              setNewBlogName(text);
            }}
            placeholder="Blog title"
            keyboardType="ascii-capable"
          />
        </View>

        <View style={[tw`flex flex-col`, { alignItems: "left" }]}>
          <Text style={[tw`text-xl ml-4`]}>Body</Text>
          <TextInput
            style={[styles.input, tw`rounded-1`]}
            onChangeText={(text) => {
              setNewBlogText(text);
            }}
            placeholder="Text"
            keyboardType="ascii-capable"
          />
        </View>

        <Pressable
          style={[
            tw`border border-black rounded-5 p-2 bg-[#4da6ff] border-[#4da6ff]`,
          ]}
          onPress={handleNewItemAdd}
        >
          <Text style={[tw`text-white text-center`]}>Post blog</Text>
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

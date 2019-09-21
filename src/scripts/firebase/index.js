import * as firebase from "firebase/app";
import "firebase/database";

import firebaseConfig from "./firebaseConfig";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const database = firebase.database();

export const writePostion = (uId, x, y) => {
  database.ref(`position/${uId}`).set({
    x,
    y
  });
};

export const setDBListner = (uId, callback = val => {}) => {
  if (uId) {
    const positionValue = database.ref(`position/${uId}`);
    positionValue.on("value", function(snapshot) {
      callback(snapshot.val());
    });
  }
};

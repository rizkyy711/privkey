import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, update, get } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAV42ZLNKlXih6e4HMqMEcX9inEO4199ts",
    authDomain: "privkey-4707a.firebaseapp.com",
    databaseURL: "https://privkey-4707a-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "privkey-4707a",
    storageBucket: "privkey-4707a.firebasestorage.app",
    messagingSenderId: "446413469375",
    appId: "1:446413469375:web:c2054d7ea2aec25dc7f80a",
    measurementId: "G-SM0MQHHYGE"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dataRef = ref(database, 'userData');

window.firebaseDatabase = { database, dataRef, set, push, onValue, update, get };

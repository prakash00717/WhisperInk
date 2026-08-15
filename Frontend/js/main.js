import Paper from "./Paper.js";

console.log("MAIN.JS LOADED");

window.addEventListener("DOMContentLoaded", () => {

    const canvas = document.getElementById("paper");

    const diaryApp = new Paper(canvas);

    console.log("Created Paper:", diaryApp);

    window.diaryApp = diaryApp;

    console.log("window.diaryApp =", window.diaryApp);

});
<template>
  <div id="app">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" 
        integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" 
        crossorigin="">
    <app-nav :logged="logged"></app-nav>
    <app-body :logged="logged" :located="located" :messagesAround="messagesAround"></app-body>
  </div>
</template>


<script>
import AppNav from "./components/AppNav.vue"
import AppBody from "./components/AppBody.vue"
import { EventBus } from "./main.js" 
const axios = require("axios");
const POLLING_INTERVAL = 10000;
const DEFAULT_LAT = 44.148020;
const DEFAULT_LNG = 12.235375;

export default {
  components: {
    AppNav,
    AppBody
  },
  data() {
    return {
      logged: (sessionStorage.getItem("logged") === null) ? false : JSON.parse(sessionStorage.logged),
      located: (sessionStorage.getItem("located") === null) ? {lat: DEFAULT_LAT, lng: DEFAULT_LNG} : JSON.parse(sessionStorage.located),
      // selectedMessageId,
      messagesAround:[
        {
          _id: 0,
          nickname: "mark", 
          name: "Marco",
          text: "#welcome to #wasteland",
          hashtags: ["welcome", "wasteland"],
          votes: 1,
          location: {
            type: "Point",
            coordinates: [38.6109607, -90.2060344]
          },
          comments_id: [],
        },
        {
          _id: 1,
          nickname: "euge", 
          name: "Eugenio",
          text: "#hello there",
          hashtags: ["hello"],
          votes: 2,
          location: {
            type: "Point",
            coordinates: [38.6111607, -90.2050322]
          },
          comments_id: [],
        }
      ]
    }
  },
  created() {
    EventBus.$on("loggedIn", () => {
      this.logged = true;
      sessionStorage.logged = JSON.stringify(true);
    });
    EventBus.$on("loggedOut", () => {
      this.logged = false;
      sessionStorage.logged = JSON.stringify(false);
    });
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        this.located.lat = position.coords.latitude;
        this.located.lng = position.coords.longitude;

        // (DEBUGGING) Uncomment the following lines to simulate random movements
        // this.located.lat = Math.random()*50;
        // this.located.lng = Math.random()*50;
        // console.log("Fake location: Lat"+this.located.lat + ",Lng:" + this.located.lng);

        if (this.logged === true) {
          axios.put(sessionStorage.urlHost + "/users/location", {
              lng: position.coords.longitude,
              lat: position.coords.latitude
            })
            .then(response => {
              console.log("coordinates updated in server")
              axios.get(sessionStorage.urlHost + "/messages/full")
                .then(response => {
                  console.log(response.data);
                  this.messagesAround = response.data;
                }).catch(error => {
                  if (error.response) {
                    console.log("Response");
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                  } else if (error.request) {
                    console.log("Request");
                    console.log(error.request);
                  } else {
                    console.log("Setting up");
                    console.log("Error", error.message);
                  }
                  console.log(error.config);
                });
            })
            .catch(error => {
              if (error.response) {
                console.log("Response");
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
              } else if (error.request) {
                console.log("Request");
                console.log(error.request);
              } else {
                console.log("Setting up");
                console.log("Error", error.message);
              }
              console.log(error.config);
            });
        }
      }, function() {
        noGeolocation('Error: The Geolocation service failed.');
      }, { enableHighAccuracy: true });
    } else {
      alert("Geolocation not supported by this browser.");
    }

    // Polling for new messages if the user isn't moving
    setInterval(function () {
      if (this.logged === true) {
        axios.get(sessionStorage.urlHost + "/messages/full")
          .then(response => {
            console.log(response.data);
            this.messagesAround = response.data;
          }).catch(error => {
            if (error.response) {
              console.log("Response");
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
            } else if (error.request) {
              console.log("Request");
              console.log(error.request);
            } else {
              console.log("Setting up");
              console.log("Error", error.message);
            }
            console.log(error.config);
          });
      }
    }.bind(this), POLLING_INTERVAL); 
  }
}
</script>


<style lang="sass">
@import './components/vars.sass'

#app
  font-family: 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #2c3e50

.fa-pen
  color: $base-color 

.fa-times-circle
  text-align: right
  padding-top: 12%
  cursor: pointer
  font-size: 24px 
  color: $base-color
  &:hover, &:active, &:focus
    color: $base-color-mod

.fa-comment
  font-size: 24px
  color: $base-color
  cursor: pointer
  width: 100%
  &:hover, &:active, &:focus
    color: $base-color-mod

.fa-envelope
  color: $base-color 

.fa-map-marker-alt
  color: $accent-color
  z-index: 1

</style>

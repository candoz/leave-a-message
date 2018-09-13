<template>
  <div id="app">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" 
        integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" 
        crossorigin="">
    <link href="https://fonts.googleapis.com/css?family=Jua|Nanum+Gothic" rel="stylesheet">
    <app-nav :logged="logged"></app-nav>
    <app-body :logged="logged" :located="located" :messagesAround="messagesAround"></app-body>
  </div>
</template>


<script>
import AppNav from "./components/AppNav.vue"
import AppBody from "./components/AppBody.vue"
import { EventBus } from "./main.js" 
const axios = require("axios");

const POLLING_INTERVAL = 30000;
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
      messagesAround:[ ]
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
    EventBus.$on("requestFullMessages", () => {
      if (this.logged === true) {
        this.getFullMessages();
      }
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
              this.getFullMessages();
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
        this.getFullMessages();
      }
    }.bind(this), POLLING_INTERVAL); 
  },
  methods: {
    getFullMessages: function() {
      axios.get(sessionStorage.urlHost + "/messages/full")
        .then(response => {
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
  }
}
</script>


<style lang="sass">
@import './components/vars.sass'

#app
  font-family: $primary-font
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #2c3e50
  height: 100%

.fa-heart
  color: $dark-color
  display: inline-block
  cursor: pointer

.fa-pen
  color: $primary-color
.fa-pencil
  color: $primary-color

.fa-times-circle
  text-align: right
  cursor: pointer
  font-size: 24px 
  color: $secondary-color

.fa-comment
  color: $dark-color
  cursor: pointer
  display: inline-block

.fa-comment-alt
  color: $dark-color

.fa-sad-cry
  color: $dark-color

.fa-map-marker-alt
  z-index: 500 !important

.liked
  color: $secondary-color

.disabled
  color: $light-color-mod-two
.logged-in
  color: $primary-color
.logged-out
  color: $dark-color

.envelope-outline-dark
  color: $dark-color
.envelope-outline-light
  color: $light-color-mod
.regular-envelope
  color: $light-color
.stripped-envelope
  color: $dark-color
.filtered-envelope
  color: $tertiary-color

.full-popup
  margin: 0
  padding: 0px
  font-size: 100%
  p 
    font-family: $secondary-font
    text-align: left
    margin: 0 !important
  .bottom-text
    margin-top: 10px !important
    display: flex
    justify-content: space-between
  .fa-comment
    cursor: auto
  .fa-heart
    cursor: auto

.stripped-popup
  color: $light-color
  .leaflet-popup-content-wrapper
    background-color: $dark-color 
  .leaflet-popup-tip
    background-color: $dark-color 

</style>

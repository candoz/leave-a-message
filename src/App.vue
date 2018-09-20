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

const POLLING_INTERVAL = 120000;

export default {
  components: {
    AppNav,
    AppBody
  },
  data() {
    return {
      logged: (sessionStorage.getItem("logged") === null) ? false : JSON.parse(sessionStorage.logged),
      located: (sessionStorage.getItem("located") === null) ? null : JSON.parse(sessionStorage.located),
      messagesAround:[]
    }
  },
  methods: {
    getFullMessages: function() {
      axios.get(sessionStorage.urlHost + "/messages/full", {
        params: {
          lng: this.located.lng,
          lat: this.located.lat
        }
      })
      .then(response => {
        this.messagesAround = response.data;
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
    },
    updateLocationInServer: function() {
      axios.put(sessionStorage.urlHost + "/users/location", {
        lng: this.located.lng,
        lat: this.located.lat
      })
      .then(response => {
        console.log("coordinates updated in server")
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
  },
  created() {
    EventBus.$on("loggedIn", () => {
      this.logged = true;
      sessionStorage.logged = JSON.stringify(true);
      if (this.located) {
        this.updateLocationInServer();
      }
    });
    EventBus.$on("loggedOut", () => {
      this.logged = false;
      sessionStorage.logged = JSON.stringify(false);
    });
    EventBus.$on("requestFullMessages", () => {
      if (this.located) {
        this.getFullMessages();
      }
    });
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(position => {
        if (this.located && this.located.lat === position.coords.latitude && this.located.lng === position.coords.longitude) {
          console.log("Same position as before...");
        } else {
          this.located = { 
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log("New position: " + this.located);
          this.getFullMessages();
          if (this.logged) {
            this.updateLocationInServer();
          }
        }
      }, function() {
        noGeolocation('Error: The Geolocation service failed.');
      }, { enableHighAccuracy: true });
    } else {
      alert("Geolocation not supported by this browser.");
    }

    // Polling for new messages if the user isn't moving
    setInterval(() => {
      if (this.located) {
        this.getFullMessages();
      }
    }, POLLING_INTERVAL); 
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
  color: $dark-color
  height: 100%

h4, h3
  margin: 0px 0px 11px 0px

.fa-comments, .fa-heart
  color: $dark-color
  display: inline-block
  cursor: pointer
  transition: color .5s
  &:hover
    color: $primary-color

.fa-pen
  color: $primary-color
.fa-pencil
  color: $primary-color

.fa-sad-cry
  color: $dark-color

.fa-map-marker-alt
  z-index: 500 !important

.liked
  color: $secondary-color
.disabled
  color: $light-color-mod-two

.highlighted
  background-color: rgba(20, 167, 108, 0.15)  // primary color in Hex: #14a76c

.logged-in
  color: $primary-color
.logged-out
  color: $dark-color

.envelope-outline-dark
  color: $dark-color
.envelope-outline-light
  color: $light-color-mod-two
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

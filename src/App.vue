<template>
  <div id="app">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" 
        integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" 
        crossorigin="">
    <link href="https://fonts.googleapis.com/css?family=Alegreya|Lato" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Oswald" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Baloo+Tammudu" rel="stylesheet">
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
    EventBus.$on("forceFullMessagesUpdate", () => {
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
      // if (this.logged === true) {
      if (this.logged === false) {
        this.getFullMessages();
      }
    }.bind(this), POLLING_INTERVAL); 
  },
  methods: {
    getFullMessages: function() {
      /* this.messagesAround = [
        {
          "_id": {
              "$oid": "5b900a60e2469c00d879ef2d"
          },
          "author_id": "5b8e98c5279ee175e040d78d",
          "text": "Ciao da Lizzano in Belvedere\n#belvedere #montanari #holiday",
          "comments": [
              {
                  "author_nickname": "euge",
                  "author_name": "Eugenio",
                  "text": "belvedere è veramente un bel paese, consigliatissimo"
              }
          ],
          "likes": [
              "5b8e98c5279ee175e040d78d"
          ],
          "date": {
              "$date": "2018-09-05T16:54:56.718Z"
          },
          "hashtags": [
              "belvedere",
              "montanari",
              "holiday"
          ],
          "location": {
              "type": "Point",
              "coordinates": [
                  12.2808,
                  44.1959
              ]
          },
          "author_nickname": "euge"
        },
        {
          "_id": {
              "$oid": "5b8f7e55594c6e37f0df36d0"
          },
          "author_id": "5b8e98c5279ee175e040d78d",
          "text": "Vediamo se funzionano i messaggi  #yo",
          "comments": [
              {
                  "author_nickname": "euge",
                  "author_name": "Eugenio",
                  "text": "i commenti sono stati un po strani da implementare"
              }
          ],
          "likes": [
              "5b8e98c5279ee175e040d78d"
          ],
          "date": {
              "$date": "2018-09-05T06:57:25.056Z"
          },
          "hashtags": [
              "yo"
          ],
          "location": {
              "type": "Point",
              "coordinates": [
                  12.2805,
                  44.198
              ]
          },
          "author_nickname": "euge"
        },
        {
          "_id": {
              "$oid": "5b8e9498d8594867d4307e02"
          },
          "author_id": "5b8e437fb4677f37e2f6dbac",
          "text": "Prova dall' #alfa\n",
          "comments": [
              {
                  "author_nickname": "euge",
                  "author_name": "Eugenio",
                  "text": "test commento "
              },
              {
                  "author_nickname": "euge",
                  "author_name": "Eugenio",
                  "text": "test commento "
              },
              {
                  "author_nickname": "euge",
                  "author_name": "Eugenio",
                  "text": "test commento "
              }
          ],
          "likes": [
              "5b8e437fb4677f37e2f6dbac",
              "5b8e98c5279ee175e040d78d"
          ],
          "date": {
              "$date": "2018-09-04T14:20:08.605Z"
          },
          "hashtags": [
              "alfa"
          ],
          "location": {
              "type": "Point",
              "coordinates": [
                  12.2806,
                  44.196
              ]
           }
        }
      ] */
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

.liked
  color: $secondary-color

.fa-pen
  color: $primary-color
  width: 100%

.fa-times-circle
  text-align: right
  cursor: pointer
  font-size: 24px 
  color: $secondary-color

.fa-comment
  color: $dark-color
  cursor: pointer
  display: inline-block

.fa-envelope
  color: $dark-color

.filtered
  color: $secondary-color

.logged-in
  color: $primary-color

.logged-out
  color: $dark-color

.fa-map-marker-alt
  z-index: 500 !important

</style>

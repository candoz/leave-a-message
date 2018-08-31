<template>
    <div class=profile>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.3/dist/leaflet.css"
        integrity="sha512-Rksm5RenBEKSKFjgI3a41vrjkw4EVPlJ3+OiI65vTjIdo9brlAacEuKOiQ5OFh7cOI1bkDwLqdLw3Zg0cRJAAQ=="
        crossorigin=""/>
      <div class="card">
        <img v-bind:src="profilePic" style="width:80%">
        <h3>{{ nickname }}</h3>
        <p class="mail">{{ email }}</p>
        <p class="reputation">{{ reputation }}</p>
        <div class="badges" v-for="badge in badges" :key=badge>
          {{badge}}
        </div>
        <button @click="doLogout()">logout</button>
      </div>
      <div id="map"></div>
    </div>
</template>

<script>
const axios = require("axios");
const DEFAULT_ZOOM_LEVEL = 13; 
const MIN_ZOOM_LEVEL = 5;
const MAX_ZOOM_LEVEL = 15;
import { EventBus } from "../main.js" 
import L from "leaflet";

export default {
  props: ["located"],
  data() {
    return {
      nickname: "Example Nickname",
      email: "Example@example.it",
      writedMessages: [],
      reputation: "15",
      badges: ["badge1", "badge2"],
      profilePic: require("../assets/profile-pic.png"),
      myMap: null,
      tileLayer: null,
      userMessages: [ ],
      userFullMessagesIcon: null
    };
  },
  methods: {
    initProfile() { 
      axios.get(sessionStorage.urlHost + "/users")
      .then(response => {
        this.nickname = response.data.nickname || "Nickname non trovato";
        this.email = response.data.email || "Email non trovata";
        this.getUserMessages();
      }).catch(error => {
          console.log(error);
      });
    },
    initMap() {
      this.myMap = L.map('map', {
        attributionControl: false
      });
      this.myMap.setView([this.located.lat, this.located.lng], DEFAULT_ZOOM_LEVEL);
      this.tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        minZoom: MIN_ZOOM_LEVEL,
        maxZoom: MAX_ZOOM_LEVEL,
        ext: 'png'
      }).addTo(this.myMap);
    },
    getUserMessages() {
      axios.
        get(sessionStorage.urlHost + "/messages/full/user")
        .then(response => {
          console.log(response.data);
          this.userMessages = response.data;
          this.userMessages.forEach(message => {
            let messageMarker = L.marker([message.location.coordinates[1], message.location.coordinates[0]], {icon: this.userFullMessagesIcon}).bindPopup(
              "Tags:" + message.tags + "\n" +
              "Votes: " + message.votes + "\n" +
              "Text: " + message.text + "\n"
            ).addTo(this.myMap);
          });
        })
        .catch(err => {
          console.log(err);
        });
    },
    doLogout(event) {
      axios
        .put(sessionStorage.urlHost + "/logout")
        .then(response => {
          EventBus.$emit("loggedOut");
          this.$router.push('/');
          console.log(response);
        })
        .catch(error => {
          console.log(error.config);
        });
    }
  },
  mounted() {
    this.initProfile();
    this.initMap();
    this.userFullMessagesIcon = L.icon({
      iconUrl: require("../assets/stripped-message.png"),
      iconSize: [24, 24],
    }); 
  },
};
</script>

<style lang="sass" scoped>
@import './vars.sass'

#map
  width: 30%
  height: 40vh
  max-height: 30%
  max-width: 1100px
  z-index: 0
  display: inline-block
  @media only screen and (max-width: 600px)
    width: 80%
    margin-top: 4%

.profile
  width: 100%
  padding: 10vh 0 0
  margin: auto

.card 
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2)
  max-width: 300px
  width: 40%
  background: #FFFFFF
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)
  margin-top: 1%
  text-align: center
  padding: 2%
  display: inline-block
  @media only screen and (max-width: 600px)
    width: 100%


.mail
  color: grey
  font-size: 18px

button
  text-transform: uppercase
  outline: 0
  background: $accent-color
  width: 100%
  max-width: 200px
  margin: 3% auto auto auto
  border: 0
  padding: 15px
  color: #FFFFFF
  font-size: 14px
  transition: all 0.3 ease
  cursor: pointer
  &:hover, &:active, &:focus
    background: $accent-color-mod

</style>
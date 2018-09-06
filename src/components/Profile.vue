<template>
    <div class=profile>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.3/dist/leaflet.css"
        integrity="sha512-Rksm5RenBEKSKFjgI3a41vrjkw4EVPlJ3+OiI65vTjIdo9brlAacEuKOiQ5OFh7cOI1bkDwLqdLw3Zg0cRJAAQ=="
        crossorigin=""/>
      <div class="profile-card">
        <h4>{{ name }}</h4>
        <img v-bind:src="profilePic" style="width:30%">
        <h5>@{{ nickname }}</h5>
        <button @click="doLogout()">Logout</button>
      </div>
      <div class="badges-card">
        <h4>Your badges</h4>
        <div class="badges-container">
          <div v-for="badge in badgesPic" :key=badge >
            <img class="badge-image" v-bind:src="badge">
          </div>
        </div>
      </div>
      <div class="map-card">
        <h4>Your messages around the world</h4>
        <div id="map"></div>
      </div>
    </div>
</template>

<script>
const axios = require("axios");
const DEFAULT_ZOOM_LEVEL = 13; 
import { EventBus } from "../main.js" 
import L from "leaflet";

export default {
  props: ["located"],
  data() {
    return {
      nickname: "Example Nickname",
      email: "Example@example.it",
      name: "Example",
      badges: [ "beta-tester", "explorer", "certified", "one-year", "beta-tester", "explorer", "certified", "one-year"  ],
      profilePic: require("../assets/profile-pic.png"),
      myMap: null,
      tileLayer: null,
      userMessages: [ ],
      userFullMessagesIcon: null
    };
  },
  computed: {
    badgesPic: function() {
      let badgesPic = [ ];
      this.badges.forEach(badge => {
        badgesPic.push(require('../assets/'+badge+'.png'));
      });
      return badgesPic;
    }
  },
  methods: {
    initProfile() { 
      axios.get(sessionStorage.urlHost + "/users")
      .then(response => {
        this.email = response.data.email;
        this.nickname = response.data.nickname;
        this.name = response.data.name;
        this.badges = response.data.badges;
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
        // subdomains: 'abcd',
        ext: 'png'
      }).addTo(this.myMap);
    },
    getUserMessages() {
      axios.
        get(sessionStorage.urlHost + "/messages/full/user")
        .then(response => {
          console.log(response.data);
          this.userMessages = response.data;
          let markers = [];
          this.userMessages.forEach(message => {
            let messageMarker = L.marker([message.location.coordinates[1], message.location.coordinates[0]], {icon: this.userFullMessagesIcon}).bindPopup(
              '<p><b>Hashtags:</b> ' +  
              this.hashtagFormatter(message.hashtags) + 
              '<br /><b>Likes:</b> ' +
              message.likes.length +
              '<br /><b>Written by:</b> ' +
              message.author_nickname +
              '</p>'
            ).addTo(this.myMap);
            markers.push(messageMarker);
          this.myMap.fitBounds(new L.featureGroup(markers).getBounds().pad(0.5));
          });
        })
        .catch(err => {
          console.log(err);
        });
    },
    hashtagFormatter(hashtagsArray) {
      let result = [ ];
      if(hashtagsArray) {
        hashtagsArray.forEach(hashtag => {
          result.push("#"+hashtag)
        });
      }
      return result;
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
    this.initMap();
    this.initProfile();
    this.userFullMessagesIcon = L.divIcon({
      className: "fas fa-envelope fa-2x"
    }); 
  },
};
</script>

<style lang="sass" scoped>
@import './vars.sass'

.profile
  padding: 4vh 2vw
  display: flex
  flex-wrap: wrap
  justify-content: center
  align-items: flex-start

%card
  background: #FFFFFF
  box-shadow: $shadow
  border-radius: $radius
  margin: 0 2% 2% 2%
  padding: 10px
  
.profile-card
  @extend %card
  flex-basis: 20%
  flex-grow: 2

.badges-card
  @extend %card
  flex-basis: 100px
  flex-grow: 1

.badges-container
  display: flex
  flex-wrap: wrap
  flex-direction: row
  justify-content: center
  overflow-y: auto
  max-height: 300px

.badge-image
  width: 80px
  flex: 1
  
.map-card
  @extend %card
  flex-basis: 40%
  flex-grow: 2
  align-self: stretch
  min-height: 400px

#map
  height: 80%
  z-index: 0

.mail
  color: grey
  font-size: 18px

button
  text-transform: uppercase
  outline: 0
  background: $secondary-color
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
    // background: $primary-color-mod
    box-shadow: $shadow
</style>
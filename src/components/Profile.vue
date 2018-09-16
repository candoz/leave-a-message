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
import L from "leaflet";
import { EventBus } from "../main.js" 
const axios = require("axios");

const DEFAULT_ZOOM_LEVEL = 13;

const ENVELOPE_ICON_WIDTH = 24;
const ENVELOPE_ICON_HEIGHT = 24;
const REGULAR_ENVELOPE_ICON = L.divIcon({ className: "fas fa-envelope fa-stack-2x regular-envelope", iconAnchor: [ENVELOPE_ICON_WIDTH / 2, ENVELOPE_ICON_HEIGHT / 2] });
const ENVELOPE_OUTLINE_DARK_ICON = L.divIcon({ className: "far fa-envelope fa-2x envelope-outline-dark", iconAnchor: [ENVELOPE_ICON_WIDTH / 2, ENVELOPE_ICON_HEIGHT / 2] });

export default {
  props: ["located"],
  data() {
    return {
      nickname: "Example Nickname",
      email: "Example@example.it",
      name: "Example",
      badges: [ "beta-tester", "explorer", "certified", "one-year", "beta-tester", "explorer", "certified", "one-year"  ],
      profilePic: require("../assets/profile-pic.png"),
      userMessages: [],  // not mandatory...
      myMap: null
    };
  },
  computed: {
    badgesPic: function() {
      let badgesPic = [ ];
      this.badges.forEach(badge => {
        badgesPic.push(require('../assets/' + badge + '.png'));
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
        attributionControl: false,
        layers: [ L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png',{ext:'png'}) ]
      }).setView([this.located.lat, this.located.lng], DEFAULT_ZOOM_LEVEL)
    },
    getUserMessages() {
      axios.
        get(sessionStorage.urlHost + "/messages/full/user")
        .then(response => {
          console.log(response.data);
          this.userMessages = response.data;
          const messagesGroup = L.featureGroup().addTo(this.myMap);
          this.userMessages.forEach(msg => {
            const msgLatLng = [msg.location.coordinates[1], msg.location.coordinates[0]];
            
            const popupHtml =
              "<div class='full-popup'>" +
                "<p>" + msg.text + "</p>" +
                "<div class='bottom-text'>" +
                  "<div>" +
                    "<p>by <b>" + msg.author_nickname +" &nbsp; </b></p>" +
                  "</div>" +
                  "<div>" +
                    "<p>" +
                      " &nbsp; <i class='fas fa-comment'> </i> " + msg.comments.length + " " +
                      "<i class='fas fa-heart'> </i> " + msg.likes.length +
                    "</p>" +
                  "</div>" +
                "</div>" +
              "</div>";
            
            const fullPopup = L.popup({ closeButton: false })
              .setContent(popupHtml)

            const envelopeMarker = L.marker(msgLatLng)
              .setIcon(REGULAR_ENVELOPE_ICON)
              .addTo(messagesGroup);
            
            const envelopeOutlineMarker = L.marker(msgLatLng, { id: msg._id })
              .setIcon(ENVELOPE_OUTLINE_DARK_ICON)
              .bindPopup(fullPopup)
              .addTo(messagesGroup);
          });
          this.myMap.fitBounds(messagesGroup.getBounds().pad(0.5));
        })
        .catch(err => {
          console.log(err);
        });
    },
    hashtagFormatter(hashtagsArray) {
      let result = [ ];
      if(hashtagsArray) {
        hashtagsArray.forEach(hashtag => {
          result.push("#" + hashtag)
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
  background: $light-color
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
    box-shadow: $shadow
</style>
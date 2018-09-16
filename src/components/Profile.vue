<template>
    <div class="profile-component">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.3/dist/leaflet.css"
        integrity="sha512-Rksm5RenBEKSKFjgI3a41vrjkw4EVPlJ3+OiI65vTjIdo9brlAacEuKOiQ5OFh7cOI1bkDwLqdLw3Zg0cRJAAQ=="
        crossorigin=""/>
      <div class="profile-card">
        <h4>{{ name }}</h4>
        <p>{{ nickname }}</p>
        <img v-bind:src="profilePic" style="width:30%">
        <div class="badges-container">
          <div v-for="badge in badgesPic" :key=badge >
            <img class="badge-image" v-bind:src="badge">
          </div>
        </div>
        <button @click="doLogout()">Logout</button>
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
      nickname: "nickname",
      name: "Name Surname",
      badges: [ "beta-tester", "explorer"],// "certified", "one-year", "beta-tester", "explorer", "certified", "one-year" ],
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

.profile-component
  height: 100%
  display: flex
  padding: 4vh 2vw
  justify-content: center
  @media screen and (max-width: $media-width-first)
    flex-direction: column
    padding: 4vh 0

%card
  flex-grow: 1
  background: $light-color
  box-shadow: $shadow
  min-width: 250px
  max-width: 450px
  min-height: 350px
  max-height: 500px
  border-radius: $radius
  margin: 0 1%
  padding: 1%
  display: flex
  flex-direction: column
  align-items: center
  @media screen and (max-width: $media-width-first)
    align-self: center
    width: 90%
    margin: 0
    padding: 2%
    min-height: 200px
  
.profile-card
  @extend %card
  flex-basis: 40vh
  justify-content: space-evenly
  .badges-container
    max-width: 70%
    max-height: 100px
    display: flex
    flex-wrap: wrap
    justify-content: center
    overflow-y: auto
    max-height: 300px
    margin: 15px 0 15px 0 
    .badge-image
      width: 80px
      height: 80px
  p
    margin: 0 0 15px 0 
  button
    text-transform: uppercase
    outline: 0
    border: 0
    font-family: $primary-font
    font-size: 100%
    background: $secondary-color
    width: 230px
    padding: 15px
    color: #FFFFFF
    cursor: pointer
    margin-bottom: 8px
    &:hover, &:active, &:focus
      box-shadow: $shadow
  
.map-card
  @extend %card
  #map
    flex: 1
    z-index: 0

</style>
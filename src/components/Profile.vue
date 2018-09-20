<template>
    <div class="profile-component">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.3/dist/leaflet.css"
        integrity="sha512-Rksm5RenBEKSKFjgI3a41vrjkw4EVPlJ3+OiI65vTjIdo9brlAacEuKOiQ5OFh7cOI1bkDwLqdLw3Zg0cRJAAQ=="
        crossorigin=""/>
      <div class="profile-card">
        <h4>{{ name }}</h4>
        <p>{{ nickname }}</p>
        <div class="profile-pic-container">
          <img v-bind:src="profilePic" class="profile-pic">
          <div class="edit">
            <a href="#">
              <input type="file" name="file" id="file" class="inputfile " @change="changeProfilePic">
              <label for="file" class="fas fa-camera fa-2x logged-in"></label>
            </a>
          </div>
        </div>
        <div class="badges-container">
          <div v-for="badge in badgesPic" :key=badge.badgeName >
            <div class="tooltip">
              <img class="badge-image" v-bind:src="badge.badgeUrl">
              <span class="tooltiptext"> {{ badgesDescription[badge.badgeName] }} </span>
            </div>
          </div>
        </div>
        <button @click="doLogout()">Logout</button>
      </div>
      <div class="map-card">
        <h4>My messages around the world</h4>
        <div id="map"></div>
      </div>
    </div>
</template>

<script>
import L from "leaflet";
import { EventBus } from "../main.js" 
const axios = require("axios");
import BadgesDescription from './BadgesDescription.js'

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
      badges: [ "beta_testing", "certified", "the_explorer", "top_contributor", "one_year_club" ], //badges: [ "beta-testing", "certified"],  "the-explorer", "top-contributor", "one-year-club"],
      badgesDescription: BadgesDescription,
      profilePic: require("../assets/profile_pic.png"),
      userMessages: [],  // not mandatory...
      myMap: null
    };
  },
  computed: {
    badgesPic: function() {
      let badgesPic = [ ];
      this.badges.forEach(badge => {
        let badgeTuple = {
          "badgeName" : badge,
          "badgeUrl" : require('../assets/'+badge+'.png')
        }
        badgesPic.push(badgeTuple);
      });
      return badgesPic;
    },
    nicknamePic: function() {
      return this.nickname+"pic"
    }
  },
  methods: {
    initProfile() { 
      axios.get(sessionStorage.urlHost + "/users")
      .then(response => {
        this.nickname = response.data.nickname;
        this.name = response.data.name;
        this.badges = response.data.badges;
        this.profilePic = localStorage.getItem(this.nicknamePic) || require("../assets/profile_pic.png")
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
    },
    changeProfilePic(e) {
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length)
        return;
      let image = new Image();
      let reader = new FileReader();
      let self = this;

      reader.onload = (e) => {
        localStorage.profilePic = e.target.result;
        localStorage.setItem(this.nicknamePic, e.target.result);
        self.profilePic = e.target.result;
        //load to server? here
      };
      reader.readAsDataURL(files[0]);
    },
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
  @media screen and (max-width: $media-width-second)
    flex-direction: column
    padding: 4vh 0

%card
  flex-grow: 1
  background: $light-color
  box-shadow: $shadow
  min-width: 250px
  min-height: 450px
  border-radius: $radius
  margin: 0 1%
  padding: 1%
  display: flex
  flex-direction: column
  align-items: center
  @media screen and (max-width: $media-width-second)
    align-self: center
    width: 90%
    padding: 2%
  
.profile-card
  @extend %card
  flex-basis: 40vh
  max-width: 300px
  max-height: 500px
  justify-content: space-evenly
  @media screen and (max-width: $media-width-second)
    margin: 0
  p
    margin: 0 0 15px 0 
  button
    text-transform: uppercase
    outline: 0
    border: 0
    font-family: $primary-font
    font-size: 100%
    background: $secondary-color
    width: 220px
    padding: 15px
    color: #FFFFFF
    cursor: pointer
    margin-bottom: 8px
    &:hover, &:active, &:focus
      box-shadow: $shadow

.profile-pic
  max-width: 175px
  max-height: 175px

.badges-container
  width: 70%
  max-height: 180px
  display: flex
  flex-wrap: wrap
  justify-content: center
  overflow-x: hidden
  overflow-y: auto
  margin: 15px 0 15px 0 
  .badge-image
    width: 80px
    height: 80px
  
.map-card
  @extend %card
  max-width: 550px
  max-height: 550px
  align-items: stretch
  @media screen and (max-width: $media-width-second)
    margin-top: 3vh
  #map
    z-index: 0
    flex: 1

.tooltip
  position: relative
  display: block
  .tooltiptext
    visibility: hidden
    width: 120px
    background-color: $dark-color
    font-family: $secondary-font
    font-size: 80%
    color: #fff
    text-align: center
    padding: 5px 0
    border-radius: 6px
    position: absolute
    z-index: 1000
    left: 50%
    margin-left: -60px
    opacity: 0
    transition: opacity 0.3s
    /* &::after
      content: ""
      position: absolute
      top: 100%
      left: 50%
      margin-left: -5px
      border-width: 5px
      border-style: solid
      border-color: #555 transparent transparent transparent
       */
  &:hover .tooltiptext
    visibility: visible
    opacity: 1

.profile-pic-container
  position: relative
  display: inline-block
  &:hover .edit
    display: block

.edit
  padding-top: 7px
  padding-right: 7px
  position: absolute
  right: 0
  top: 0
  display: none
  a
    color: #000
  label
    cursor: pointer

.inputfile
  width: 0.1px
  height: 0.1px
  opacity: 0
  overflow: hidden
  position: absolute
  z-index: -1
</style>
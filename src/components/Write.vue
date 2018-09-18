<template>
  <div class=write-component>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.3/dist/leaflet.css"
      integrity="sha512-Rksm5RenBEKSKFjgI3a41vrjkw4EVPlJ3+OiI65vTjIdo9brlAacEuKOiQ5OFh7cOI1bkDwLqdLw3Zg0cRJAAQ=="
      crossorigin=""/>
    <form v-on:submit.prevent id="write-form" class="write-card" @submit.prevent="writeMessage">
      
      <div v-if="!logged" class="cannot-write-motivation">
        <p>
          please 
          <router-link :to="'/login'" class="a-login" exact> login </router-link> <br />
          to write something
        </p>
      </div>
      
      <div v-if="logged && !located" class="cannot-write-motivation">
        <p> Waiting to acquire your current location ... </p>
      </div>

      <textarea v-if="logged && located" form="write-form" v-model="messageText" placeholder="Write here your message"  maxlength="256"></textarea>
      
      <button :disabled="loading || !logged || !located" type="submit" class="">Publish message</button>
    </form>
    <div class="lds-facebook" v-if="loading"><div></div><div></div><div></div></div>
    <div class="map-card">
      <div id="map"></div>
    </div>
  </div>
</template>

<script>
import L from "leaflet";
const axios = require("axios");

const DEFAULT_ZOOM_LEVEL = 16
const MIN_ZOOM_LEVEL = 6;
const POPUP_TEXT = "Your message will be published here!"
const MILLIS_TO_PUBLISH = 2000;
const HASHTAGS_REGEXP = new RegExp("(#[a-z\d-]+)");

const PENGIL_ICON_WIDTH = 36;
const PENGIL_ICON_HEIGHT = 37;
const PENCIL_ICON_LOGGED_IN = L.divIcon({ className: "fas fa-pencil-alt fa-3x logged-in", iconAnchor: [0, PENGIL_ICON_HEIGHT] });
const PENCIL_ICON_LOGGED_OUT = L.divIcon({ className: "fas fa-pencil-alt fa-3x disabled", iconAnchor: [0, PENGIL_ICON_HEIGHT] });

export default {
  props: ["located", "logged"],
  data() {
    return {
      myMap: null,
      tileLayer: null,
      pencilPointer: null,
      pencilIcon: null,
      messageText: null,
      loading: false,
    };
  },
  methods: {
    initMap() {
      this.myMap = L.map('map', {
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: 'center',
			  doubleClickZoom: 'center',
			  touchZoom:       'center'
        // zoomControl: false,
      });
      this.myMap.setView([this.located.lat, this.located.lng], DEFAULT_ZOOM_LEVEL);
      this.tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
        minZoom: MIN_ZOOM_LEVEL,
        ext: 'png'
      }).addTo(this.myMap);
      this.pencilPointer = L.marker([this.located.lat, this.located.lng], {icon: this.pencilIcon})
        .bindPopup(L.popup({ closeButton: false }).setContent(POPUP_TEXT))
        .addTo(this.myMap);
    },
    writeMessage(event) {
      // if(HASHTAGS_REGEXP.test(this.messageText)) {
        this.loading = true;
        let self = this;
        setTimeout(function(){
          axios
          .post(sessionStorage.urlHost + "/messages", {
            text: self.messageText
          })
          .then(response => {
            console.log(response);
            self.messageText = "";
            self.loading = false;
            self.$router.push('/');
          })
          .catch(error => {
            if (error.response) {
              console.log("Response");
            } else if (error.request) {
              console.log("Richiesta");
            } else {
              console.log("Setting up");
              console.log("Error", error.message);
            }
            console.log(error.config);
          });
        }, MILLIS_TO_PUBLISH);
      // } else {
      //   alert("Please insert at least one hashtag");
      // }
    }
  },
  mounted() {
    this.pencilIcon = this.logged ? PENCIL_ICON_LOGGED_IN : PENCIL_ICON_LOGGED_OUT;
    this.initMap();
  },  
  watch: {
    located: {
      handler(newCoordinates, oldValue) {
        console.log("update: newCoordinates detected! lat:" + newCoordinates.lat + "lng:" + newCoordinates.lng);
        this.myMap.removeLayer(this.pencilPointer);
        this.pencilPointer = L.marker([this.located.lat, this.located.lng], { icon: this.pencilIcon })
          .bindPopup(L.popup({ closeButton: false }).setContent(POPUP_TEXT))
          .addTo(this.myMap);
        this.myMap.setView([this.located.lat, this.located.lng]);
      },
      deep: true
    }
  },
};
</script>

<style lang="sass" scoped>
@import './vars.sass'

.write-component
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
  border-radius: $radius
  margin: 0 1%
  padding: 1%
  @media screen and (max-width: $media-width-first)
    align-self: center
    width: 90%
    margin: 0
    padding: 2%
    min-height: 200px

.map-card
  @extend %card
  @media screen and (max-width: $media-width-first)
    flex-basis: 40vh
    margin-top: 3vh
    height: auto

#map
  z-index: 0
  height: 100%

.write-card
  @extend %card
  display: flex
  flex-direction: column
  @media screen and (max-width: $media-width-first)
    flex-basis: 40vh

form
  @extend %card
  flex-grow: 1
  text-align: center
  display: flex
  flex-direction: column

%write-area
  flex-grow: 1
  background-color: $light-color-mod
  margin: 0 0 12px
  padding: 12px
  border: 0
  box-sizing: border-box

textarea 
  @extend %write-area
  font-family: $secondary-font
  font-size: 14px
  resize: none

.cannot-write-motivation 
  @extend %write-area
  width: 100%
  font-size: 105%
  p
    text-align: center
    vertical-align: middle
    font-family: $primary-font

a
  text-decoration: none

button
  text-transform: uppercase
  font-size: 100%
  font-family: $primary-font
  outline: 0
  background: $primary-color
  width: 100%
  border: 0
  padding: 15px
  color: #FFFFFF
  cursor: pointer
  &:hover:enabled, &:active:enabled, &:focus:enabled
    box-shadow: $shadow
  &:disabled
    background: $light-color-mod-two
    cursor: auto

.a-login
  color: $primary-color

.lds-facebook
  display: inline-block
  position: relative
  width: 64px
  height: 64px
  div
    display: inline-block
    position: absolute
    left: 6px
    width: 13px
    background: $secondary-color
    animation: lds-facebook 1.2s cubic-bezier(0, 0.5, 0.5, 1) infinite
    &:nth-child(1)
      left: 6px
      animation-delay: -0.24s
    &:nth-child(2)
      left: 26px
      animation-delay: -0.12s
    &:nth-child(3)
      left: 45px
      animation-delay: 0

@keyframes lds-facebook
  0%
    top: 6px
    height: 51px
  50%, 100%
    top: 19px
    height: 26px

</style>
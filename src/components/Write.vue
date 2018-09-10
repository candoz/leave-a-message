<template>
  <div class=write-component>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.3/dist/leaflet.css"
      integrity="sha512-Rksm5RenBEKSKFjgI3a41vrjkw4EVPlJ3+OiI65vTjIdo9brlAacEuKOiQ5OFh7cOI1bkDwLqdLw3Zg0cRJAAQ=="
      crossorigin=""/>
    <form v-on:submit.prevent id="write-form" @submit.prevent="writeMessage">
      <textarea v-if="logged === true" form="write-form" v-model="messageText" placeholder="Write here your message"></textarea>
      <div v-if="logged === false" class="login-to-write">
        <p class="text-align-middle">
          <router-link :to="'/login'" class="a-login" exact> login </router-link>
          or
          <router-link :to="'/signup'" class="a-signup" exact> signup </router-link>
          <!-- <br/> -->
          to write
        </p>
      </div>
      <button :disabled="loading === true || logged === false" type="submit" class="">Publish message</button>
    </form>
    <div class="lds-facebook" v-if="loading === true"><div></div><div></div><div></div></div>
    <div class="map-card">
      <div id="map"></div>
    </div>
  </div>
</template>

<script>
import L from "leaflet";
const axios = require("axios");
const DEFAULT_ZOOM_LEVEL = 13
const MIN_ZOOM_LEVEL = 5;
const POPUP_TEXT = "Your message will be published here"

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
      this.pencilPointer = L.marker([this.located.lat, this.located.lng], {icon: this.pencilIcon}).bindPopup(POPUP_TEXT).addTo(this.myMap);
    },
    writeMessage(event) {
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
      }, 2000);
    }
  },
  mounted() {
    if (this.logged === true) {
      this.pencilIcon = L.divIcon({
        className: "fas fa-pencil-alt fa-3x logged-in",  // "fas fa-pen fa-3x"
        iconAnchor: [0, 36]
      });
    } else {
      this.pencilIcon = L.divIcon({
        className: "fas fa-pencil-alt fa-3x",  // "fas fa-pen fa-3x"
        iconAnchor: [0, 36]
      });
    }
    this.initMap();
  },  
  watch: {
    located: {
      handler(newCoordinates, oldValue) {
        console.log("update: newCoordinates detected! lat:" + newCoordinates.lat + "lng:" + newCoordinates.lng);
        this.myMap.setView([this.located.lat, this.located.lng]);
        this.myMap.removeLayer(this.pencilPointer);
        this.pencilPointer = L.marker([this.located.lat, this.located.lng], {icon: this.pencilIcon}).bindPopup(POPUP_TEXT).addTo(this.myMap); 
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
  flex-wrap: wrap
  padding: 4vh 2vw
  justify-content: center

%card
  background: $light-color
  box-shadow: $shadow
  max-width: 400px
  min-width: 180px
  min-height: 350px
  border-radius: $radius
  flex: 1
  margin: 0 2% 2% 2%
  padding: 2.5% 

.map-card
  @extend %card

#map
  z-index: 0
  height: 100%

form
  @extend %card
  text-align: center

textarea
  outline: 0
  font-family: $secondary-font
  background: $light-color-mod
  width: 100%
  height: 80%
  border: 0
  margin: 0 0 15px
  padding: 12px
  box-sizing: border-box
  font-size: 14px
  resize: none

.login-to-write
  width: 100%
  height: 80%
  background-color: $light-color-mod
  display: table

.text-align-middle
  text-align: center
  vertical-align: middle
  display: table-cell

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
  -webkit-transition: all 0.3 ease
  transition: all 0.3 ease
  cursor: pointer
  margin-bottom: 10px
  &:hover:enabled, &:active:enabled, &:focus:enabled
    box-shadow: $shadow
  &:disabled
    background: $dark-color
    cursor: auto

.a-login
  color: $primary-color

.a-signup
  color: $secondary-color

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
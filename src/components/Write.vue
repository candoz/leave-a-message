<template>
    <div class=write-component>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.3/dist/leaflet.css"
        integrity="sha512-Rksm5RenBEKSKFjgI3a41vrjkw4EVPlJ3+OiI65vTjIdo9brlAacEuKOiQ5OFh7cOI1bkDwLqdLw3Zg0cRJAAQ=="
        crossorigin=""/>
      <div id="map"></div>
      <form v-on:submit.prevent id="write-form" @submit.prevent="writeMessage">
        <h3>Write a message</h3>
          <textarea form="write-form" v-model="messageText" placeholder="Write here your message"></textarea>
        <button :disabled="loading === true" type="submit" class="">Publish message</button>
        <div class="lds-facebook" v-if="loading === true"><div></div><div></div><div></div></div>
      </form>
    </div>
</template>

<script>
import L from "leaflet";
const axios = require("axios");
const DEFAULT_ZOOM_LEVEL = 13
const MIN_ZOOM_LEVEL = 5;
const MAX_ZOOM_LEVEL = 16;
const POPUP_TEXT = "Your message will be published here"

export default {
  props: ["located"],
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
      this.tileLayer = L.tileLayer("https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}", {
        // attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        minZoom: MIN_ZOOM_LEVEL,
        maxZoom: MAX_ZOOM_LEVEL,
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
    this.pencilIcon = L.icon({
      iconUrl: require("../assets/lead-pencil.png"),
      iconSize: [24, 24],
    }); 
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

#map
  width: 50%
  height: 50vh
  max-height: 30%
  max-width: 1100px
  margin: auto
  z-index: 0

.write-component
  margin: auto
  background: #FFFFFF
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)
  width: 90%
  padding: 15vh 0 0

form
  z-index: 0
  background: #FFFFFF
  max-width: 360px
  width: 80%
  margin: 1% auto auto auto
  padding: 2%
  text-align: center
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)

textarea
  outline: 0
  background: #f2f2f2
  width: 100%
  border: 0
  margin: 0 0 15px
  padding: 15px
  box-sizing: border-box
  font-size: 14px
  max-width: 360px

button
  text-transform: uppercase
  outline: 0
  background: $base-color
  width: 100%
  border: 0
  padding: 15px
  color: #FFFFFF
  font-size: 14px
  transition: all 0.3 ease
  cursor: pointer
  &:hover, &:active, &:focus
    background: $base-color-mod

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
    background: $accent-color
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
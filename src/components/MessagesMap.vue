<template>
  <div>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.3/dist/leaflet.css"
      integrity="sha512-Rksm5RenBEKSKFjgI3a41vrjkw4EVPlJ3+OiI65vTjIdo9brlAacEuKOiQ5OFh7cOI1bkDwLqdLw3Zg0cRJAAQ=="
      crossorigin=""/>
    <div class="filter-input">
      <input type="text" v-model="filter" placeholder="filter by hashtag or by nickname" />
    </div>
    <div id="map"></div>
    
  </div>
</template>


<script>
import L from "leaflet";
import { } from "leaflet-easybutton"
import { } from "leaflet-maskcanvas"
import { EventBus } from "../main.js"
const axios = require("axios");

const FULL_MESSAGES_RADIUS = 5000;  // meters
const POLLING_INTERVAL = 10000;

const MIN_ZOOM_LEVEL = 5;
const MASK_OPACITY = 0.65;

const PIN_ICON_WIDTH = 18;
const PIN_ICON_HEIGHT = 24;
const ENVELOPE_ICON_WIDTH = 24;
const ENVELOPE_ICON_HEIGHT = 25;

const Z_INDEX_USER_LOCATION = 1;
const Z_INDEX_MASK = 1;
const Z_INDEX_STRIPPED = 1;
const Z_INDEX_FULL = 1;

export default {
  props: ["located", "logged", "filter", "messagesAround"],
  data() {
    return {
      strippedMessages: [],
      strippedPolling: null,

      pinIconLoggedIn: L.divIcon({ className: "fas fa-map-marker-alt fa-2x logged-in", iconAnchor: [PIN_ICON_WIDTH / 2, PIN_ICON_HEIGHT] }),
      pinIconLoggedOut: L.divIcon({ className: "fas fa-map-marker-alt fa-2x logged-out", iconAnchor: [PIN_ICON_WIDTH / 2, PIN_ICON_HEIGHT] }),
      envelopeOutlineIcon: L.divIcon({ className: "far fa-envelope fa-2x envelope-outline", iconAnchor: [ENVELOPE_ICON_WIDTH / 2, ENVELOPE_ICON_HEIGHT / 2] }),
      regularEnvelopeIcon: L.divIcon({ className: "fas fa-envelope fa-stack-2x regular-envelope", iconAnchor: [ENVELOPE_ICON_WIDTH / 2, ENVELOPE_ICON_HEIGHT / 2] }),
      strippedEnvelopeIcon: L.divIcon({ className: "fas fa-envelope fa-stack-2x stripped-envelope", iconAnchor: [ENVELOPE_ICON_WIDTH / 2, ENVELOPE_ICON_HEIGHT / 2], }),
      filteredEnvelopeIcon: L.divIcon({ className: "fas fa-envelope fa-stack-2x filtered-envelope", iconAnchor: [ENVELOPE_ICON_WIDTH / 2, ENVELOPE_ICON_HEIGHT / 2], }),
      
      myMap: null,
      tileLayer: null,
      maskLayer: null,
      strippedGroup: L.layerGroup(),
      fullGroup: L.layerGroup(),
      userLocationMarker: null
    }
  },
  computed: {
    filterAbsent: function() {
      return this.filter === "";
    }
  },
  methods: {
    initMap() {

      this.myMap = L.map('map', {
        attributionControl: false,
        doubleClickZoom: false,
        scrollWheelZoom: 'center',
			  doubleClickZoom: 'center',
			  touchZoom: 'center'
      });
      this.myMap.setView([this.located.lat, this.located.lng], 13);

      let self = this;
      L.easyButton('fa-crosshairs fa-lg', (btn, map) => {
        map.setView([self.located.lat, self.located.lng]);
      }).addTo(this.myMap);

      this.tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
        minZoom: MIN_ZOOM_LEVEL,
        ext: 'png'
      }).addTo(this.myMap);

      this.maskLayer = L.TileLayer.maskCanvas({
        radius: FULL_MESSAGES_RADIUS,  // radius in pixels or in meters (see useAbsoluteRadius)
        useAbsoluteRadius: true,       // true: r in meters, false: r in pixels
        color: "#000",
        opacity: MASK_OPACITY,
        noMask: false,
        minZoom: MIN_ZOOM_LEVEL
      }).addTo(this.myMap);
      this.maskLayer.setData([[self.located.lat, self.located.lng]]);

      this.userLocationMarker = L.marker([this.located.lat, this.located.lng], { icon: this.pinIconLoggedOut })
        .bindPopup("You are here")
        .addTo(this.myMap);

      this.strippedGroup.addTo(this.myMap);
      this.fullGroup.addTo(this.myMap);     
    },
    satisfiesFilter(message) {
      return message.author_nickname.toLowerCase().startsWith(this.filter.toLowerCase() ||
             message.hashtags.some(hashtag => {
               return (hashtag.toLowerCase().startsWith(this.filter.toLowerCase()))
             }));
    },
    updateStrippedLayer() {
      this.strippedGroup.clearLayers();
      this.strippedMessages.forEach(message => {
        if (this.filterAbsent || satisfiesFilter(message)) {
          const popupString = "<p><b>Hashtags: </b> " + this.hashtagFormatter(message.hashtags) + "<br />" +
                              "<b>By: </b> " + message.author_nickname + "</p>" +
                              "<b>Likes: </b> " + message.likes.length + "<br />";
          const envelopeMarker = L.marker(message.latLng, {id: message.id});
          if (this.filterAbsent) {
            envelopeMarker.setIcon(this.strippedEnvelopeIcon);
          } else {
            envelopeMarker.setIcon(this.filteredEnvelopeIcon);
          }
          const envelopeOutlineMarker = L.marker(message.latLng, {icon: this.envelopeOutlineIcon, id: message.id}).bindPopup(popupString);
          this.strippedGroup.addLayer(envelopeMarker);
          this.strippedGroup.addLayer(envelopeOutlineMarker);
        }
      });
    },
    updateFullLayer() {
      this.fullGroup.clearLayers();
      this.messagesAround.forEach(message => {
        if (this.filterAbsent || satisfiesFilter(message)) {
          const popupString = "<p>" + message.text + "<br />" +
                              "<b>By: </b> " + message.author_nickname + "<br />" +
                              "<b>Likes: </b> " + message.likes.length + "</p>";
          const envelopeMarker = L.marker(message.latLng, {id: message.id});
          if (this.filterAbsent) {
            envelopeMarker.setIcon(this.regularEnvelopeIcon);
          } else {
            envelopeMarker.setIcon(this.filteredEnvelopeIcon);
          }
          const envelopeOutlineMarker = L.marker(message.latLng, {icon: this.envelopeOutlineIcon, id: message.id}).bindPopup(popupString);
          this.fullGroup.addLayer(envelopeMarker);
          this.fullGroup.addLayer(envelopeOutlineMarker);
        }
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
    watchMapMovement() {
      this.myMap.on("moveend", (event) => {  // "move" ?
        let cornerSouthWest = event.target.getBounds().getSouthWest();
        let cornerNorthEast = event.target.getBounds().getNorthEast();
        this.getStripped(cornerSouthWest, cornerNorthEast);
      });
    },
    getStripped(cornerSouthWest, cornerNorthEast) {
      axios.get(sessionStorage.urlHost + "/messages/stripped", {
          params: {
            cornerBottomLeft: [cornerSouthWest.lng, cornerSouthWest.lat],
            cornerUpperRight: [cornerNorthEast.lng, cornerNorthEast.lat],
          }
        }).then(response => {
          this.strippedMessages.length = 0;
          for (let element of response.data) {
            this.strippedMessages.push({
              id : element._id,
              author_nickname: element.author_nickname,
              hashtags: element.hashtags,
              likes: element.likes,
              latLng: [element.location.coordinates[1], element.location.coordinates[0]],  //NB: lat and lng are inverted server side
            });
          }
          this.updateStrippedLayer();
        }).catch(error => {
          console.log(error);
        });
    }
  },
  watch: {
    located: {
      handler(newCoordinates) {
        this.userLocationMarker.setLatLng(L.latLng(newCoordinates.lat, newCoordinates.lng));
        this.maskLayer.setData([[newCoordinates.lat, newCoordinates.lng]]);
        console.log("update: newCoordinates detected! lat:" + newCoordinates.lat + "lng:" + newCoordinates.lng);
      },
      deep: true
    },
    logged: {
      handler(newValue) {
        console.log("logged handler, logged= " + newValue);
        if (newValue == true) {
          this.userLocationMarker.setIcon(this.pinIconLoggedIn);
        } else {
          this.userLocationMarker.setIcon(this.pinIconLoggedOut);
        }
      },
      deep: true
    },
    messagesAround: {
      handler() {
        // this.updateFullLayer();
      },
      deep: true
    },
    filter: {
      handler() {
        this.updateStrippedLayer();
        // this.updateFullLayer();
      }
    }
  },
  created() {
    EventBus.$on("selectedFullMessage", (idMessage) => {
      this.strippedGroup.getLayers().forEach(message => {
        if(message.options.id === idMessage) {
          this.myMap.setView(message.getLatLng(), 13);
          // change icon to open envelope
        }
      });
    });
  },
  mounted() {
    this.initMap();
    this.watchMapMovement();
    this.strippedPolling = setInterval(function() {
      this.getStripped(this.myMap.getBounds().getSouthWest(), this.myMap.getBounds().getNorthEast())
    }.bind(this), POLLING_INTERVAL);
  },
  destroyed() {
    clearInterval(this.strippedPolling);
  }
}
</script>


<style lang="sass" scoped>
@import './vars.sass'

#map
  z-index: 0
  flex: 1

.filter-input
  margin-bottom: 8px
  input
    font-family: $secondary-font
    color: $dark-color
    width: 100%
    text-align: center
    outline: 0
    background: $light-color-mod
    border: 0
    padding: 5px
    box-sizing: border-box
    font-size: 14px

</style>

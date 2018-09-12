<template>
  <div>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.3/dist/leaflet.css"
      integrity="sha512-Rksm5RenBEKSKFjgI3a41vrjkw4EVPlJ3+OiI65vTjIdo9brlAacEuKOiQ5OFh7cOI1bkDwLqdLw3Zg0cRJAAQ=="
      crossorigin=""/>
    <div id="map"></div>
    <div class="filter-input">
      <input type="text" v-model="filter" placeholder="filter by hashtag or by nickname" />
    </div>
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
const START_ZOOM_LEVEL = 14;
const MASK_OPACITY = 0.65;

const PIN_ICON_WIDTH = 18;
const PIN_ICON_HEIGHT = 24;
const ENVELOPE_ICON_WIDTH = 24;
const ENVELOPE_ICON_HEIGHT = 25;

const Z_INDEX_STRIPPED_FILL = 3;
const Z_INDEX_STRIPPED_OUTLINE = 4;
const Z_INDEX_FULL_FILL = 5;
const Z_INDEX_FULL_OUTLINE = 6;
const Z_INDEX_USER_LOCATION = 7;

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
      userLocationMarker: null,
      strippedGroup: L.layerGroup(),
      fullGroup: L.layerGroup()
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
      }).setView([this.located.lat, this.located.lng], START_ZOOM_LEVEL);
    },
    initCenterButton() {
      let self = this;
      L.easyButton('fa-crosshairs fa-lg', (btn, map) => {
        map.setView([self.located.lat, self.located.lng]);
      }).addTo(this.myMap);
    },
    initTileLayer() {
      this.tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
        minZoom: MIN_ZOOM_LEVEL,
        ext: 'png'
      }).addTo(this.myMap);
    },
    initMaskLayer() {
      this.maskLayer = L.TileLayer.maskCanvas({
        radius: FULL_MESSAGES_RADIUS,  // radius in pixels or in meters (see useAbsoluteRadius)
        useAbsoluteRadius: true,       // true: r in meters, false: r in pixels
        color: "#000",
        opacity: MASK_OPACITY,
        noMask: false,
        minZoom: MIN_ZOOM_LEVEL
      });
      this.maskLayer.setData([[this.located.lat, this.located.lng]]);
      this.maskLayer.addTo(this.myMap);
    },
    initUserLocationMarker() {
      this.userLocationMarker = L.marker(
        [this.located.lat, this.located.lng],
        { icon: this.pinIconLoggedOut }
      );
      this.userLocationMarker.setZIndexOffset(Z_INDEX_USER_LOCATION)
                             .bindPopup("You are here")
                             .addTo(this.myMap);
    },
    initMessagesGroups() {
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
          
          const popupString = "<p>By " + message.author_nickname + "<br />"+
                              "<p class='fas fa-heart'>" + message.likes.length + "</p>"+
                              "<b>Topics: </b> " + this.hashtagFormatter(message.hashtags) + "</p>";
          
          const envelopeMarker = 
            L.marker(message.latLng, { id: message.id })
             .setZIndexOffset(Z_INDEX_STRIPPED_FILL)
             .setIcon(this.filterAbsent ? this.strippedEnvelopeIcon : this.filteredEnvelopeIcon)
             .addTo(this.strippedGroup);

          const envelopeOutlineMarker =
            L.marker(message.latLng, { id: message.id })
             .setZIndexOffset(Z_INDEX_STRIPPED_OUTLINE)
             .setIcon(this.envelopeOutlineIcon)
             .bindPopup(popupString)
             .addTo(this.strippedGroup);
        }
      });
    },
    updateFullLayer() {
      this.fullGroup.clearLayers();
      this.messagesAround.forEach(message => {
        if (this.filterAbsent || satisfiesFilter(message)) {
          
          const msgLatLng = [message.location.coordinates[1], message.location.coordinates[0]];
          const popupString = "<p>" + message.text + "<br />" +
                              "<b>By: </b> " + message.author_nickname + "<br />" +
                              "<b>Likes: </b> " + message.likes.length + "</p>";
          
          const envelopeMarker =
            L.marker(msgLatLng, {id: message.id})
             .setZIndexOffset(Z_INDEX_FULL_FILL)
             .setIcon(this.filterAbsent ? this.regularEnvelopeIcon : this.filteredEnvelopeIcon)
             .addTo(this.fullGroup);
          
          const envelopeOutlineMarker = 
            L.marker(msgLatLng, { id: message.id })
             .setZIndexOffset(Z_INDEX_FULL_OUTLINE)
             .setIcon(this.envelopeOutlineIcon)
             .bindPopup(popupString)
             .addTo(this.fullGroup);
        }
      });
    },
    hashtagFormatter(hashtagsArray) {
      let result = [ ];
      if (hashtagsArray) {
        hashtagsArray.forEach(hashtag => {
          result.push("#" + hashtag)
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
          this.updateFullLayer();  // FORSE DA TOGLIERE
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
    messagesAround: {
      handler() {
        this.updateFullLayer();
      },
      deep: true
    },
    filter: {
      handler() {
        this.updateStrippedLayer();
        this.updateFullLayer();
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
    this.initCenterButton();
    this.initTileLayer();
    this.initMaskLayer();
    this.initUserLocationMarker();
    this.initMessagesGroups();

    this.watchMapMovement();

    if(this.logged) {
      this.userLocationMarker.setIcon(this.pinIconLoggedIn);
    } else {
      this.userLocationMarker.setIcon(this.pinIconLoggedOut);
    }

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
  margin-top: 8px
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

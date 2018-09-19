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
const STRIPPED_POLLING_INTERVAL = 120000;

const MASK_OPACITY = 0.6;
const MIN_ZOOM_LEVEL = 5;

const MAP_CENTER_NO_LOCATION_AVAIL = [44.498955, 11.327591];  // Bologna
const ZOOM_LEVEL_NO_LOCATION_AVAIL = 7;
const ZOOM_LEVEL_FIRST_LOCATION = 14;

const PIN_ICON_WIDTH = 18;
const PIN_ICON_HEIGHT = 24;
const ENVELOPE_ICON_WIDTH = 24;
const ENVELOPE_ICON_HEIGHT = 24;

const Z_INDEX_STRIPPED = 1000;
const Z_INDEX_FULL = 2000;
const PIN_LOGGED_IN_ICON = L.divIcon({ className: "fas fa-map-marker-alt fa-2x logged-in", iconAnchor: [PIN_ICON_WIDTH / 2, PIN_ICON_HEIGHT] });
const PIN_LOGGED_OUT_ICON = L.divIcon({ className: "fas fa-map-marker-alt fa-2x logged-out", iconAnchor: [PIN_ICON_WIDTH / 2, PIN_ICON_HEIGHT] });
const ENVELOPE_OUTLINE_LIGHT_ICON = L.divIcon({ className: "far fa-envelope fa-2x envelope-outline-light", iconAnchor: [ENVELOPE_ICON_WIDTH / 2, ENVELOPE_ICON_HEIGHT / 2] });
const ENVELOPE_OUTLINE_DARK_ICON = L.divIcon({ className: "far fa-envelope fa-2x envelope-outline-dark", iconAnchor: [ENVELOPE_ICON_WIDTH / 2, ENVELOPE_ICON_HEIGHT / 2] });
const REGULAR_ENVELOPE_ICON = L.divIcon({ className: "fas fa-envelope fa-stack-2x regular-envelope", iconAnchor: [ENVELOPE_ICON_WIDTH / 2, ENVELOPE_ICON_HEIGHT / 2] });
const STRIPPED_ENVELOPE_ICON = L.divIcon({ className: "fas fa-envelope fa-stack-2x stripped-envelope", iconAnchor: [ENVELOPE_ICON_WIDTH / 2, ENVELOPE_ICON_HEIGHT / 2] });
const FILTERED_ENVELOPE_ICON = L.divIcon({ className: "fas fa-envelope fa-stack-2x filtered-envelope", iconAnchor: [ENVELOPE_ICON_WIDTH / 2, ENVELOPE_ICON_HEIGHT / 2] });

export default {
  props: ["located", "logged", "messagesAround"],
  data() {
    return {
      strippedMessages: [],
      filter: "",
      strippedPolling: null,
      myMap: null,
      tileLayer: null,
      maskLayer: null,
      userLocationMarker: null,
      strippedGroup: null,
      fullGroup: null,
      firstLocationInfo: true
    }
  },
  computed: {
    filterAbsent: function() {
      return this.filter === "";
    }
  },
  methods: {
    initMap() {
      let mapCenter;
      let zoomLevel;
      if (this.located) {
        mapCenter = this.located;
        zoomLevel = ZOOM_LEVEL_FIRST_LOCATION
        this.firstLocationInfo = false;
      } else {
        mapCenter = MAP_CENTER_NO_LOCATION_AVAIL;
        zoomLevel = ZOOM_LEVEL_NO_LOCATION_AVAIL;
      }
      this.myMap = L.map('map', {
        attributionControl: false,
        doubleClickZoom: false,
       }).setView(mapCenter, zoomLevel);
    },
    initTileLayer() {
      this.tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
        minZoom: MIN_ZOOM_LEVEL,
        ext: 'png'
      }).addTo(this.myMap);
    },
    initMessagesGroups() {
      this.strippedGroup = L.layerGroup();
      this.strippedGroup.addTo(this.myMap);
      this.fullGroup = L.layerGroup();
      this.fullGroup.addTo(this.myMap);  
    },
    initMaskLayer() {
      this.maskLayer = L.TileLayer.maskCanvas({
        radius: FULL_MESSAGES_RADIUS,  // radius in pixels or in meters (see useAbsoluteRadius)
        useAbsoluteRadius: true,       // true: r in meters, false: r in pixels
        color: "#000",
        opacity: MASK_OPACITY,
        noMask: false,
        minZoom: MIN_ZOOM_LEVEL
      }).addTo(this.myMap);
    },
    initUserLocationMarker() {
      this.userLocationMarker = L.marker(
        [this.located.lat, this.located.lng],
        { icon: this.logged ? PIN_LOGGED_IN_ICON : PIN_LOGGED_OUT_ICON }
      )
        .bindPopup(L.popup({ closeButton: false }).setContent("You are here"))
        .addTo(this.myMap);
    },
    initCenterButton() {
      let self = this;
      L.easyButton('fa-crosshairs fa-lg', (btn, map) => {
        map.setView([self.located.lat, self.located.lng]);
      }).addTo(this.myMap);
    },
    satisfiesFilter(msg) {
      return msg.author_nickname.toLowerCase().startsWith(this.filter.toLowerCase()) ||
              msg.hashtags.some(hashtag => {
                return hashtag.toLowerCase().startsWith(this.filter.toLowerCase());
              });
    },
    updateStrippedLayer() {
      this.strippedGroup.clearLayers();
      if (this.strippedMessages.length > 0) {
        this.strippedMessages.forEach(msg => {
          if (this.filterAbsent || this.satisfiesFilter(msg)) {
            
            const popupHtml = "<div class='stripped-popup'>" + this.hashtagFormatter(msg.hashtags) + "</div>"
            const strippedPopup = L.popup({ 
              closeButton: false, 
              className: "stripped-popup" 
            }).setContent(popupHtml)

            const envelopeMarker = L.marker(msg.latLng, { id: msg.id })
              .setZIndexOffset(Z_INDEX_STRIPPED)
              .setIcon(this.filterAbsent ? STRIPPED_ENVELOPE_ICON : FILTERED_ENVELOPE_ICON)
              .addTo(this.strippedGroup);

            const envelopeOutlineMarker = L.marker(msg.latLng, { id: msg.id })
              .setZIndexOffset(Z_INDEX_STRIPPED)
              .setIcon(this.filterAbsent ? ENVELOPE_OUTLINE_LIGHT_ICON : ENVELOPE_OUTLINE_DARK_ICON)
              .bindPopup(strippedPopup)
              .addTo(this.strippedGroup);
          }
        });
      }
    },
    updateFullLayer() {
      this.fullGroup.clearLayers();
      if (this.messagesAround.length > 0) {
          this.messagesAround.forEach(msg => {
          if (this.filterAbsent || this.satisfiesFilter(msg)) {
            
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
              .setZIndexOffset(Z_INDEX_FULL)
              .setIcon(this.filterAbsent ? REGULAR_ENVELOPE_ICON : FILTERED_ENVELOPE_ICON)
              .addTo(this.fullGroup);
            
            const envelopeOutlineMarker = L.marker(msgLatLng, { id: msg._id })
              .setZIndexOffset(Z_INDEX_FULL)
              .setIcon(ENVELOPE_OUTLINE_DARK_ICON)
              .bindPopup(fullPopup)
              .on('click', function(e) {                                     // NB: do NOT change to the newer syntax!!
                EventBus.$emit("clickedOnEnvelopeNearby", this.options.id);  // NB: 'this' refers to the marker here...
              })
              .addTo(this.fullGroup);
          }
        });
      }
    },
    hashtagFormatter(hashtagsArray) {
      let result = [];
      if (hashtagsArray.length > 0) {
        hashtagsArray.forEach(hashtag => {
          result.push("#" + hashtag)
        });
      }
      return result.join(" ");
    },
    watchMapMovement() {
      this.myMap.on("moveend", (event) => {  // "move" instead of "moveend" for more responsiveness, but also more server requests !
        let cornerSouthWest = event.target.getBounds().getSouthWest();
        let cornerNorthEast = event.target.getBounds().getNorthEast();
        this.getStripped(cornerSouthWest, cornerNorthEast);
      });
    },
    getStripped(cornerSouthWest, cornerNorthEast) {
      axios.get(sessionStorage.urlHost + "/messages/stripped", {
        params: {
          cornerBottomLeft: [cornerSouthWest.lng, cornerSouthWest.lat],
          cornerUpperRight: [cornerNorthEast.lng, cornerNorthEast.lat]
        }
      })
      .then(response => {
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
      })
      .catch(error => {
        console.log(error);
      });
    },
    selectFullMsg(msgId) {
      EventBus.$emit("clickedOnEnvelopeNearby", msgId);
    },
  },
  watch: {
    located: {
      handler(newCoordinates) {
        const newLatLng = L.latLng([newCoordinates.lat, newCoordinates.lng]);
        if (this.firstLocationInfo) {
          this.initUserLocationMarker();
          this.initCenterButton();
          this.myMap.flyTo(newLatLng, ZOOM_LEVEL_FIRST_LOCATION);
          this.firstLocationInfo = false;
        }
        this.maskLayer.setData([newLatLng]);  // array of coordinates
        this.userLocationMarker.setLatLng(newLatLng);
        console.log("New coordinates detected: " + newLatLng);
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
    EventBus.$on("selectedFullMessageFromList", (msgId) => {
      if (this.fullGroup.getLayers().length > 0) {
        this.fullGroup.getLayers().forEach(marker => {
          if(marker.options.id === msgId) {
            this.myMap.setView(marker.getLatLng());
            marker.openPopup();
            // change icon to opened envelope ?
          }
        });
      }
    });
  },
  mounted() {
    this.initMap();
    this.initTileLayer();
    this.initMaskLayer();
    this.initMessagesGroups();
    this.watchMapMovement();

    if (this.located) {
      this.firstLocationInfo = false;
      const currentLatLng = L.latLng(this.located.lat, this.located.lng);

      EventBus.$emit("requestFullMessages");
      
      this.initUserLocationMarker();
      this.initCenterButton();
      
      this.myMap.flyTo(currentLatLng, ZOOM_LEVEL_FIRST_LOCATION);
      this.maskLayer.setData([currentLatLng]);  // array of coordinates
      this.userLocationMarker.setLatLng(currentLatLng);
    }
    
    // get stripped messages now
    this.getStripped(this.myMap.getBounds().getSouthWest(), this.myMap.getBounds().getNorthEast());
    
    // get stripped messages in the future with stripped polling
    this.strippedPolling = setInterval(function() {
      this.getStripped(this.myMap.getBounds().getSouthWest(), this.myMap.getBounds().getNorthEast());
    }.bind(this), STRIPPED_POLLING_INTERVAL);
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
  margin-top: 13px
  input
    font-family: $secondary-font
    width: 100%
    text-align: center
    outline: 0
    background: $light-color-mod
    border: 0
    padding: 5px
    box-sizing: border-box
    font-size: 14px

</style>

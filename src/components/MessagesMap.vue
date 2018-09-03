<template>
    <div class="messages-map">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.3/dist/leaflet.css"
        integrity="sha512-Rksm5RenBEKSKFjgI3a41vrjkw4EVPlJ3+OiI65vTjIdo9brlAacEuKOiQ5OFh7cOI1bkDwLqdLw3Zg0cRJAAQ=="
        crossorigin=""/>
      <div id="map"></div>
    </div>
</template>


<script>
import L from "leaflet";
import { } from "leaflet-easybutton"
import { } from "leaflet-maskcanvas"
import { EventBus } from "../main.js"
const axios = require("axios");
const FULL_MESSAGES_RADIUS = 7500;  // meters
const POLLING_INTERVAL = 10000;
const USER_LOCATION_ICON_WIDTH = 18;
const USER_LOCATION_ICON_HEIGHT = 24;
const MESSAGE_ICON_WIDTH = 24;
const MESSAGE_ICON_HEIGHT = 25;

export default {
  props: ["located", "logged"],
  data() {
    return {
      myMap: null,
      strippedMessages: [ ],
      tileLayer: null,
      maskLayer: null,
      strippedGroup : null,
      strippedMessageIcon : null,
      fg: null,
      userLocationIcon: null,
      userLocationMarker: null,
      strippedPollingId: null
    }
  },
  methods: {
    initMap() {
      this.myMap = L.map('map', {
        attributionControl: false,
        doubleClickZoom: false,
        scrollWheelZoom: 'center',
			  doubleClickZoom: 'center',
			  touchZoom:       'center'
      });
      this.myMap.setView([this.located.lat, this.located.lng], 13);

      // this.tileLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
      this.tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
        // subdomains: 'abcd',
        minZoom: 5,
        // maxZoom: 15,
        ext: 'png'
      }).addTo(this.myMap);

      this.userLocationMarker = L.marker([this.located.lat, this.located.lng], {
        icon: this.userLocationIcon
      }).bindPopup(
        "Your current position"
      ).addTo(this.myMap);

      let self = this;
      L.easyButton('fa-crosshairs fa-lg', (btn, map) => {
        map.setView([self.located.lat, self.located.lng]);
      }).addTo(this.myMap);

      this.maskLayer = L.TileLayer.maskCanvas({
        radius: FULL_MESSAGES_RADIUS,  // radius in pixels or in meters (see useAbsoluteRadius)
        useAbsoluteRadius: true,       // true: r in meters, false: r in pixels
        color: '#000',
        opacity: 0.6  ,
        noMask: false,
      }).addTo(this.myMap);
      this.maskLayer.setData([[self.located.lat, self.located.lng]]);
      
    },
    updateStrippedLayer() {
      this.strippedGroup.clearLayers();
      this.strippedMessages.forEach(message => {
        let messageMarker = L.marker(message.latLng, {icon: this.strippedMessageIcon, id: message.id}).bindPopup(
          "Tags:" + message.tags + "\n" +
          "Votes: " + message.votes + "\n" +
          "Author: " + message.name + "\n"
        );
        this.strippedGroup.addLayer(messageMarker);
      });
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
            cornerBottomLeft: [ cornerSouthWest.lng , cornerSouthWest.lat ],
            cornerUpperRight: [ cornerNorthEast.lng , cornerNorthEast.lat ],
          }
        }).then(response => {
          this.strippedMessages.length = 0;
          for (let element of response.data) {
            this.strippedMessages.push({
              id : element._id,
              name: element.name, //NON VIENE INVIATO
              tags: element.hashtags,
              votes: element.votes, //NON VENGONO INVIATI
              latLng: [element.location.coordinates[1], element.location.coordinates[0]], //NB: lat and lng are inverted server side
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
      handler(newCoordinates, oldValue) {
        this.userLocationMarker.setLatLng(L.latLng(newCoordinates.lat, newCoordinates.lng));
        this.maskLayer.setData([[newCoordinates.lat, newCoordinates.lng]]);
        // this.myMap.setView([this.located.lat, this.located.lng]);
        console.log("update: newCoordinates detected! lat:" + newCoordinates.lat + "lng:" + newCoordinates.lng);
      },
      deep: true
    },
    logged: {
      handler(newValue, oldValue) {
        if (newValue === true) {
          this.userLocationIcon = L.divIcon({
            className: "fas fa-map-marker-alt fa-2x logged-in",
            iconAnchor: [USER_LOCATION_ICON_WIDTH / 2, USER_LOCATION_ICON_HEIGHT],
            iconSize: [USER_LOCATION_ICON_WIDTH, USER_LOCATION_ICON_HEIGHT],
          });
        } else {
          this.userLocationIcon = L.divIcon({
            className: "fas fa-map-marker-alt fa-2x logged-out",
            iconAnchor: [USER_LOCATION_ICON_WIDTH / 2, USER_LOCATION_ICON_HEIGHT],
            iconSize: [USER_LOCATION_ICON_WIDTH, USER_LOCATION_ICON_HEIGHT],
          });
        }
        this.userLocationMarker.setIcon(this.userLocationIcon)
      },
      deep: true
    }
  },
  created() {
    EventBus.$on("selectedFullMessage", (idMessage) => {
      this.strippedGroup.getLayers().forEach(message => {
        if(message.options.id == idMessage) {
          this.myMap.setView(message.getLatLng(), 13);
          message.openPopup();
        }
      });
    });
  },
  mounted() {  // do NOT change to "created"
    this.strippedMessageIcon = L.divIcon({
      className: "fas fa-envelope fa-2x",
      iconAnchor: [MESSAGE_ICON_WIDTH / 2, MESSAGE_ICON_HEIGHT / 2],
      iconSize: [MESSAGE_ICON_WIDTH, MESSAGE_ICON_HEIGHT],
    }); 
    this.fullMessageIcon = L.divIcon({
      className: "fas fa-envelope fa-2x"
    });
    
    if (this.logged === true) {
      this.userLocationIcon = L.divIcon({
        className: "fas fa-map-marker-alt fa-2x logged-in",
        iconAnchor: [USER_LOCATION_ICON_WIDTH / 2, USER_LOCATION_ICON_HEIGHT],
        iconSize: [USER_LOCATION_ICON_WIDTH, USER_LOCATION_ICON_HEIGHT],
      });
    } else {
      this.userLocationIcon = L.divIcon({
        className: "fas fa-map-marker-alt fa-2x logged-out",
        iconAnchor: [USER_LOCATION_ICON_WIDTH / 2, USER_LOCATION_ICON_HEIGHT],
        iconSize: [USER_LOCATION_ICON_WIDTH, USER_LOCATION_ICON_HEIGHT],
      });
    }
    
    this.initMap();
    this.strippedGroup = L.layerGroup().addTo(this.myMap);
    this.watchMapMovement();

    // Polling ...
    this.strippedPollingId = setInterval(function() {
      this.getStripped(this.myMap.getBounds().getSouthWest(), this.myMap.getBounds().getNorthEast())
    }.bind(this), POLLING_INTERVAL);
  },
  destroyed() {
    clearInterval(this.strippedPollingId);
  }
}
</script>


<style lang="sass" scoped>

#map
  width: 90%
  height: 50vh
  max-height: 40%
  max-width: 1100px
  margin: auto
  z-index: 0

</style>

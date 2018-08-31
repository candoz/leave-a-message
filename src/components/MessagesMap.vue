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
// import { } from "../leaflet-tilelayer-mask-master/leaflet-tilelayer-mask.js"
import { EventBus } from "../main.js"
const axios = require("axios");
const FULL_MESSAGES_RADIUS = 5000;  // meters
const POLLING_INTERVAL = 10000;
const COLOR = "#14a76c";

export default {
  props: ["located"],
  data() {
    return {
      myMap: null,
      myArea: null,
      strippedMessages: [ ],
      tileLayer: null,
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
      });
      this.myMap.setView([this.located.lat, this.located.lng], 13);

      // this.tileLayer = L.tileLayer("http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png", {
      //   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
      //   maxZoom: 30,
      //   minZoom: 5,
      // }).addTo(this.myMap);

      // this.tileLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
      //   attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      //   // subdomains: 'abcd',
      //   minZoom: 5,
      //   maxZoom: 16,
      //   ext: 'png'
      // }).addTo(this.myMap);

      // this.tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png', {
      this.tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
      // this.tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
      // this.tileLayer = L.tileLayer('https://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey={apikey}', {
      // this.tileLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
      // this.tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        
        // subdomains: 'abcd',
        minZoom: 5,
        // maxZoom: 15,
        ext: 'png'
      }).addTo(this.myMap);

      this.myArea = L.circle([this.located.lat, this.located.lng], {
        color: COLOR, // "#B96925", // "#e68a00", "#FFD700",
        weight: "2",
        dashArray: "5",
        // fillColor: COLOR, // "#ff9900", "#FFD700",
        fillOpacity: 0.075,
        radius: FULL_MESSAGES_RADIUS
      });

      this.userLocationMarker = L.marker([this.located.lat, this.located.lng], {
        icon: this.userLocationIcon
      }).bindPopup(
        "Your current position"
      ).addTo(this.myMap);

      let self = this;
      L.easyButton('fa-crosshairs fa-lg', (btn, map) => {
        map.setView([self.located.lat, self.located.lng], 12);
      }).addTo(this.myMap);
      this.myArea.addTo(this.myMap);

      // this.fg = L.tileLayer.mask('https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png', { 
      //   maskSize : L.point(200, 200)
      // }).addTo(this.myMap);
      
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
      this.myMap.on("moveend", (event) => {  // "move"
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
        console.log("update: newCoordinates detected! lat:" + newCoordinates.lat + "lng:" + newCoordinates.lng);
        this.myMap.removeLayer(this.myArea);
        this.myArea.setLatLng(L.latLng(newCoordinates.lat, newCoordinates.lng)).addTo(this.myMap);
        this.myMap.removeLayer(this.userLocationMarker);
        this.userLocationMarker.setLatLng(L.latLng(newCoordinates.lat, newCoordinates.lng)).addTo(this.myMap);
        // this.fg.setCenter(e.containerPoint);
        // this.myMap.setView([this.located.lat, this.located.lng], 13);
      },
      deep: true
    }
  },
  created() {
    EventBus.$on("selectedFullMessage", (idMessage) => {
      this.strippedGroup.getLayers().forEach(message => {
        console.log("ID dello stripped: " + message.options.id);
        console.log("ID del full: " + idMessage);
        console.log("---");
        if(message.options.id == idMessage) {
          this.myMap.setView(message.getLatLng(), 13);
          message.openPopup();
        }
      });
    });
  },
  mounted() {  // do NOT change to "created"
    this.strippedMessageIcon = L.icon({
      iconUrl: require("../assets/stripped-message.png"),
      iconSize: [24, 24],
    }); 
    this.fullMessageIcon = L.icon({
      iconUrl: require("../assets/full-message.png"),
      iconSize: [24, 24],
    });
    this.userLocationIcon = L.icon({
      iconUrl: require("../assets/map-marker.png"),
      iconSize: [24, 24],
    });
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

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
const axios = require("axios");
import { EventBus } from "../main.js" 

export default {
  props: ["located"],
  data() {
    return {
      myMap: null,
      myArea: null,
      strippedMessages: [ ],
      tileLayer: null,
      strippedGroup : null,
      strippedMessageIcon : null
    }
  },
  methods: {
    initMap() {
      this.myMap = L.map('map').setView([this.located.lat, this.located.lng], 13);
      this.tileLayer = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
        maxZoom: 30,
        minZoom: 5,
      }).addTo(this.myMap);
      this.myArea = L.circle([this.located.lat, this.located.lng], {
        color: '#e68a00',
        fillColor: '#ff9900 ',
        fillOpacity: 0.1,
        radius: 500
      }).addTo(this.myMap);
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
      this.myMap.on("moveend", (event) => {
      //this.myArea.setLatLng(event.target.getCenter() );
        let cornerSouthWest = event.target.getBounds().getSouthWest();
        let cornerNorthEast = event.target.getBounds().getNorthEast();
        let cornerBottomLeft = [ cornerSouthWest.lng , cornerSouthWest.lat ];
        let cornerUpperRight = [ cornerNorthEast.lng , cornerNorthEast.lat ];
        axios.get(sessionStorage.urlHost + "/messages/stripped", {
          params: {
            cornerBottomLeft: cornerBottomLeft,
            cornerUpperRight: cornerUpperRight,
          }
        }).then(response => {
          this.strippedMessages.length = 0;
          for (let element of response.data) {
            this.strippedMessages.push({
              id : element._id,
              name: element.name,//NON VIENE INVIATO
              tags: element.hashtags,
              votes: element.votes, //NON VENGONO INVIATI
              latLng: [element.location.coordinates[1], element.location.coordinates[0]], //NB: lat and lng are inverted server side
            });
          }
          this.updateStrippedLayer();
        }).catch(error => {
          console.log(error);
        });
      });
    }
  },
  watch: {
    located: (newCoordinates) => {
      console.log("update: newCoordinates detected! lat:" + newCoordinates.lat + "lng:" + newCoordinates.lng);
      this.myArea.setLatLng(T.latLng(newCoordinates.lat, newCoordinates.lng));
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
    this.initMap();
    this.strippedGroup = L.layerGroup().addTo(this.myMap);
    this.watchMapMovement();
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

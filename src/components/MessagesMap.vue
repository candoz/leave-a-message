<template>
    <div class="messages-map">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.3/dist/leaflet.css"
        integrity="sha512-Rksm5RenBEKSKFjgI3a41vrjkw4EVPlJ3+OiI65vTjIdo9brlAacEuKOiQ5OFh7cOI1bkDwLqdLw3Zg0cRJAAQ=="
        crossorigin=""/>
      <div id="map"></div>
    </div>
</template>


<script>
//TODO:
// update della posizione -> render del cerchio in corrispondenza
// get dei messaggi in base alla mappa visualizzata (map.on("move")???)
// render dei marker personalizzati dei messaggi
import L from "leaflet";

export default {
  props: ["located"],
  data() {
    return {
      myMap: null,
      myArea: null,
      tileLayer: null
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
        color: '#669999',
        fillColor: '#669999',
        fillOpacity: 0.1,
        radius: 500
      }).addTo(this.myMap);
    }
  },
  watch: {
    located: (newCoordinates) => {
      console.log("update: newCoordinates detected! lat:" + newCoordinates.lat + "lng:" + newCoordinates.lng);
      this.myArea.setLatLng(T.latLng(newCoordinates.lat, newCoordinates.lng));
    }
  },
  mounted() {  // do NOT change to "created"
    this.initMap();
    this.myMap.on("move", (event) => {
      this.myArea.setLatLng(event.target.getCenter() );
    });
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

</style>

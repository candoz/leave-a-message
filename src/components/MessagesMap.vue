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
  props: ["locationStatus"],
  data() {
    return {
      mymap: null,
      tileLayer: null,
      myarea: null
    }
  },
  mounted() {
    this.initMap();
    /* let self = this;
    self.mymap.on("move", function(){
      var center = self.mymap.getCenter();
      self.myarea.setLatLng( center );
    }); */
  },
  methods: {
    initMap() {
      this.mymap = L.map('map').setView([this.locationStatus.lat, this.locationStatus.lat], 13);
      this.tileLayer = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
        maxZoom: 30,
        minZoom: 10,
      }).addTo(this.mymap);
      this.myarea = L.circle([this.locationStatus.lat, this.locationStatus.lng], {
        color: '#669999',
        fillColor: '#669999',
        fillOpacity: 0.1,
        radius: 500
      }).addTo(this.mymap);
    }
  },
  watch: {
    locationStatus: function(newValue, oldValue) {
      console.log("update");
      this.myarea.setLatLng(T.latLng(newValue.lat, newValue.lng));
    }
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


<template>
    <div class=map-component>
        <div id="map" class="map"></div>
        <div
          class="form-check"
          v-for="layer in layers"
          :key="layer.id"
        >
        <label class="form-check-label">
        <input class="form-check-input" type="checkbox" v-model="layer.active" @change="layerChanged(layer.id, layer.active)"/>
        {{ layer.name }}
        </label>
        </div>
    </div>
</template>

<script>
import L from "leaflet";
export default {
  data() {
    return {
      msg: "Ciao sono il MapComponent",
      map: null,
      tileLayer: null,
      layers: [
        {
          id: 0,
          name: "FullMessages",
          active: false,
          features: this.fullmsgs
          //Esempio di come deve essere una feature
          // [
          //   {
          //     id: 0,
          //     name: "Messaggio Full 2",
          //     type: "marker",
          //     coords: [38.6109607, -90.2050322]
          //   }
          // ]

        },
        {
          id: 1,
          name: "LimitedMessages",
          active: false,
          features: this.limitedmsgs
        }
      ]
    };
  },
  props: ["limitedmsgs", "fullmsgs"],
  created() {},
  mounted() {
    this.initMap();
    this.initLayers();
  },
  methods: {
    initMap() {
      this.map = L.map("map").setView([38.63, -90.23], 18);
      this.tileLayer = L.tileLayer(
        "https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png",
        {
          maxZoom: 18
          // attribution:
          //   '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
        }
      );
      this.tileLayer.addTo(this.map);
    },
    initLayers() {
      this.layers.forEach(layer => {
        const markerFeatures = layer.features.filter(
          feature => feature.type === "marker"
        );
        markerFeatures.forEach(feature => {
          feature.leafletObject = L.marker(feature.coords).bindPopup(
            feature.name
          );
        });
      });
    },
    layerChanged(layerId, active) {
      const layer = this.layers.find(layer => layer.id === layerId);
      layer.features.forEach(feature => {
        if (active) {
          feature.leafletObject.addTo(this.map);
        } else {
          feature.leafletObject.removeFrom(this.map);
        }
      });
    }
  }
};
</script>

<style scoped>
/* .map-section {
  width: 100vw;
  height: 50vh;
} */
.map {
  width: 80vw;
  height: 50vh;
  margin: auto;
  padding: 10px;
}
</style>

<template>
<div id="lookAround">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.2.0/dist/leaflet.css"/>
  <h1>Look Around</h1>
  <div class=search><p>da mettere il componente search</p></div>
  <div id="map" class="map"></div>
  <h3>Messaggi completi:</h3>
  <ul>
    <li v-for="msg in mixedMessages" @click="selectMessage(msg._id)" :key=msg._id :class="{selected: msg._id==selectedMessage._id}">
      {{msg}}
    </li>
  </ul>
</div>
</template>

<script type="text/javascript">
import L from "leaflet";
const axios = require('axios');
export default {
  // Do not forget this little guy
  name: "RangeSlider",
  // share common functionality with component mixins
  mixins: [],
  // compose new components
  extends: {},
  // component properties/variables
  props: {},
  // variables
  data() {
    return {
      selectedMessage: "",
      map: null,
      tileLayer: null,
      fullMessages: [
        {
          _id: 0,
          name: "Messaggio Full 2",
          type: "marker",
          coords: [38.6109607, -90.2050322]
        },
        {
          _id: 1,
          name: "Messaggio Full 4",
          type: "marker",
          coords: [38.6109607, -90.2050322]
        }
      ],
      strippedMessages: [
        {
          _id: 3,
          name: "Messaggio Stipped 1",
          type: "marker",
          coords: [38.6109607, -90.5050322]
        }
      ]
    };
  },
  computed: {
    mixedMessages: function() {
      let mix = this.fullMessages;
      for (let strippedMessage of this.strippedMessages) {
        if (mix.find(x => x._id == strippedMessage._id) == null) {
          mix.push(strippedMessage);
        }
      }
      return mix;
    }
  },
  // when component uses other components
  components: { },
  // methods
  watch: {},
  methods: {
    selectMessage(id) {
      this.selectedMessage = this.mixedMessages.find(x => x._id==id);
    },
    getStrippedMessages() {
      let self = this;
      axios.get(localStorage.urlHost+'/messages/stripped', {
        params: {
          lng:localStorage.lng,
          lat:localStorage.lat
        }
      })
      .then(response => self.strippedMessages = response.data)
      .catch(err => console.log(err));
    },
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
  },
  // component Lifecycle hooks
  beforeCreate() {},
  created() {},
  mounted() {}
};
</script>

<style lang="sass" scoped>
.selected
  color: #009
.map
  width: 80vw
  height: 50vh
  margin: auto
  padding: 10px
</style>

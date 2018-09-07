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
const USER_LOCATION_ICON_WIDTH = 18;
const USER_LOCATION_ICON_HEIGHT = 24;
const MESSAGE_ICON_WIDTH = 24;
const MESSAGE_ICON_HEIGHT = 25;

export default {
  props: ["located", "logged","filter"],
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

      this.tileLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
        minZoom: 5,
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
        minZoom: 5
      }).addTo(this.myMap);
      this.maskLayer.setData([[self.located.lat, self.located.lng]]);
      
    },
    updateStrippedLayer() {
      this.strippedGroup.clearLayers();
      this.strippedMessages.forEach(message => {
        const filterAbsent = this.filter === "";
        let filterSatisfied = false;
        let properMessageIcon;
        if (filterAbsent) {
          properMessageIcon = this.strippedMessageIcon;
        } else {
          properMessageIcon = this.strippedMessageFilteredIcon;
          filterSatisfied = (message.author_nickname.toLowerCase().startsWith(this.filter.toLowerCase()) ||
                            (message.hashtags.some(hashtag => {
                              return (hashtag.toLowerCase().startsWith(this.filter.toLowerCase()))
                            })));
        }
        if (filterAbsent || filterSatisfied) {
          const popupString = "<p><b>Hashtags:</b> " + this.hashtagFormatter(message.hashtags) + "<br />" +
                              "<b>Likes:</b> " + message.likes.length + "<br />" +
                              "<b>Written by:</b> " + message.author_nickname + "</p>";
          const messageMarker = L.marker(message.latLng, {icon: properMessageIcon, id: message.id}).bindPopup(popupString);
          this.strippedGroup.addLayer(messageMarker);
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
            cornerBottomLeft: [ cornerSouthWest.lng , cornerSouthWest.lat ],
            cornerUpperRight: [ cornerNorthEast.lng , cornerNorthEast.lat ],
          }
        }).then(response => {
          this.strippedMessages.length = 0;
          for (let element of response.data) {
            this.strippedMessages.push({
              id : element._id,
              author_nickname: element.author_nickname,
              hashtags: element.hashtags,
              likes: element.likes,
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
      handler(newCoordinates) {
        this.userLocationMarker.setLatLng(L.latLng(newCoordinates.lat, newCoordinates.lng));
        this.maskLayer.setData([[newCoordinates.lat, newCoordinates.lng]]);
        // this.myMap.setView([this.located.lat, this.located.lng]);
        console.log("update: newCoordinates detected! lat:" + newCoordinates.lat + "lng:" + newCoordinates.lng);
      },
      deep: true
    },
    logged: {
      handler(newValue) {
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
    },
    filter: {
      handler() {
        this.updateStrippedLayer();
      }
    }
  },
  created() {
    EventBus.$on("selectedFullMessage", (idMessage) => {
      this.strippedGroup.getLayers().forEach(message => {
        if(message.options.id == idMessage) {
          this.myMap.setView(message.getLatLng(), 13);
        }
      });
    });
  },
  mounted() {  // do NOT change to "created"
    this.strippedMessageIcon = L.divIcon({
      className: "fas fa-comment-alt fa-2x",
      iconAnchor: [MESSAGE_ICON_WIDTH / 2, MESSAGE_ICON_HEIGHT / 2],
      iconSize: [MESSAGE_ICON_WIDTH, MESSAGE_ICON_HEIGHT],
    });
    this.strippedMessageFilteredIcon = L.divIcon({
      className: "fas fa-comment-alt fa-2x filtered",
      iconAnchor: [MESSAGE_ICON_WIDTH / 2, MESSAGE_ICON_HEIGHT / 2],
      iconSize: [MESSAGE_ICON_WIDTH, MESSAGE_ICON_HEIGHT],
    }); 
    this.fullMessageIcon = L.divIcon({
      className: "fas fa-comment-alt fa-2x"
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

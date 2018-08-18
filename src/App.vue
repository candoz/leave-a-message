<template>
  <div id="app">
    <app-nav :logged="logged"></app-nav>
    <app-body :logged="logged" :located="located"></app-body>
  </div>
</template>


<script>
import AppNav from "./components/AppNav.vue"
import AppBody from "./components/AppBody.vue"
import { eventBus } from "main" 

export default {
  components: {
    AppNav,
    AppBody
  },
  data() {
    return {
      logged: (localStorage.logged === null) ? false : JSON.parse(localStorage.logged),
      located: (localStorage.located === null) ? {lat: 0, lng: 0} : JSON.parse(localStorage.located),
      messagesAround:[
        {
          _id: 0,
          nickname: "mark", 
          name: "Marco",
          text: "#welcome to wasteland",
          tags: "#welcome",
          votes: 1,
          location: {
            type: "Point",
            coordinates: [38.6109607, -90.2060344]
          },
          comments_id: [],
        },
        {
          _id: 1,
          nickname: "euge", 
          name: "Eugenio",
          text: "#hello there",
          tags: "#hello",
          votes: 2,
          location: {
            type: "Point",
            coordinates: [38.6111607, -90.2050322]
          },
          comments_id: [],
        }
      ]
    }
  },
  watch: {
    loginStatus: (event) => {
      this.logged = JSON.stringify(event.logged);
      localStorage.logged = JSON.stringify(event.logged);
    },
    locationStatus: (event) => {
      this.located = JSON.stringify(event.located);
      localStorage.located = JSON.stringify(event.located);
    }
  },
  created() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        //this.located.lat = position.coords.latitude;
        //this.located.lng = position.coords.longitude;
        this.located.lat = Math.random()*50;
        this.located.lng = Math.random()*50;
        console.log("Fake located: " + this.located.lat + " - " + this.located.lng);
      });
    } else {
        alert("Geolocation not supported by this browser.");
    }
  }
}
</script>


<style lang="sass" scoped>
#app
  font-family: 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #2c3e50
</style>

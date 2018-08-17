<template>
  <div id="app">
    <nav-bar></nav-bar>
    <app-view></app-view>
  </div>
</template>

<script>
import NavBar from "./components/NavBar.vue"
import AppView from "./components/AppView.vue"
export default {
  components: {
    NavBar,
    AppView
  },
  data() {
    return {
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
      ],
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

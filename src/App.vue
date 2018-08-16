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
    return
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

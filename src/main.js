// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  created() {
    if(!localStorage.getItem('logged')) {
      localStorage.logged = 'false';
    } 
    localStorage.urlHost = "http://localhost:5000";
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(this.setPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
  },
  methods: {
    setPosition(position) {
      localStorage.lat = position.coords.latitude;
      localStorage.lng = position.coords.longitude;
      console.log("Current position: " + position.coords.latitude + " - " + position.coords.longitude);
    }
  }
})

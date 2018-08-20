<template>
    <div class=profile>
      <button @click="doLogout()">logout</button>
    </div>
</template>

<script>
import { EventBus } from "../main.js" 
const axios = require("axios");
export default {
  data() {
    return {
      
    };
  },
  methods: {
    doLogout(event) {
      axios
        .put(sessionStorage.urlHost + "/logout")
        .then(response => {
          EventBus.$emit("loggedOut");
          console.log(response);
        })
        .catch(error => {
          console.log(error.config);
        });
    }
  }
};
</script>

<style lang="sass" scoped>

.profile
  width: 80%
  max-width: 500px
  padding: 15vh 0 0
  margin: auto

</style>
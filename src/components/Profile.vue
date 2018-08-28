<template>
    <div class=profile>
      <div class="card">
        <img src="../assets/profile-pic.png" alt="profile-pic" style="width:80%">
        <h3>{{ nickname }}</h3>
        <p class="mail">{{ email }}</p>
        <p class="reputation">{{ reputation }}</p>
        <div class="badges" v-for="badge in badges" :key=badge>
          {{badge}}
        </div>
      </div>
      <button @click="doLogout()">logout</button>
    </div>
</template>

<script>
import { EventBus } from "../main.js" 
const axios = require("axios");

export default {
  data() {
    return {
      nickname: "Example Nickname",
      email: "Example@example.it",
      writedMessages: [],
      reputation: "15",
      badges: ["badge1", "badge2"],
      profilePic: null
    };
  },
  methods: {
    initProfile() { 
      axios.get(sessionStorage.urlHost + "/users")
      .then(response => {
        this.nickname = response.data.nickname || "Nickname non trovato";
        this.email = response.data.email || "Email non trovata";
        
      }).catch(error => {
          console.log(error);
      });
    },
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
  },
  mounted() {
    this.initProfile();
  }
};
</script>

<style lang="sass" scoped>

$base-background-color: #990000;
$base-background-opacity-color: #800000;

.profile
  width: 80%
  padding: 10vh 0 0
  margin: auto
  background: #FFFFFF
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)

.card 
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2)
  max-width: 300px
  margin: auto auto 1% auto
  text-align: center
  padding: 2%

.mail
  color: grey
  font-size: 18px

button
  text-transform: uppercase
  outline: 0
  background: $base-background-color
  width: 100%
  max-width: 200px
  margin: auto
  border: 0
  padding: 15px
  color: #FFFFFF
  font-size: 14px
  transition: all 0.3 ease
  cursor: pointer
  &:hover, &:active, &:focus
    background: $base-background-opacity-color

</style>
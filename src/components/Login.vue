<template>
  <div id="login-component">
    <div class="form" v-if="logged === false" >
      <form @submit.prevent="doLogin">
        <input v-model="email" type="text" placeholder="Email" required>            <!--  'v-model.lazy' ? -->
        <input v-model="password" type="password" placeholder="Password" required>  <!--  'v-model.lazy' ? -->
        <button type="submit" class="">Login</button>
        <router-link :to="'/signup'" class="message" exact>Not registered? Create an account</router-link>
      </form>
    </div>
    <div class="form" v-else >
      <p>You are logged-in! :)</p>
    </div>
  </div>
</template>


<script>
import { EventBus } from "../main.js" 
const axios = require("axios");

export default {
  props: ["logged"],
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    doLogin(event) {
      axios
        .put(sessionStorage.urlHost + "/login", {
          email: this.email,
          password: this.password
        })
        .then(response => {
          EventBus.$emit("loggedIn");
          console.log(response.data);
          sessionStorage.myUserId = response.data;
          this.$router.push('/');
        })
        .catch(error => {
          if (error.response) {
            console.log("Response");
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log("Request");
            console.log(error.request);
          } else {
            console.log("Setting up");
            console.log("Error", error.message);
          }
          console.log(error.config);
        });
    },
  }
};
</script>


<style lang="sass" scoped>
@import './vars.sass'

#login-component
  padding: 4vh 0
  display: flex
  flex-direction: column

.form
  border-radius: $radius
  z-index: 0
  background: $light-color
  max-width: 500px
  margin: 0
  padding: 2.5%
  text-align: center
  box-shadow: $shadow
  align-self: center
  width: 90%
  input
    outline: 0
    font-family: $secondary-font
    background: $light-color-mod
    width: 100%
    border: 0
    margin: 0 0 2.9%
    padding: 15px
    box-sizing: border-box
    font-size: 14px
  button
    text-transform: uppercase
    font-size: 100%
    font-family: $primary-font
    outline: 0
    background: $primary-color
    width: 100%
    border: 0
    padding: 15px
    color: #FFFFFF
    -webkit-transition: all 0.3 ease
    transition: all 0.3 ease
    cursor: pointer
    margin-bottom: 10px
    &:hover, &:active, &:focus
      box-shadow: $shadow
  .message
    margin: 15px 0 0
    color: #b3b3b3
    font-size: 75%
    font-family: $secondary-font
    a
      color: #4CAF50
      text-decoration: none

</style>

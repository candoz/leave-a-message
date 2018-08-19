<template>
  <div id="login-component">
    <div class="form" v-if="logged === false" >
      <form @submit.prevent="doLogin">
        <h3>Login Form</h3>
        <input v-model="email" type="text" placeholder="Email" required>               <!--  'v-model.lazy' ? -->
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
        .put(localStorage.urlHost + "/login", {
          email: this.email,
          password: this.password
        })
        .then(response => {
          EventBus.$emit("loggedIn");
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
    doLogout(event) {
      axios
        .put(localStorage.urlHost + "/logout")
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

#login-component
  width: 80%
  max-width: 500px
  padding: 15vh 0 0
  margin: auto

.form
  z-index: 0
  background: #FFFFFF
  max-width: 360px
  width: 80%
  margin: auto
  padding: 5%
  text-align: center
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)
  input
    outline: 0
    background: #f2f2f2
    width: 100%
    border: 0
    margin: 0 0 15px
    padding: 15px
    box-sizing: border-box
    font-size: 14px
  button
    text-transform: uppercase
    outline: 0
    background: #4CAF50
    width: 100%
    border: 0
    padding: 15px
    color: #FFFFFF
    font-size: 14px
    -webkit-transition: all 0.3 ease
    transition: all 0.3 ease
    cursor: pointer
    &:hover, &:active, &:focus
      background: #43A047
  .message
    margin: 15px 0 0
    color: #b3b3b3
    font-size: 12px
    a
      color: #4CAF50
      text-decoration: none

</style>

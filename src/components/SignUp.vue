<template>
  <div class="signup-component">
    <div class="form" v-if="logged == 'false'" >
      <form class="signup-form" @submit.prevent="doRegister">
        <h3>Signup Form</h3>
        <input id="nickname" v-model="nickname" type="text" placeholder="Nickname" required/>
        <input  id="password" v-model="password" type="password" placeholder="Password" required/>
        <input  id="email" v-model="email" type="text" placeholder="Email address" required/>
        <button type="submit" class="">Create</button>
        <router-link :to="'/login'" class="message" exact>Already registered? Sign In</router-link>
      </form>
    </div>
    <div class="form" v-else >
      <p>You are logged</p>
    </div>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  data() {
    return {
      email: null,
      password: null,
      nickname: null,
      logged: localStorage.logged
    };
  },
  methods: {
    doRegister(event) {
      let self = this;
      axios
        .post(localStorage.urlHost + "/users", {
          email: this.email,
          password: this.password,
          nickname: this.nickname
        })
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          if (error.response) {
            console.log("Response");
          } else if (error.request) {
            console.log("Richiesta");
          } else {
            console.log("Setting up");
            console.log("Error", error.message);
          }
          console.log(error.config);
        });
    }
  }
}
</script>

<style lang="sass" scoped>

.signup-component
  width: 80%
  max-width: 500px
  padding: 15vh 0 0
  margin: auto

.form
  position: relative
  z-index: 1
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

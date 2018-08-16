<template>
  <div class="login-page-body">
    <div class="login-component">
      <div class="form" v-if="logged == 'false'" >
        <form class="register-form" v-if="newUser == 'true'" @submit.prevent="doRegister">
          <input type="text" placeholder="Nickname"/>
          <input type="password" placeholder="Password"/>
          <input type="text" placeholder="Email address"/>
          <button>Create</button>
          <p type="submit" class="message">Already registered? <a href="#">Sign In</a></p>
        </form>
        <form class="login-form" v-else-if="newUser == 'false'" @submit.prevent="doLogin">
          <h3>Login Form</h3>
          <input id="email" v-model="email" type="text" placeholder="Email" required>
          <input id="password" v-model="password" type="password" placeholder="Password" required>
          <button type="submit" class="">Login</button>
          <p class="message">Not registered? <a href="#">Create an account</a></p>
        </form>
      </div>
      <div class="form" v-else >
        <p>You are logged</p>
      </div>
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
      logged: localStorage.logged,
      newUser: 'false'
    };
  },
  methods: {
    doLogin(event) {
      let self = this;
      axios
        .put(localStorage.urlHost + "/login", {
          email: this.email,
          password: this.password
        })
        .then(response => {
          self.logged = "true";
          console.log(response);
        })
        .catch(error => {
          if (error.response) {
            console.log("Response");
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            console.log("Richiesta");
            console.log(error.request);
          } else {
            console.log("Setting up");
            console.log("Error", error.message);
          }
          console.log(error.config);
        });
    },
    doLogout(event) {
      let self = this;
      axios
        .put(localStorage.urlHost + "/logout")
        .then(response => {
          self.logged = "false";
          console.log(response);
        })
        .catch(error => {
          console.log(error.config);
        });
    },
    doRegister(event) {
      //TODO da implementare
    }
  },
  watch: {
    logged(state) {
      localStorage.logged = state;
    }
  }
};
</script>

<style lang="sass" scoped>

$base-background-color: #76b852;
$gradient-background-color: #8DC26F;

.login-page-body 
  background: $base-background-color
  background: -webkit-linear-gradient(right, $base-background-color, $gradient-background-color)
  background: -moz-linear-gradient(right, $base-background-color, $gradient-background-color)
  background: -o-linear-gradient(right, $base-background-color, $gradient-background-color)
  background: linear-gradient(to left, $base-background-color, $gradient-background-color)
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  width: 100%
  height: 100vh

.login-component
  width: 360px
  padding: 8% 0 0
  margin: auto

.form
  position: relative
  z-index: 1
  background: #FFFFFF
  max-width: 360px
  margin: 0 auto 100px
  padding: 45px
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
  .register-form
    display: none

.container
  position: relative
  z-index: 1
  max-width: 300px
  margin: 0 auto
  &:before, &:after
    content: ""
    display: block
    clear: both
  .info
    margin: 50px auto
    text-align: center
    h1
      margin: 0 0 15px
      padding: 0
      font-size: 36px
      font-weight: 300
      color: #1a1a1a
    span
      color: #4d4d4d
      font-size: 12px
      a
        color: #000000
        text-decoration: none
      .fa
        color: #EF3B3A

body
  background: #76b852
  /* fallback for old browsers
  background: -webkit-linear-gradient(right, #76b852, #8DC26F)
  background: -moz-linear-gradient(right, #76b852, #8DC26F)
  background: -o-linear-gradient(right, #76b852, #8DC26F)
  background: linear-gradient(to left, #76b852, #8DC26F)
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale

</style>

<template>
  <div id="signup-component">
    <div class="form" v-if="logged === false" >
      <form @submit.prevent="doRegister">
        <input v-model="name" type="text" placeholder="Name" required/>
        <input v-model="nickname" type="text" placeholder="Nickname" required/>
        <input v-model="email" type="text" placeholder="Email" required/>
        <input v-model="password" type="password" placeholder="Password" required/>
        <button type="submit" class="">Create account</button>
        <router-link :to="'/login'" class="message" exact>Already registered? Sign In</router-link>
      </form>
    </div>
    <div class="form" v-else >
      <p>You are logged-in! :)</p>
    </div>
  </div>
</template>


<script>
const axios = require("axios");

export default {
  props: ["logged"],
  data() {
    return {
      name: "",
      nickname: "",
      email: "",
      password: "",
    };
  },
  methods: {
    doRegister(event) {
      let self = this;
      axios
        .post(sessionStorage.urlHost + "/users", {
          email: this.email.toLowerCase(),
          password: this.password,
          nickname: this.nickname,
          name : this.name
        })
        .then(response => {
          console.log(response);
          this.$router.push('/login');
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
@import './vars.sass'

#signup-component
  padding: 4vh 1%
  display: flex
  flex-direction: column

.form
  border-radius: $radius
  z-index: 0
  background: $light-color
  max-width: 500px
  margin: auto
  padding: 2.5%
  text-align: center
  box-shadow: $shadow
  width: 90%
  
  input
    outline: 0
    font-family: $secondary-font
    background: $light-color-mod
    width: 100%
    border: 0
    margin: 0 0 3.3%
    padding: 15px
    box-sizing: border-box
    font-size: 14px
  button
    text-transform: uppercase
    outline: 0
    font-family: $primary-font
    font-size: 100%
    background: $secondary-color
    width: 100%
    border: 0
    padding: 15px
    color: $light-color
    cursor: pointer
    margin-bottom: 8px
    &:hover, &:active, &:focus
      box-shadow: $shadow
  .message
    font-family: $secondary-font
    color: #b3b3b3
    font-size: 12px
    a
      color: #4CAF50
      text-decoration: none

</style>

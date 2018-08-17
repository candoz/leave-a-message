<template>
  <div class="login-page-body">
    <div class="login-component">
      <div class="form" v-if="logged == 'false'" >
        <form class="register-form" @submit.prevent="doRegister">
          <input id="nickname" v-model="nickname" type="text" placeholder="Nickname"/>
          <input  id="password" v-model="password" type="password" placeholder="Password"/>
          <input  id="email" v-model="email" type="text" placeholder="Email address"/>
          <button type="submit" class="">Create</button>
          <router-link :to="'/login'" class="message" exact>Already registered? Sign In</router-link>
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

</style>

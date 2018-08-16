<template>
    <div class=nav-bar>
      <router-link :to="'/'">Look Around</router-link>
      <router-link :to="'/login'">Login</router-link>
      <router-link :to="'/profile'">My Profile</router-link>
      <router-link :to="'/write'">Write a Message</router-link>
    </div>
</template>

<script>
import L from "leaflet";

export default {
  data() {
    return {
      
    };
  }
};
</script>

<style lang="sass" scoped>
.visible
.selected
</style>
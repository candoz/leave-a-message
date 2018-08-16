<template>
    <div class="ext">
      <nav>
        <router-link tag="li" v-if="!logged" :to="'/login'" exact>Login</router-link>
        <router-link tag="li" :to="'/'" exact>Look Around</router-link>
        <router-link tag="li" v-if="logged" :to="'/write'" exact>Write</router-link>
        <router-link tag="li" v-if="logged" :to="'/profile'" exact>MyProfile</router-link>
      </nav>
    </div>
</template>

<script>
import L from "leaflet";

export default {
  data() {
    return {
      logged: localStorage.logged,
    };
  }
};
console.log(this.$route);
</script>

<style lang="sass" scoped>
nav
  margin: 0
  padding: 0
  top: 0
  left: 0
  width: 100%
  overflow: hidden
  background-color: #333
  position: fixed
  li
    display: inline-block
    color: white
    padding: 14px 16px
    margin: 0px
    text-decoration: none
    &.router-link-active
      background-color: #6600ff
      cursor: pointer
    &:hover:not(.router-link-active)
      background-color: #111
      cursor: pointer

/* 
 *background-color: #0099ff
 *background-color: #ff9900
 *background-color: #6600ff

</style>

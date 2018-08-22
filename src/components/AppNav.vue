<template>
    <div>
      <nav>
        <router-link tag="li" v-if="logged === false" :to="'/login'" exact>Login</router-link>
        <router-link tag="li" :to="'/'" exact>Look Around</router-link>
        <router-link tag="li" v-if="logged === true" :to="'/write'" exact>Write</router-link>
        <router-link tag="li" v-if="logged === true" :to="'/profile'" exact>MyProfile</router-link>
      </nav>
    </div>
</template>


<script>
export default {
  props: ["logged"],
  data() {
    return {
      
    };
  },
};
</script>


<style lang="sass" scoped>

$base-background-color: #e68a00;

nav
  top: 0
  left: 0
  width: 100%
  z-index: 10
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
      background-color: $base-background-color
      cursor: pointer
    &:hover:not(.router-link-active)
      background-color: #111
      cursor: pointer

/* 
 *background-color: #0099ff
 *background-color: #ff9900
 *background-color: #6600ff
 *background-color: #43A047

</style>

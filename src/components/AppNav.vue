<template>
    <div>
      <nav>
        <router-link tag="li" :to="'/'" exact>Explore</router-link>
        <router-link tag="li" v-if="logged === false" :to="'/login'" exact>Login</router-link>
        <router-link tag="li" v-if="logged === false" :to="'/signup'" exact>Signup</router-link>
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
@import './vars.sass'

nav
  top: 0
  left: 0
  width: 100%
  background-color: $dark-color
  position: fixed
  display: flex
  flex-wrap: nowrap
  list-style: none
  justify-content: center
  z-index: 1
  overflow-x: auto
  // vertical-align: center

  
  li
    // height: $navbar-height
    // vertical-align: center
    border-radius: 4px 4px 0px 0px
    color: white
    flex: 1
    max-width: 75px
    padding: 14px 16px
    margin: 0px
    text-decoration: none
    &.router-link-active
      background-color: $primary-color
      cursor: pointer
    &:hover:not(.router-link-active)
      background-color: $dark-color-mod
      cursor: pointer

</style>

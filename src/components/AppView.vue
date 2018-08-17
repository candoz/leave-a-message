<template>
    <div class=app-view>
    <router-view/>
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
  $base-background-color: #76b852;

  .app-view 
    height: 100vh
    background-color: $base-background-color
    width: 100%
    overflow: hidden
</style>
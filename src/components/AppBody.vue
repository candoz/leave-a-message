<template>
    <div class=app-view>
      <router-view :logged="logged" :located="located" :messagesAround="messagesAround"/>
    </div>
</template>


<script>
export default {
  props: ["logged", "located", "messagesAround"],
  data() {
    return {
      
    };
  },
};
</script>


<style lang="sass" scoped>
@import './vars.sass'

.app-view 
  min-height: 100vh
  background-color: $base-color
  width: 100%

</style>
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

  background-color: $base-color
  width: 100%
  min-height: 100%
  margin-top: 50px

</style>
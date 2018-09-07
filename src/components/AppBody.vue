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

  background-color: $primary-color
  width: 100%
  min-height: 100%  // do not change!!
  margin-top: $margin-for-navbar

</style>
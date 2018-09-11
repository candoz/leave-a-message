<template>
    <div class=app-body>
      <router-view :logged="logged" :located="located" :messagesAround="messagesAround"/>
    </div>
</template>


<script>
export default {
  props: ["logged", "located", "messagesAround"],
};
</script>


<style lang="sass" scoped>
@import './vars.sass'

.app-body

  background-color: $primary-color
  width: 100%
  min-height: 100%  // do not change!!
  margin-top: $margin-for-navbar

</style>
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
  }
};
</script>


<style lang="sass" scoped>

$base-background-color: #e68a00;

.app-view 
  min-height: 100vh
  background-color: $base-background-color
  width: 100%

</style>
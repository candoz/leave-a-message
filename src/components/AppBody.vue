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

$base-background-color: #76b852;

.app-view 
  height: 100vh
  background-color: $base-background-color
  width: 100%
  overflow: hidden

</style>
<template>
<div id="look-around-component">
  <messages-map class="messages-map-card" :logged="logged" :located="located" :filter="filter"></messages-map>
  <messages-list class="messages-list-card" :logged="logged" :messagesAround="messagesAround" :filter="filter"></messages-list>
</div>
</template>


<script type="text/javascript">
import MessagesMap from "./MessagesMap.vue"
import MessagesList from "./MessagesList.vue"
const axios = require('axios');

export default {
  components: {
    MessagesMap,
    MessagesList
  },
  props: ["logged", "located", "messagesAround"],
  data() {
    return {
      filter: ""
    };
  }
};
</script>


<style lang="sass" scoped>
@import './vars.sass'

#look-around-component
  height: 100%
  padding: 4vh 2vw

%card
  background: $light-color
  box-shadow: $shadow
  min-width: 300px
  min-height: 300px
  border-radius: $radius
  padding: 1%

.messages-map-card
  @extend %card
  margin: 2px

.messages-list-card
  @extend %card
  margin: 0 2% 2% 2%

</style>

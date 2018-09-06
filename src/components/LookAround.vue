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
  padding: 4vh 0

%card
  background: $light-color
  box-shadow: $shadow
  min-width: 300px
  min-height: 300px
  border-radius: $radius
  padding: 1%
  margin: 4px
  display: inline-block
  vertical-align: top
  
.messages-map-card
  @extend %card
  width: 55vw
  @media screen and (max-width: 768px)
    width: 95vw
    height: 50vh
  
.messages-list-card
  @extend %card
  @media screen and (max-width: 768px)
    width: 95vw
    // height: 10vh

</style>

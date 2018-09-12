<template>
<div class="look-around-component">
  <messages-map class="messages-map-card" :logged="logged" :located="located" :messagesAround="messagesAround" :filter="filter"></messages-map>
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

.look-around-component
  padding: 4vh 1%
  display: flex
  flex-direction: row
  align-items: flex-start
  min-height: 100vh
  @media screen and (max-width: $media-width-first)
    flex-direction: column
    padding: 4vh 0

%card
  background: $light-color
  box-shadow: $shadow
  min-width: 180px
  min-height: 180px
  border-radius: $radius
  padding: 1%
  margin: 0 1%
  flex-grow: 1
  font-size: 100%

  @media screen and (max-width: $media-width-first)
    align-self: center
    width: 90%
    margin: 0
  
.messages-map-card
  @extend %card
  flex-basis: 40vw
  height: 80vh
  display: flex    // also a flex container
  flex-direction: column

  @media screen and (max-width: $media-width-first)
    flex-basis: 70vh
    height: auto

.messages-list-card
  @extend %card
  max-height: 80vh
  @media screen and (max-width: $media-width-first)
    margin-top: 3vh

</style>

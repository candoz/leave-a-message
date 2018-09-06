<template>
<div class="look-around-component">
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

.look-around-component
  padding: 4vh
  display: flex
  // flex-wrap: wrap
  flex-direction: row
  justify-content: center
  align-items: flex-start
  min-height: 100vh
  @media screen and (max-width: $media-width-first)
    flex-direction: column

%card
  background: $light-color
  box-shadow: $shadow
  min-width: 180px
  min-height: 180px
  border-radius: $radius
  padding: 1%
  margin: 0 1%
  flex-grow: 1
  @media screen and (max-width: $media-width-first)
    margin: auto
  
.messages-map-card
  @extend %card
  flex-basis: 50vw
  height: 80vh
  // also a flex container
  display: flex
  flex-direction: column
  @media screen and (max-width: $media-width-first)
    width: 95%
    height: 70%

.messages-list-card
  @extend %card
  flex-basis: 15vw
  @media screen and (max-width: $media-width-first)
    width: 95%
    margin-top: 2vh

</style>

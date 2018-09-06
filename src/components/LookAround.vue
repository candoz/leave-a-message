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
  padding: 4vh 0
  display: flex
  // flex-wrap: wrap
  flex-direction: row
  justify-content: center
  align-items: flex-start
  padding: 4%
  @media screen and (max-width: 768px)
    flex-direction: column

%card
  background: $light-color
  box-shadow: $shadow
  min-width: 300px
  min-height: 300px
  border-radius: $radius
  padding: 1%
  margin: 1%
  display: inline-block
  vertical-align: top
  flex-grow: 1
  
.messages-map-card
  @extend %card
  flex-basis: 50vw
  height: 90vh
  @media screen and (max-width: 768px)
    width: 90vw
    height: 70vh
  // also a flex container
  display: flex
  flex-direction: column

.messages-list-card
  @extend %card
  flex-basis: 15vw
  @media screen and (max-width: 768px)
    width: 90vw

</style>

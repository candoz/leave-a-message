<template>
<div id="look-around-component">
  <messages-map :logged="logged" :located="located" :filter="filter"></messages-map>
  <input type="text" v-model="filter" placeholder="filter by hashtag or by nickname" />
  <messages-list :logged="logged" :messagesAround="messagesAround" :filter="filter"></messages-list>
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
  margin: auto
  background: $light-color
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)
  width: 90%
  padding: 10vh 0 0
  @media only screen and (max-width: 600px)
    width: 100%

</style>

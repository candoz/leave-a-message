<template>
<div id="look-around-component">
  <messages-map :logged="logged" :located="located" :filtering="filtering"></messages-map>
  <input type="text" v-model="filtering" placeholder="filter by hashtag" />
  <messages-list :logged="logged" :messagesAround="messagesAround" :filtering="filtering"></messages-list>
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
      filtering: ""
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

<template>
<div id="look-around-component">
  <div class=search><p>da mettere il componente search</p></div>
  <messages-map :located="located"></messages-map>
  <h3>Messages nearby:</h3>
  <!-- <ul>
    <li v-for="msg in mixedMessages" @click="selectMessage(msg._id)" :key=msg._id :class="{selected: msg._id==selectedMessage._id}">
      {{msg}}
    </li>
  </ul> -->
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
  props: ["logged", "located"],
  data() {
    return {

    };
  }
};
</script>


<style lang="sass" scoped>

#look-around-component
  margin: auto
  background: #FFFFFF
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)
  width: 90%
  padding: 15vh 0 0

.selected
  color: #009

</style>

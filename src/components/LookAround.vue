<template>
<div id="lookAround">
  <div class=search><p>da mettere il componente search</p></div>
  <messages-map :locationStatus="locationStatus"></messages-map>
  <h3>Messaggi completi:</h3>
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
  // share common functionality with component mixins
  mixins: [],
  extends: {},
  // variables
  props: ["loginStatus", "locationStatus"],
  data() {
    return {
    };
  },
  computed: {
    // mixedMessages: function() {
    //   let mix = this.fullMessages;
    //   for (let strippedMessage of this.strippedMessages) {
    //     if (mix.find(x => x._id == strippedMessage._id) == null) {
    //       mix.push(strippedMessage);
    //     }
    //   }
    //   return mix;
    // }
  },
  watch: {},
  methods: {
    // selectMessage(id) {
    //   this.selectedMessage = this.mixedMessages.find(x => x._id==id);
    // },
  },
  // component Lifecycle hooks
  beforeCreate() {},
  created() {},
  mounted() {}
};
</script>

<style lang="sass" scoped>
#lookAround
  margin: auto
  background: #FFFFFF
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)
  width: 90%
  padding: 15vh 0 0

.selected
  color: #009

</style>

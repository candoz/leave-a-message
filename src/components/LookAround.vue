<template>
  <div id="lookAround">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.2.0/dist/leaflet.css"/>
    <h1>Look Around</h1>
    <div class=search><p>da mettere il componente search</p></div>
    <p> {{ mixedMessages }} </p>
</div>
</template>

<script type="text/javascript">
const axios = require('axios');

export default {
  // Do not forget this little guy
  name: "RangeSlider",
  // share common functionality with component mixins
  mixins: [],
  // compose new components
  extends: {},
  // component properties/variables
  props: {},
  // variables
  data() {
    return {
      selectedMessage: null,
      fullMessages: [
        {
          _id: 0,
          name: "Messaggio Full 2",
          type: "marker",
          coords: [38.6109607, -90.2050322]
        },
        {
          _id: 1,
          name: "Messaggio Full 4",
          type: "marker",
          coords: [38.6109607, -90.2050322]
        }
      ],
      strippedMessages: [
        {
          _id: 3,
          name: "Messaggio Stipped 1",
          type: "marker",
          coords: [38.6109607, -90.5050322]
        }
      ]
    };
  },
  computed: {
    mixedMessages: function() {
      let mix = this.fullMessages;
      for (let strippedMessage of this.strippedMessages) {
        if (mix.find(x => x._id == strippedMessage._id) == null) {
          mix.push(strippedMessage);
        }
      }
      return mix;
    }
  },
  // when component uses other components
  components: { },
  // methods
  watch: {},
  methods: {
    updateSelectedMessage(msg) {
      this.selectedMessage=msg;
    },
    getStrippedMessages() {
      let self = this;
      axios.get(localStorage.urlHost+'/messages/stripped', {
        params: {
          lng:localStorage.lng,
          lat:localStorage.lat
        }
      })
      .then(response => self.strippedMessages = response.data)
      .catch(err => console.log(err));
    }
  },
  // component Lifecycle hooks
  beforeCreate() {},
  created() {},
  mounted() {}
};
</script>

<style scoped>
/* Si può fare anche lo <style> con scss ecc... */
</style>

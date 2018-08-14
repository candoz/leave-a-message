<template>
  <div id="lookAround">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.2.0/dist/leaflet.css"/>
    <h1>Look Around</h1>
    <div class=search><p>da mettere il componente search</p></div>
    <button v-on:click="getStrippedMessages()">Get stripped messages</button>
    <p>Messaggio attualmente selezionato: {{selectedMessage}}</p>
    <map-component :strippedmsgs=strippedMessages :fullmsgs=fullMessages :selectedmsg=selectedMessage @selectMessage="updateSelectedMessage"></map-component>
    <messages-list-component :strippedmsgs=strippedMessages :fullmsgs=fullMessages :selectedmsg=selectedMessage @selectMessage="updateSelectedMessage"></messages-list-component>
  </div>
</template>

<script type="text/javascript">
import MapComponent from "@/components/child_components/MapComponent.vue";
import MessagesListComponent from "@/components/child_components/MessagesListComponent.vue";
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
      msg: "Componente LookAround",
      selectedMessage: null,
      fullMessages: [
        {
          id: 0,
          name: "Messaggio Full 2",
          type: "marker",
          coords: [38.6109607, -90.2050322]
        }
      ],
      strippedMessages: [
        {
          id: 1,
          name: "Messaggio Stipped 1",
          type: "marker",
          coords: [38.6109607, -90.5050322]
        }
      ]
    };
  },
  computed: {},
  // when component uses other components
  components: { MapComponent, MessagesListComponent },
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
        .then(function(response) {
            self.strippedMessages = response.data.map(function(item){
                return JSON.stringify(item);
            });
        })
        .catch(function(err) {
            console.log(err);
        });
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
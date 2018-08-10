<template>
  <div id="lookAround">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.2.0/dist/leaflet.css"/>
    <h1>Look Around</h1>
    <div class=search><p>da mettere il componente search</p></div>
    <map-component :limitedmsgs=limitedMessages :fullmsgs=fullMessages></map-component>
    <messages-list-component :limitedmsgs=limitedMessages :fullmsgs=fullMessages></messages-list-component>
  </div>
</template>

<script type="text/javascript">
import MapComponent from "@/components/child_components/MapComponent.vue";
import MessagesListComponent from "@/components/child_components/MessagesListComponent.vue";

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
      fullMessages: [
        {
          id: 0,
          name: "Messaggio Full 2",
          type: "marker",
          coords: [38.6109607, -90.2050322]
        }
      ],
      limitedMessages: [
        {
          id: 1,
          name: "Messaggio Limited 1",
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
  methods: {},
  // component Lifecycle hooks
  beforeCreate() {},
  created() {},
  mounted() {}
};
</script>

<style scoped>
/* Si può fare anche lo <style> con scss ecc... */
</style>
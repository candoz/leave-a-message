<template>
  <div id="lookAround">
    <h1>Look Around</h1>
    <div class=search><p>da mettere il componente search</p></div>
    <map-component></map-component>
    <messages-list-component></messages-list-component>
  </div>
</template>

<script type="text/javascript">

import MapComponent from "@/components/child_components/MapComponent.vue";
import MessagesListComponent from "@/components/child_components/MessagesListComponent.vue"

export default {
  // Do not forget this little guy
  name: "RangeSlider",
  // share common functionality with component mixins
  mixins: [],
  // compose new components
  extends: {},
  // component properties/variables
  props: {
    bar: {}, // Alphabetized
    foo: {},
    fooBar: {}
  },
  // variables
  data() {},
  computed: {},
  // when component uses other components
  components: { MapComponent, MessagesListComponent },
  // methods
  watch: {},
  methods: {},
  // component Lifecycle hooks
  beforeCreate() {},
  mounted() {}
};
</script>

<style scoped>
/* Si può fare anche lo <style> con scss ecc... */
</style>
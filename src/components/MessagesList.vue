<template>
    <div>
      <div v-for="msg in messagesAround" :key=msg._id >  <!-- :class="{selected: msg._id === selectedMessage._id"} -->
        <button class="accordion" @click="expandMessage(msg._id)" :ref="'button-'+msg._id">{{msg.hashtags}}</button>
        <div class="panel" :ref="'panel-'+msg._id">
          {{msg.text}}
        </div>
      </div>
    </div>
</template>

<script>
import { EventBus } from "../main.js" 

export default {
  props: ["messagesAround"],
  data() {
    return {
      
    };
  },
  methods: {
    expandMessage(id) {
      let button = this.$refs['button-'+id][0];  // '[0]' because we want the first element of the ref
      button.classList.toggle("active");  
      let panel = this.$refs['panel-'+id][0];
      if (panel.style.maxHeight){
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
      EventBus.$emit("selectedFullMessage", id);
    }
  }
  
};
</script>

<style lang="sass" scoped>

.accordion
  background-color: #eee
  color: #444
  cursor: pointer
  padding: 18px
  width: 100%
  border: none
  text-align: left
  outline: none
  font-size: 15px
  transition: 0.4s

.active
  background-color: #ccc

.accordion
  &:hover
    background-color: #ccc
  &:after
    content: '\002B'
    color: #777
    font-weight: bold
    float: right
    margin-left: 5px

.active:after
  content: "\2212"

.panel
  padding: 0 18px
  background-color: white
  max-height: 0
  overflow: hidden
  transition: max-height 0.2s ease-out

</style>
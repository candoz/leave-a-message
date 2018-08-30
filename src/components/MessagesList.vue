<template>
  <div>
    <div v-if="logged === true" >
      <h3>Messages nearby:</h3>
      <div v-for="msg in messagesAround" :key=msg._id >  <!-- :class="{selected: msg._id === selectedMessage._id"} -->
        <div class="accordion" @click="expandMessage(msg._id)" :ref="'button-'+ msg._id">
          <button class="heart-button" @click="love(msg._id)" :ref="'heart-button' + msg._id">
            <img class="heart" v-bind:src="likeButton" :ref="'heart-image' + msg._id"/> <!-- v-if sull'id? 2 image differenti-->
          </button>
          <p class="votes">{{msg.votes}}</p>
          <p class="hashtags" v-for="value in msg.hashtags" :key=value> 
            &nbsp; #{{ value }}
          </p>
        </div>
        <div class="panel" :ref="'panel-'+msg._id">
          {{msg.text}}
        </div>
      </div>
    </div>
    <div v-else> 
      <h4>To see full messages please login...</h4>
    </div>
  </div>
</template>

<script>
import { EventBus } from "../main.js" 

export default {
  props: ["messagesAround", "logged"],
  data() {
    return {
      likeButton: require("../assets/heart-circle.png"),
      likedButton: require("../assets/heart-circle-outline.png")
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
    },
    love(id) {
      console.log("like to message " + this.$refs['heart-button'+id][0]);
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
  /* width: 100% */
  border: none
  text-align: center
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

.heart 
  margin:auto

.heart-button
  padding: 0
  border: none
  background: none
  display: inline-block
  float: left

.heart-button-liked
  padding: 0
  border: none
  background: none
  display: inline-block
  float: left

.votes
  display: inline-block
  float: left

.hashtags
  display: inline-block

</style>
<template>
  <div>

    <div v-if="logged === true" >
      <h4>Messages nearby:</h4>
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

          <button @click="writing = true">Commenta</button> <!-- ICONA COMMENTO? -->
          <form v-if="writing === true" v-on:submit.prevent id="write-form" @submit.prevent="addComment(msg._id)">
            <h3>Write a comment</h3>
              <textarea form="write-form" v-model="commentText" placeholder="Write here your message"></textarea>
            <button type="submit" class="">Publish comment</button>
          </form>

          <!-- MOSTRARE I COMMENTI -->

        </div>
      </div>
    </div>
    
    <!--    W O R K   I N   P R O G R E S S   ! ! !    -->
    <div v-else> 
      <h4>To open the messages nearby please
        <router-link :to="'/login'" class="message" exact> login </router-link>
        or
        <router-link :to="'/signup'" class="message" exact> signup </router-link>
      </h4>
      <div v-for="msg in messagesAround" :key=msg._id >  <!-- :class="{selected: msg._id === selectedMessage._id"} -->
        <div class="accordion">
          <button class=" -button">
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

  </div>
</template>

<script>
import { EventBus } from "../main.js" 
const axios = require("axios");

export default {
  props: ["messagesAround", "logged"],
  data() {
    return {
      likeButton: require("../assets/heart-circle.png"),
      likedButton: require("../assets/heart-circle-outline.png"),
      writing: false,
      commentText: null,
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
    },
    addComment(id) {
      this.writing = false;
      axios
        .post(sessionStorage.urlHost + "/messages/comment", {
          text: this.commentText,
          messageId: id
        })
        .then(response => {
          console.log(response);
          this.commentText = "";
        })
        .catch(error => {
          if (error.response) {
            console.log("Response");
          } else if (error.request) {
            console.log("Richiesta");
          } else {
            console.log("Setting up");
            console.log("Error", error.message);
          }
          console.log(error.config);
        });
    }
  }
};
</script>

<style lang="sass" scoped>
@import './vars.sass'

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

form
  z-index: 0
  background: #FFFFFF
  max-width: 360px
  margin: 1% auto auto auto
  padding: 2%
  text-align: center
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24)
  position: fixed
  z-index: 1
  width: 40%
  height: 40%
  padding-top: 100px
  left: 0
  top: 0
  button
    text-transform: uppercase
    outline: 0
    background: $base-color
    width: 100%
    border: 0
    padding: 15px
    color: #FFFFFF
    font-size: 14px
    transition: all 0.3 ease
    cursor: pointer
    &:hover, &:active, &:focus
      background: $base-color-mod

textarea
  outline: 0
  background: #f2f2f2
  width: 100%
  border: 0
  margin: 0 0 15px
  padding: 15px
  box-sizing: border-box
  font-size: 14px
  max-width: 360px

</style>
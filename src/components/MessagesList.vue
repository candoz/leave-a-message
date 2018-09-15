<template>
  <div>
    <template v-if="logged === true" >
      <h4>Messages nearby</h4>
      <div v-if="messagesIsPresent === true" class="scrollable">
        
        <div v-for="msg in messagesAround" :key=msg._id >  <!-- :class="{selected: msg._id === selectedMessage._id"} -->
          
          <div class="message-panel" @click="selectFullMessage(msg._id)">
            
            <div>
              <p>{{msg.text}}</p>
              <div class="bottom-text">
                <div>
                  <p>by <b>{{ msg.author_nickname }}</b></p>
                </div>
                <div>
                  <p>
                    <i class="far fa-comments" @click="showCommentsPopup(msg._id)"></i>
                    {{ msg.comments.length }}
                    <i class="far fa-heart" @click="likeUnlike(msg._id, msg.likes)" v-bind:class="{ 'liked': checkIfLiked(msg.likes) }" :ref="'heart-'+msg._id"></i>
                    {{ msg.likes.length }}
                  </p>
                </div>
              </div>
            </div>

            <div class="comments-window centered-screen" :ref="'comment-section-'+msg._id">
              <h4>Comments</h4>
              <i class="far fa-times-circle" @click="hideCommentsPopup(msg._id)"></i>
              <div class="comments-list">
                <div v-for="comment in msg.comments" :key=comment._id style="text-align:left">
                  <p><b>{{ comment.author_nickname }}:</b> {{ comment.text }}</p>
                </div>
              </div>
              <form v-on:submit.prevent id="write-form" @submit.prevent="addComment(msg._id)">
                <textarea form="write-form" v-model="commentText" placeholder="Write here your comment"></textarea> <!-- mettere v-if WRITE YOUR FIRST COMMENT -->
                <button type="submit" class="">Publish comment</button>
              </form>
            </div>
          </div>
          <a href="#" class="close-popup" :ref="'close-popup-'+msg._id" @click="hideCommentsPopup(msg._id)"></a>

        </div>  <!-- fine for -->

      </div>
      <div v-else>
        <i class="fas fa-sad-cry fa-3x"></i>
        <p>Ops! There aren't messages around here <br /> 
          do you want to <router-link :to="'/write'" class="a-login" exact> write </router-link> the first one?</p>
      </div>
    </template>
    
    <div v-else>
      <p>Messages nearby</p>
      <p class="to-open-message">
        <router-link :to="'/login'" class="a-login" exact> login </router-link>
        or
        <router-link :to="'/signup'" class="a-signup" exact> signup </router-link>
        to see them
      </p>
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
      commentText: null,
      messagesIsPresent: false,
    };
  },
  methods: {
    selectFullMessage(id) {
      EventBus.$emit("selectedFullMessageFromList", id);
    },
    addComment(id) {
      let commentMsg = this.commentText;
      this.commentText = "";
      axios
        .post(sessionStorage.urlHost + "/messages/comment", {
          text: commentMsg,
          messageId: id
        })
        .then(response => {
          console.log(response);
          EventBus.$emit("requestFullMessages");
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
    },
    showCommentsPopup(id) {
      let commentsPopup = this.$refs["comment-section-"+id][0];
      let closePopup = this.$refs["close-popup-"+id][0];
      commentsPopup.style.display = "flex";
      closePopup.style.visibility = "visible"
    },
    hideCommentsPopup(id) {
      let commentsPopup = this.$refs["comment-section-"+id][0];
      let closePopup = this.$refs["close-popup-"+id][0];
      commentsPopup.style.display = "none";
      closePopup.style.visibility = "hidden" 
    },
    likeUnlike(id, likesArray) {
      let likeUnlike = "";
      let likeIcon = this.$refs["heart-"+id][0];
      if(likesArray.includes(sessionStorage.myUserId)) {
        likeUnlike = "/messages/unlike";
      } else {
        likeUnlike = "/messages/like";
      }
      axios
        .put(sessionStorage.urlHost + likeUnlike, {messageId: id})
        .then(response => {
          EventBus.$emit("requestFullMessages");
        })
        .catch(error => {
          console.log(error);
        });
    },
    checkIfLiked(likesArray) {
      if(likesArray.includes(sessionStorage.myUserId)) {
        return true;
      } else {
        return false;
      }
    }
  },
  watch: {
    messagesAround: {
      handler(newMessages) {
        if(newMessages.length > 0) {
          this.messagesIsPresent = true;
        } else {
          this.messagesIsPresent = false;
        }
      },
      deep: true
    },
  }
};
</script>

<style lang="sass" scoped>
@import './vars.sass'

p
  color: $dark-color

a
  text-decoration: none

h4
  font-family: $primary-font
  margin: 0px 0px 10px 0px
  color: $dark-color
  font-size: 110%

.a-login
  color: $primary-color

.a-signup
  color: $secondary-color

.meta-message
  font-family: $primary-font
  display: inline-block

.internal-subtitle
  font-family: $primary-font

.scrollable
  overflow-y: auto
  flex: 1

.active
  background-color: $light-color-mod-two

.active:after
  content: "\2212"

.message-panel
  transition: font-size 0.3s ease, background-color 0.3s ease
  // display: block
  border-top: 1px solid #ccc
  font-family: $secondary-font
  &:hover
    background-color: $light-color-mod
  p
    margin: 0
    padding: 10px
    font-size: 85%
    font-family: $secondary-font
    text-align: left
  .bottom-text
    display: flex
    justify-content: space-between

.votes
  display: inline-block
  float: left

.hashtags
  display: inline-block

.comments-window
  display: none
  font-family: $secondary-font
  background: $light-color
  max-height: 80vh
  width: 480px
  margin: auto
  padding: 1%
  box-shadow: $shadow
  z-index: 1
  flex-direction: column
  @media only screen and (max-width: $media-width-first)
    max-width: 80vw
    height: 60%
  .comments-list
    flex: 1
    overflow-y: auto
    margin-bottom: 13px
    .p
      padding: 6px

.centered-screen
  position: fixed
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)

form
  text-align: center
  button
    text-transform: uppercase
    outline: 0
    background: $primary-color
    font-family: $primary-font
    width: 100%
    border: 0
    padding: 15px
    color: #FFFFFF
    font-size: 14px
    transition: all 0.3 ease
    cursor: pointer
    &:hover, &:active, &:focus
      box-shadow: $shadow

textarea
  outline: 0
  resize: none
  font-family: $secondary-font
  background: #f2f2f2
  width: 100%
  border: 0
  margin-bottom: 14px
  padding: 15px
  box-sizing: border-box
  font-size: 14px

.to-open-message
  color: #b3b3b3
  font-size: 85%

.fa-times-circle
  position: absolute
  top: 12px
  right: 12px
  cursor: pointer
  font-size: 24px
  color: $secondary-color
  transition: color .8s
  &:hover
    color: $dark-color

.close-popup
  background: black
  cursor: default
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  opacity: 0
  visibility: hidden
  /* "delay" the visibility transition */
  -webkit-transition: opacity .5s, visibility 0s linear .5s
  transition: opacity .5s, visibility 0s linear .5s

</style>
<template>
  <div>
    <template v-if="logged === true" >
      <h4>Messages nearby</h4>
      <div v-if="messagesIsPresent === true" class="scrollable">
        
        <div v-for="msg in messagesAround" :key=msg._id >
          
          <div class="message-panel" v-bind:class="{ 'highlighted': msg._id === selectedMsgIdFromMap }">
            <div>
              <p class="message-text" @click="selectFullMessage(msg._id)">{{msg.text}}</p>
              <div class="bottom-text">
                <div>
                  <p>by <b>{{ msg.author_nickname }}</b></p>
                </div>
                <div>
                  <p>
                    <i class="far fa-comments" @click="showCommentsPopup(msg._id)"></i>
                    {{ msg.comments.length }}
                    <i class="far fa-heart" @click="likeUnlike(msg._id, msg.likes)" v-bind:class="{ 'liked': checkIfLikedByMe(msg) }" :ref="'heart-'+msg._id"></i>
                    {{ msg.likes.length }}
                  </p>
                </div>
              </div>
            </div>

            <div class="comments-window centered-screen" :ref="'comment-section-'+msg._id">
              <h3>Comments</h3>
              <i class="far fa-times-circle" @click="hideCommentsPopup(msg._id)"></i>
              <div class="comments-list">
                <div v-for="comment in msg.comments" :key=comment._id style="text-align:left">
                  <p><b>{{ comment.author_nickname }}</b> {{ comment.text }}</p>
                </div>
              </div>
              <form v-on:submit.prevent id="write-form" @submit.prevent="addComment(msg._id)">
                <template v-if="msg.comments.length === 0" >
                  <textarea form="write-form" v-model="commentText" placeholder="There aren't any comments yet... Write here the first one"></textarea>
                </template>
                <template v-else>
                  <textarea form="write-form" v-model="commentText" placeholder="Write here your comment"></textarea>
                </template>
                <button type="submit" class="">Publish comment</button>
              </form>
            </div>
          </div>
          <a href="#" class="close-popup" :ref="'close-popup-'+msg._id" @click="hideCommentsPopup(msg._id)"></a>

        </div>  <!-- fine for -->

      </div>
      <div v-else>
        <i class="fas fa-sad-cry fa-3x"></i>
        <p>Ops! There aren't messages around here. <br /> 
          Do you want to <router-link :to="'/write'" class="a-login" exact> write </router-link> the first one?</p>
      </div>
    </template>
    
    <div v-else>
      <h4>Messages nearby</h4>
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

const MILLIS_TO_STAY_HIGHLIGHTED_FOR = 5000;

export default {
  props: ["messagesAround", "logged"],
  data() {
    return {
      commentText: "",
      messagesIsPresent: false,
      selectedMsgIdFromMap: "",
      lastSelectionTime: null
    };
  },
  methods: {
    selectFullMessage(id) {
      EventBus.$emit("selectedFullMessageFromList", id);
    },
    addComment(id) {
      axios
        .post(sessionStorage.urlHost + "/messages/comment", {
          text: this.commentText,
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
        this.commentText = "";
        this.hideCommentsPopup(id);
    },
    showCommentsPopup(id) {
      let commentsPopup = this.$refs["comment-section-"+id][0];
      let closePopup = this.$refs["close-popup-"+id][0];
      closePopup.style.visibility = "visible";
      closePopup.style.opacity = .7;
      commentsPopup.style.display = "flex";
    },
    hideCommentsPopup(id) {
      let commentsPopup = this.$refs["comment-section-"+id][0];
      let closePopup = this.$refs["close-popup-"+id][0];
      closePopup.style.visibility = "hidden";
      closePopup.style.opacity = 0;
      commentsPopup.style.display = "none";
    },
    likeUnlike(id, likesArray) {
      let likeUnlike = "";
      let likeIcon = this.$refs["heart-"+id][0];
      if(likesArray.includes(sessionStorage.myUserId)) {
        likeUnlike = "/messages/unlike";
      } else {
        likeUnlike = "/messages/like";
      }
      axios.put(sessionStorage.urlHost + likeUnlike, {messageId: id})
      .then(response => {
        EventBus.$emit("requestFullMessages");
      })
      .catch(error => {
        console.log(error);
      });
    },
    checkIfLikedByMe(msg) {
      return msg.likes.includes(sessionStorage.myUserId);
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
  },
  created() {
    EventBus.$on("clickedOnEnvelopeNearby", (msgId) => {
      this.selectedMsgIdFromMap = msgId;
      this.lastSelectionTime = new Date();
      setTimeout(() => {
        if (new Date() - this.lastSelectionTime >= MILLIS_TO_STAY_HIGHLIGHTED_FOR) {
          this.selectedMsgIdFromMap = "";
        }
      }, MILLIS_TO_STAY_HIGHLIGHTED_FOR);
    });
  }
}
</script>

<style lang="sass" scoped>
@import './vars.sass'

p
  color: $dark-color

a
  text-decoration: none

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
  border-top: 1px solid #ccc
  &:hover
    background-color: $light-color-mod
  p
    margin: 0
    padding: 10px
    font-size: 85%
    font-family: $secondary-font
    text-align: left
  .message-text
    cursor: pointer
    transition: color .5s
    &:hover
      color: $primary-color
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
  background: $light-color
  min-height: 250px
  max-height: 85vh
  width: 480px
  margin: auto
  padding: 1%
  box-shadow: $shadow
  z-index: 1
  flex-direction: column
  @media only screen and (max-width: $media-width-first)
    max-width: 85vw
  .comments-list
    flex: 1
    overflow-y: auto
    margin-bottom: 6px
    .p
      font-family: $secondary-font
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
    font-size: 100%
    width: 100%
    border: 0
    padding: 15px
    color: #FFFFFF
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
  margin-bottom: 6px
  padding: 15px
  box-sizing: border-box
  font-size: 14px

.to-open-message
  color: #b3b3b3
  font-size: 85%

.fa-times-circle
  position: absolute
  top: 8px
  right: 8px
  cursor: pointer
  font-size: 24px
  color: $secondary-color
  transition: color .3s
  &:hover
    color: $secondary-color-mod

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
  -webkit-transition: opacity .7s linear, visibility .7s linear
  -moz-transition: opacity .7s linear, visibility .7s linear
  -o-transition: opacity .7s linear, visibility .7s linear
  transition: opacity .7s linear, visibility .7s linear

</style>
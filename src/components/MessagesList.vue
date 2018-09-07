<template>
  <div>

    <!-- <div v-if="logged === true" > -->
    <div v-if="logged === true" >
      <h4>Messages nearby:</h4>
      <div v-if="messagesAround > 1">
        <div v-for="msg in messagesAround" :key=msg._id >  <!-- :class="{selected: msg._id === selectedMessage._id"} -->
          <div class="accordion" @click="expandMessage(msg._id)" :ref="'button-'+ msg._id">
            <p class="hashtags" v-for="value in msg.hashtags" :key=value> 
              &nbsp; #{{ value }}
            </p>
          </div>
          <div class="panel" :ref="'panel-'+msg._id">
            <p>{{msg.text}}</p>          
            <p class="meta-message"><b>by:</b> {{ msg.author_nickname }}
              <i class="fas fa-heart" @click="likeUnlike(msg._id, msg.likes)" v-bind:class="{ 'liked': checkIfLiked(msg.likes) }" :ref="'heart-'+msg._id"></i>
              {{ msg.likes.length }}
              <i class="fas fa-comment" @click="showCommentsPopup(msg._id)" v-if="msg.comments"></i>
              {{ msg.comments.length }}
            </p>
            <div class="comment-section" style="display:none" :ref="'comment-section-'+msg._id">
              <i class="far fa-times-circle" @click="hideCommentsPopup(msg._id)"></i>
              <div v-for="comment in msg.comments" :key=comment._id style="text-align:left">
                <p><b>{{ comment.author_nickname }}:</b> {{ comment.text }}</p>
              </div>
              <form v-on:submit.prevent id="write-form" @submit.prevent="addComment(msg._id)">
                <p class="internal-subtitle">Write a comment</p>
                  <textarea form="write-form" v-model="commentText" placeholder="Write here your message"></textarea>
                <button type="submit" class="">Publish comment</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <i class="fas fa-sad-cry fa-3x"></i>
        <p>Ops! There aren't messages here, do you want to write the first?</p>
      </div>
    </div>
    
    <div v-else>
      <p>Messages nearby</p>
      <p class="to-open-message">
        <router-link :to="'/login'" class="a-login" exact> login </router-link>
        or
        <router-link :to="'/signup'" class="a-signup" exact> signup </router-link>
        <!-- <br/> -->
        to see them
      </p>
    </div>

  </div>

    <!--    W O R K   I N   P R O G R E S S   ! ! !    DENTRO ALL'ELSE--> 
    <!-- <div v-for="msg in messagesAround" :key=msg._id >  <!\-\- :class="{selected: msg._id === selectedMessage._id"} -\->
      <div class="accordion">
        <p class="votes">{{msg.votes}}</p>
        <p class="hashtags" v-for="value in msg.hashtags" :key=value> 
          &nbsp; #{{ value }}
        </p>
      </div>
      <div class="panel" :ref="'panel-'+msg._id">
        {{msg.text}}
      </div>
    </div> -->
</template>

<script>
import { EventBus } from "../main.js" 
const axios = require("axios");

export default {
  props: ["messagesAround", "logged"],
  data() {
    return {
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
      commentsPopup.style.display = "block";
    },
    hideCommentsPopup(id) {
      let commentsPopup = this.$refs["comment-section-"+id][0];
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
      axios
        .put(sessionStorage.urlHost + likeUnlike, {messageId: id})
        .then(response => {
          EventBus.$emit("forceFullMessagesUpdate");
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
  
};
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

.internal-subtitle
  font-family: $primary-font

.accordion
  background-color: $light-color-mod
  color: #444
  cursor: pointer
  padding: 5px
  border: none
  text-align: center
  outline: none
  font-size: 15px
  transition: 0.4s

.active
  background-color: $light-color-mod-two

.accordion
  &:hover
    background-color: $light-color-mod-two
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
  background-color: $light-color-mod
  max-height: 0
  overflow: hidden
  transition: max-height 0.2s ease-out
  border: 1px
  font-family: $secondary-font

.votes
  display: inline-block
  float: left

.hashtags
  display: inline-block

.comment-section
  background: #FFFFFF
  max-width: 360px
  margin: auto
  padding: 1%
  box-shadow: $shadow
  position: fixed
  z-index: 1
  width: 40%
  height: 40%
  font-family: $secondary-font
  top: 0
  left: 0
  overflow: auto 
  @media only screen and (max-width: 700px)
    width: 80%
    padding: 3%
    height: 60%
    margin: auto

form
  text-align: center
  padding: 2%
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
      box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 3px 3px 0 rgba(0, 0, 0, 0.24)

textarea
  outline: 0
  resize: none
  font-family: $secondary-font
  background: #f2f2f2
  width: 100%
  border: 0
  margin: 0 0 15px
  padding: 15px
  box-sizing: border-box
  font-size: 14px
  max-width: 360px

.to-open-message
  color: #b3b3b3
  font-size: 85%

</style>
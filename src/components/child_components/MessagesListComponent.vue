<template>
    <div class=messages-list-component>
        <p>Lista di messaggi</p>
        <h3>Messaggi completi:</h3>
        <li v-for="msg in fullMessages" v-on:click="selectFullMsg(msg, $event)" v-bind:key=msg.id>
            {{msg}}
        </li>
        <h3>Messaggi parziali:</h3>
        <li v-for="msg in strippedMessages" v-on:click="selectStrippedMsg(msg, $event)" v-bind:key=msg.id>
            {{msg}}
        </li> 
    </div>
</template>

<script>
export default {
    data() {
        return {
            strippedMessages: this.strippedmsgs,
            fullMessages: this.fullmsgs
        }
    },
    methods: {
        selectFullMsg(msg, event) {
            this.$emit('selectMessage', this.fullMessages[event.target.value].name);
        },
        selectStrippedMsg(msg, event) {
            this.$emit('selectMessage', this.strippedMessages[event.target.value].name);
        },
    },
    props: ["strippedmsgs", "fullmsgs", "selectedmsg"],
    watch: {
        strippedmsgs: function(val) {
            this.strippedMessages = this.strippedmsgs;
            console.log(this.strippedMessages);
        }
    }
}
</script>

<style>

</style>

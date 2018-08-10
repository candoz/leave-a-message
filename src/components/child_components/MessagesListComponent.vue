<template>
    <div class=messages-list-component>
        <p>Lista di messaggi</p>
        <h3>Messaggi completi:</h3>
        <li v-for="msg in fullMessages" v-bind:key=msg.id>
            {{msg}}
        </li>
        <h3>Messaggi parziali:</h3>
        <li v-for="msg in limitedMessages" v-bind:key=msg.id>
            {{msg}}
        </li>
    </div>
</template>

<script>
export default {
    data() {
        return {
            limitedMessages: this.limitedmsgs,
            fullMessages: this.fullmsgs
        }
    },
    props: ["limitedmsgs", "fullmsgs"]
}
</script>

<style>

</style>

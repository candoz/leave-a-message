<template>
    <div id="login">
        <link href="//cdn.bootcss.com/pure/0.6.0/pure-min.css" rel="stylesheet">
        <form class="pure-form pure-form-stacked" v-on:submit.prevent="doLogin" id="form">
        <fieldset>
            <legend>Login Form</legend>

            <label for="email">Email</label>
            <input id="email" v-model="email" type="text" placeholder="Email">

            <label for="password">Password</label>
            <input id="password" v-model="password" type="password" placeholder="Password">

            <button type="submit" class="pure-button pure-button-primary" v-on:click="doLogin($event)">login</button>
        </fieldset>
        </form>
    </div>
</template>

<script>
    const axios = require('axios');
    export default {
        data() {
            return {
                email: null,
                password: null
            }
        
        },
        methods: {
            doLogin(event) {
                axios.put('https://jsonplaceholder.typicode.com/posts/1', {email:this.email,password:this.password})
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                   // Error
                    if (error.response) {
                        console.log("Response");
                        // The request was made and the server responded with a status code
                        // that falls out of the range of 2xx
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    } else if (error.request) {
                        console.log("Richiesta");
                        // The request was made but no response was received
                        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                        // http.ClientRequest in node.js
                        console.log(error.request);
                    } else {
                        console.log("Setting up");
                        // Something happened in setting up the request that triggered an Error
                        console.log('Error', error.message);
                    }
                    console.log(error.config);
                });
            }
        }
    }
</script>


<style scoped>
#form {
  margin-left: 20px;
}
</style>
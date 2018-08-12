<template>
    <div id="login">
        <link href="//cdn.bootcss.com/pure/0.6.0/pure-min.css" rel="stylesheet">
        {{logged}}
        <div v-if="logged==='false'" >
        <form class="pure-form pure-form-stacked" v-on:submit.prevent="doLogin" id="form">
        <fieldset>
            <legend>Login Form</legend>

            <label for="email">Email</label>
            <input id="email" v-model="email" type="text" placeholder="Email">

            <label for="password">Password</label>
            <input id="password" v-model="password" type="password" placeholder="Password">

            <button type="submit" class="pure-button pure-button-primary">login</button>
        </fieldset>
        </form>
        </div>
        <div v-else >
            <p>You are logged</p>
            <button class="pure-button pure-button-primary" v-on:click="doLogout">logout</button>
        </div>
    </div>
</template>

<script>
    const axios = require('axios');
    export default {
        data() {
            return {
                email: null,
                password: null,
                logged: localStorage.logged
            }
        
        },
        methods: {
            doLogin(event) {
                let self = this;
                axios.put(localStorage.urlHost+'/login', {email:this.email,password:this.password})
                .then(function (response) {
                    self.logged='true';
                    console.log(response);
                })
                .catch(function (error) {
                   // Error
                    if (error.response) {
                        console.log("Response");
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    } else if (error.request) {
                        console.log("Richiesta");
                        console.log(error.request);
                    } else {
                        console.log("Setting up");
                        console.log('Error', error.message);
                    }
                    console.log(error.config);
                });
            },
            doLogout(event) {
                let self = this;
                axios.put(localStorage.urlHost+'/logout')
                .then(function (response) {
                    self.logged='false';
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error.config);
                });
            },
        },
        watch: {
            logged(state) {
                localStorage.logged = state;
            }
        }
    }
</script>


<style scoped>
#form {
  margin-left: 20px;
}
</style>
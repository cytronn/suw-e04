<template>
  <section class="container">
    <div class="login__sideContainer">
      <div class="login__sideContent">
        <img class="login__logo" width="135" src="~assets/img/accio_logo.png">
        <div class="login__textContent">
          <span class="login__mainHeadline">Create<span class="blue">, dont repeat.</span></span>
          <p class="login__secondHeadline">Accio lets everyone in the company browse your development history and load components with project management information.</p>
        </div>
        <div class="login__githubContainer">
          <a class="login__link" :href="'https://github.com/login/oauth/authorize?scope=user,repo,repo:invite,&client_id='+client_id">
            <div class="login__githubSquare"><img src="~assets/img/github_logo.png" alt="" width="36"></div>
            <button class="login__logButton">Register with GitHub</button>
          </a>
          <div class="login__explanation">Soon with Bitbucket and Gitlab ! 😀</div>
        </div>
      </div>
    </div>
    <div class="login__backgroundImg"><img src="~assets/img/login_background.png" alt=""></div>
  </section>
</template>

<script>
import axios from "~/plugins/axios";

export default {
  data() {
    return {
      client_id: process.env.client_id
    };
  },
  async asyncData() {},
  head() {
    return {
      title: "Users"
    };
  },
  fetch({ store, redirect }) {
    if (store.state.authUser == "logged") {
      return redirect("/repos");
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
}
.login__sideContainer {
  /* width: 33%; */
  background-color: white;
  min-width: 464px;
  height: 100vh;
}
.login__sideContent {
  width: 80%;
  margin-left: 65px;
}
.login__logo {
  margin-top: 46px;
}
.login__mainHeadline {
  width: 80%;
  margin-top: 20vh;
  color: #8a8ca2;
  display: inline-block;
  font-size: 31px;
  text-align: left;
  font-family: "SFProText-Semibold";
}
.blue {
  color: #574beb;
}
.login__githubContainer {
  width: fit-content;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
}
.login__link {
  display: flex;
  margin-top: 15vh;
  text-decoration: none;
}
.login__githubSquare {
  display: flex;
  justify-content: center;
  align-items: center;
  /* display: inline-block; */
  height: 70px;
  width: 70px;
  background-color: #574beb;
}
.login__logButton {
  display: inline-block;
  padding: 26px 46px;
  margin-left: 2px;
  font-size: 16px;
  cursor: pointer;
  background-color: #574beb;
  color: white;
  border: none;
  outline: none;
}
.login__secondHeadline {
  width: 80%;
  color: #c7cad5;
  font-size: 16px;
  text-align: left;
}
.login__explanation {
  color: #c7cad5;
  text-align: center;
  margin-top: 22px;
}
.login__backgroundImg {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
.login__backgroundImg img {
  position: absolute;
  min-width: 100%;
  height: 100vh;
  object-fit: cover;
}
</style>

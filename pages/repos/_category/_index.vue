<template>
  <section class="components">
    <div v-bind:class="{'repos__logoContainer--hidden':!$store.getters.isLoading}" class="repos__logoContainer">
      <img class="repos__logo" src="~assets/img/accio_logo_fat.gif">
      <div class="repos__logoCircle"></div>
    </div>
    <div class="flex align-center">
      <h1 class="components__categorytitle">{{ $store.getters.active_category }}</h1>
      <div class="components__componentsCount">{{ $store.getters.components.length }}</div>
      <button class="newComponent" v-if="!$store.getters.isLoading" @click.prevent="displayForm">New component</button>
    </div>
    <form v-if="createMode" class="view-top" ref="form" name="createComponent"  @submit.prevent="createComponent">
      <div v-if="createMode" class="flex">
        <div class="newComponentDetails">
          <h2>Component details</h2>
          <p>Enter the informations of the component to create it in Github</p>
          <div class="form-group">
            <label>Component name</label>
            <input required type="text" name="componentName" />
          </div>
          <div class="form-group">
            <label>Development time</label>
            <div class="flex inline-input">
              <input required placeholder="Days" type="number" name="devTimeDays" />
              <input required placeholder="Hours" type="number" name="devTimeHours" />
            </div>
          </div>
          <div class="form-group">
            <label>Pricing in euros</label>
            <input required placeholder="€" type="number" name="pricing" />
          </div>
          <div class="form-group">
            <label>Difficulty</label>
            <div class="flex listDifficulty">
              <div>
                <input required type="radio" id="veryEasy" name="difficulty"  value="1">
                <label>Very easy</label>
              </div>
              <div>
                <input required type="radio" id="easy" name="difficulty" value="2">
                <label>Easy</label>
              </div>
              <div>
                <input required type="radio" id="medium" name="difficulty"  value="3">
                <label>Medium</label>
              </div>
              <div>
                <input required type="radio" id="hard" name="difficulty" value="4">
                <label>Hard</label>
              </div>
              <div>
                <input required type="radio" id="insane" name="difficulty" value="5">      
                <label>Insane</label>
              </div>
            </div>
          </div>
        </div>
        <div class="newComponentInfos">
          <h2>Tags & description</h2>
          <p>Fill in tags for the search as well as an aid to understanding.</p>
          <div class="fluid-form-group">
            <span>Tags</span>
            <div class="flex align-center">
              <input id="tags" autocomplete="off" type="text" name="tags" placeholder="Enter a tag"/>
              <a v-on:click="createTag" class="createTag"><i class="fa fa-plus"></i></a>
            </div>
            <ul v-if="newComponent.tags.length > 0" class="tags view-top">
              <li class="tag view-top" v-for="(tag) in newComponent.tags" :key="tag">
                {{tag}} <i v-on:click="deleteTag(tag)" class="fa fa-times deleteTag"></i>
              </li>
            </ul>
          </div>
          <div class="fluid-form-group">
            <span>Description</span>
            <textarea name="description"></textarea>
          </div>
        </div>
      </div>
      <div class="form-actions flex">
        <button class="createBtn" type="submit">Create</button>
      </div>
    </form>
    <div v-if="!createMode && !$store.getters.isLoading" class="components__componentsContainer">
      <div v-for="(component, name) in $store.getters.components" :key="name" class="components__componentCard">
        <template v-if="component.component.type === 'dir'">
          <div class="components__componentLink" @click="setActiveComponent(component.component.name)">
            <span><i class="fa fa-folder"></i> {{ component.component.name }}</span>
            <div class="flex justify-between componentInfosIcons">
              <p><i class="fa fa-money"></i> {{ component.content.pricing }}€</p>
              <p v-if="component.content.difficulty === '1'"><i class="fa fa-tachometer"></i> Very easy</p>
              <p v-if="component.content.difficulty === '2'"><i class="fa fa-tachometer"></i> Easy</p>
              <p v-if="component.content.difficulty === '3'"><i class="fa fa-tachometer"></i> Medium</p>
              <p v-if="component.content.difficulty === '4'"><i class="fa fa-tachometer"></i> Hard</p>
              <p v-if="component.content.difficulty === '5'"><i class="fa fa-tachometer"></i> Insane</p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script>
import axios from "~/plugins/axios";
import logoutMixin from "~/mixins/logoutMixin";

export default {
  data() {
    return {
      components: null,
      createMode: null,
      creatingComponent: false,
      newComponent: {
        name: null,
        devTime: null,
        pricing: null,
        difficulty: null,
        description: null,
        tags: []
      }
    };
  },
  mixins: [logoutMixin],
  mounted() {
    this.init();
  },
  methods: {
    setActiveComponent(componentName) {
      this.$store.dispatch("setActiveComponent", componentName);
      this.$nuxt.$router.replace({ path: `/component/${componentName}` });
    },
    displayForm() {
      this.createMode = !this.createMode;
      this.preventEnterKey();
      this.newComponent.tags = [];
      if (this.createMode) {
        document.querySelector(".newComponent").innerHTML = "Cancel";
      } else {
        document.querySelector(".newComponent").innerHTML = "New component";
      }
    },
    isEmpty(str) {
      return !str.replace(/^\s+/g, "").length;
    },
    createTag() {
      var newTag = document.getElementsByName("tags");
      var newTagInput = document.getElementById("tags");
      if (this.isEmpty(newTagInput.value)) {
        return;
      }
      newTag.forEach(tag => {
        if (this.newComponent.tags.indexOf(tag.value) > -1) {
          alert("This tag already added !");
        } else {
          this.newComponent.tags.push(tag.value);
          newTagInput.value = "";
        }
      });
    },
    preventEnterKey() {
      var _this = this;
      setTimeout(() => {
        document.getElementById("tags").onkeypress = function(e) {
          var key = e.charCode || e.keyCode || 0;
          if (key == 13) {
            e.preventDefault();
            _this.createTag();
          }
        };
      }, 500);
    },
    deleteTag(tag) {
      var tags = this.newComponent.tags;
      var index = tags.indexOf(tag);
      if (index > -1) {
        tags.splice(index, 1);
      }
    },
    reloadComponentsList() {
      return axios
        .get(
          "https://api.github.com/repos/" +
            this.$store.getters.active_repo.owner +
            "/" +
            this.$store.getters.active_repo.name +
            "/contents/" +
            this.$store.getters.active_category +
            "?access_token=" +
            this.$store.getters.access_token
        )
        .then(res => {
          res.data.forEach(function(component) {
            // this is to not make a query on the readme file
            if (component.name.indexOf("README")) {
              return axios
                .get(
                  `https://api.github.com/repos/${
                    this.$store.getters.active_repo.owner
                  }/${this.$store.getters.active_repo.name}/contents/${
                    this.$store.getters.active_category
                  }/${component.name}/config.json?access_token=${
                    this.$store.getters.access_token
                  }`
                )
                .then(response => {
                  var decodeContent = atob(response.data.content);
                  let content = JSON.parse(decodeContent);
                  this.creatingComponent = true;
                  this.$store.dispatch("setLoaderState", false);
                  document.querySelector(".newComponent").innerHTML =
                    "New component";
                  this.$store.dispatch("setComponentContent", {
                    component: component,
                    content: content
                  });
                })
                .catch(e => {
                  console.log(e);
                });
            }
          }, this);
        });
    },
    init() {
      if (this.$store.getters.components.length > 0) {
        this.$store.dispatch("deleteComponents");
      }
      let categoryName = null;
      this.$store.dispatch("setLoaderState", true);
      return axios
        .get(
          "https://api.github.com/repos/" +
            this.$store.getters.active_repo.owner +
            "/" +
            this.$store.getters.active_repo.name +
            "/contents/" +
            this.$store.getters.active_category +
            "?access_token=" +
            this.$store.getters.access_token
        )
        .then(res => {
          res.data.forEach(function(component) {
            // this is to not make a query on the readme file
            if (component.name.indexOf("README")) {
              return axios
                .get(
                  `https://api.github.com/repos/${
                    this.$store.getters.active_repo.owner
                  }/${this.$store.getters.active_repo.name}/contents/${
                    this.$store.getters.active_category
                  }/${component.name}/config.json?access_token=${
                    this.$store.getters.access_token
                  }`
                )
                .then(response => {
                  var decodeContent = atob(response.data.content);
                  let content = JSON.parse(decodeContent);
                  // this.components += {component: component, content: content};
                  this.$store.dispatch("setComponentContent", {
                    component: component,
                    content: content
                  });
                })
                .catch(e => {
                  console.log(e);
                });
            }
          }, this);
          this.$store.dispatch("setLoaderState", false);
        })
        .catch(e => {
          console.log(e);
        });
    },
    githubAction(componentName) {
      this.createMode = false;
      this.$store.dispatch("setLoaderState", true);
      const configJson = {
        devTime: {
          days: this.$refs.form.devTimeDays.value,
          hours: this.$refs.form.devTimeHours.value
        },
        pricing: this.$refs.form.pricing.value,
        difficulty: this.$refs.form.difficulty.value,
        description: this.$refs.form.description.value,
        tags: this.newComponent.tags
      };
      return axios
        .put(
          `https://api.github.com/repos/${
            this.$store.getters.active_repo.owner
          }/${this.$store.getters.active_repo.name}/contents/${
            this.$route.params.index
          }/${componentName}/index.js?access_token=${
            this.$store.getters.access_token
          }`,
          {
            message: `:octopus: Accio :tophat: • ${Date.now()}`,
            content: btoa("console.log('hello wolrd')")
          }
        )
        .then(res => {
          axios
            .put(
              `https://api.github.com/repos/${
                this.$store.getters.active_repo.owner
              }/${this.$store.getters.active_repo.name}/contents/${
                this.$route.params.index
              }/${componentName}/config.json?access_token=${
                this.$store.getters.access_token
              }`,
              {
                message: `:octopus: Accio :tophat: • ${Date.now()}`,
                content: btoa(JSON.stringify(configJson))
              }
            )
            .then(res => {
              this.$store.dispatch("deleteComponents");
              setTimeout(() => {
                this.creatingComponent = false;
                this.reloadComponentsList();
              }, 6000);
            });
        })
        .catch(e => {
          this.logoutMixin();
        });
    },
    createComponent() {
      this.githubAction(this.$refs.form.componentName.value);
    }
  },
  fetch({ store, redirect, params }) {
    if (store.state.authUser != "logged") {
      return redirect("/login");
    }
  }
};
</script>

<style scoped>
@keyframes view-top {
  0% {
    opacity: 0;
    transform: translate(0, 100px);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0);
  }
}
.view-top {
  margin-top: 100px;
  animation: view-top 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  animation-fill-mode: forwards;
}
.flex {
  display: flex;
}
.justify-between {
  justify-content: space-between;
}
.justify-center {
  justify-content: center;
}
.align-center {
  align-items: center;
}
.components {
  position: relative;
  display: flex;
  width: calc(100% - 301px);
  margin-left: 301px;
  min-height: 100vh;
  background-color: #fbfbfd;
  padding: 100px 30px;
  box-sizing: border-box;
  flex-direction: column;
  background-image: url("~assets/img/bg-illu.png");
  background-size: contain;
  background-position: right;
  background-repeat: no-repeat;
  background-position-y: 150px;
}
.newComponent {
  margin-left: 2rem;
  background: white;
  cursor: pointer;
  width: 200px;
  color: #574beb;
  border: 1px solid #574beb;
  text-align: center;
  border-radius: 3px;
  padding: 10px;
  outline: none;
  transition: all 0.2s ease;
}
.newComponent:hover {
  background: #574beb;
  color: white;
}
.newComponentDetails {
  flex: 40%;
}
.newComponentInfos {
  flex: 60%;
}
.newComponentDetails,
.newComponentInfos {
  background: white;
  border: 1px solid #dad8f9;
  border-radius: 3px;
  padding: 30px;
}
.newComponentDetails h2,
.newComponentInfos h2 {
  margin: 0;
  color: black;
  font-size: 21px;
}
.newComponentDetails p,
.newComponentInfos p {
  color: #808080;
  margin-top: 20px;
  margin-bottom: 0;
}
.newComponentDetails .form-group:first-child {
  margin-top: 38px;
}
.newComponentDetails .form-group {
  margin-top: 24px;
}
.newComponentDetails .form-group .inline-input input:last-child {
  margin-left: 2rem;
}
.newComponentDetails .form-group label {
  display: block;
  color: #574beb;
  font-size: 15px;
}
.newComponentDetails .form-group input:not([type="radio"]) {
  margin-top: 10px;
  padding: 10px;
  border-radius: 3px;
  border: 1px solid #dedede;
  width: 70%;
  outline: none;
}
.listDifficulty {
  margin-top: 10px;
}
.listDifficulty div {
  position: relative;
}
.form-group .listDifficulty div label {
  color: black;
  top: 20px;
  font-size: 12px;
  position: absolute;
  left: 50%;
  width: max-content;
  transform: translateX(-50%);
}
.listDifficulty input {
  height: 10px;
  width: 42px;
  background: #dfe3e8;
  -webkit-appearance: none;
  transition: all 0.2s ease;
  cursor: not-allowed;
}
.listDifficulty input:not(:disabled) {
  cursor: pointer;
}
.listDifficulty input:focus {
  outline: none;
}
.listDifficulty input:checked:before {
  content: "";
  position: absolute;
  top: 12px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 0;
  height: 0;
  border-left: solid 5px transparent;
  border-right: solid 5px transparent;
}
.listDifficulty #veryEasy:checked {
  background-color: #66e27e;
}
.listDifficulty #veryEasy:checked:before {
  border-top: solid 5px #66e27e;
}
.listDifficulty #easy:checked {
  background-color: #1eb663;
}
.listDifficulty #easy:checked:before {
  border-top: solid 5px #1eb663;
}
.listDifficulty #medium:checked {
  background-color: #f47922;
}
.listDifficulty #medium:checked:before {
  border-top: solid 5px #f47922;
}
.listDifficulty #hard:checked {
  background-color: #f43922;
}
.listDifficulty #hard:checked:before {
  border-top: solid 5px #f43922;
}
.listDifficulty #insane:checked {
  background-color: #6d0c00;
}
.listDifficulty #insane:checked:before {
  border-top: solid 5px #6d0c00;
}
.newComponentInfos {
  margin-left: 0.8125rem;
}
.newComponentInfos .fluid-form-group:first-child {
  margin-top: 38px;
}
.newComponentInfos .fluid-form-group {
  margin-top: 25px;
}
.newComponentInfos .fluid-form-group input {
  margin-top: 10px;
  padding: 10px;
  border-radius: 3px;
  border: 1px solid #dedede;
  width: 70%;
  outline: none;
}
.newComponentInfos .fluid-form-group span {
  color: #574beb;
  font-size: 15px;
  display: block;
}
.newComponentInfos .tags {
  margin-top: 30px;
  border: 1px solid #dedede;
  border-radius: 3px;
  padding-left: 0;
}
.newComponentInfos .createTag {
  background: #574beb;
  color: white;
  padding: 5px;
  border-radius: 3px;
  margin-top: 10px;
  margin-left: 0.5rem;
  padding: 7px;
  width: 20px;
  text-align: center;
  cursor: pointer;
}
.newComponentInfos .tags .tag {
  background: #574beb;
  color: white;
  border-radius: 3px;
  width: auto;
  display: inline-block;
  padding: 7px;
  margin: 5px;
  font-size: 12px;
}
.newComponentInfos textarea {
  border: 1px solid #dedede;
  border-radius: 3px;
  margin-top: 10px;
  resize: none;
  padding: 10px;
  box-sizing: border-box;
  width: 100%;
  height: 300px;
  outline: none;
}
.form-actions {
  justify-content: flex-end;
}
.form-actions button {
  text-align: center;
  border: none;
  border-radius: 3px;
  padding: 15px;
  margin-top: 30px;
  outline: none;
  width: 200px;
  font-size: 14px;
  cursor: pointer;
}
.form-actions .createBtn {
  background: #574beb;
  color: white;
  margin-left: 1rem;
}
.components__componentsContainer {
  margin-top: 100px;
  display: flex;
  flex-wrap: wrap;
}
.components__categorytitle {
  margin: 0;
}
.components__componentsCount {
  background: #574beb;
  padding: 3px;
  color: white;
  width: 25px;
  margin-left: 2rem;
  text-align: center;
}
.components__componentLink span {
  display: block;
}
.components .components__componentLink i {
  color: #574beb;
}
.components__componentCard .componentInfosIcons {
  margin-top: 30px;
}
.components__componentCard .componentInfosIcons p {
  margin: 0;
}
.components__componentCard {
  cursor: pointer;
  width: 232px;
  padding: 20px;
  margin-right: 20px;
  margin-bottom: 20px;
  box-sizing: border-box;
  background-color: #f5f6fa;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  -webkit-box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.07);
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.07);
}
.components__componentCard:hover {
  -webkit-box-shadow: 0px 9px 8px 0px rgba(0, 0, 0, 0.1);
  box-shadow: 0px 9px 8px 0px rgba(0, 0, 0, 0.1);
}

.repos__logoContainer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  width: 130px;
  height: 130px;
}

.repos__logoContainer--hidden {
  display: none;
}
.repos__logo {
  width: 130px;
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 10;
  transform: translate3d(-50%, -50%, 0);
}
.repos__logoCircle {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate3D(-50%, -50%, 0);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 1px solid #c6d2d6;
  animation-name: circleFade;
  animation-duration: 3s;
  animation-iteration-count: infinite;
}
.repos__logoCircle:before,
.repos__logoCircle:after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate3D(-50%, -50%, 0);
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 1px solid #c6d2d6;
  animation-name: circleFade;
  animation-duration: 3s;
  animation-iteration-count: infinite;
}

.repos__logoCircle:before {
  animation-delay: 0.3s;
}

.repos__logoCircle:after {
  animation-delay: 0.6s;
}

@keyframes circleFade {
  0% {
    width: 10px;
    height: 10px;
    opacity: 1;
  }
  70% {
    width: 224px;
    height: 224px;
    opacity: 0.7;
  }
  80% {
    width: 224px;
    height: 224px;
    opacity: 0;
  }
  100% {
    width: 10px;
    height: 10px;
    opacity: 0;
  }
}
</style>
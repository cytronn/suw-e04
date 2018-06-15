<template>
  <section class="component">
    <div class="row">
      <div class="component-title">
        <div>
          <h1>
            {{$route.params.slug}}
          </h1>
        </div>
      </div>
      <div class="flex align-center justify-between">
        <div>
          <nuxt-link class="editInfos" :to="`/repos/${$store.getters.active_repo.name}/${$store.getters.active_category}`"><i class="fa fa-caret-left"></i> Back to {{$store.getters.active_category}}</nuxt-link>
        </div>
        <div>
          <button v-if="!editMode" class="editBtn" @click.prevent="displayInputs">Modify</button>
          <button v-if="editMode" class="editBtn" @click.prevent="toggleEditMode">Cancel</button>
          <button v-if="editMode" class="deleteComponentBtn view-left" @click.prevent="deleteComponent">Delete Component</button>
        </div>
      </div>
    </div>
    <div class="row infos-sections">
      <div v-if="configFile !== null" class="component-datas">
        <form class="flex" ref="form" name="saveConfigFile"  @submit.prevent="saveConfigFile">
          <div class="infos-wrapper left-col">
            <div class="flex">
              <div class="info componentInfo">
                <span v-if="!editMode">{{ configFile.content.devTime.days }} days / {{ configFile.content.devTime.hours }} hours </span>
                <div class="flex inline-input">
                  <input class="view-left" placeholder="Days" v-if="editMode" type="number" name="devTimeDays"  v-model="configFile.content.devTime.days"/>
                  <input class="view-left" placeholder="Hours" v-if="editMode" type="number"  name="devTimeHours" v-model="configFile.content.devTime.hours"/>
                </div>
                <label>Development time</label>
              </div>
              <div class="info componentInfo">
                <span>1.0</span>
                <label>Version</label>
              </div>
              <div class="info componentInfo">
                <span v-if="!editMode">{{ configFile.content.pricing }}€</span>
                <input placeholder="€" class="view-left" v-if="editMode" type="number" name="pricing" v-model="configFile.content.pricing"/>
                <label>Pricing</label>
              </div>
              <div class="info componentInfo">
                <span>6</span>
                <label>Contributors</label>
              </div>
            </div>
            <h2 v-if="previewUrl">Preview</h2>
            <div class="preview-tag-wrapper">
              <div class="meta__informations_preview">
                <img v-if="previewUrl" class="preview" :src="previewUrl" />
              </div>
              <div class="tab">
                <a class="tablinks" v-on:click="openContent(index)" v-for="(file, index) in files" :key="index" v-bind:class="{active: index === 0}">
                  {{file.name }}
                </a>
              </div>
              <div class="code-wrapper">
                <div class="copy">
                  <p class="label view-left" v-if="isCopied">Copied !</p>
                  <i v-on:click="copyToClipBoard" class="fa fa-clone"></i>
                </div>
                <div class="view-left" v-for="(file, index) in files" :key="index" >
                  <div v-bind:id="file.name" v-if="file.content !== null" v-bind:class="{active: index === 0}" class="tabcontent">
                    <pre>{{file.content}}</pre>
                  </div>
                </div>
              </div>
              <h2>Description</h2>
              <textarea class="view-left" v-if="editMode" name="description" v-model="configFile.content.description"></textarea>
              <p>{{ configFile.content.description }}</p>
            </div>
          </div>
          <div class="right-col">
            <div class="info difficulty">
              <span>Difficulty</span>
              <div class="flex listDifficulty">
                <div>
                  <input :disabled="!editMode" type="radio" id="veryEasy" name="difficulty" :checked="{true: configFile.content.difficulty === 1}" value="1" v-model="configFile.content.difficulty">
                  <label v-if="configFile.content.difficulty === '1'">Very easy</label>
                </div>
                <div>
                  <input :disabled="!editMode" type="radio" id="easy" name="difficulty" :checked="{true: configFile.content.difficulty === 2}" value="2" v-model="configFile.content.difficulty">
                  <label v-if="configFile.content.difficulty === '2'">Easy</label>
                </div>
                <div>
                  <input :disabled="!editMode" type="radio" id="medium" name="difficulty" :checked="{true: configFile.content.difficulty === 3}" value="3" v-model="configFile.content.difficulty">
                  <label v-if="configFile.content.difficulty === '3'">Medium</label>
                </div>
                <div>
                  <input :disabled="!editMode" type="radio" id="hard" name="difficulty" :checked="{true: configFile.content.difficulty === 4}" value="4" v-model="configFile.content.difficulty">
                  <label v-if="configFile.content.difficulty === '4'">Hard</label>
                </div>
                <div>
                  <input :disabled="!editMode" type="radio" id="insane" name="difficulty" :checked="{true: configFile.content.difficulty === 5}" value="5" v-model="configFile.content.difficulty">      
                  <label v-if="configFile.content.difficulty === '5'">Insane</label>
                </div>
              </div>
            </div>
            <div class="tags-wrapper">
              <div class="flex justify-between">
                <p>Tags</p>
                <p class="addTagLink" v-on:click="addTag" v-if="editMode">Add</p>
              </div>
              <input class="view-left" v-if="editMode" id="newTag" name="newTag" placeholder="Enter a tag"/>
              <ul class="tags">
                <li class="tag view-left" v-for="(tag) in configFile.content.tags" :key="tag">
                  {{tag}} <i v-if="editMode" v-on:click="deleteTag(tag)" class="fa fa-times deleteTag"></i>
                </li>
              </ul>
            </div>
            <button class="saveBtn" v-if="editMode" type="submit">Save component</button>
          </div>
        <div>
        </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
import axios from "~/plugins/axios";

export default {
  fetch({ store, params, route, redirect }) {
    if (store.state.authUser != "logged") {
      return redirect("/login");
    }
    store.dispatch("setSlug", route.params.slug);
  },
  data() {
    return {
      configFile: null,
      files: [],
      editMode: false,
      isCopied: false,
      configValues: [],
      previewUrl: null
    };
  },
  head() {
    return {
      title: "Component"
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.files = [];
      // this.$store.dispatch("setActiveRepo", {
      //   name: this.$store.getters.active_repo.name,
      //   owner: this.$store.getters.active_repo.owner
      // });
      this.getComponentInformations();
    },
    toggleEditMode() {
      this.editMode = !this.editMode;
    },
    isEmpty(str) {
      return !str.replace(/^\s+/g, "").length;
    },
    openContent(index) {
      this.isCopied = false;
      var i, tabcontent, tablinks;
      tabcontent = document.getElementsByClassName("tabcontent");
      for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
      }
      tabcontent[index].classList.add("active");
      tablinks = document.getElementsByClassName("tablinks");
      for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
      }
      tablinks[index].classList.add("active");
    },
    copyToClipBoard() {
      var code = document.querySelector(".tabcontent.active pre").textContent;
      var textArea = document.createElement("textarea");
      textArea.textContent = code;
      document.body.append(textArea);
      textArea.style.opacity = "0";
      textArea.select();
      document.execCommand("copy");
      this.isCopied = true;
    },
    getComponentInformations() {
      return axios
        .get(
          `/api/github/${this.$store.getters.active_repo.owner}/${
            this.$store.getters.active_repo.name
          }/${this.$store.getters.active_category}/${
            this.$route.params.slug
          }/component/${this.$store.getters.access_token}`
        )
        .then(res => {
          this.files = JSON.parse(res.data);
          this.getComponentFilesContent();
        });
    },
    deleteComponent() {
      this.files.forEach(file => {
        axios({
          method: "delete",
          url: `https://api.github.com/repos/${
            this.$store.getters.active_repo.owner
          }/${this.$store.getters.active_repo.name}/contents/${
            this.$store.getters.active_category
          }/${this.$route.params.slug}/${file.name}?access_token=${
            this.$store.getters.access_token
          }`,
          data: {
            message: `:octopus: Accio delete : ` + this.$route.params.slug,
            sha: file.sha
          },
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }).then(res => {
          axios({
            method: "delete",
            url: `https://api.github.com/repos/${
              this.$store.getters.active_repo.owner
            }/${this.$store.getters.active_repo.name}/contents/${
              this.$store.getters.active_category
            }/${this.$route.params.slug}/${this.configFile.name}?access_token=${
              this.$store.getters.access_token
            }`,
            data: {
              message: `:octopus: Accio delete : ` + this.$route.params.slug,
              sha: this.configFile.sha
            },
            headers: {
              "Content-Type": "multipart/form-data"
            }
          }).then(res => {
            alert("Component deleted");
            this.$nuxt.$router.replace({
              path: `/repos/${this.$store.getters.active_repo.name}/${
                this.$store.getters.active_category
              }`
            });
          });
        });
      });
    },
    displayInputs() {
      if (!this.editMode) {
        this.editMode = true;
        this.preventEnterKey();
      } else {
        this.editMode = false;
      }
    },
    addTag() {
      var newTagInput = document.querySelector("#newTag");
      var newTag = newTagInput.value;
      if (this.isEmpty(newTagInput.value)) {
        return;
      }
      if (this.configFile.content.tags.indexOf(newTag) > -1) {
        alert("This tag already exist !");
      } else {
        newTagInput.value = "";
        this.configFile.content.tags.push(newTag);
      }
    },
    preventEnterKey() {
      var _this = this;
      setTimeout(() => {
        document.getElementById("newTag").onkeypress = function(e) {
          var key = e.charCode || e.keyCode || 0;
          if (key == 13) {
            e.preventDefault();
            _this.addTag();
          }
        };
      }, 500);
    },
    deleteTag(tag) {
      var tags = this.configFile.content.tags;
      var index = tags.indexOf(tag);
      if (index > -1) {
        tags.splice(index, 1);
      }
    },
    saveConfigFile() {
      let configJson = {
        devTime: {
          days: this.$refs.form.devTimeDays.value,
          hours: this.$refs.form.devTimeHours.value
        },
        pricing: this.$refs.form.pricing.value,
        difficulty: this.$refs.form.difficulty.value,
        description: this.$refs.form.description.value,
        tags: this.configFile.content.tags
      };
      axios
        .put(
          `https://api.github.com/repos/${
            this.$store.getters.active_repo.owner
          }/${this.$store.getters.active_repo.name}/contents/${
            this.$store.getters.active_category
          }/${this.$route.params.slug}/config.json?access_token=${
            this.$store.getters.access_token
          }`,
          {
            message: `:octopus: Accio :tophat: • ${Date.now()}`,
            content: btoa(JSON.stringify(configJson)),
            sha: this.configFile.sha
          }
        )
        .then(res => {
          this.configFile.content = configJson;
          this.editMode = false;
          this.configFile.sha = res.data.content.sha;
          alert("Updated !!");
        });
    },
    getComponentFilesContent() {
      for (let file in this.files) {
        axios
          .get(
            `/api/github/${this.$store.getters.active_repo.owner}/${
              this.$store.getters.active_repo.name
            }/${this.$store.getters.active_category}/${
              this.$route.params.slug
            }+${this.files[file].name}/component/${
              this.$store.getters.access_token
            }`
          )
          .then(res => {
            console.log(JSON.parse(res.data));
            if (JSON.parse(res.data).name === "config.json") {
              this.configFile = JSON.parse(res.data);
              this.configFile.content = JSON.parse(
                atob(this.configFile.content)
              );
            } else if (JSON.parse(res.data).name.includes("preview")) {
              this.preview = JSON.parse(res.data);
              this.previewUrl = `https://github.com/${
                this.$store.getters.active_repo.owner
              }/${this.$store.getters.active_repo.name}//blob/master/${
                this.$store.getters.active_category
              }/${this.$route.params.slug}/${this.preview.name}?raw=true`;
            } else {
              this.files = this.files.filter(function(file) {
                return (
                  file.name !== "config.json" && !file.name.includes("preview")
                );
              });
              this.files.forEach(file => {
                if (file.name === JSON.parse(res.data).name) {
                  file.content = atob(JSON.parse(res.data).content);
                }
              });
            }
          });
      }
    }
  }
};
</script>

<style scoped>
@keyframes view-left {
  0% {
    opacity: 0;
    transform: translate(100px, 0);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0);
  }
}
.view-left {
  animation: view-left 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  animation-fill-mode: forwards;
}
.component {
  width: calc(100% - 301px);
  min-height: 100vh;
  margin-left: 301px;
  padding-left: 30px;
  padding-right: 30px;
  background-color: #fbfbfd;
  padding-bottom: 100px;
}
.row {
  display: block;
  width: 100%;
}
form {
  justify-content: space-between;
}
.left-col {
  width: 70%;
}
.right-col {
  margin-left: 2rem;
  width: 30%;
  margin-top: 22px;
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
.editInfos {
  color: #2978ee;
  text-decoration: none;
}
.infos-section {
  margin-top: 40px;
}
.infos-wrapper {
  margin-top: 22px;
  align-items: center;
}
.editBtn {
  float: right;
  border: none;
  background: none;
  color: #2978ee;
  font-size: 14px;
  outline: none;
}
.deleteComponentBtn {
  float: right;
  border: none;
  font-size: 14px;
  outline: none;
  background: none;
  color: #f43922;
}
.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  text-align: center;
  background: white;
  border: 1px solid #dddbfb;
  padding: 32px 25px;
}
.inline-input input {
  justify-content: center;
  max-width: 43px;
}
.inline-input input:last-child {
  margin-left: 5px;
}
.info:nth-child(even) {
  border-right: 0;
  border-left: 0;
}
.info:nth-child(4) {
  border-right: 1px solid #dddbfb;
}
.info button {
  margin-top: 20px;
  display: block;
  width: 100%;
  background: #574beb;
  padding: 10px;
  color: white;
  text-align: center;
  border: none;
  border-radius: 3px;
}
.info input {
  display: block;
}
.componentInfo input {
  height: 34px;
  width: 60px;
  padding-left: 10px;
  border-radius: 3px;
  border: 1px solid #dedede;
}
.info input:focus {
  outline: none;
}
.info span {
  color: #574beb;
  font-size: 21px;
}
.info label {
  color: #808080;
  display: block;
  margin-top: 18px;
}
textarea {
  width: 100%;
  resize: none;
  border: 1px solid #dedede;
  padding: 10px;
  border-radius: 3px;
  box-sizing: border-box;
  font-size: 14px;
  outline: none;
  height: 300px;
}
.difficulty {
  padding: 20px;
  height: 129px;
  align-items: flex-start;
  justify-content: flex-start;
}
.difficulty .listDifficulty {
  margin-top: 30px;
  width: 100%;
}
.listDifficulty div {
  position: relative;
}
.difficulty .listDifficulty label {
  color: black;
  top: 10px;
  font-size: 12px;
  position: absolute;
  left: 50%;
  width: max-content;
  transform: translateX(-50%);
}
.difficulty input {
  height: 10px;
  width: 42px;
  background: #dfe3e8;
  -webkit-appearance: none;
  transition: all 0.2s ease;
  cursor: not-allowed;
}
.difficulty input:not(:disabled) {
  cursor: pointer;
}
.difficulty input:focus {
  outline: none;
}
.difficulty input:checked:before {
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
.difficulty #veryEasy:checked {
  background-color: #66e27e;
}
.difficulty #veryEasy:checked:before {
  border-top: solid 5px #66e27e;
}
.difficulty #easy:checked {
  background-color: #1eb663;
}
.difficulty #easy:checked:before {
  border-top: solid 5px #1eb663;
}
.difficulty #medium:checked {
  background-color: #f47922;
}
.difficulty #medium:checked:before {
  border-top: solid 5px #f47922;
}
.difficulty #hard:checked {
  background-color: #f43922;
}
.difficulty #hard:checked:before {
  border-top: solid 5px #f43922;
}
.difficulty #insane:checked {
  background-color: #6d0c00;
}
.difficulty #insane:checked:before {
  border-top: solid 5px #6d0c00;
}
.copy .label {
  display: inline-block;
  position: relative;
  left: -10px;
  margin: 0;
}
.preview-tag-wrapper .tab {
  margin-top: 71px;
}
.tags {
  display: block;
}
.preview {
  width: 100%;
}
.tags {
  padding: 0;
}
.addTagLink {
  cursor: pointer;
  color: #574beb;
}
.tags-wrapper {
  background: white;
  border: 1px solid #dddbfb;
  margin-top: 72px;
  padding: 25px 15px;
}
.tags-wrapper p {
  margin: 0;
  color: #574beb;
}
.tags-wrapper input {
  width: 100%;
  padding: 10px;
  border: 1px solid #dedede;
  border-radius: 3px;
  background: white;
  box-sizing: border-box;
  margin-top: 25px;
}
.tag {
  background: #574beb;
  color: white;
  border-radius: 3px;
  width: auto;
  display: inline-block;
  padding: 10px;
  margin: 5px;
}
.saveBtn {
  background: white;
  border: 1px solid #574beb;
  color: #574beb;
  margin-top: 50px;
  border-radius: 3px;
  padding: 10px;
  width: 100%;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.saveBtn:hover {
  background-color: #574beb;
  color: white;
}
ul {
  display: flex;
  justify-content: space-between;
}
li {
  list-style-type: none;
}
pre {
  text-align: left;
}

.tab {
  overflow: hidden;
  border: 1px solid #e3e7eb;
}

/* Style the buttons that are used to open the tab content */
.tablinks {
  float: left;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 14px 16px;
  transition: 0.3s;
  color: #574beb;
  border: 1px solid #574beb;
}
.code-wrapper {
  position: relative;
}
.copy {
  color: #574beb;
  position: absolute;
  z-index: 9;
  right: 20px;
  top: 20px;
}

/* Change background color of buttons on hover */
.tablinks:hover {
  color: white;
  background-color: #574beb;
}

/* Create an active/current tablink class */
.tablinks.active {
  color: white;
  background-color: #574beb;
}

/* Style the tab content */
.tabcontent {
  padding: 6px 12px;
  border: 1px solid #e3e7eb;
  border-top: none;
  overflow-x: scroll;
}
.tabcontent:not(.active) {
  display: none;
}

@media screen and (max-width: 1200px) {
  form.flex {
    flex-direction: column;
  }
  .right-col {
    margin-left: 0;
    width: 80%;
  }
  .tags-wrapper {
    margin-top: 20px;
  }
  .left-col {
    width: 80%;
  }
  .left-col > div {
    flex-direction: column;
  }
}
</style>

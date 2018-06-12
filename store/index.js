import Vuex from "vuex";
import Axios from "axios";

const axios = require("axios");

// const host = process.env.HOST
// const port = process.env.PORT


console.log('HOST PORT')
console.log([process.env.port, process.env.host])
const createStore = () => {
  return new Vuex.Store({
    state: {
      access_token: null,
      user: {
        informations: null,
        repos: null
      },
      activeCategory: null,
      activeRepoCategories: null,
      activeRepo: null,
      authUser: null,
      slug: null,
      components: [],
    },
    getters: {
      access_token(state) {
        return state.access_token;
      },
      user(state) {
        return state.user;
      },
      active_repo(state) {
        return state.active_repo;
      },
      active_category(state) {
        return state.activeCategory;
      },
      slug(state) {
        return state.slug;
      },
      components(state) {
        return state.components;
      },
      active_repo_categories(state) {
        return state.active_repo_categories;
      }
    },
    mutations: {
      SET_ACCESSTOKEN(state, access_token) {
        state.access_token = access_token;
      },
      SET_USERINFORMATIONS(state, informations) {
        state.user.informations = informations;
      },
      SET_USERREPOS(state, repos) {
        state.user.repos = repos;
      },
      SET_ACTIVEREPO(state, activeRepo) {
        state.active_repo = activeRepo;
      },
      SET_ACTIVECATEGORY(state, cat) {
        state.activeCategory = cat;
      },
      DELETE_COMPONENTS(state) {
        state.components.length = 0;
      },
      SET_COMPONENTCONTENT(state, data) {
        state.components.push(data);
      },
      SET_USER: function(state, user) {
        state.authUser = user;
      },
      SET_SLUG: function(state, slug) {
        state.slug = slug;
      },
      SET_ACTIVEREPOCATEGORIES: function(state, data) {
        state.active_repo_categories = data;
      }
    },
    actions: {
      nuxtServerInit({ commit }, { req }) {

        console.log(req.session)

        let user = {};
        if (req.session && req.session.authUser) {
          user.username = req.session.authUser.username;
          user.access_token = req.session.authUser.access_token;
        } else {
          user.username = "";
          user.access_token = "";
        }
        if (req.session && req.session.activeRepo){
          commit("SET_ACTIVEREPO", req.session.activeRepo);
        }
        if (req.session && req.session.activeCategory){
          commit("SET_ACTIVECATEGORY", req.session.activeCategory);
        }
        return axios
          .post(`${process.env.host}:${process.env.port}/api/login`, {
            user
          })
          .then(res => {
            if (req.session.authUser) {
              commit("SET_USER", "logged");
              return axios
                .get(
                  `${process.env.host}:${process.env.port}/api/github/user/${
                    req.session.authUser.access_token
                  }`
                )
                .then(res => {
                  commit("SET_USERINFORMATIONS", res.data);
                  commit("SET_ACCESSTOKEN", req.session.authUser.access_token);
                })
                .catch(error => {
                  console.log(error.response);
                });
            }
          });
      },
      setAccessToken({ commit }, access_token) {
        commit("SET_ACCESSTOKEN", access_token);
      },
      setUserInformations({ commit }, informations) {
        commit("SET_USERINFORMATIONS", informations);
      },
      setUserRepos({ commit }, repos) {
        commit("SET_USERREPOS", repos);
      },
      setActiveRepo({ commit }, activeRepo) {
        commit("SET_ACTIVEREPO", activeRepo);
      },
      setActiveCategory({ commit }, cat) {
        commit("SET_ACTIVECATEGORY", cat);
      },
      setSlug({ commit }, slug) {
        commit("SET_SLUG", slug);
      },
      setComponentContent({ commit }, data) {
        commit("SET_COMPONENTCONTENT", data);
      },
      setUserAuth({ commit }, data) {
        commit("SET_USER", data);
      },
      deleteComponents({commit}) {
        commit("DELETE_COMPONENTS");
      },
      setActiveRepoCategories({ commit }, data) {
        commit("SET_ACTIVEREPOCATEGORIES", data);
      }
    }
  });
};

export default createStore;
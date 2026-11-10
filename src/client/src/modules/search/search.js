import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '../common/store';
import Search from '../search/Search.vue';

import { getUserScopes } from "../common/utils";

import { abilitiesPlugin } from '@casl/vue';
import defineAbilityFor from '../common/abilities';
import VueClipboard from "vue-clipboard2";

let abilities = defineAbilityFor(getUserScopes());

Vue.use(abilitiesPlugin, abilities);

Vue.use(VueRouter);
Vue.use(VueClipboard);


const router = new VueRouter({
    mode: 'history',
    routes: [
        {path: '/search', component: Search}
    ]
});

new Vue({
    el: '#spa-search',
    router,
    store,
    render: h => h(Search)
});
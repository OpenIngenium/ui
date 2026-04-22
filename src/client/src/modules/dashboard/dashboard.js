import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '../common/store';
import Dashboard from '../dashboard/Dashboard.vue';

import { getUserScopes } from "../common/utils";

import { abilitiesPlugin } from '@casl/vue';
import defineAbilityFor from '../common/abilities';

let abilities = defineAbilityFor(getUserScopes());

Vue.use(abilitiesPlugin, abilities);

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        {path: '/', component: Dashboard}
    ]
});

new Vue({
    el: '#spa-dashboard',
    router,
    store,
    render: h => h(Dashboard)
});



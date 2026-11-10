import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '../common/store';
import Reporting from '../reporting/Reporting.vue';

import { getUserScopes } from "../common/utils";

import { abilitiesPlugin } from '@casl/vue';
import defineAbilityFor from '../common/abilities';

let abilities = defineAbilityFor(getUserScopes());

Vue.use(abilitiesPlugin, abilities);

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        {path: '/reporting', component: Reporting}
    ]
});

new Vue({
    el: '#spa-reporting',
    router,
    store,
    render: h => h(Reporting)
});



import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '../common/store';

import { getUserScopes } from "../common/utils";
import { abilitiesPlugin } from '@casl/vue';
import defineAbilityFor from '../common/abilities';

import Executions from "./Executions.vue";

let abilities = defineAbilityFor(getUserScopes());
Vue.use(abilitiesPlugin, abilities);
Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        {path: '/test', component: Executions}
    ]
});

new Vue({
    el: '#spa-test-page',
    router,
    store,
    render: h => h(Executions)
});


import Vue from 'vue';
import VueRouter from 'vue-router';
import store from '../common/store';
import VenueDetailPage from './VenueDetailPage.vue';

import { getUserScopes } from "../common/utils";
import { abilitiesPlugin } from '@casl/vue';
import defineAbilityFor from '../common/abilities';

Vue.use(abilitiesPlugin, defineAbilityFor(getUserScopes()));
Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        {path: '/venues/:venueId/', component: VenueDetailPage}
    ]
});

new Vue({
    el: '#spa-venue-detail',
    router,
    store,
    render: h => h(VenueDetailPage)
});

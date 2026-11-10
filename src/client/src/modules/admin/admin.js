import Vue from 'vue';
import VueRouter from 'vue-router';
import AdminRouter from './AdminRouter.vue';
import store from '../common/store';

import AdminVenueGroups from './venue-groups/AdminVenueGroups.vue';
import AdminVenues from './venues/AdminVenues.vue';
import AdminGroups from './permissions/AdminGroups.vue';
import AdminUsers from './permissions/AdminUsers.vue';
import AdminRoles from './permissions/AdminRoles.vue';
import AdminPersonalPreferences from './preferences/AdminPersonalPreferences.vue';
import AdminProcedureLabels from './procedureLabels/AdminProcedureLabels.vue';

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/admin',
            component: AdminVenues
        },
        {
            path: '/admin/venue_groups',
            component: AdminVenueGroups
        },
        {
            path: '/admin/venues',
            component: AdminVenues
        },
        {
            path: '/admin/procedurelabels',
            component: AdminProcedureLabels
        },
        {
            path: '/admin/permissions/groups',
            component: AdminGroups
        },
        {
            path: '/admin/permissions/users',
            component: AdminUsers
        },
        {
            path: '/admin/permissions/roles',
            component: AdminRoles
        },
        {
            path: '/admin/preferences/personal',
            component: AdminPersonalPreferences
        }
    ]
});

new Vue({
    el: '#spa-admin',
    router,
    store,
    render: h => h(AdminRouter)
});
import Vue from 'vue';
import VueRouter from 'vue-router';
import Header from '../header/Header.vue';
import store from '../common/store';

Vue.use(VueRouter);

const router = new VueRouter({
    mode: 'history',
    routes: []
});

new Vue({
    el: '.up-header',
    router,
    store,
    render: h => h(Header)
});

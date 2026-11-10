<template>
    <div class="row">
        <div class="right-toolbar">
            <div class="btn-group btn-group-toggle" data-toggle="buttons">
                <button
                    v-on:click="changeType('cmds')"
                    type="button"
                    :class="'btn btn-default ' + displayActive('cmds')"
                > CMD</button>
                <button
                    v-on:click="changeType('evrs')"
                    type="button"
                    :class="'btn btn-default ' + displayActive('evrs')"
                > EVR</button>
                <button
                    v-on:click="changeType('ehas')"
                    type="button"
                    :class="'btn btn-default ' + displayActive('ehas')"
                > EHA</button>
                <button
                    v-on:click="changeType('mil1553')"
                    type="button"
                    :class="'btn btn-default ' + displayActive('mil1553')"
                > 1553</button>
            </div>
        </div>
        <h4><i class="glyphicon glyphicon-book"></i> Project Configuration &raquo; <router-link :to="{ path: '/project_configuration/sse' }">SSE Dictionary</router-link> &raquo; {{ this.version }}</h4> 

        <div class="types_container">
            <router-view></router-view>
        </div>
    </div>
</template>


<script>
    import IngTable from "../../common/IngTable.vue";

    import { mapActions, mapGetters } from "vuex";

    export default {
        name: 'SseDictionaryVersion',
        components: {
            IngTable,
        },
        computed: {
            ...mapGetters([
                "sse"
            ]),
            versionType() { return this.type; }
        },
        created: function() {
            this.fetchSseDicts({
                dictionaryVersion: this.version,
                limit: 1
            }).then(() => {
                this.componentLoaded = true;
            });
        },
        methods: {
            ...mapActions([
                "fetchSseDicts"
            ]),
            changeType: function(type) {
                this.$router.push({ path: `/project_configuration/sse/${ this.version }/${ type }`});
            },
            displayActive: function(type) {
                return type == this.versionType ? "active": "";
            }
        },
        data() {
            return {
                version: this.$route.params.version,
                // TODO make this default to populated types on landing
                type: this.$route.params.type,
                componentLoaded: false
            };
        }
    };
</script>

<style lang="scss" scoped>
    .right-toolbar{
        float:right;
        padding-bottom:5px;
    }
    .types_container{
        padding:15px;
    }
</style>

<template>
   <div id="admin-spa">
       <div class="container">
            <div class="row">
                <sidebar></sidebar>
                <div class="col-sm-9 col-sm-10">
                    <h2>
                        <span class="glyphicon glyphicon-user"></span>
                        Personal Preferences
                    </h2>
                    <div style="margin-top: 30px;">
                        Debug Mode: 
                        <ing-toggle
                            :value="debugEnabled"
                            :clickHandler="onClickDebugMode"
                            sizeClass="btn-sm"
                        >
                        </ing-toggle>
                    </div>
                </div>
            </div>
       </div>
   </div> 
</template>

<script>
    import Sidebar from '../Sidebar.vue';
    import IngToggle from "../../common/IngToggle.vue";
    import { mapActions, mapGetters } from 'vuex';

    export default {
        name: "AdminUsers",
        components: {
            'sidebar': Sidebar,
            'ing-toggle': IngToggle,
        },
        data() {
            return {
            };
        },
        mounted() {
            this.loadDebugEnabled();
        },
        computed: {
            ...mapGetters([
                "debugEnabled"
            ])
        },
        methods: {
            ...mapActions([
                "loadDebugEnabled",
                "setDebugEnabled"
            ]),
            onClickDebugMode: function() {
                this.setDebugEnabled(!this.debugEnabled);
            }
        }
    };
</script>

<style scoped>

</style>

<template>
    <div>
        <!-- this modal remains hidden until it's activated -->
        <ing-modal v-if="visible" @close="setVisible(false)">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">{{ evr.evr_name }}</h4>
            </template>
            <template slot="body">
                <div class="row">
                    <div class="col-xs-12">
                        <p>
                            <b>EVR Id</b><br> {{ evr.evr_id }}
                            <br><br><b>Level</b><br> {{ evr.evr_level }}
                            <br><br><b>Operations Category</b><br > {{ evr.operations_category }}
                            <br><br><b>Description</b><br > {{ evr.evr_description }}
                            <br><br><b>Message</b><br >{{ evr.evr_message }}
                        </p>
                    </div>
                </div>
            </template>
            <template slot="footer">
                <button
                    type="button"
                    class="btn btn-default pull-left"
                    @click="setVisible(false)">
                    Close
                </button>
            </template>
        </ing-modal>
        <button 
            class="btn btn-default"
            @click="setVisible(true)">
            Details</button>
    </div>
</template>

<script>
    import IngTable from "../../common/IngTable.vue";
    import IngModal from "../../common/IngModal.vue";

    import { mapActions, mapGetters } from "vuex";

    export default {
        name: 'EvrDetails',
        components: {
            IngTable,
            IngModal
        },
        computed: {
            ...mapGetters([
                "details"
            ]),
            evr() {
                let details = this.details({
                    dict_type: this.$route.path.split("/")[2],
                    version: this.$route.path.split("/")[3],
                    type: "evrs",
                    id: this.data.evr_name
                });
                return details !== undefined ? details : {};
            }
        },
        props: {
            data: {
                type: Object,
                required: true
            }
        },
        created: function() { },
        methods: {
            ...mapActions([
                "fetchDictItem"
            ]),
            setVisible(visible) {
                this.visible = visible;
                if (visible) {
                    this.fetchDictItem({
                        dict_type: this.$route.path.split("/")[2],
                        version: this.$route.path.split("/")[3],
                        type: "evrs", 
                        options: { limit: 1 },
                        id: this.data.evr_name
                    }).then(() => {
                        this.componentLoaded = true;
                    });

                }
            }
        },
        data() {
            return {
                visible: false,
                componentLoaded: false
            };
        }
    };
</script>

<style lang="scss" scoped>

</style>

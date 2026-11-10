<template>
    <div>
        <!-- this modal remains hidden until it's activated -->
        <ing-modal v-if="visible" @close="setVisible(false)">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">{{ eha.channel_name }}</h4>
            </template>
            <template slot="body">
                <div class="row">
                    <div class="col-xs-12">
                        <p>
                            <b>Channel ID</b><br> {{ eha.channel_id }}
                            <br><br><b>Derived</b><br> {{ eha.derived }}
                            <br><br><b>Operations Category</b><br > {{ eha.operations_category }}
                            <br><br><b>Description</b><br > {{ eha.description }}
                            <br><br><b>EHA Type</b><br> {{ eha.type }}
                            <br><br><b>EU Present</b><br> {{ eha.eu_present }}
                            <br><br><b>EHA Bit Size</b><br> {{ eha.bit_size }}
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
        name: 'EhaDetails',
        components: {
            IngTable,
            IngModal
        },
        computed: {
            ...mapGetters([
                "details"
            ]),
            eha() {
                let details = this.details({
                    dict_type: this.$route.path.split("/")[2],
                    version: this.$route.path.split("/")[3],
                    type: "ehas",
                    id: this.data.channel_name
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
                        type: "ehas",
                        options: { limit: 1 },
                        id: this.data.channel_name
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

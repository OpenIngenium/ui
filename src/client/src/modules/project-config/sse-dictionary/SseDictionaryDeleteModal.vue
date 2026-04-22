<template>
    <div>
        <ing-modal v-if="showModal" @close="showModal = false">
            <!-- Title -->
            <template slot="title">
                <h4 :style="{fontWeight: 'bold', display: 'inline-block'}">
                    <span class="glyphicon glyphicon-trash"></span>
                    Delete Version
                </h4>
            </template>

            <!-- Body -->
            <template slot="body">
                <div class="row" :style="{border: '1px solid red', borderColor: 'orangered', backgroundColor: '#efcecd', padding: '5px 0px 5px 0px'}">
                    <div class="col-xs-12">Are you sure you want to delete {{version}}</div>
                </div>
            </template>

            <!-- Footer -->
            <template slot="footer">
                <button type="button"
                        class="btn btn-default pull-left"
                        @click="showModal = false">
                    Cancel
                </button>
                <button
                    type="button"
                    class="btn btn-danger pull-right"
                    @click="handleDelete()">
                    Delete
                </button>
            </template>
        </ing-modal>
        <button
            :disabled="!$can('delete', 'Configuration_Management')"
            type="button"
            class="btn btn-light"
            @click="showModal = true">
            <i class="glyphicon glyphicon-trash"></i>
        </button>
    </div>
</template>

<script>
    import IngModal from "../../common/IngModal.vue";
    import { mapActions } from "vuex";

    export default {
        name: "SseDictionaryDeleteModal",
        components: {
            "ing-modal": IngModal,
        },
        props: {
            data: {
                type: Object,
                required: true
            }
        },
        data() {
            return {
                showModal: false,
            };
        },
        computed: {
            version: function() {
                return this.data.dictionary_version;
            }
        },
        methods: {
            ...mapActions([
                "deleteSseDict"
            ]),
            handleDelete() {
                this.deleteSseDict({version: this.version});
                this.showModal = false;
            }
        }
    };
</script>

<style>
    .btn{
        color:black;
    }
</style>

<template>
    <div>
        <ing-modal v-show="showDelete" @close="close()" size="medium">
            <template slot="title">
                <span id="modal-title">
                    <i class="glyphicon glyphicon-tags"></i>
                    &nbsp;Confirm Delete
                </span>
            </template>
            <template slot="body">
                <p>Are you sure you wanted to delete this save rule?</p>
            </template>
            <template slot="footer">
                <button type="button"
                        class="btn btn-default pull-left"
                        @click="close()">
                    Cancel
                </button>
                <button type="button"
                        class="btn btn-danger"
                        @click="handleDelete()">
                    Delete
                </button>
            </template>
        </ing-modal>
        <button
            class="btn btn-link btn-sm"
            @click="handleSelectRule()">
            <i class="glyphicon glyphicon-check"> Select</i>
        </button>
        <button
            class="btn btn-link btn-sm"
            v-clipboard:copy="getSearchURL">
            <i class="glyphicon glyphicon-copy"> Copy URL</i>
        </button>
        <button
            class="btn btn-link btn-sm"
            @click="handleDeleteConfirm()">
            <i class="glyphicon glyphicon-trash"> Delete</i>
        </button>
    </div>
</template>

<script>
    import IngModal from '../common/IngModal.vue';

    export default {
        name: "ActionButtons",
        components:{
            'ing-modal':IngModal
        },
        props: {
            data: {
                type: Object,
                required: true
            },
        },
        data() {
            return {
                showDelete: false
            };
        },
        computed:{
            getSearchURL:function() {
                const currentURL = window.location.href;
                const queryParam = `id=${this.data.id}`;
                return `${currentURL.split('?')[0]}?${queryParam}`;
            }
        },
        methods: {
            handleDelete: function() {
                this.showDelete = false;
                return this.$emit('tableEvent', {
                    event: 'delete',
                    data: this.data
                });
            },
            handleSelectRule: function() {
                return this.$emit('tableEvent', {
                    event: 'select',
                    data: this.data
                });
            },
            handleDeleteConfirm: function() {
                this.showDelete = true;
            },
            close: function() {
                this.showDelete = false;
            }
        },
    };
</script>

<style scoped></style>

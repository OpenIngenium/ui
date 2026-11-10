<template>
    <div>
        <ing-modal v-if="showDelete" @close="close()" size="medium">
            <template slot="title">
                <span id="modal-title">
                    <i class="glyphicon glyphicon-tags"></i>
                    &nbsp;Confirm Delete
                </span>
            </template>
            <template slot="body">
                <p>Are you sure you wanted to delete this tag?</p>
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
            @click="handleDeleteConfirm()">
            <i class="glyphicon glyphicon-trash"></i>
        </button>
        <button
            class="btn btn-link btn-sm"
            @click="handleEdit()">
            <i class="glyphicon glyphicon-edit"></i>
        </button>
    </div>
</template>

<script>
    import IngModal from '../common/IngModal.vue';

    export default {
        name: "DeleteTagButton",
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
        methods: {
            handleDelete: function() {
                this.showDelete = false;
                return this.$emit('tableEvent', {
                    event: 'delete',
                    data: this.data
                });
            },
            handleEdit: function() {
                return this.$emit('tableEvent', {
                    event: 'edit',
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

<template>
    <ing-modal v-if="showModal" @close="close()">
        <template slot="title">
            <h4 id="modal-title">
                Add New Procedure
            </h4>
        </template>
        <template slot="body">
            <div class="form-group">
                <label for="title">
                    Title
                    <span :style="{color: 'orangered'}">*</span>
                </label>
                <input id="title" class="form-control" v-model.lazy="title">
            </div>
            <div class="form-group">
                <label for="institutional-id">
                    Institutional ID
                </label>
                <input id="institutional-id" class="form-control" v-model.lazy="institutionalId">
            </div>
            <div class="form-group">
                <label for="description">
                    Description
                </label>
                <input id="description" class="form-control" v-model.lazy="description">
            </div>
        </template>
        <template slot="footer">
            <button type="button"
                    class="btn btn-default pull-left"
                    @click="close()">
                Cancel
            </button>
            <button
                type="button"
                class="btn btn-primary pull-right"
                @click="submit()">
                Submit
            </button>
        </template>
    </ing-modal>
</template>
<script>
    import IngModal from "../common/IngModal.vue";
    import { mapActions } from 'vuex';

    export default {
        name: "ProceduresAddModal",
        components: {
            'ing-modal': IngModal,
        },
        data() {
            return {
                title: '',
                institutionalId: '',
                description: '',
                showError: false,
            };
        },
        props: {
            showModal: {
                type: Boolean,
                required: true,
                default: false,
            },
        },
        methods: {
            ...mapActions([
                'createProcedure',
            ]),
            resetFields: function() {
                this.title = '';
                this.institutionalId = '';
                this.description = '';
            },
            close: function() {
                this.resetFields();
                this.$emit('close');
            },
            submit: function() {
                if (this.title.trim() === '') {
                    this.showError = true;
                }
                else {
                    const resp = this.createProcedure({
                        title: this.title,
                        institutionalId: this.institutionalId,
                        description: this.description,
                    });
                    
                    if (resp) {
                        this.$emit('created-procedure');
                        this.close();
                    }
                    else {
                        this.showError = true;
                    }
                }
            },
        },
    };
</script>
<style lang="scss" scoped>
    #modal-title {
        font-weight: bold;
        display: inline-block;
    }
</style>

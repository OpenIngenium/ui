<template>
    <ing-modal v-show="showModal" @close="close()">
        <template slot="title">
            <h4 id="modal-title">
                Save Search Rule
            </h4>
        </template>
        <template slot="body">
            <div class="form-group">
                <label for="name">
                    Name 
                    <span :style="{color: 'orangered'}">*</span>
                </label>
                <input id="name" class="form-control" v-model.trim="name">
            </div>
            <div class="form-group">
                <label for="description">
                    Description
                </label>
                <input id="description" class="form-control" v-model.trim="description">
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
                :disabled="disableSubmit"
                @click="submit()">
                Submit
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import IngModal from "../common/IngModal.vue";
    

    export default {
        name: "SaveRuleModal",
        components: {
            'ing-modal': IngModal,
        },
        data() {
            return {
                name: '',
                description: ''
            };
        },
        props: {
            showModal: {
                type: Boolean,
                required: true,
                default: false,
            },
        },
        computed:{
            disableSubmit: function() {
                return this.name == '' ? true : false;
            }
        },
        methods: {
            resetFields: function() {
                this.name = '';
                this.description = '';
            },
            close: function() {
                this.resetFields();
                this.$emit('close');
            },
            submit: function() {
                this.$emit('save', {name: this.name, description: this.description});
                this.resetFields();
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

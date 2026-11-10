<template>
    <ing-modal v-if="show" @close="close" size="medium">
        <template slot="title">
            <h4 :style="{fontWeight: 'bold', display: 'inline-block'}">
                {{ title }}
            </h4>
        </template>
        <template slot="body">
            <p>
                Report ID: {{ reportId }}<br>
                <span v-if="message">{{ message }}<br></span>
                The report will be sent to you via email once ready.<br>
            </p>
        </template>
        <template slot="footer">
            <button type="button"
                    class="btn btn-default pull-right"
                    @click="close">
                Confirm
            </button>
        </template>
    </ing-modal>
</template>

<script>
    import IngModal from "./IngModal.vue";

    export default {
        name: "ReportSubmittedModal",
        components: {
            'ing-modal': IngModal
        },
        props: {
            show: {
                type: Boolean,
                required: true,
                default: false
            },
            reportId: {
                type: [String, Number],
                default: ''
            },
            message: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                default: 'Report Request Accepted'
            }
        },
        methods: {
            close: function() {
                this.$emit('close');
            }
        }
    };
</script>

<style scoped>
</style>

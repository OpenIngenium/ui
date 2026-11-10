<template>
    <div style="display: flex;">
        <div class="col-xs-3 select-option">
            Labels:
            <select 
                @change="handleAddLabel"
                class="form-control input-sm" 
                style="margin-left:5px">
                <option 
                    v-for="({label_id, name}) in filteredAvailableLabels"
                    :key="label_id"
                    :value="label_id">
                    {{ name | truncate(64)}}
                </option>
            </select>
        </div>
        <div class="col-xs-9">
            <div class="inline-label">
                <procedure-label
                    v-for="label in labels"
                    :key="label.label_id"
                    v-on:deleteLabel="handleDeleteLabel"
                    :data="label">
                </procedure-label>
            </div>
        </div>
    </div>   
</template>

<script>
    import { mapGetters } from "vuex";
    import ProcedureLabel from './ProcedureLabel.vue';
    import {truncate} from "../common/filters";

    export default {
        name: "ProcedureLabelInline",
        components: {
            'procedure-label': ProcedureLabel
        },
        props: {
            availableLabels: {
                type: Array,
                required: true
            },
            labels: {
                type: Array,
                required: true
            },
        },
        filters: {
            truncate: truncate
        },
        computed: {
            ...mapGetters([

            ]),
            filteredAvailableLabels: function() {
                const labelIds = this.labels.map(label => label.label_id) || [];
                return this.availableLabels.filter(label => !labelIds.includes(label.label_id));
            },
        },
        methods: {
            handleAddLabel: function(e) {
                this.$emit('addLabel', e);
            },
            handleDeleteLabel: function(e) {
                this.$emit('deleteLabel', e);
            }
        }
    };

</script>

<style>
    .inline-label {
        margin-top: 0px;
        margin-bottom: 5px;
        display: flex; 
        flex-wrap: wrap; 
        gap: 3px;
    }

    .select-option {
        display: flex; 
        align-items: center; 
        min-width: 200px; 
        max-width: 200px; 
        padding-right: 0px;
    }

</style>

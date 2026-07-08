<template>
    <div>
        <i 
            style="cursor: pointer"
            @click="show = !show" 
            :class="showChevron"></i> 
        [{{ this.changedItem.change_type }}] {{ this.changedItem.item_type }}: {{ this.changedItem.item_name }}
        <div v-if="show" class="validateChildrenFields">
            <div v-if="this.changedItem.item_id">
                SCRIPT ID: {{ this.changedItem.item_id }}
            </div>
            <div 
                class="validateChildrenField"
                v-for="(changed_field, idx) in this.changedItem.changed_fields"
                :key="idx">
                Field: {{ changed_field.field_name }}<br>
                WAS: {{ changed_field.previous_value }}<br>
                IS: {{ changed_field.new_value }}
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: "ValidateCardField",
        data() {
            return {
                show: true
            };
        },
        props: {
            changedItem: {
                type: Object,
                required: true
            }
        },
        computed: {
            showChevron: function() {
                return this.show ? "glyphicon glyphicon-triangle-bottom" : "glyphicon glyphicon-triangle-right";
            },
        }
    };

</script>

<style lang="scss" scoped>

    .validateChildrenFields {
        margin-left: 15px;
        margin-top: 5px;
    }

    .validateChildrenField {
        margin-left: 5px;
        margin-bottom: 5px;
    }

</style>

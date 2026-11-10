<template>
    <div>
        <template v-if="editing && !disabled">
            <div class="editable-container">
                <div style="margin-bottom: 0;">
                    <div class="control-group form-group">
                        <div class="editable-input">
                            <input
                                class="form-control input-sm"
                                size="75"
                                ref="editableValue"
                                style="padding-right: 24px;"
                                type="text"
                                @change="confirm"
                                :value="value">
                        </div>
                    </div>
                </div>
            </div>
        </template>
        <template v-else>
            <p v-if="value.trim() && disabled" :class="inputClasses">{{ value }}</p>
            <p v-else-if="value.trim()" @click="toggleEdit" class="editable-text" :class="inputClasses" :style="inputStyle">{{ value }}</p>
            <p v-else-if="disabled" :class="inputClasses">No Title</p>
            <em v-else @click="toggleEdit" class="editable-text print-hide" :class="inputClasses" :style="inputStyle">Click to Add Title</em>
        </template>
    </div>
</template>

<script>
    export default {
        name: 'IngEditable',
        props: {
            value: {
                type: String,
                required: false
            },
            color: {
                type: String,
                required: false,
                default: 'black'
            },
            disabled: {
                type: Boolean,
                default: false,
                required: false
            },
            inputClasses: {
                type: String,
                required: false
            }
        },
        data() {
            return {
                editing: false
            };
        },
        computed: {
            inputStyle: function() {
                return `color: ${this.color}; border-bottom: 1px dashed black;`;
            }
        },
        methods: {
            toggleEdit: function() {
                this.$emit('disableDragDrop', !this.editing);
                this.editing = !this.editing;
                this.$nextTick(() => this.$refs.editableValue.focus());
            },
            confirm: function() {
                this.$emit('disableDragDrop', false);
                this.$emit('save', this.$refs.editableValue.value.trim());
                this.editing = false;
            }
        }
    };
</script>

<style lang="scss" scoped>
    .editable-container {
        display: inline-block;
        vertical-align: middle;
        width: auto;
        zoom: 1;
    }
    .editable-input {
        vertical-align: top;
        display: inline-block;
        width: auto;
        white-space: normal;
        zoom: 1;
    }
    .editable-text {
        padding-bottom: 1px;
        cursor: pointer;
    }
    .editable-buttons {
        display: inline-block;
        vertical-align: top;
        margin-left: 7px;
        zoom: 1;
    }
    .control-group {
        margin-bottom: 0;
        white-space: nowrap;
        line-height: 20px;
    }

    @media print {
        .print-hide{ 
            display:none;
        }
    }
</style>

<template>
    <div
        :class="[
          'form-group',
          `col-xs-${field.layout.width}`,
          field._offset > 0 ? `col-xs-offset-${field._offset}` : ''
        ]"
        :style="{ textAlign: (field.layout.align || 'LEFT').toLowerCase() }"
        >
        <!-- FIELD / FILE / IMAGE / SERIES -->
        <CustomScriptInputArg
            v-if="['FIELD','IMAGE','SERIES'].includes(field.layout_type)"
            v-on:updateArgEvent="$emit('updateArgEvent', $event)"
            :disableFields="disableForField"
            :canDisableExecuteField="canDisableForField"
            :index="getInputIndexByName(field.field_name)"
            :mode="pageMode"
            :isEntry="isEntry"
            :r4s="isRunForScore"
            :arg="getInputByName(field.field_name)"
            :inputClasses="modStyle(elementId, `inputs.${field.field_name}`)"
            :argumentLabel="field.label && field.label.label_content"
            :labelAlign="field.label && field.label.label_align"
            :labelLoc="field.label && field.label.label_loc"
            :fieldHeight="field.layout.height"
            :advancedLayout="true"
        ></CustomScriptInputArg>

        <!-- DISPLAY with tooltip -->
        <ing-popover v-if="field.layout_type==='DISPLAY' && field.mouseover" placement="right">
            <ul slot="body" style="width: 300px">
                <span v-html="generateIconTooltip(field.mouseover.mouseover_elements)"></span>
            </ul>
            <span v-html="renderTemplate(field.template && field.template.template)"></span>
        </ing-popover>

        <!-- DISPLAY plain -->
        <span
            v-if="field.layout_type==='DISPLAY' && !field.mouseover"
            v-html="renderTemplate(field.template && field.template.template)"
        ></span>

        <!-- ICON: INFO -->
        <ing-popover placement="bottom" v-if="field.icon_type==='INFO'">
            <ul slot="body" style="width: 300px">
                <span v-html="generateIconTooltip(field.mouseover && field.mouseover.mouseover_elements)"></span>
            </ul>
            <span class="glyphicon glyphicon-info-sign"></span>
        </ing-popover>

        <!-- ICON: STATUS (only when executed) -->
        <ing-popover placement="bottom" v-if="executed && field.icon_type==='STATUS'">
            <template slot="title">Entry Outputs</template>
            <ul slot="body" style="width: 300px">
                <li
                    v-for="({name, value}, idx) in outputs"
                    :key="idx"
                    style="word-break: break-all;"
                >
                    <span class="result-key">{{ name }}</span>:&nbsp;<span class="result-value">{{ value }}</span>
                </li>
          </ul>
            <execution-status-check
                  v-if="enableExecution && field.layout_type==='ICON' && field.icon_type==='STATUS'"
                  :executed="executed"
                  :status="isEntry ? getExecutionResultsEntryKey('verification_status', String) : getExecutionMetaDataKey('status')"
            ></execution-status-check>
        </ing-popover>
    </div>
</template>

<script>
    import CustomScriptInputArg from "./CustomScriptInputArg.vue";

    export default {
        name: "AdvancedLayoutField",
        components: { CustomScriptInputArg },
        props: {
            field: { 
                type: Object, 
                required: true 
            },
            elementId: { 
                type: [String, Number], 
                required: true 
            },

            // state/permissions
            disableFields: { 
                type: Boolean, 
                default: false 
            },
            canDisableExecuteField: { 
                type: Boolean, 
                default: false 
            },
            pageMode: { 
                type: String, 
                default: "authoring" 
            },
            isRunForScore: { 
                type: Boolean, 
                default: false 
            },
            executed: { 
                type: Boolean, 
                default: false 
            },
            enableExecution: { 
                type: Boolean, 
                default: false 
            },
            outputs: { 
                type: Array, 
                default: () => [] 
            },
            isEntry:{
                type: Boolean,
                default: false
            },

            // functions borrowed from parent
            modStyle: { 
                type: Function,
                required: true 
            },
            getInputByName: { 
                type: Function, 
                required: true 
            },
            getInputIndexByName: { 
                type: Function, 
                required: true 
            },
            isOutputField: { 
                type: Function, 
                required: true 
            },
            renderTemplate: { 
                type: Function, 
                required: true 
            },
            generateIconTooltip: { 
                type: Function, 
                required: true 
            },
            getExecutionMetaDataKey: { 
                type: Function, 
            },
            getExecutionResultsEntryKey: {
                type: Function,
            }
        },
        computed: {
            disableForField() {
                return this.disableFields || this.isOutputField(this.field.field_name);
            },
            canDisableForField() {
                return this.canDisableExecuteField || this.isOutputField(this.field.field_name);
            }
        }
    };
</script>

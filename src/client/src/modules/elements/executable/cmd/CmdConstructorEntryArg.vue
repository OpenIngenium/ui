<template>
    <div v-bind:class="getStyling()">
        <div class="row">
            <div class="col-xs-3 form-group">
                <input 
                    type="text" 
                    class="form-control" 
                    v-bind:value="this.argument.argument_value"
                    v-if="!this.argument.enumerations"
                    :name="this.sectionIndex+'-'+this.argumentIndex"
                    v-on:keydown.enter.prevent
                    @change="updateArg">
                <select
                    class="form-control"
                    v-bind:value="this.argument.argument_value"
                    v-if="this.argument.enumerations"
                    :name="this.sectionIndex+'-'+this.argumentIndex"
                    @change="updateArg">
                    <option 
                        v-for="(enumeration, index) in this.argument.enumerations" 
                        :key="index">{{ enumeration.symbol }}</option>
                </select>
                <span class="required_field" v-if="showRequiredField">
                    <i class="glyphicon glyphicon-exclamation-sign"></i> Required field</span>
            </div>
            <div class="col-xs-1 cmd_arg_name">{{ this.argument.argument_name }}</div>
            <div class="col-xs-1 cmd_arg_name">{{ this.argument.default_value }}</div>
            <div class="col-xs-1">{{ this.argument.argument_type }}</div>
            <div class="col-xs-1">{{ this.argument.argument_size }}</div>
            <div class="col-xs-1">{{ this.argument.repeat_arg }}</div>
            <div class="col-xs-2">
                <p v-for="(allowable_range, index) in this.argument.allowable_ranges" :key="index" style="font-size:12px;">
                    Min-Value: {{ allowable_range.min_value }}<br>
                    Max-Value: {{ allowable_range.max_value }}
                </p>
            </div>
            <div class="col-xs-2">{{ this.argument.argument_description }}</div>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from "vuex";

    export default {
        name: 'CmdConstructorEntryArg',
        data(){
            return{
                showRequiredField: false
            };
        },
        props: {
            argument: {
                type: Object
            },
            sectionIndex: {
                type: Number
            },
            argumentIndex: {
                type: Number
            },
            argType: {
                type: String // regular or repeat
            }
        },
        computed: {
            ...mapGetters([
                "argsPresent",
                "selectedCmdObjRepeatArgs"
            ])
        },
        methods: {
            getStyling() {
                return this.argType === "repeat" ? 'cmd_repeat' : 'cmd_regular';
            },
            updateArg(event) {
                this.$emit('updateArgEvent', {
                    action: 'updateArg',
                    data: {
                        argumentValue: event.target.value,
                        sectionIndex: this.sectionIndex,
                        argumentIndex: this.argumentIndex,
                        argType: this.argType
                    }
                });
            }
        }
    };
</script>


<style scoped>
    .cmd_regular {
        padding: 10px 20px 10px 15px;
        margin-bottom: 6px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .cmd_repeat {
        padding: 10px 20px 10px 15px;
        margin-bottom: 6px;
    }

    .required_field {
        color:#a94442;
        size:12px;
    }

    .cmd_arg_name {
        word-break: break-all;
        overflow-wrap: anywhere;
        white-space: normal;
    }
</style>
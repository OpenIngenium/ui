<template>
  <div class="query-builder">
    <div class="rules">
      <!--Select Conditions-->
      <div class="btn-group btn-condition-group">
        <label v-for="(option, index) in conditionOptions" :key="index" class="btn"
          :class="option.value === importedRules.condition ? 'active' : 'inactive'" style="border-radius: 2px !important;"
          :disabled="disableConditionSelection">
          <input type="radio" class="hide-radio-circle" v-model="importedRules.condition" :value="option.value"
            :disabled="disableConditionSelection">{{ option.label }}
        </label>
      </div>
      <!--Select Group or Rule-->
      <div class="dropdown">
        <button class="btn btn-default btn-selection-dropdown dropdown-toggle" type="button" id="dropdownsSelection"
          data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
          <span class="plus"></span>
        </button>
        <ul class="dropdown-menu selection-dropdown" aria-labelledby="dropdownsSelection">
          <li><a href="#" @click.prevent="addCondition"><span class="plus"></span> Add Condition</a></li>
          <li><a href="#" @click.prevent="addGroup" v-if="showGroupSelection"><span class="plus"></span> Add Group</a></li>
        </ul>
      </div>
      <!--Remove Group Button-->
      <button v-if="isNestedRule" class="btn btn-default btn-selection-dropdown" type="button"
        @click="removeGroup">
        <span class="cross"></span>
      </button>
    </div>

    <!--Select Rule Variables-->
    <div class="rule-group">
      <div class="rule-list">
        <div v-for="(rule, index) in importedRules.rules" :key="index" class="condition-container" :class="[index !== importedRules.rules.length-1 ? 'after': '', rule.hasOwnProperty('condition') ? 'nested-margin' :'']">
          <div class="rule-field">
            <div class="form-group from-group-padding" v-if="!rule.hasOwnProperty('condition')">
              <!--Select field-->
              <select class="form-control select-margin" v-model="rule.field">
                <option value="" disabled selected>Select your field</option>
                <option v-for="(option, index) in fieldOptions" :value="option.value" :key="index">{{option.label}}</option>
              </select>
              <!--Select operator-->
              <select class="form-control select-margin" v-model="rule.operator">
                <option value="" disabled selected>Select your operator</option>
                <option v-for="(option, index) in operatorOptions(rule)" :value="option.value" :key="index">{{option.label}}</option>
              </select>
              <!--Enter value to search-->
              <input class="form-control select-margin" type="text" v-model="rule.value" placeholder="Enter search text">
              <!--Hint Search-->
              <search-popover placement="bottom">
                <template slot="title">Hint:</template>
                <template slot="body">{{ ruleHint(rule) }}</template>
                <i class="glyphicon glyphicon-question-sign" style="margin-top: 15px;"></i>
              </search-popover>
              <!--Remove Rule button-->
              <button class="btn btn-default btn-remove-condition" type="button"
                @click="removeCondition(index)">
                <span class="cross"></span>
              </button>
            </div>
            <div class="nested-rules" v-if="rule.hasOwnProperty('condition')">
              <query-builder :importedRules.sync="rule" :isNestedRule="true" @update:importedRules="handleNestedRulesUpdated(index, $event)" @remove-group="handleRemoveGroup(index)"></query-builder>
            </div> 
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
    import _ from 'lodash';
    import SearchPopover from './SearchPopover.vue';
    const fieldOptions =[
        { label: 'TITLE', value: 'title' },
        { label: 'DESCRIPTION', value: 'description' },
        { label: 'STEP_TYPE', value: 'step_type, elem_type' },
        { label: 'EXECUTION_ID', value: 'execution_id' },
        { label: 'PROCEDURE_ID', value: 'procedure_id' },
        { label: 'PROCEDURE_VERSION', value: 'procedureVersionDetails.version'},
        { label: 'STATUS', value: 'execution.meta_data.status' },
        { label: 'COMMENT_USERNAME', value: 'conversations.comments.user_name' },
        { label: 'TEST_CONDUCTOR', value: 'executionDetails.test_conductors, execution.meta_data.test_conductor' },
        { label: 'COMMENT', value: 'conversations.comments.content' },
        { label: 'VENUE_NAME', value: 'executionDetails.venue_name' },
        { label: 'VENUE_TYPE', value: 'venueDetails.type' },
        { label: 'TAG_NAME', value: 'tag_names' },
        { label: 'REDLINE/BLUELINE', value: 'procedure_modification.justification.modification_type' },
        { label: 'REFERENCE_PROCEDURE_ID', value: 'authoring_user_input.reference_procedure_id'},
        { label: 'REFERENCE_PROCEDURE_VERSION', value: 'execution_user_input.reference_procedure_version, authoring_user_input.reference_procedure_version' },
        { label: 'START_TIME', value: 'execution.meta_data.time_started' },
        { label: 'END_TIME', value: 'execution.meta_data.time_completed' },
        { label: 'DURATION', value: 'execution_user_input.duration, authoring_user_input.duration' },
        { label: 'TIMEOUT', value: 'execution_user_input.timeout, authoring_user_input.timeout' },
        { label: 'LOOKBACK', value: 'execution_user_input.lookback, authoring_user_input.lookback' },
        { label: 'DATA_PATH', value: 'execution_user_input.data_path, execution_user_input.entries.data_path, authoring_user_input.data_path, authoring_user_input.entries.data_path' },
        { label: 'COMMAND_STRING', value: 'execution_user_input.entries.cmd_string, authoring_user_input.entries.cmd_string' },
        { label: 'EVR_NAME', value: 'execution_user_input.entries.evr_name, execution_user_input.evr_name, authoring_user_input.entries.evr_name, authoring_user_input.evr_name' },
        { label: 'CHANNEL_NAME', value: 'execution_user_input.entries.channel_name, authoring_user_input.entries.channel_name' },
        { label: 'CHANNEL_ID', value: 'execution_user_input.entries.channel_id, authoring_user_input.entries.channel_id' },
    ];
    const hints = {
        'title': 'Text search of step titles',
        'description': 'Text search of step descriptions',
        'step_type, elem_type': 'Text search of step type. Example: PROCEDURE_SECTION, PARAGRAPH, STEP, MANUAL_INPUT, MANUAL_EIP, VENUE_CONFIG_MANUAL, ENVIRONMENT_MANUAL, GDS_MANUAL, VERIFICATION_ITEM, VERIFICATION_ITEM_STATUS, GRAPH_EHA, QUERY_EVR, VERIFY_EHA, WAIT_EHA, WAIT_EVR, BUS_1553, LIST_DATA_PRODUCTS, WAIT_DATA_PRODUCTS, CMD, CMD_FILE, CMD_SCMF, CMD_SSE, VENUE_CONFIG_GET, VENUE_CONFIG_UPDATE, VENUE_CONFIG_CHECK, MANUAL_VERIFICATION, CUSTOM_SCRIPT, ANALYSIS, WAIT, TIME_REFERENCE, TOC, SECTION',
        'execution.meta_data.status': 'Text search of step status. Example: PASS, FAIL, ERROR, OVERRIDE_PASS, OVERRIDE_FAIL, RUNNING, SKIPPED, NONE',
        'conversations.comments.user_name': 'Text search of user name of comments.',
        'executionDetails.test_conductors, execution.meta_data.test_conductor': 'Text search of user name of test conductor',
        'conversations.comments.content': 'Text search of comment text',
        'executionDetails.venue_name': 'Text search of venue names',
        'venueDetails.type': 'Text search of venue types. Example: WSTS, Testbed, ATLO, Other',
        'tag_names': 'Text of tag names as applied to steps',
        'procedure_modification.justification.modification_type': 'Search for either "redline" or "blueline"',
        'authoring_user_input.reference_procedure_id': 'Text search for procedure id',
        'execution_user_input.reference_procedure_version, authoring_user_input.reference_procedure_version': 'Text search of procedure version',
        'execution.meta_data.time_started': 'Step Start Time in UTC. Example: 2022-08-26T12:30:50, 2022-08-26T12:30:50.000 or 2022-08-26T12:30:50.000Z',
        'execution.meta_data.time_completed': 'Step End Time in UTC. Example: 2022-08-26T12:30:50, 2022-08-26T12:30:50.000 or 2022-08-26T12:30:50.000Z',
        'execution_user_input.duration, authoring_user_input.duration': 'Text search of duration fields in a variety of steps.',
        'execution_user_input.timeout, authoring_user_input.timeout': 'Text search of timeout fields in a variety of steps.',
        'execution_user_input.lookback, authoring_user_input.lookback': 'Text search of lookback fields in a variety of steps.',
        'execution_user_input.data_path, execution_user_input.entries.data_path, authoring_user_input.data_path, authoring_user_input.entries.data_path': 'Text search of data path fields in a variety of steps.',
        'execution_user_input.entries.cmd_string, authoring_user_input.entries.cmd_string': 'Text search of command string fields (command steps)',
        'execution_user_input.entries.evr_name, execution_user_input.evr_name, authoring_user_input.entries.evr_name, authoring_user_input.evr_name': 'Text search of EVR Name fields in EVR steps.',
        'execution_user_input.entries.channel_name, authoring_user_input.entries.channel_name': 'Text search of Channel Name fields in Channel steps',
        'execution_user_input.entries.channel_id, authoring_user_input.entries.channel_id': 'Text search of Channel ID fields in Channel steps',
    };

    export default {
        name: "QueryBuilder",
        components:{
            'search-popover':SearchPopover
        },
        props: {
            importedRules: {
                type: Object,
                default: () => ({ condition: "AND", rules: [] })
            },
            isNestedRule: {
                type: Boolean,
                default: false
            },
        },
        data() {
            return {
                query: "",
                conditionOptions: [
                    { label: 'AND', value: 'AND' },
                    { label: 'OR', value: 'OR' }
                ],
                showDropdown: false,
                nestedCondtion: false,
            };
        },
        computed: {
            disableConditionSelection: function() {
                return this.importedRules.rules.length == 0 ? true : false;
            },
            showGroupSelection: function() {
                if(this.importedRules.rules.length > 0 && !this.isNestedRule && !this.nestedCondtion)
                    return true;
                else 
                    return false;
            },
            fieldOptions: function() {
                return fieldOptions;
            },
            operatorOptions: function() {
                const fieldList = [ 
                    'procedureVersionDetails.version',
                    'execution_user_input.reference_procedure_version, authoring_user_input.reference_procedure_version',
                    'execution.meta_data.time_started', 
                    'execution.meta_data.time_completed', 
                    'execution_user_input.duration, authoring_user_input.duration', 
                    'execution_user_input.timeout, authoring_user_input.timeout', 
                    'execution_user_input.lookback, authoring_user_input.lookback'
                ];
                return (rule) => {
                    if (fieldList.includes(rule.field)) {
                        return [
                            { label: 'equal', value: '==' },
                            { label: 'not equal', value: '!==' },
                            { label: 'greater than', value: '>' },
                            { label: 'less than', value: '<' },
                            { label: 'greater than equal', value: '>=' },
                            { label: 'less than equal', value: '<=' },
                        ];
                    }
                    return [
                        { label: 'contains', value: '=' },
                        { label: 'does not contain', value: '!=' },
                    ];
                };
            },
            ruleHint: function() {
                return (rule) => {
                    if (rule.field) {
                        return hints[rule.field] || 'Select a field to see the hint';
                    }
                    return 'Select a field to see the hint';
                };
            },
            rules: function() {
                return this.importedRules;
            },
        },
        methods: {
            addCondition: function() {
                let rulesCopy =  _.cloneDeep(this.rules);
                rulesCopy.rules.push({ field: "", operator: "", value: "" });
                this.$emit('update:importedRules', rulesCopy);
            },
            addGroup: function() {
                this.nestedCondtion = true;
                let rulesCopy = _.cloneDeep(this.rules);
                rulesCopy.rules.push({ condition: "AND", rules: [{field: "", operator: "", value: ""}] });
                this.$emit('update:importedRules', rulesCopy);
            },
            removeGroup: function() {
                this.$emit('remove-group');
            },
            removeCondition: function(index) {
                let rulesCopy = _.cloneDeep(this.rules);
                rulesCopy.rules.splice(index, 1);
                this.$emit('update:importedRules', rulesCopy);
            },
            handleNestedRulesUpdated: function(index, newRules) {
                let rulesCopy = _.cloneDeep(this.rules);
                rulesCopy.rules[index] = newRules;
                this.$emit('update:importedRules', rulesCopy);
            },
            handleRemoveGroup: function(index) {
                this.nestedCondtion = false;
                let rulesCopy = _.cloneDeep(this.rules);
                rulesCopy.rules.splice(index, 1);
                this.$emit('update:importedRules', rulesCopy);
            },
        }
    };
</script>
  
<style lang="scss" scoped>
.rule {
  margin-bottom: 10px;
}

.actions {
  margin-top: 10px;
}

.add-condition-button {
  margin-left: 10px;
}

.remove-rule-button {
  margin-left: 10px;
}

.nested-rules {
  margin-left: 10px;
}

.query-builder {
  margin-top: 15px;
}

.btn.active {
  background: #e3165b;
  border-color: #e3165b;
  color: #fff;
  outline: #fafafa 0 solid;
  outline-offset: 0;
  font-size: 12px;
  line-height: 1.5834em;
  padding: 2px 12px 1px;
}

.btn.inactive {
  font-size: 12px;
  line-height: 1.5834em;
  padding: 2px 12px 1px;
}

.btn-no-radius {
  border-radius: 0px;
}

.btn-condition-group {
  border-color: #e0e0e0;
  border: none;
  box-shadow: 0 1px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
  display: inline-block;
  box-sizing: border-box;
}

.hide-radio-circle {
  display: none;
}

.rules {
  display: flex;
  align-items: center;
  padding-top: 10px;
}

.btn-selection-dropdown {
  margin-left: 12px;
  box-shadow: 0 2px 6px #d3d3d3;
  background-color: #fafafa;
  border-color: transparent;
  color: rgba(0, 0, 0, 0.87);
  border-radius: 50%;
}

.selection-dropdown {
  margin-left: 12px;
  border: none;
  border-radius: 0;
  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
  box-sizing: border-box;
  font-size: 14px;
  font-weight: normal;
  list-style-image: none;
  list-style-position: outside;
  list-style-type: none;
  min-width: 120px;
  overflow: hidden;
  padding: 8px 0;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  white-space: nowrap;
}

.plus {
  height: 20px;
  display: inline-block;
  background-color: transparent;
  color: black;
  font-size: 20px;
  line-height: 24px;
  text-align: center;
}

.plus::before {
  content: "+";
}

.cross {
  height: 20px;
  display: inline-block;
  background-color: transparent;
  color: black;
  font-size: 20px;
  line-height: 24px;
  text-align: center;
}

.cross::before {
  content: "x";
}

.condition-container {
  border-bottom: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  box-shadow: 0 2px 6px #d3d3d3;
  height: auto;
  margin-top: 0;
  padding-right: 12px;
  background-color: #fff;
  border-color: #d3d3d3;
  border: none;
  border-radius: 0;
  position: relative;
  box-sizing: border-box;
  padding-bottom: 10px;
}

.condition-container::before {
  height: calc(50% + 8px);
  top: -12px;
  border-color: #e0e0e0;
  border-style: dotted;
  content: "";
  left: -12px;
  position: absolute;
  width: 10px;
  border-width: 0 0 2px 2px;
  box-sizing: border-box;
}

.condition-container.after::after {
  height: calc(50% + 6px);
  top: calc(50% - 3px);
  border-color: #e0e0e0;
  border-width: 0 0 0 2px;
  border-style: dotted;
  content: "";
  left: -12px;
  position: absolute;
  width: 10px;
  box-sizing: border-box;
}

.rule-list {
  padding: 12px 0 12px 0;
  padding-bottom: 0;
}

.rule-group {
  padding-left: 20px;
}

.from-group-padding {
  display: flex;
  padding: 10px;
  margin-bottom: 0px;
}

.select-margin {
  margin:5px
}

.btn-remove-condition {
  margin-top: 3px;
  height: 40px;
  width: 80px;
  margin-left: 12px;
  background-color: transparent;
  color: rgba(0, 0, 0, 0.87);
  border-radius: 50%;
  border-color: transparent;
}

.btn-remove-condition:hover{
  border-color: gray;
}

.nested-margin {
    margin-bottom: 10px;
}
</style>
  
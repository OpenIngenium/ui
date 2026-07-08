<template>
    
    <div class="validateCard validateRootCard">
        <div 
            v-if="editable"
            style="float: right">
            {{ this.stepType }}
            <button 
                v-if="!updated"
                data-toggle="tooltip" 
                data-placement="top"
                data-trigger="hover" 
                onclick="$(this).tooltip('hide');"
                :title="userActionMsg != '' ? userActionMsg : ''"
                :disabled="userActionMsg !== ''"
                @click="handleRefreshElement(validationItem.elem_id)"
                class="btn btn-primary validateUpdate">Update</button>
            <div
                v-else
                style="float: right; color: #008000;">
                <i 
                    data-toggle="tooltip" 
                    data-placement="top"
                    data-trigger="hover" 
                    onclick="$(this).tooltip('hide');"
                    title="Updated"
                    class="glyphicon glyphicon-ok"></i>
            </div>
        </div>
        <div v-else style="float: right;"> {{ this.stepType }}</div>
        <div style="width: 47%; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
            <i 
                style="cursor: pointer"
                @click="show = !show" 
                :class="showChevron"></i>
                <a 
                    @click="jumpToStep(validationItem.elem_id, $event)"
                    href="#">
                    <span class="validateName">{{ validationItem.number }} {{ validationItem.title }}</span>
                </a>
        </div>

        <div v-if="show" class="validateChildren">
            <div 
                v-if="userActionMsg !== ''" 
                style="color: orange; word-break: break-all;">
                <i>{{ userActionMsg }}</i>
            </div>
            <div 
                class="validateChild"
                v-for="(changed_item, idx) in validationItem.changed_items" 
                :key="idx">
                <validate-card-field
                    :changed-item="changed_item"
                    :jump-to-step="jumpToStep"
                ></validate-card-field>
            </div>
        </div>
    </div>

</template>

<script>
    
    import { mapActions } from "vuex";
    import ValidateCardField from "./ValidateCardField.vue";

    export default {
        name: "ValidateCard",
        components: {
            ValidateCardField
        },
        data() {
            return {
                show: true,
            };
        },
        computed: {
            stepType: function() {
                if (this.validationItem.elem_type === "PROCEDURE_SECTION") {
                    return "Procedure";
                } else {
                    switch (this.validationItem.step_type) {
                        case "VERIFICATION_ITEM": return "VI";
                        case "VERIFICATION_ITEM_STATUS": return "VI Status";
                        case "CUSTOM_SCRIPT": return "Custom Script";
                        default: return "";
                    }
                }
            },
            showChevron: function() {
                return this.show ? "glyphicon glyphicon-triangle-bottom" : "glyphicon glyphicon-triangle-right";
            },
            userActionMsg: function() {
                return this.validationItem.user_action_msg;
            },
            updated: function() {
                return this.validationItem.updated;
            }
        },
        props: {
            validationItem: {
                type: Object,
                required: true
            },
            editable: {
                type: Boolean,
                required: true
            },
            jumpToStep: {
                type: Function
            }
        }, 
        methods: {
            ...mapActions([
                "validateProcedureElement"
            ]),
            handleRefreshElement: async function(elementId) {
                await this.validateProcedureElement(elementId);
            }
        }
    };

</script>

<style lang="scss" scoped>
    .validateHeader {
        margin-bottom: 10px;
    }

    .validateCard {
        padding: 10px;
        border: 1px solid lightgray;
        border-radius: 5px;
        margin-bottom: 10px;
    }

    .validateName {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        width: 100px;
    }

    .validateRootCard {

    }

    .validateChild {
        margin-left: 5px;
    }

    .validateChildren {
        margin-top: 10px;
        word-break: break-all;
    }

    .validateUpdate {
        margin-left: 5px;
    }

    .updateAll {
        float: right;
    }
</style>
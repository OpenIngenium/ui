<template>
    <div>
        <div class="validateHeader">
            <button 
                @click="handleValidateProcedure(false)"
                class="validate btn btn-primary">
                Validate
            </button>
            <div v-if="editable && validationItems.length > 0" style="float:right;">
                <button 
                    v-if="!updated"
                    :disabled="!canUpdateAll"
                    @click="handleValidateProcedure(true)"
                    class="updateAll btn btn-primary">Update All</button>
                <div
                    v-else
                    style="float: right; color: #008000;">
                    <i 
                        data-toggle="tooltip" 
                        data-placement="top"
                        data-trigger="hover" 
                        onclick="$(this).tooltip('hide');"
                        title="Updated All"
                        class="glyphicon glyphicon-ok"></i>
                </div>
            </div>
        </div>

        <!-- All -->
        <ValidateCard
            v-for="validationItem in validationItems"
            :validation-item="validationItem"
            :key="validationItem.elem_id"
            :editable="editable"
            :jump-to-step="jumpToStep"
        ></ValidateCard>

    </div>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    import ValidateCard from "./ValidateCard.vue";

    export default {
        name: "Validate",
        components: {
            ValidateCard
        },
        data() {
            return {
                updated: false
            };
        },
        props: {
            editable: {
                type: Boolean,
                required: true
            },
            jumpToStep: {
                type: Function
            }
        },
        computed: {
            ...mapGetters([
                "validationItems"
            ]),
            canUpdateAll: function() {
                return this.validationItems.filter(validationItem => validationItem.user_action_msg === '').length > 0;
            }
        },
        methods: {
            ...mapActions([
                "editScrollToElementId",
                "validateProcedureElements"
            ]),
            handleValidateProcedure: async function(update) {
                await this.validateProcedureElements(update);
            },
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

    .validateVi {

    }

    .validateVa {
        margin-left: 10px;
    }

    .validateVas {
        margin-top: 10px;
    }

    .validateUpdate {
        margin-left: 5px;
    }

    .updateAll {
        float: right;
    }
</style>
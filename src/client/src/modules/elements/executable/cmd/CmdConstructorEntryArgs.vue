<template>
    <form novalidate="novalidate">
        <div class="cmd_builder_arg_rows">
            <cmd-constructor-entry-arg 
                v-for="(argument, index) in this.arguments" 
                v-on:updateArgEvent="updateArgEvent"
                :argument="argument"
                :arg-type="argType"
                :section-index="sectionIndex"
                :argument-index="index"
                :key="index"></cmd-constructor-entry-arg>
        </div>
    </form>
</template>

<script>
    import CmdConstructorEntryArg from "./CmdConstructorEntryArg.vue";

    export default {
        name: 'CmdConstructorEntryArgs',
        components: {
            CmdConstructorEntryArg
        },
        props: {
            arguments: {
                type: Array
            },
            argType: {
                type: String
            },
            sectionIndex: {
                type: Number
            }
        },
        methods: {
            updateArgEvent: function(payload) {
                this.$emit('updateArgEvent', payload);
            },
            random: function() {
                return Math.floor(Math.random() * 100000000) + 1;
            }
        }
    };
</script>


<style scoped>
    .cmd_builder_table{
        border-collapse: collapse;
        background-color:inherit;
        border:none;
    }
</style>
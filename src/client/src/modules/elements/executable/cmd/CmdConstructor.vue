<template>
    <div class="cmd-constructor">
        <select-cmd-table></select-cmd-table>
        <cmd-constructor-builder></cmd-constructor-builder>
    </div>
</template>

<script>
    import SelectCmdTable from "./SelectCmdTable.vue";
    import CmdConstructorBuilder from "./CmdConstructorBuilder.vue";

    export default {
        name: "CmdConstructor",
        components: {
            SelectCmdTable,
            CmdConstructorBuilder
        },
        data() {
            return {
                cmdString: undefined
            };
        },
        methods: {
            commandStringEvent(event) {
                this.$emit('commandStringEvent', event);
            }
        }
    };
</script>

<style scoped>

</style>
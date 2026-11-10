<template>
    <div class="cmd_builder_repeat_sections">
        <cmd-constructor-repeat-section
            v-for="(section, index) in this.selectedCmdObjRepeatArgs"
            v-on:updateRepeatArgEvent="updateRepeatArgEvent"
            :key="index"
            :section-index="index"
            :section="section"></cmd-constructor-repeat-section>
    </div>
</template>

<script>
    import CmdConstructorRepeatSection from "./CmdConstructorRepeatSection.vue";
    import { mapGetters } from "vuex";

    export default {
        name: 'CmdConstructorRepeatSections',
        components: {
            CmdConstructorRepeatSection
        },
        computed: {
            ...mapGetters([
                "selectedCmdObjRepeatArgs"
            ])
        },
        methods: {
            updateRepeatArgEvent: function(payload) {
                this.$emit('updateRepeatArgEvent', payload);
            }
        }
    };
</script>

<style scoped>

</style>
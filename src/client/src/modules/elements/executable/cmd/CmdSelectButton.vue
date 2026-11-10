<template>
    <button :type="type" class="btn btn-primary" @click="$emit('tableEvent', selectCmdEvent)">Select</button>
</template>

<script>
    export default {
        name: 'EvrSelectButton',
        props: {
            data: {
                type: Object
            }
        },
        computed: {
            type() { return this.submit? 'submit' : 'button'; },
            selectCmdEvent() {
                return {
                    action: 'selectedCmd',
                    data: {
                        command_stem: this.data.command_stem
                    }
                };
            }
        }
    };
</script>


<style lang="scss" scoped>

</style>
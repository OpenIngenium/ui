<template>
    <button class="btn btn-primary" @click="$emit('tableEvent', selectCmdStringEvent)">Select</button>
</template>

<script>
    export default {
        name: 'CmdSseChooseButton',
        props: {
            data: {
                type: Object
            }
        }, 
        computed: {
            selectCmdStringEvent() {
                return {
                    action: 'onSelectCmd', 
                    data: {
                        cmd_id: this.data.cmd_id,
                        title: this.data.title,
                        command_stem: this.data.command_stem
                    }
                };
            }
        }
    };
</script>

<style lang="scss" scoped>
// button {
//     background-color: #5db85b; 
//     color: white; 
// }
</style>
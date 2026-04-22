<template>
    <button :type="type" class="btn btn-primary" @click="$emit('tableEvent', selectCustomScriptEvent)">Select</button>
</template>

<script>
    export default {
        name: 'CustomScriptSelectButton',
        props: {
            data: {
                type: Object
            }
        },
        computed: {
            type() { return this.submit? 'submit' : 'button'; },
            selectCustomScriptEvent() {
                return {
                    action: 'selectedCustomScript',
                    data: {
                        script_path: this.data.script_path
                    }
                };
            }
        }
    };
</script>


<style lang="scss" scoped>

</style>

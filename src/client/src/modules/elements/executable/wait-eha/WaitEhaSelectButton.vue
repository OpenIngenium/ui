<template>
    <button class="btn btn-primary" @click="$emit('tableEvent', selectEhaChannelEvent)">Select</button>
</template>

<script>
    export default {
        name: 'EhaChannelSelectButton',
        props: {
            data: {
                type: Object
            }
        }, 
        computed: {
            selectEhaChannelEvent() {
                return {
                    action: 'onSelectEha', 
                    data: {
                        eha_name: this.data.channel_name,
                        channel_id: this.data.channel_id,
                        operations_category: this.data.operations_category,
                        eha_description: this.data.description, 
                        derived: this.data.derived
                    }
                };
            }
        }
    };
</script>

<style lang="scss" scoped>
button {
    background-color: #5db85b; 
    color: white; 
}
</style>
<template>
    <button :type="type" class="btn btn-primary" @click="$emit('tableEvent', selectEvrEvent)">Choose</button>
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
            selectEvrEvent() {
                return {
                    action: 'selectEvr',
                    data: {
                        evr_name: this.data.evr_name,
                        level: this.data.level
                    }
                };
            }
        }
    };
</script>


<style lang="scss" scoped>

</style>
<template>
    <button class="btn btn-primary" @click="$emit('tableEvent', select1553Event)">Select</button>
</template>

<script>
    export default {
        name: 'Select1553Button',
        props: {
            data: {
                type: Object
            }
        }, 
        computed: {
            select1553Event() {
                return {
                    action: 'onSelect1553', 
                    data: {
                        mil1553_name: this.data.mil1553_name
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
<template>
    <span>
        <template>
            <div>    
                {{this.data.step_type ? this.data.step_type : this.data.elem_type}}
            </div>
        </template>
    </span>
</template>

<script>
    export default {
        name: 'SearchStepType',
        props: {
            data: {
                type: Object,
            },
        },
        computed: {
            
        },
    };
</script>

<style lang="scss" scoped></style>

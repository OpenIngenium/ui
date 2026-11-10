<template>
    <span>
        <template>
            <div v-if="this.data.execution_id && this.data.runRecordDetails._to">
                <a :href="this.getExecutionURL(this.data.execution_id,'')" target="_blank">
                    {{this.data.execution_id}} (Previous Run) 
                </a>
            </div>
            <div v-else-if="this.data.execution_id">
                <a :href="this.getExecutionURL(this.data.execution_id,this.data.elem_id)" target="_blank">
                    {{this.data.execution_id}}
                </a>
            </div>
            <div  v-if="this.data.procedure_id && this.data.execution_id !== ''">    
               {{this.data.procedure_id}}v{{this.data.procedureVersionDetails.version}}
            </div>
            <div  v-if="this.data.procedureDetails">
                <a :href="this.getProcedureURL(this.data.procedure_id,this.data.procedureVersionDetails.version,this.data.elem_id)" target="_blank">
                    {{this.data.procedure_id}}v{{this.data.procedureVersionDetails.version}}
                </a>
            </div>
        </template>
    </span>
</template>

<script>
    export default {
        name: 'SearchSource',
        props: {
            data: {
                type: Object,
            },
        },
        methods:{
            getExecutionURL:function(id, elem_id) {
                const currentURL = window.location.origin;
                if(elem_id == ''){
                    return `${currentURL}/execute/as_run/${id}/`;
                }
                const queryParam = `id=${elem_id}`;
                return `${currentURL}/execute/as_run/${id}/?${queryParam}`;
            },
            getProcedureURL:function(id, version, elem_id) {
                const currentURL = window.location.origin;
                const queryParam = `id=${elem_id}`;
                return `${currentURL}/authoring/${id}/${version}/?${queryParam}`;
            },
        }
    };
</script>

<style lang="scss" scoped></style>

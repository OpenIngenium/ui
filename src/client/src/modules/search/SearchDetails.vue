<template>
    <span>
        <template>
            <div v-if="this.data.execution_id">
                Start Time: {{ this.startTime}}
            </div>
            <div v-if="this.data.execution_id">
                End Time: {{ this.endTime }}
            </div>
            <div v-if="this.data.execution_id">
                TC: {{ this.testConductor }}
            </div>
            <div v-if="this.data.procedureDetails">
                Author: {{ this.author }}
            </div>
            <div>
                Tag: {{ this.tagNameStr }}
            </div>
            <div>
                <span v-if="this.modificationType != ''" :class="modificationStyle">{{ this.modificationType }}</span> 
            </div>
        </template>
    </span>
</template>

<script>
    export default {
        name: 'SearchDetails',
        props: {
            data: {
                type: Object,
            },
        },
        computed: {
            startTime: function() {
                if (this.data.execution && this.data.execution.meta_data && this.data.execution.meta_data.time_started && this.data.execution.meta_data.time_started !== '1970-01-01T00:00:00Z')
                    return this.data.execution.meta_data.time_started;
                return '';
            },
            endTime: function() {
                if (this.data.execution && this.data.execution.meta_data && this.data.execution.meta_data.time_completed && this.data.execution.meta_data.time_completed !== '1970-01-01T00:00:00Z')
                    return this.data.execution.meta_data.time_completed;
                return '';
            },
            author: function() {
                if (this.data.procedureDetails && this.data.procedureDetails.author)
                    return this.data.procedureDetails.author;
                return '';
            },
            testConductor: function() {
                if (this.data.execution && this.data.execution.meta_data && this.data.execution.meta_data.test_conductor)
                    return this.data.execution.meta_data.test_conductor;
                else if(this.data.executionDetails && this.data.executionDetails.test_conductors)
                    return this.data.executionDetails.test_conductors.join(', ');
                return '';
            },
            tagNameStr: function() {
                if (this.data.tag_ids.length > 0) {
                    const ids =  this.data.tag_ids;
                    const tagName = ids.map(id => {
                        const matchedTag = this.data.procedureVersionDetails.tags.find(tag => id === tag.tag_id);
                        return matchedTag ? matchedTag.name : null;
                    }).filter(tagName => tagName !== null);
                    return tagName.join(', ');
                }
                return '';
            },
            modificationType: function() {
                if (this.data.procedure_modification && this.data.procedure_modification.justification && this.data.procedure_modification.justification.modification_type)
                    return this.data.procedure_modification.justification.modification_type;
                return '';
            },
            modificationStyle: function() {
                return this.modificationType == 'REDLINE' ? 'redline' : 'blueline';
            }
            
        },
    };
</script>

<style lang="scss" scoped>
.redline {
    border:1px solid #ff4d4d;
    background-color:#ffe7e7;
    color:#ff4d4d;
}

.blueline {
    border:1px solid #4da6ff;
    background-color:#e7f3ff;
    color:#4da6ff;
}
</style>

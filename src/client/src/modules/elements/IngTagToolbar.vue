<template>
    <div class="tag-toolbar" :v-if="display">
        <h2 v-if="filterElementName">
           Preview of procedure step {{ filterElementName }}
        </h2>
        <button 
            type="button" 
            v-if="allowManageTag"
            class="btn btn-sm btn-default manage-tags"
            @click="toggleManageTagsModal">
            <i class="glyphicon glyphicon-tags"></i>
            &nbsp;Manage Tags
        </button>
        <ing-tag 
            v-for="tag in tags" 
            :key="tag.name" 
            :data="tag"
            style="margin-top:5px;"></ing-tag>
        <ing-tag-modal
            :showModal="showManageTagsModal"
            v-on:close="toggleManageTagsModal"
            v-on:newTag="createNewTag"
            v-on:deleteTag="deleteTag"
            v-on:editTag="handleEditTag"
            :tags="tags"
        ></ing-tag-modal>
        <select 
            v-if="filterElementName === ''"
            class="filter-dropdown"
            @change="filterTrigger">
            <option>Add filter...</option>
            <option 
                v-for="(filter, index) in unselectedAllFilters" 
                :key="filter.name"
                :value="index">
                {{ filter.name }}
            </option>
        </select>
        <div class="filter-tags">
            <ing-tag 
                v-for="filter in selectedAllFilters" 
                :key="filter.name"
                :data="filter"
                v-on:deleteTag="handleDeleteTag"
                :remove="filter.type !== 'run_procedure'"></ing-tag>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";
    import IngTagModal from './IngTagModal.vue';
    import IngTag from './IngTag.vue';
    import Multiselect from 'vue-multiselect';
    import { textToColor } from '../common/hash-colors.js';

    export default {
        name: "IngTagToolbar",
        components: {
            Multiselect,
            'ing-tag-modal': IngTagModal,
            'ing-tag': IngTag
        },
        data() {
            return { 
                showManageTagsModal: false,
                runProcedureElementSelectedStepName: '',
                runProcedureElementSelectedStepIds: [],
            };
        },
        props: {
            display: {
                type: Boolean,
                default: false
            },
        },
        watch: {
            async dataInitialized(val) {
                // get procedure_step_id from url (if applicable)
                const runProcedureElementId = this.$route.query.run_procedure_element_id;
                const procedureId = this.$route.query.procedure_id;
                const version = this.$route.query.version;
                const executionId = this.$route.query.execution_id;

                let procedureStepFilter = false;
                if (runProcedureElementId && procedureId && version) {
                    procedureStepFilter = true;
                    await this.fetchRunProcedureOutlineSelectedSteps({
                        procedureId: procedureId,
                        runProcedureElementId: runProcedureElementId,
                        version: version,
                        executionId: executionId
                    });
                } 

                let filtersValue = null;
                if(this.$route && this.$route.query.hasOwnProperty('filters')) {
                    filtersValue = this.$route.query.filters.trim();
                } 

                if (filtersValue === null) {
                    if (!procedureStepFilter) {
                        // if query parameter filters does not exist (and no procedure step filter), turn on step filter
                        this.setElemFilter({filter: 'step', value: true});
                    }
                } else if (filtersValue === "") {
                    // if filter is blank, set no filter (do nothing)
                } else {
                    const filterItems = filtersValue.split(',');
                    this.setElemFilter({filter: 'step', value: filterItems.includes('step')});
                    this.setElemFilter({filter: 'comment', value: filterItems.includes('comment')});
                }

                let tagsValue = null;
                if(this.$route && this.$route.query.hasOwnProperty('tags')) {
                    tagsValue = this.$route.query.tags.trim();
                } 

                if (tagsValue === null || tagsValue === "") {
                    // if tags is blank or missing, do nothing
                } else {
                    const tagItems = tagsValue.split(',');
                    for (const tagItem of tagItems) {
                        this.toggleTagFilter(tagItem);
                    }
                }
            },
        },
        computed: {
            ...mapGetters([
                "procedureVersion",
                "isWorkingCopy",
                "commentFilter",
                "tagsFilter",
                "procedureDetails",
                "selectedStepIds",
                "filterElementName",
                "dataInitialized",
            ]),
            tags: function() {
                return this.procedureDetails.tags ? this.procedureDetails.tags : [];
            },
            tagNames: function() {
                return this.tags.map(tag => tag.name);
            },
            allowManageTag: function() {
                return this.$route.query.hasOwnProperty('update') && this.isWorkingCopy;
            },
            filters: function() {
                let filters = [];

                filters.push({ 
                    name: 'Comments', 
                    value: 'comment',
                    type: 'filter', 
                    backgroundColor: '#41b883', 
                    textColor: 'white',
                    selected: this.commentFilter, 
                });
                
                if (this.procedureDetails.tags) {
                    for (const tag of this.procedureDetails.tags) {
                        filters.push({
                            name: tag.name,
                            value: tag.name,
                            type: 'tag',
                            backgroundColor: textToColor(tag.name).background,
                            textColor: textToColor(tag.name).text,
                            selected: this.tagsFilter.includes(tag.tag_id),
                        });
                    }
                }

                return filters;
            },
            selectedAllFilters: function() {
                const filters = this.filters.filter(filter => filter.selected);
                return filters;
            },
            unselectedAllFilters: function() {
                const filters = this.filters.filter(filter => !filter.selected);
                return filters;
            },
            selectedFilters: function() {
                const filters = this.filters.filter(filter => (filter.selected && filter.type === "filter"));
                return filters;
            },
            unselectedFilters: function() {
                const filters = this.filters.filter(filter => (!filter.selected && filter.type === "filter"));
                return filters;
            },
            selectedTags: function() {
                const tags = this.filters.filter(filter => (filter.selected  && filter.type === "tag"));
                return tags;
            },
            unselectedTags: function() {
                const tags = this.filters.filter(filter => (!filter.selected  && filter.type === "tag"));
                return tags;
            },
        },
        methods: {
            ...mapActions([
                "toggleElemFilter",
                "setElemFilter",
                "toggleTagFilter",
                "fetchProcedures",
                "fetchRunProcedureOutlineSelectedSteps",
                "fetchExecutionRunProcedureOutlineSelectedSteps"
            ]),
            textHashToColor: function(text) {
                return textToColor(text);
            },
            toggleManageTagsModal: function() {
                this.showManageTagsModal = !this.showManageTagsModal;
            },
            createNewTag: function(e) {
                this.$emit('newTag', e);
            },
            deleteTag: function(e) {
                this.$emit('deleteTag', e);
            },
            handleEditTag: function(e) {
                this.$emit('editTag', e);
            },
            filterTrigger: function(event) {
                const idx = parseInt(event.target.value);

                const selectedOption = this.unselectedAllFilters[idx];
                if (selectedOption.type === 'filter') {
                    if (selectedOption.name === 'Steps') {
                        this.toggleElemFilter('step');
                    } else if (selectedOption.name === 'Comments') {
                        this.toggleElemFilter('comment');
                    }
                } else if (selectedOption.type === 'tag') {
                    this.toggleTagFilter(selectedOption.name);
                }
                this.updateQueryParams();
            },
            handleDeleteTag: function(tag) {
                switch(tag.type) {
                    case "filter": {
                        this.toggleElemFilter(tag.value);
                        break;
                    }
                    case "tag": {
                        this.toggleTagFilter(tag.name);
                        break;
                    }
                }
                this.updateQueryParams();
            },
            updateQueryParams: function() {
                const filterNamesStr = this.selectedFilters.map((selectedFilter) => selectedFilter.value).join(',');
                const filterTagsStr = this.selectedTags.map((selectedTag) => selectedTag.value).join(',');
                this.$router.replace({
                    path: this.$route.path,
                    query: { ...this.$route.query, ...{
                        filters: filterNamesStr,
                        tags: filterTagsStr
                    } 
                }});
            }
        }
    };
</script>

<style lang="scss" scoped>
    .tag-toolbar {
        // float: right; 
        // display: flex;
        line-height: 2.3;
        min-height: 25px;
        margin-top: 20px;
        // overflow: auto;
        margin-bottom: 10px;
    }
    .tag-toolbar .btn-group {
        float: right;
    }
    .tag-toolbar .manage-tags {
        margin-left: 5px;
        margin-top: -5px;
    }
    .tag-toolbar .filter-dropdown {
        float: right;
        padding: 5px;
        margin-left: 2px;
    }
    .tag-toolbar .filter-tags {
        float: right;
    }

    .multiselect__tags {
        padding-right: 0px !important;
        font-size: 10px !important;
    }
    .multiselect__tag {
        margin-right: 2px !important;
        margin-bottom: 0px !important;
    }
    .multiselect__tag-icon {
        line-height: 16px !important;
    }

    .option-tag {
        position: relative;
        display: inline-block;
        padding: 4px 10px 4px 10px;
        border-radius: 5px;
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        max-width: 100%;
        text-overflow: ellipsis;
        margin-right: 5px;
    }

    .option-tag-selected {
        position: relative;
        display: inline-block;
        padding: 4px 5px 4px 10px;
        border-radius: 5px;
        line-height: 1;
        white-space: nowrap;
        overflow: hidden;
        max-width: 100%;
        text-overflow: ellipsis;
        margin-right: 5px;
    }

    .option-tag-remove {
        margin-left: 3px;
    }
</style>

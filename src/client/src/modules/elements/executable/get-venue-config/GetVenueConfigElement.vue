// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js
<template>
    <form>
        <div v-if="isLevelTwoDetail">
            <div class="row">
                <div class="col-xs-2" style="display: inline-block;">
                    <label>Get All
                    <input type="checkbox"
                        v-model="getAll"
                        @change="save"
                        :disabled="disableFields"
                        class="execution-input"
                        style="margin-right: 8px;"></label>

                </div>
                <div class="col-xs-10"></div>
            </div>
        </div>
        <div v-if="!getAll" class="dynamic-elements">
            <entries-wrapper v-for="(entry, idx) in elementEntryCount" :key="idx"
                v-on:save="save"
                :mode="mode"
                :element-id="elementId"
                :element-path="elementMap.path"
                entry="get-venue-config-entry"
                :index="idx">
            </entries-wrapper>
        </div>
        <div v-if="isLevelThreeDetail">
            <div v-if="executed">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Config Elem Name</th>
                            <th>Serial</th>
                            <th>Status</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="entry in executionResultsKey(this.elementId, 'entries')" :key="entry.config_elem_name">
                            <td>{{ entry.config_elem_name }}</td>
                            <td>{{ entry.serial }}</td>
                            <td>{{ entry.status }}</td>
                            <td>{{ entry.type }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </form>
</template>

<script>
    export default {
        name: "GetVenueConfigElement",
        computed: {
            getAll: {
                get() {
                    return this.executionInputKey(this.elementId, "get_all");
                },
                set(value) {
                    this.editElementInput({
                        elementId: this.elementId,
                        keyString: "get_all",
                        value
                    });
                }
            }
        }
    };
</script>



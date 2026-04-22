// THIS COMPONENT INHERITS METHODS AND PROPS FROM A BASE MIXIN AND A CONTEXT-SPECIFIC MIXIN - EXECUTION, AS-RUN, OR AUTHORING.
// element-core-mixin.js
<template>
    <form>
        <div class="dynamic-elements">
            <entries-wrapper v-for="(entry, idx) in elementEntryCount" :key="idx"
                v-on:save="save"
                :element-id="elementId"
                :index="idx"
                :mode="mode"
                :element-path="elementMap.path"
                entry="update-venue-config-entry">
            </entries-wrapper>
        </div>
    </form>
</template>

<script>
    export default {
        name: "UpdateVenueConfigElement",
        methods: {
        }
    };
</script>



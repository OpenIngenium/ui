<template>
    <button
        :class="btnClass"
        @click="handleClick()">
        <span v-if="isSelected">Unselect</span>
        <span v-else>Select</span>
    </button>
</template>

<script>
    import {mapActions, mapGetters} from "vuex";

    export default{
        name: "ChooseViButton",
        props: {
            data: {
                type: Object,
                required: true
            },
        },
        computed: {
            ...mapGetters([
                "selectedVisStepElementId",
                "isSelectedViId"
            ]),
            isSelected: function() {
                return this.isSelectedViId(this.data.vi_id);
            },
            btnClass: function() {
                return this.isSelected ? "btn btn-success" : "btn btn-info";
            }
        },
        methods: {
            ...mapActions([
                "addSelectedViId",
                "removeSelectedViId"
            ]),
            handleClick: function() {
                if(this.isSelected) {
                    this.removeSelectedViId({vi: this.data});
                } else {
                    this.addSelectedViId({vi: this.data});
                }
            },
        },
    };
</script>

<style scoped></style>

<template>
    <ul class="element-outline nav">
        <li>
            <a :href="`#${elementId}`">
                <i>{{ number }} -
                    <span v-if="title"> {{ title }}</span>
                    <span v-else> No Title </span>
                </i>
            </a>
        </li>
        <template v-for="element in childElements">
            <element-outline
                :key="element.elem_id"
                :title="element.title"
                :number="element.number"
                :element-id="element.elem_id">
            </element-outline>
        </template>
    </ul>

</template>

<script>
    import { mapGetters } from "vuex";
    import ElementOutline from "./ElementOutline.vue";

    export default {
        name: "ElementOutline",
        components: {
            ElementOutline
        },
        props: {
            elementId: {
                type: String,
                required: true
            },
            title: {
                type: String,
            },
            number: {
                type: String,
            }
        },
        computed: {
            ...mapGetters([
                "elementsByParent",
            ]),
            childElements: function() {
                return this.elementsByParent(this.elementId);
            }
        }
    };
</script>

<style lang="scss" scoped>
    ul.element-outline {
        list-style-type: none;
        padding-left: 5px;
    }
    ul.element-outline ul.element-outline {
        list-style-type: none;
        padding-left: 25px;
    }
    ul.element-outline > li > a {
        color: black;
        position: relative;
        display: block;
        padding: 5px 15px;
    }
</style>

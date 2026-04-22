<template>
  <div class="autocomplete">
    <input 
      ref="inputElement"
      type="text"
      v-model="search"
      v-on:input="handleInputEvent"
      class="form-control execution-input"
      :class="inputClasses"
      @change="onChange"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter="onEnter"
      :disabled="this.disabled"
    >
    <ul
        id="autocomplete-results"
        v-show="isOpen"
        class="autocomplete-results"
        :class="dynamicWidth"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
    >
        <li
            class="loading"
            v-if="noResults"
        >
            <div class="loading-container">
                No matching results.
            </div>
        </li>
        <li
            v-else-if="this.items.length > 0"
            v-for="(item, i) in this.items"
            :key="i"
            @click="setResult(item[`${enterByName}`], item[`${enterByAdditionalField}`])"
            class="autocomplete-result"
            :class="{ 'is-active': i === arrowCounter }"
        >
            <div class="autocomplete-sublist" @mouseenter="setArrowCounter(i)">
                <ul class="autocomplete-first-line">
                    <li class="autocomplete-title">{{ item[`${nameField}`] }}</li>
                    <li v-if="categoryField" class="autocomplete-category">{{ item[`${categoryField}`] }}</li>
                </ul>
                    <p class="autocomplete-description">{{ item[`${descriptionField}`] }}</p>
            </div>
        </li>
    </ul>
  </div>
</template>

<script>
    import _ from 'lodash';

    export default {
        name: 'IngAutocomplete', 
        props: {
            value: {
                type: String, 
                default: ''
            },

            disabled: {
                type: Boolean, 
                default: false,
                required: true
            },

            items: {
                type: Array, 
                default: () => []
            },

            enterByName: {
                type: String, 
                required: true
            },

            enterByAdditionalField: {
                type: String
            },

            nameField: {
                type: String, 
                required: true
            },

            descriptionField: {
                type: String, 
                required: true
            },

            categoryField: {
                type: String
            },

            callback: {
                type: Function, 
                required: true
            },

            dynamicWidth: {
                type: String
            },

            inputClasses: {
                type: String
            }

        },
        data() {
            return {
                isOpen: false,
                noResults: false,
                isLoading: false, 
                search: this.value, 
                arrowCounter: 0,
                // true if the mouse was on the list of lookup items.
                // Used to prevent calling API (save step) more than once. 
                isMouseOnItem: false,
            };
        },
        methods: {
            handleInputEvent: _.debounce(function(customEvent) {
                const newInput = customEvent.target.value; 
                this.$emit('handleEvent', newInput);
                this.triggerCallback();
            }, 200),

            onChange: function() {
                // See ING-4565

                // onChange is called when the input loses input focus and its value has been changed.
                // It is fired before other events, and it is important to save the output before calling
                // other API such as running a step. 

                // If a lookup item was selected, setResult() will be used to save step.
                // If not, save step.

                // If save is called here, setResult() may not be called in Chrome when a lookup item is selected.
                // So, call it only when input focus was lost by click away.
                if (!this.isMouseOnItem) {
                    this.$emit('save');
                }
            },
            onMouseEnter: function() {
                this.isMouseOnItem = true;
            },
            onMouseLeave: function() {
                this.isMouseOnItem = false;
            },

            triggerCallback: function() {
                if(this.callback) {
                    if (this.search !== 0) {
                        this.callback(this.search);
                    }
                    setTimeout(() => {
                        if (this.search.length < 1) {
                            this.isOpen = false;
                        } else if (this.items.length === 0) {
                            this.noResults = true; 
                            this.isOpen = true;
                        } else { 
                            this.isOpen = true;
                            this.noResults = false;
                        }
                    }, 210);
                }
            },

            setResult(result, secondResult) {
                if (secondResult) {
                    this.search = result;
                    this.$emit('handleEvent', result, secondResult);
                    this.$emit('save');
                    this.isOpen = false;
                } else {
                    this.search = result;
                    this.$emit('handleEvent', result);
                    this.$emit('save');
                    this.isOpen = false;
                }  
            },

            onArrowDown() {
                if (this.arrowCounter < this.items.length) {
                    this.arrowCounter = this.arrowCounter + 1;
                }
            },
            onArrowUp() {
                if (this.arrowCounter > 0) {
                    this.arrowCounter = this.arrowCounter -1;
                }
            },
            onEnter() {
                if (this.enterByAdditionalField) {
                    const mainAutoCompleteSelection = this.items[this.arrowCounter][`${this.enterByName}`];
                    const secondResult = this.items[this.arrowCounter][`${this.enterByAdditionalField}`];
                    this.$emit('handleEvent', mainAutoCompleteSelection, secondResult);
                    this.isOpen = false;
                    this.arrowCounter = -1;
                } else if (this.items[this.arrowCounter]){
                    const autoCompleteSelection = this.items[this.arrowCounter][`${this.enterByName}`];
                    this.$emit('handleEvent', autoCompleteSelection);
                    this.isOpen = false;
                    this.arrowCounter = -1;
                }
                // set this false here so as to save the change
                this.isMouseOnItem = false;
                // This will trigger save
                this.$refs.inputElement.blur();
            },
            setArrowCounter(value) {
                this.arrowCounter = value;
            },
            handleClickOutside(event) {
                if (!this.$el.contains(event.target) && this.isOpen == true) {
                    this.isOpen = false;
                    this.arrowCounter = -1;
                }
            }
        },

        watch: {
            value: function(val) {
                this.search = val;
            }
        },

        mounted() {
            document.addEventListener('click', this.handleClickOutside);
        },

        destroyed() {
            document.removeEventListener('click', this.handleClickOutside);
        },
    };
</script>

<style lang="scss" scoped>
  .autocomplete {
    position: relative;
  }

  .autocomplete-results {
    background-color: white;
    color: #3c763d;
    padding: 0;
    margin: 0;
    height: auto;
    overflow: auto;
    width: 100%;
    position: absolute;
    z-index: 11;

    .loading {
        padding-top: 5px;
        padding-bottom: 5px;
    }
  }

  .five-hundred-width {
    width: 550px;
  }

  .three-hundred-width {
      width: 375px;
  }

  .auto-width {
      width: 100%;
  }


  .autocomplete-result{
    list-style: none;
    text-align: left;
    padding: 4px 2px;
    cursor: pointer;
  }

 .autocomplete-description {
     margin-bottom: 2px;
     font-size: 11px;
 }

  .autocomplete-result.is-active,
  .autocomplete-result:hover {
    background-color: #3c763d;
    color: white;
  }

  .autocomplete-first-line {
      padding-left: 7px;
  }

  .autocomplete-sublist {
      list-style-type: none;

      li {
          display: inline;
      }
  }

  .autocomplete-category {
      float: right;
      margin-right: 20px;
  }

  .autocomplete-title {
      font-size: 14px;
      font-weight: bold;
  }

</style>

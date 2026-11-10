

    // execution namespace
    ING.execution = {};

    /**
     * -------------------------------------------------------------------------------------------------------------
     * status notification states
     * -------------------------------------------------------------------------------------------------------------
     */

    ING.execution.notify_states = {
        executing: {
            glyphicon: 'glyphicon-refresh',
            caption: 'Executing',
            animation: 'spin',
            small: true
        },
        execution_pass: {
            glyphicon: 'glyphicon-thumbs-up',
            caption: 'Execution Passed',
            color: 'green',
            animation: 'pop',
            dismiss: 1000,
            small: true
        },
        execution_fail: {
            glyphicon: 'glyphicon-thumbs-down',
            caption: 'Execution Failed',
            color: 'red',
            animation: 'pop',
            dismissible: true,
            small: true
        },
        execution_error: {
            glyphicon: 'glyphicon-fire',
            caption: 'Execution Error',
            color: 'red',
            animation: 'pop',
            dismissible: true,
            small: true
        },
        execution_unknown: {
            glyphicon: 'glyphicon-question-sign',
            caption: 'Execution Unknown',
            details: 'Unable to determine status of execution',
            color: 'yellow',
            animation: 'pop',
            dismissible: true,
            small: true
        },
        halted: {
            glyphicon: 'glyphicon-stop',
            caption: 'Halted',
            color: 'red',
            animation: 'pop',
            dismiss: 1000,
            small: true
        },
        halting: {
            glyphicon: 'glyphicon-refresh',
            caption: 'Halting',
            animation: 'spin',
            small: true
        },
        halting_error: {
            glyphicon: 'glyphicon-fire',
            caption: 'Halting Error',
            color: 'red',
            animation: 'pop',
            dismissible: true,
            small: true
        },
        loading: {
            glyphicon: 'glyphicon-refresh',
            caption: 'Loading',
            animation: 'spin',
            small: true
        },
        saved: {
            glyphicon: 'glyphicon-floppy-disk',
            caption: 'Saved',
            color: 'blue',
            animation: 'pop',
            dismiss: 1000,
            small: true
        },
        saving: {
            glyphicon: 'glyphicon-refresh',
            caption: 'Saving',
            animation: 'spin',
            small: true
        }
    };


    /**
     * -------------------------------------------------------------------------------------------------------------
     * initialization
     * -------------------------------------------------------------------------------------------------------------
     */
    ING.execution.init_steps_canvas = function() {
        $('ol#steps_canvas').sortable({
            group: 'steps'
        });

        // listen for step being added/removed/moved from $steps_canvas; re-evaluate anything that might need to change
        $('ol#steps_canvas').on('step.added step.removed step.moved step.active step.not_active step.executing step.not_executing step.executed step.not_executed', function () {

            // show/hide empty messages on all $ol elements in container as appropriate
            ING.execution.toggle_empty_message();

            // checks if all comments are shown/hidden/mix and marks 'comments' trigger as appropriate
            ING.execution.toggle_toggle_comment_all();

            // checks if all details are shown/hidden/mix and marks 'details' trigger as appropriate
            ING.execution.toggle_toggle_detail_all();

            // enable/disable $execution_next_step_button and $execution_previous_step_button as appropriate
            ING.execution.toggle_next_previous_step_buttons();

            // enable/disable play button based on whether or not there are executable steps in the canvas
            ING.execution.toggle_play_button();

            // update execution status
            ING.execution.update_execution_status();

        });

        // listen for an instance of the large_step to be added to page
        $('ol#steps_canvas .step').each(function () {
            const $step = $(this);
            ING.execution.step_initialize($step);
        });
    };

    ING.execution.init_steps_toolbar = function() {
        let cancelDrop = false;
        let toolbarItem = false;
        let scrollTimeout = null;

        $('ol#steps_toolbar').sortable({
            group: 'steps',
            itemSelector: 'li.step',
            drop: false,
            handle: '.step_move_button',
            pullPlaceholder: false,
            onDragStart: function ($step, container, _super, event) {
                cancelDrop = false; // reset for each new drag
                // save original location of $step (used for error handling on move error)
                $step.data('insert_after_id', ING.execution.get_insert_after_id($step));
                $step.data('level', ING.execution.get_level($step));

                // recreate dragged element
                if (!container.options.drop) {
                    $step.clone().insertAfter($step);
                }

                // keep track of where the item came from
                if(container.target.attr('id') === 'steps_toolbar') {
                    toolbarItem = true;
                } else {
                    toolbarItem = false;
                }

                // execute default onDragStart behavior
                _super($step, container);
            },
            onDrag: function ($step, position, _super, event) {
                position.left = position.left - 10;
                position.top = position.top - 10;

                // Scroll constants 
                const scrollOffset = 200;
                const scrollInterval = 50;

                let relativePosition = position.top;

                // Toolbar items have a position relative to their container, so add the offset
                if(toolbarItem) {
                    relativePosition += $(window).scrollTop();
                }


                // Upwards
                if((relativePosition - $(window).scrollTop() < scrollOffset) ) {
                    scrollTimeout = setTimeout(function() {
                        $(window).scrollTop($(window).scrollTop() - scrollInterval);
                    }, 5)
                }
                
                // Downwards
                if(relativePosition + scrollOffset > ($(window).scrollTop() + $(window).height() - scrollOffset)) {
                    scrollTimeout = setTimeout(function() {
                        $(window).scrollTop($(window).scrollTop() + scrollInterval);
                    }, 5)
                }


                $step.css(position);
            },

            onDrop: function ($step, container, _super, event) {
                // cancel the operation if we're not on a valid target
                if(cancelDrop) {
                    // only remove un-initialized steps
                    if($step[0].id === "None") {
                        $step.remove();
                        return;
                    }
                }

                // moving a $step
                if ($step.data('initialized')) {
                    // indicate that $step was moved
                    ING.execution.step_move($step);
                }

                // creating a new step;
                else {
                    // add $step
                    ING.execution.step_add($step);
                }

                // clear timer
                clearTimeout(scrollTimeout);

                // execute default onDrop behavior
                _super($step, container);
            },

            onCancel: function ($step, container, _super, event) {
                cancelDrop = true;
                // execute default onCancel behavior
                _super($step, container);
            }
        });
    };

    ING.execution.init_switches = function() {
        $('input#toggle_venue_status').bootstrapSwitch({
            onText: 'Show',
            offText: 'Hide',
            labelWidth: 10,
            onSwitchChange: function (event, state) {
                var $venue_status = $('#venue_status');
                (state) ? $venue_status.slideDown('fast') : $venue_status.slideUp('fast');
            }
        });

        $('input#toggle_detail_all').bootstrapSwitch({
            onText: 'Show',
            offText: 'Hide',
            labelWidth: 10,
            onSwitchChange: function (event, state) {
                $('ol#steps_canvas').find('.step').each(function () {
                    (state) ? ING.execution.step_show_detail($(this)) : ING.execution.step_hide_detail($(this));
                });
            }
        });
    };

    ING.execution.init_up_added_listeners = function() {
        $(document).on('up.added', 'span.step-detail-execution-resize', function (event, element) {
            if (this === element) {
                $('span.step-detail-execution-resize').off();
                $('span.step-detail-execution-resize').on('click', function() {
                    $step = $(this).closest('li.step.step_executable');
                    ING.execution.toggle_executed_step_results($step);
                });
            }
        });

        /**
         * -------------------------------------------------------------------------------------------------------------
         * initialization for editable on all elements that need it
         * -------------------------------------------------------------------------------------------------------------
         */

        $(document).on('up.added', '.step_title', function (event, element) {
            /* because we're listening to 'document' for up.added and then rely on event bubbling to alert us when an
             * $element was added to the document, we must make sure that the $element we get back is the same $element
             * that we're listening for, and not a child of the $element that we're listening for */
            if (this === element) {
                $(this).each(function () {
                    $(this).editable({
                        ajaxOptions: {'headers': {'X-CSRFToken': ING.utils.csrfToken()}},
                        emptytext: 'Click to add title',
                        onblur: 'submit',
                        url: '/core/elements/update/base/element/'
                    });
                });
            }
        });

        /**
         * -------------------------------------------------------------------------------------------------------------
         * initialization for inline froala inside editor
         * -------------------------------------------------------------------------------------------------------------
         */

        $(document).on('up.added', '.description_wysiwyg_button', function (event, element) {
            /* because we're listening to 'document' for up.added and then rely on event bubbling to alert us when an
             * $element was added to the document, we must make sure that the $element we get back is the same $element
             * that we're listening for, and not a child of the $element that we're listening for */
            if (this === element) {
                $(this).each(function () {

                    var $button = $(this),
                        $content = $button.siblings('.description_wysiwyg_content'),
                        data = $button.data('data');

                    $button.on('click', function () {

                        $content.data('old-html', $content.html());
                        $content.contents().fadeOut(250);
                        $content.notify_status('loading', {background: 'transparent', small: true});
                        $content.animate({'min-height': ($content.height() > 200) ? $content.height() : 200}, 250);

                        $.ajax({
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader("X-CSRFToken", ING.utils.csrfToken());
                            },
                            url: $button.data('url'),
                            method: 'POST',
                            data: data,
                            dataType: 'JSON',
                            success: function (result) {
                                ING.execution.populate_wysiwyg_content_block($content, result.html, false, true);
                            },
                            error: function () {
                                ING.execution.populate_wysiwyg_content_block($content, $content.data('old-html'), false, true);
                                $.notify_status('error', {dismissible: true, details: 'Please try again'});
                            }
                        });

                    });

                });
            }
        });


        $(document).on('up.added', 'form#description_form', function (event, element) {
            /* because we're listening to 'document' for up.added and then rely on event bubbling to alert us when an
             * $element was added to the document, we must make sure that the $element we get back is the same $element
             * that we're listening for, and not a child of the $element that we're listening for */
            if (this === element) {
                $(this).each(function () {

                    var $form = $(this),
                        $content = $form.parent('div.description_wysiwyg_content'),
                        $editor = $form.find('textarea#id_description'),
                        $cancel = $form.find('button#description_form_cancel'),
                        $submit = $form.find('button#description_form_submit'),
                        element_id = $form.find('input[name="element_id"]'),
                        execution_id = $form.find('input[name="execution_id"]');
                        procedure_id = $form.find('input[name="procedure_id"]');


                    var enable_file_upload = $form.data('enable_file_upload');
                    var toolbar_set = $form.data('toolbar_set');

                    // Initialize WYSIWYG
                    $editor.froalaEditor(ING.external.setup_froala_options(enable_file_upload, toolbar_set, execution_id.val(), procedure_id.val(), element_id.val()));

                    $cancel.on('click', function () {
                        ING.execution.populate_wysiwyg_content_block($content, $content.data('old-html'), false, false);
                    });

                    $submit.on('click', function () {
                        $.ajax({
                            beforeSend: function (xhr) {
                                $content.notify_status('saving', {background: 'transparent', small: true});
                                xhr.setRequestHeader("X-CSRFToken", ING.utils.csrfToken());
                            },
                            url: $submit.data('url'),
                            method: 'POST',
                            data: $form.serialize(),
                            dataType: 'JSON',
                            success: function (result) {
                                ING.execution.populate_wysiwyg_content_block($content, result.description, true, false);
                            },
                            error: function () {
                                ING.execution.populate_wysiwyg_content_block($content, $content.data('old-html'), false, false);
                                $.notify_status('error', {dismissible: true, details: 'Please try again'});
                            }
                        });
                    });

                });
            }
        });
    };

    ING.execution.init = function() {
        ING.execution.init_switches();
        ING.execution.init_steps_toolbar();
        ING.execution.init_steps_canvas();

        // show/hide empty messages on all $ol elements in container as appropriate
        ING.execution.toggle_empty_message();

        // enable/disable play button based on whether or not there are executable steps in the canvas
        ING.execution.toggle_play_button();

        // update execution status
        ING.execution.update_execution_status();

        // listen for manual_button_play being pressed
        $(document).on('click', 'button#manual_button_play', ING.execution.start_manual_play);

        // listen for manual_button_halt being pressed
        $(document).on('click', 'button#manual_button_halt', ING.execution.halt_manual_play);

        // listen for manual_button_end being pressed
        $(document).on('click', 'button#manual_button_end', ING.execution.end_manual_play);
    };

    /**
     * -------------------------------------------------------------------------------------------------------------
     * functions for toolbar operations
     * -------------------------------------------------------------------------------------------------------------
     */

    // update execution status
    ING.execution.update_execution_status = function () {
        // status
        var $status = $('#execution_status_status'),
            status_old = $status.text(),
            status = '';
        if (ING.execution.is_execution_executing()) {
            status = 'Executing';
        }
        else if (ING.execution.is_execution_active()) {
            status = 'Playing';
        }
        else {
            status = 'Building';
        }
        $status.text(status);
        if ((status != status_old) && (status_old != '')) {
            $status.up_flash();
        }

        // un_executed_steps
        var $un_executed_steps = $('#execution_status_un_executed_steps'),
            un_executed_steps_old = $un_executed_steps.text(),
            un_executed_steps = '',
            executable_steps_count = ING.execution.get_executable_steps_count(),
            executed_steps_count = executable_steps_count - ING.execution.get_not_executed_executable_steps_count();
        if (!executable_steps_count) {
            un_executed_steps = 'No executable steps';
        }
        else if (executed_steps_count == executable_steps_count) {
            un_executed_steps = 'All steps executed';
        }
        else {
            un_executed_steps = executed_steps_count + ' of ' + executable_steps_count + ' executed';
        }
        $un_executed_steps.text(un_executed_steps);
        if ((un_executed_steps != un_executed_steps_old) && (un_executed_steps_old != '')) {
            $un_executed_steps.up_flash();
        }

    };

    /**
     * -------------------------------------------------------------------------------------------------------------
     * functions for canvas operations
     * -------------------------------------------------------------------------------------------------------------
     */

    // show/hide empty messages on all $ol elements in container as appropriate
    ING.execution.toggle_empty_message = function () {
        ING.execution.get_all_step_containers().each(function () {
            $(this).siblings('.step_empty_list_message').toggle(ING.execution.has_children($(this)));
        });
    };

    // enable/disables $execution_next_step_button and $execution_previous_step_button as appropriate
    ING.execution.toggle_next_previous_step_buttons = function () {

        // for every executable $step
        ING.execution.get_executable_steps().each(function () {

            // get $previous and $next buttons
            var $previous = $(this).find('.execution_previous_step_button').first();
            var $next = $(this).find('.execution_next_step_button').first();

            // if has $previous_step/$next_step, show $previous/$next buttons as appropriate
            (ING.execution.has_previous_not_executed_executable_step($(this))) ? $previous.show() : $previous.hide();
            (ING.execution.has_next_not_executed_executable_step($(this))) ? $next.show() : $next.hide()

        });

    };

    // checks if all details are shown/hidden/mix and marks 'details' trigger as appropriate
    ING.execution.toggle_toggle_detail_all = function () {

        var $steps = ING.execution.get_all_steps(),
            $input = $("input#toggle_detail_all"),
            all_true = true,
            all_false = true;

        // if there are no $steps, switch toggle_detail_all to true
        if ($steps.length == 0) {
            $input.bootstrapSwitch('state', true)
        }

        // else there are $steps
        else {

            // iterate through each step and see if they're all_true, all_false, or a combo
            $steps.each(function () {
                $(this).data('detail-shown') ? all_false = false : all_true = false;
            });

            // if all_true, switch toggle_detail_all to true
            if (all_true) {
                $input.bootstrapSwitch('state', true)
            }

            // if all_true, switch toggle_detail_all to false
            else if (all_false) {
                $input.bootstrapSwitch('state', false)
            }

            // if neither (combo of true and false), switch toggle_detail_all to indeterminate
            else {
                $input.bootstrapSwitch('indeterminate', true)
            }

        }

    };

    // checks if all comments are shown/hidden/mix and marks 'comments' trigger as appropriate
    ING.execution.toggle_toggle_comment_all = function () {

        var $steps = ING.execution.get_all_steps(),
            $input = $("input#toggle_comment_all"),
            all_true = true,
            all_false = true;

        // if there are no $steps, switch toggle_comment_all to false
        if ($steps.length == 0) {
            $input.bootstrapSwitch('state', false)
        }

        // else there are $steps
        else {

            // iterate through each step and see if they're all_true, all_false, or a combo
            $steps.each(function () {
                $(this).data('comment-shown') ? all_false = false : all_true = false;
            });

            // if all_true, switch toggle_comment_all to true
            if (all_true) {
                $input.bootstrapSwitch('state', true)
            }

            // if all_true, switch toggle_comment_all to false
            else if (all_false) {
                $input.bootstrapSwitch('state', false)
            }

            // if neither (combo of true and false), switch toggle_comment_all to indeterminate
            else {
                $input.bootstrapSwitch('indeterminate', true)
            }

        }

    };

    // enable/disable play button based on whether or not there are executable steps in the canvas
    ING.execution.toggle_play_button = function () {
        $('button#manual_button_play').prop('disabled', !ING.execution.has_executable_steps());
    };

    // checks state of #toggle_detail_all; on indeterminate, default to true
    ING.execution.is_toggle_detail_all = function () {
        var $toggle_detail_all = $('input#toggle_detail_all');
        return !($toggle_detail_all.bootstrapSwitch('state') == false && $toggle_detail_all.bootstrapSwitch('indeterminate') == false);
    };

    // checks state of #toggle_comment_all; on indeterminate, default to false
    ING.execution.is_toggle_comment_all = function () {
        var $toggle_comment_all = $('input#toggle_comment_all');
        return $toggle_comment_all.bootstrapSwitch('state') == true && $toggle_comment_all.bootstrapSwitch('indeterminate') == false;
    };

    // renumber steps in canvas with given array of objects that contain 'elem_id' and corresponding 'number'
    ING.execution.renumber_canvas = function (element_objects) {
        element_objects.forEach(function (element_object) {
            if (typeof element_object.elem_id !== 'undefined' && typeof element_object.number !== 'undefined') {
                $('#' + element_object.elem_id).children('.step_number').text(element_object.number);
            }
        });
    };

    /**
     * -------------------------------------------------------------------------------------------------------------
     * functions for $step operations
     * -------------------------------------------------------------------------------------------------------------
     */

    // initialize a large (right-side) given $step
    ING.execution.step_initialize = function ($step) {
        // check if small_step has already been initialized
        if (!$step.data('initialized')) {

            // mark $step as initialized
            $step.data('initialized', true);

            if (!$step.data('has-executed')) {
                ING.execution.step_show_form($step);
            }

            // if $step is executable, add listeners to execution buttons
            if ($step.data('is-executable')) {

                $step.find('.execution_previous_step_button').first().on('click', function () {
                    ING.execution.deactivate_step($step);
                    const $previous_step = ING.execution.get_previous_not_executed_executable_step($step);
                    ING.execution.activate_step($previous_step);
                });

                $step.find('.execution_next_step_button').first().on('click', function () {
                    ING.execution.deactivate_step($step);
                    const $next_step = ING.execution.get_next_not_executed_executable_step($step);
                    ING.execution.activate_step($next_step);
                });

                $step.find('.execution_execute_step_button').first().on('click', function () {
                    ING.execution.execute_step($step);
                });

                $step.find('.execution_jump_to_step_button').first().on('click', function () {
                    const $active_step = ING.execution.get_active_executable_step();
                    ING.execution.deactivate_step($active_step);
                    ING.execution.activate_step($step);
                });

            }

            $step.find('.step_remove_button').first().on('click', function () {
                ING.execution.step_remove($step);
            });
            
            $step.find('.show_step_detail_button').first().on('click', function () {
                $step.data('detail-shown') ? ING.execution.step_hide_detail($step) : ING.execution.step_show_detail($step);
            }).data('detail-shown', true);
            
            $step.find('.hide_step_detail_button').first().on('click', function () {
                $step.data('detail-shown') ? ING.execution.step_hide_detail($step) : ING.execution.step_show_detail($step);
            }).data('detail-shown', true);

            $step.find('.step_comment_button').first().on('click', function () {
                $step.data('comment-shown') ? ING.execution.step_hide_comment($step) : ING.execution.step_show_comment($step);

                var data = {
                    'element_id': $step.data('element-id'),
                    'element_type_id': $step.data('element-type-id'),
                    'execution_id': $step.data('execution-id')
                };

                $.ajax({
                    beforeSend: function (xhr, settings) {
                        xhr.setRequestHeader("X-CSRFToken", ING.utils.csrfToken());
                    },
                    url: "/core/elements/comments/element/",
                    method: "POST",
                    data: data,
                    dataType: "JSON",
                    success: function (result, status) {
                        $step.find('.step_comment').html(result.html);
                    },
                    error: function (result, textStatus, errorThrown) {
                    },
                    complete: function (result, status) {
                    }
                });

            }).data('comment-shown', true);

            (ING.execution.is_toggle_detail_all()) ? ING.execution.step_show_detail($step) : ING.execution.step_hide_detail($step);
            (ING.execution.is_toggle_comment_all()) ? ING.execution.step_show_comment($step) : ING.execution.step_hide_comment($step);

        }

        // return the $step
        return $step;

    };

    // add new $step
    ING.execution.step_add = function ($step) {
        // show notify_status
        $step.notify_status(ING.execution.notify_states.loading);

        // ajax call to populate $step_detail
        $.ajax({
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", ING.utils.csrfToken());
            },
            url: $step.data('add-url'),
            method: 'POST',
            data: {
                'insert_after_id': ING.execution.get_insert_after_id($step),
                'level': ING.execution.get_level($step)
            },
            success: function (result, status) {

                // retrieve parts of the dom
                var $steps_javascript = $('div#steps_javascript');

                // populate javascript for $step
                if (typeof result.javascript !== 'undefined') {

                    // determine if javascript for this $step type has already been added to page
                    var javascript_already_loaded = Boolean($steps_javascript.children('script').filter(function () {
                        return $(this).data('element-type-id') == $step.data('element-type-id');
                    }).length);

                    // if javascript hasn't already been added to page, add it
                    if (!javascript_already_loaded) {
                        $steps_javascript.append(result.javascript);
                    }

                }

                // populate $step inner
                if (typeof result.html !== 'undefined') {
                    $step.html(result.html);
                }

                // uniquely identify element
                if (typeof result.element !== 'undefined' && typeof result.element.elem !== 'undefined') {
                    $step.attr('id', result.element.elem.elem_id);
                    $step.data('element-id', result.element.elem.elem_id);
                    $step.data('execution-id', result.element.elem.execution_id);
                }

                // renumber steps
                if (typeof result.element !== 'undefined' && typeof result.element.numbers !== 'undefined') {
                    ING.execution.renumber_canvas(result.element.numbers);
                }

                // initialize $step
                ING.execution.step_initialize($step);

                // hide notify_status
                $step.notify_status('hide');

                // trigger an event 'step.added' on $steps_canvas
                $('ol#steps_canvas').triggerHandler('step.added', $step);

            },
            error: function (result, textStatus, errorThrown) {

                var error_details = 'There was an error adding the step<br />Please try again';
                if (result.responseJSON.errors) {
                    try {
                        error_details += "<br /><br />" + JSON.parse(result.responseJSON.errors).message;
                    } catch(e) {}
                }

                // notify user that there has been an error
                $.notify_status('error', {
                    dismissible: true,
                    details: error_details
                });

                // remove $step
                $step.hide().remove();

            }
        });

        // return the $step
        return $step;

    };

    // remove a given $step
    ING.execution.step_remove = function ($step) {
        var children_count = ING.execution.get_children_count($step);
        var term = (children_count == 1) ? 'child' : 'children';

        // get all possible reasons why we should alert user before deleting $step
        var error = [];
        if (ING.execution.get_title_has_changed($step)) {
            error.push('<li>The <strong>title</strong> of this step has been modified</li>');
        }
        if (ING.execution.get_description_has_changed($step)) {
            error.push('<li>The <strong>description</strong> of this step has been modified</li>');
        }
        if (ING.execution.is_step_active($step)) {
            error.push('<li>This step is currently <strong>active</strong> in execution</li>');
        }

        if (ING.execution.is_step_executing($step)) {
            error.push('<li>This step is currently <strong>executing</strong></li>');
        }

        if (children_count) {
            error.push('<li>This step has <strong>' + children_count + ' ' + term + '</strong></li>');
        }
        if (error.length) {
            error.push('</ul>');
            error.unshift('<ul>');
            error.unshift('<p>Are you sure you want to delete this step?</p>');
        }

        // if $step has any errors, confirm that the user really wants to delete it
        if (error.length) {
            bootbox.confirm({
                title: 'Delete?',
                message: error.join(''),
                buttons: {
                    confirm: {
                        label: 'Yes, Delete It',
                        className: 'btn-primary'
                    },
                    cancel: {
                        label: 'Cancel',
                        className: 'btn-default pull-left'
                    }
                },
                callback: function (result) {
                    if (result) {
                        confirm_remove($step);
                    }
                }
            });
        }

        // if $step has no errors, just delete it
        else {
            confirm_remove($step)
        }

        // actually does the delete thing
        function confirm_remove($step) {


            // ajax call to remove $step
            $.ajax({
                beforeSend: function (xhr, settings) {
                    xhr.setRequestHeader("X-CSRFToken", ING.utils.csrfToken());
                },
                url: $step.data('remove-url'),
                method: 'POST',
                data: {
                    'element_id': $step.data('element-id'),
                    'element_type_id': $step.data('element-type-id'),
                    'execution_id': $step.data('execution-id'),
                    'procedure_id': $step.data('procedure-id')
                },
                success: function (result, status) {

                    // if $step was activated, go to next not-executed executable $step
                    if (ING.execution.is_step_active($step)) {
                        const $next_step = ING.execution.get_next_not_executed_executable_step($step);
                        ING.execution.activate_step($next_step);
                    }

                    // hide $step
                    $step.hide();

                    // remove $step element from dom
                    $step.remove();

                    // renumber steps
                    if (typeof result.element !== 'undefined' && typeof result.element.numbers !== 'undefined') {
                        ING.execution.renumber_canvas(result.element.numbers);
                    }

                    // trigger an event 'step.removed' on $steps_canvas
                    $('ol#steps_canvas').triggerHandler('step.removed');

                },
                error: function (result, textStatus, errorThrown) {
                    let message = result.responseJSON.element.message;
                    if (!message) {
                        message = 'There was an error deleting the step<br />Please try again'
                    }
                    // notify user that there has been an error
                    $.notify_status('error', {
                        dismissible: true,
                        details: message
                    });

                }
            });

        }

    };

    // move a given $step
    ING.execution.step_move = function ($step) {
        // ajax call to remove $step
        $.ajax({
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", ING.utils.csrfToken());
            },
            url: $step.data('move-url'),
            method: 'POST',
            data: {
                'insert_after_id': ING.execution.get_insert_after_id($step),
                'level': ING.execution.get_level($step),
                'execution_id': $step.data('execution-id'),
                'procedure_id': $step.data('procedure-id'),
                'element_id': $step.data('element-id'),
                'element_type_id': $step.data('element-type-id')
            },
            success: function (result, status) {

                // renumber steps
                if (typeof result.element !== 'undefined' && typeof result.element.numbers !== 'undefined') {
                    ING.execution.renumber_canvas(result.element.numbers);
                }

                // trigger an event 'step.moved' on $steps_canvas
                $('ol#steps_canvas').triggerHandler('step.moved', $step);

            },
            error: function (result, textStatus, errorThrown) {

                // notify user that there has been an error
                $.notify_status('error', {
                    dismissible: true,
                    details: 'There was an error moving the step<br />Please try again'
                });

                // move $step back to its original location
                ING.execution.move_to_location($step, $step.data('insert_after_id'), $step.data('level'));

            }
        });

    };

    ING.execution.toggle_executed_step_results = function($step) {
        $step.find('.execution-results-row').toggle();
        $step.find('span.step-detail-execution-label-text').toggle();
        $step.find('span.step-detail-execution-label-counter').toggleClass('hidden');
    };

    // move a given $step to a specific location (mostly for returning a step back to where it came from)
    ING.execution.move_to_location = function ($step, insert_after_id, level) {

        // place $step at top of $steps_canvas
        if (insert_after_id === '-1') {
            $('#steps_canvas').prepend($step);
        }

        // place $step after $step described by insert_after_id
        else if (level === 'SIBLING') {
            $('#' + insert_after_id).after($step);
        }

        // place $step inside and at top of $step described by insert_after_id
        else {
            $('#' + insert_after_id).children('.step_nested').prepend($step);
        }

    };

    // show $step_detail for a given $step
    ING.execution.step_show_detail = function ($step) {

        // show any element with class step_show_details
        $step.find('.step_show_details').show();

        // hide form if step has already executed
        if ($step.data('has-executed')) {
            ING.execution.step_hide_form($step);
        }

        // swap button from 'show_detail' to 'hide_detail'
        $step.find('.show_step_detail_button').first().removeClass('show_step_detail_button').addClass('hide_step_detail_button');

        // mark step as detail-shown == true
        $step.data('detail-shown', true);

        // add .step_expanded and remove .step_collapsed
        $step.addClass('step_expanded');
        $step.removeClass('step_collapsed');

        // show_detail all nested steps
        $step.find('.step').each(function () {
            ING.execution.step_show_detail($(this));
        });

        // checks if all details are shown/hidden/mix and marks 'details' trigger as appropriate
        ING.execution.toggle_toggle_detail_all();

    };

    ING.execution.step_show_form = function ($step) {
        $step.find('.step_detail.step_show_details').show();
        $step.find('.step_detail.step_show_details').removeClass('hidden');
    };

    ING.execution.step_hide_form = function ($step) {
        $step.find('.step_detail.step_show_details').hide();
    };

    // hide $step_detail for a given $step
    ING.execution.step_hide_detail = function ($step) {

        // hide any element with class step_show_details
        $step.find('.step_show_details').hide();

        // swap button from 'hide_detail' to 'show_detail'
        $step.find('.hide_step_detail_button').first().removeClass('hide_step_detail_button').addClass('show_step_detail_button');

        // mark step as detail-shown == false
        $step.data('detail-shown', false);

        // remove .step_expanded and add .step_collapsed
        $step.removeClass('step_expanded');
        $step.addClass('step_collapsed');

        // hide_detail all nested steps
        $step.find('.step').each(function () {
            ING.execution.step_hide_detail($(this));
        });

        // checks if all details are shown/hidden/mix and marks 'details' trigger as appropriate
        ING.execution.toggle_toggle_detail_all();

    };

    // show $step_comment for a given $step
    ING.execution.step_show_comment = function ($step) {

        // slide down $step_comment
        $step.find('.step_comment').first().show();

        // mark step as comment-shown == true
        $step.data('comment-shown', true);

        // checks if all comments are shown/hidden/mix and marks 'comments' trigger as appropriate
        ING.execution.toggle_toggle_comment_all();

    };

    // hide $step_comment for a given $step
    ING.execution.step_hide_comment = function ($step) {

        // slide up $step_comment
        $step.find('.step_comment').first().hide();

        // mark step as comment-shown == false
        $step.data('comment-shown', false);

        // checks if all comments are shown/hidden/mix and marks 'comments' trigger as appropriate
        ING.execution.toggle_toggle_comment_all();

    };

    ING.execution.change_step_form = function($form, callbacks) {
        $form.on('change', function () {
            var $last_updated_error = $form.closest('.step').first().find('.last_updated_error').first();
            var $last_updated_time = $form.closest('.step').first().find('.last_updated_time').first();
            $.ajax({
                beforeSend: function (xhr, settings) {
                    xhr.setRequestHeader("X-CSRFToken", ING.utils.csrfToken());
                },
                url: '/core/elements/update/content/element/',
                method: 'POST',
                data: $form.serialize(),
                dataType: 'JSON',
                success: function (result, status) {
                    $last_updated_error.empty().hide();
                    $last_updated_time.html("<span class='glyphicon glyphicon-floppy-disk'></span> Last Updated: " + result.last_updated);

                    if(callbacks) {
                        var success_callback = callbacks["success_callback"];
                        if (typeof success_callback === "function") {
                            success_callback($form, result, status);
                        }
                    }
                },
                error: function (response, textStatus, errorThrown) {
                    var result = $.parseJSON(response.responseText);

                    $last_updated_error.html(result.error).show();

                    if(callbacks) {
                        var error_callback = callbacks["error_callback"];
                        if (typeof error_callback === "function") {
                            error_callback($form, result, textStatus, errorThrown);
                        }
                    }
                },
                complete: function (response, textStatus) {
                    if(callbacks) {
                        var complete_callback = callbacks["complete_callback"];
                        if (typeof complete_callback === "function") {
                            complete_callback($form, response, textStatus);
                        }
                    }
                }
            });
        });
    };

    /**
     * -------------------------------------------------------------------------------------------------------------
     * functions for $step traversal
     * -------------------------------------------------------------------------------------------------------------
     */

    ING.execution.get_all_steps = function () {
        return ING.execution.get_children($('#steps_canvas'));
    };

    ING.execution.get_all_step_containers = function () {
        return $('#steps_canvas, #steps_canvas .step_nested');
    };

    ING.execution.get_children = function (el) {
        var $all_children = $();
        var $element = (el.is('li')) ? el.children('.step_nested') : el;
        $element.children('.step').each(function (index, step) {
            $all_children = $all_children.add($(step));
            var $step_nested = $(step).children('.step_nested');
            if ($step_nested) {
                $all_children = $all_children.add(ING.execution.get_children($step_nested));
            }
        });
        return $all_children;
    };

    ING.execution.get_children_count = function ($el) {
        return ING.execution.get_children($el).length;
    };

    ING.execution.has_children = function ($el) {
        return Boolean(ING.execution.get_children($el).length);
    };

    ING.execution.get_previous_step = function ($step) {
        return $step.prev('.step');
    };

    ING.execution.get_parent_step = function ($step) {
        return $step.parent('.step_nested').parent('.step');
    };

    ING.execution.has_previous_step = function ($step) {
        return Boolean(ING.execution.get_previous_step($step).length);
    };

    ING.execution.has_parent_step = function ($step) {
        return Boolean(ING.execution.get_parent_step($step).length);
    };

    ING.execution.is_first_step = function ($step) {
        return (!ING.execution.has_previous_step($step) && !ING.execution.has_parent_step($step));
    };

    ING.execution.get_insert_after_id = function ($step) {
        if (ING.execution.has_previous_step($step)) {
            return ING.execution.get_previous_step($step).data('element-id');
        } else if (ING.execution.has_parent_step($step)) {
            return ING.execution.get_parent_step($step).data('element-id');
        } else {
            return -1;
        }
    };

    ING.execution.get_level = function ($step) {
        return (ING.execution.has_previous_step($step)) ? "SIBLING" : "CHILD";
    };

    ING.execution.get_title_has_changed = function ($step) {
        return !$step.find('.step_title').first().hasClass('editable-empty');
    };

    ING.execution.get_description_has_changed = function ($step) {
        return !$step.find('.step_description').children('.description_wysiwyg_content').first().is(':empty');
    };

    /**
     * -------------------------------------------------------------------------------------------------------------
     * functions for executable $step traversal
     * -------------------------------------------------------------------------------------------------------------
     */

    ING.execution.get_executable_steps = function () {
        return ING.execution.get_all_steps().filter(function () {
            return $(this).data('is-executable') == true;
        });
    };

    ING.execution.get_executable_steps_count = function () {
        return ING.execution.get_executable_steps().length;
    };

    ING.execution.has_executable_steps = function () {
        return Boolean(ING.execution.get_executable_steps().length);
    };

    ING.execution.get_not_executed_executable_steps = function () {
        return ING.execution.get_executable_steps().filter(function () {
            const $step = $(this);
            return ING.execution.is_step_executed($step) !== true; //  ==false || ==undefined
        });
    };

    ING.execution.get_not_executed_executable_steps_count = function () {
        return ING.execution.get_not_executed_executable_steps().length;
    };

    ING.execution.has_not_executed_executable_steps = function () {
        return Boolean(ING.execution.get_not_executed_executable_steps().length);
    };

    ING.execution.scroll_to_active_executable_step = function () {
        var $step = ING.execution.get_active_executable_step();
        $(window).scrollTo($step, 500, {'offset': {'top': -200}});
        return $step;
    };

    ING.execution.get_first_executable_step = function () {
        return ING.execution.get_executable_steps().eq(0);
    };

    ING.execution.get_first_not_executed_executable_step = function () {
        return ING.execution.get_not_executed_executable_steps().eq(0);
    };

    ING.execution.get_active_executable_step = function () {
        return ING.execution.get_executable_steps().filter(function () {
            const $step = $(this);
            return ING.execution.is_step_active($step) === true;
        });
    };

    ING.execution.get_next_executable_step = function ($step) {
        var $steps = ING.execution.get_executable_steps();
        return $steps.eq($steps.index($step) + 1);
    };

    ING.execution.get_previous_executable_step = function ($step) {
        var $steps = ING.execution.get_executable_steps();
        var index = $steps.index($step);
        return (index === 0) ? $() : $steps.eq(index - 1);
    };

    ING.execution.get_next_not_executed_executable_step = function($step) {
        var $next_step = ING.execution.get_next_executable_step($step);
        if (ING.execution.is_step_executed($next_step)) {
            $next_step = ING.execution.get_next_not_executed_executable_step($next_step);
        }
        return ($next_step.length) ? $next_step : $();
    };

    ING.execution.get_previous_not_executed_executable_step = function ($step) {
        var $previous_step = ING.execution.get_previous_executable_step($step);
        if (ING.execution.is_step_executed($previous_step)) {
            $previous_step = ING.execution.get_previous_not_executed_executable_step($previous_step);
        }
        return ($previous_step.length) ? $previous_step : $();
    };

    ING.execution.has_next_executable_step = function ($step) {
        return (ING.execution.get_next_executable_step($step).length);
    };

    ING.execution.has_previous_executable_step = function ($step) {
        return (ING.execution.get_previous_executable_step($step).length);
    };

    ING.execution.has_next_not_executed_executable_step = function ($step) {
        return (ING.execution.get_next_not_executed_executable_step($step).length);
    };

    ING.execution.has_previous_not_executed_executable_step = function ($step) {
        return (ING.execution.get_previous_not_executed_executable_step($step).length);
    };

    /**
     * -------------------------------------------------------------------------------------------------------------
     * functions for execution
     * -------------------------------------------------------------------------------------------------------------
     */

    ING.execution.start_manual_play = function () {
        ING.execution.mark_execution_as_active();
        ING.execution.deactivate_all_steps();
        const $next_step = ING.execution.get_first_not_executed_executable_step();
        ING.execution.activate_step($next_step);
        ING.execution.update_execution_status();
    };

    ING.execution.halt_manual_play = function () {
        const $active_step = ING.execution.get_active_executable_step();
        ING.execution.halt_step($active_step, function () {
            ING.execution.deactivate_all_steps();
            ING.execution.mark_execution_as_not_active();
            ING.execution.update_execution_status();
        });
    };

    ING.execution.end_manual_play = function (event) {
        const execution_id = $(event.target).data("execution-id");
        ING.execution.halt_manual_play();
        ING.execution.alert_status_of_execution(execution_id);
    };

    ING.execution.mark_execution_as_active = function () {
        $('#execution_page').addClass('execution_active');
    };

    ING.execution.mark_execution_as_not_active = function () {
        $('#execution_page').removeClass('execution_active');
    };

    ING.execution.is_execution_active = function () {
        return $('#execution_page').hasClass('execution_active');
    };

    ING.execution.mark_execution_as_executing = function () {
        $('#execution_page').data('execution_executing', true);
    };

    ING.execution.mark_execution_as_not_executing = function () {
        $('#execution_page').data('execution_executing', false);
    };

    ING.execution.is_execution_executing = function () {
        return $('#execution_page').data('execution_executing');
    };

    ING.execution.mark_step_as_active = function ($step) {
        $('ol#steps_canvas').trigger('step.active', $step);
        return $step.addClass('step_active').data('step-active', true);
    };

    ING.execution.mark_step_as_not_active = function ($step) {
        if ($step.data('has-executed-at-some-point')) {
            ING.execution.mark_step_as_executed($step);
        }
        $('ol#steps_canvas').trigger('step.not_active', $step);
        return $step.removeClass('step_active').data('step-active', false);
    };

    ING.execution.is_step_active = function ($step) {
        return $step.data('step-active');
    };

    ING.execution.mark_step_as_executing = function ($step) {
        ING.execution.mark_execution_as_executing();
        $('ol#steps_canvas').trigger('step.executing', $step);
        return $step.data('step-executing', true);
    };

    ING.execution.mark_step_as_not_executing = function ($step) {
        $('ol#steps_canvas').trigger('step.not_executing', this);
        ING.execution.mark_execution_as_not_executing();
        return $step.data('step-executing', false);
    };

    ING.execution.is_step_executing = function ($step) {
        return $step.data('step-executing');
    };

    ING.execution.mark_step_as_executed = function ($step) {
        $('ol#steps_canvas').trigger('step.executed', $step);
        $step.data('has-executed-at-some-point', true);
        return $step.data('has-executed', true);
    };

    ING.execution.mark_step_as_not_executed = function ($step) {
        $('ol#steps_canvas').trigger('step.not_executed', $step);
        return $step.data('has-executed', false);
    };

    ING.execution.is_step_executed = function ($step) {
        return $step.data('has-executed');
    };

    ING.execution.execute_step = function ($step) {
        var $execution_form = $step.find('.execution_form');

        // if no $step, fail gracefully
        if (!$step.length) {
            return;
        }

        // if formValidation has been initialized
        if (typeof $execution_form.data('formValidation') != 'undefined') {

            // if form is not valid, prevent execution
            if (!$execution_form.data('formValidation').validate().isValid()) {
                return;
            }

        }

        if ($step.data('has-executed')) {
            $step.find('.step_status').hide();
        }

        // show notify_status
        $step.notify_status(ING.execution.notify_states.executing);

        // indicate that $step is currently executing
        ING.execution.mark_step_as_executing($step);

        // make the request to execute $step
        $.ajax({
            beforeSend: function (xhr, settings) {
                xhr.setRequestHeader("X-CSRFToken", ING.utils.csrfToken());
            },
            url: '/core/elements/run/element/',
            method: 'POST',
            data: $step.find('.execution_execute_step_button').data('params'),
            dataType: 'JSON',
            success: function (step_result, textStatus) {
                var result = null;
                if (typeof step_result.execution === 'object' && step_result.execution !== undefined) {
                    result = step_result.execution;
                }

                // if result.meta_data exists in result
                if (result !== null && typeof result.meta_data === 'object' && result.meta_data !== undefined) {

                    // choose the correct notify_state
                    var status;
                    if (result.meta_data.status === 'PASS') {
                        status = ING.execution.notify_states.execution_pass;
                    } else if (result.meta_data.status === 'FAIL') {
                        status = ING.execution.notify_states.execution_fail;
                    } else if (result.meta_data.status === 'ERROR') {
                        status = ING.execution.notify_states.execution_error;
                    } else {
                        status = ING.execution.notify_states.execution_unknown;
                    }

                    // show notify_status
                    $step.notify_status($.extend({}, status, {
                        'callback': function () {

                            // if result.html exists in result
                            if (typeof step_result.html === 'string' && step_result.html.trim() !== '') {
                                var $alert = $($.parseHTML(step_result.html));
                                $step.children('.step_status').html($alert);
                                // temporarily swallow the error this is generating TODO: troubleshoot up_flash
                                try {
                                    $alert.up_flash();
                                } catch (error) {}
                                $step.find('.step_status').show();
                                // $alert.find('.step-detail-execution-label').removeClass('invisible');
                            }

                        }
                    }));

                    // on a pass or fail
                    if (result.meta_data.status === 'PASS' || result.meta_data.status === 'FAIL') {

                        // hide form elements for post-execution view
                        ING.execution.step_hide_form($step);

                        // remove delete button
                        $step.children('.step_remove_button').remove();

                        // indicate that $step is no longer executing
                        ING.execution.mark_step_as_not_executing($step);

                        // mark step as executed
                        ING.execution.mark_step_as_executed($step);

                    }

                }

                // else result.meta_data does not exist in result, and we know nothing about the status of the execution
                else {

                    // show notify_status
                    $step.notify_status(ING.execution.notify_states.execution_error);

                }

            },
            error: function (response, textStatus, errorThrown) {

                // indicate that $step is no longer executing
                ING.execution.mark_step_as_not_executing($step);

                var result = $.parseJSON(response.responseText);

                // show notify_status
                $step.notify_status($.extend({}, ING.execution.notify_states.execution_error, {
                    'details': result.message
                }));

            },
            complete: function (result, status) {

                // wait a second so that user feels good about the fact that the execution has done its thing
                setTimeout(function () {

                    // deactivate current executable $step
                    ING.execution.deactivate_step($step);

                    // go to next not-executed executable $step
                    const $next_step = ING.execution.get_next_not_executed_executable_step($step);
                    ING.execution.activate_step($next_step);

                }, 1000);

            }
        });

    };

    ING.execution.halt_step = function ($step, callback) {

        // if this is actually a $step
        if ($step.length) {

            // show notify_status
            $step.notify_status(ING.execution.notify_states.halting);

            // retrieve information about $step
            var element_id = $step.data('element-id');
            var element_type_id = $step.data('element-id');
            var execution_id = $step.data('execution-id');

            $.ajax({
                beforeSend: function (xhr, settings) {
                    xhr.setRequestHeader("X-CSRFToken", ING.utils.csrfToken());
                },
                url: '/core/execution/' + execution_id + '/halt/step/',
                method: 'POST',
                data: {"execution_id": execution_id},
                dataType: 'JSON',
                success: function (result, status) {

                    // show notify_status
                    $step.notify_status(ING.execution.notify_states.halted);

                    // indicate that $step is no longer executing
                    ING.execution.mark_step_as_not_executing($step);

                },
                error: function (result, textStatus, errorThrown) {

                    // show notify_status
                    $step.notify_status(ING.execution.notify_states.halting_error);

                    // indicate that $step is no longer executing
                    ING.execution.mark_step_as_not_executing($step);

                },
                complete: function (result, status) {

                    // execute any callback, if it exists
                    if (typeof callback === 'function' && callback !== null) {
                        callback();
                    }

                }
            });

        }

        // not actually a $step
        else {

            // indicate that execution is no longer executing
            ING.execution.mark_execution_as_not_executing();

            // execute any callback, if it exists
            if (typeof callback === 'function' && callback !== null) {
                callback();
            }

        }

    };

    ING.execution.activate_step = function ($step) {

        ING.execution.toggle_next_previous_step_buttons();

        // if this is actually a $step
        if ($step.length) {

            // show form if hidden
            ING.execution.step_show_form($step);

            ING.execution.mark_execution_as_active();

            // if $step has already been executed, ask user if they really want to re-run it
            if (ING.execution.is_step_executed($step)) {
                bootbox.confirm({
                    title: 'Re-execute?',
                    message: 'This step has already been executed; Are you sure you want to run it again?',
                    buttons: {
                        confirm: {
                            label: 'Yes',
                            className: 'btn-primary'
                        },
                        cancel: {
                            label: 'No, go to next executable step',
                            className: 'btn-default pull-left'
                        }
                    },
                    callback: function (result) {
                        if (result) {

                            // show step result details
                            ING.execution.toggle_executed_step_results($step);

                            // user has agreed; activate the $step
                            confirm_activate_step($step);

                        }
                        else {

                            // go to next not-executed executable $step
                            const $next_step = ING.execution.get_next_not_executed_executable_step($step);
                            ING.execution.activate_step($next_step);

                        }
                    }
                });
            }

            // else $step hasn't already been executed; activate the $step
            else {
                confirm_activate_step($step);
            }

            return $step;

        }

        // activate the $step
        function confirm_activate_step($step) {

            // if $step was already executed
            if (ING.execution.is_step_executed($step)) {

                // mark step as not executed
                ING.execution.mark_step_as_not_executed($step);

            }

            // hide notify_status
            $step.notify_status('hide');

            // mark $step as active
            ING.execution.mark_step_as_active($step);

            // scroll to $step
            $(window).scrollTo($step, 500, {
                'offset': {'top': -200},
                'onAfter': function () {
                    $step.find('.execution-input').first().focus();
                }
            });

        }

    };

    ING.execution.deactivate_step = function ($step) {
        ING.execution.mark_step_as_not_active($step);
        return $step;
    };

    ING.execution.deactivate_all_steps = function () {
        ING.execution.get_executable_steps().filter(function () {
            const $step = $(this);
            return ING.execution.is_step_active($step) === true;
        }).each(function () {
            ING.execution.deactivate_step($(this));
        });
    };

    ING.execution.alert_status_of_execution = function (execution_id) {
        var $steps = ING.execution.get_not_executed_executable_steps(),
            title = '',
            message = '';

        // if there are still not-executed executable $steps
        if ($steps.length) {
            title = $steps.length + ' haven\'t been executed!';
            message = '<p>The following steps have not been executed:</p><table class="table"><thead><tr><th>Number</th><th>Title</th></tr></thead><tbody id="alert_status_of_execution"></tbody></table>';
        }

        // else there no not-executed executable $steps
        else {
            title = 'Are you done?';
            message = 'There are no steps to be executed.  If you are sure that you are done with this execution, press the "Close Execution" button.';
        }

        // show confirm bootbox
        var confirm = bootbox.confirm({
            title: title,
            message: message,
            buttons: {
                confirm: {
                    label: 'Close Execution',
                    className: 'btn-danger'
                },
                cancel: {
                    label: 'Cancel',
                    className: 'btn-default pull-left'
                }
            },
            callback: function (result) {
                // if user confirms
                if (result) {
                    $.ajax({
                        beforeSend: function (xhr, settings) {
                            xhr.setRequestHeader("X-CSRFToken", ING.utils.csrfToken());
                        },
                        url: "/core/execution/" + execution_id + "/close/",
                        method: "POST",
                        data: {},
                        dataType: "JSON",
                        success: function (result, status) {
                            // TODO: notify_status
                            var redirect_url = "/execute/history/" + execution_id + "/";
                            window.location.replace(redirect_url);
                        },
                        error: function (result, textStatus, errorThrown) {
                            // TODO: ENG if there is an error throw up an error message
                        },
                        complete: function (result, status) {
                        }
                    });
                }
                // if user cancels
                else {
                    confirm.modal('hide');
                }
            }
        });

        // if there are still not-executed executable $steps, populate them into list of not-executed executable $steps
        if ($steps.length) {
            confirm.init(function () {
                $steps.each(function (index, step) {
                    var number = $(step).children('.step_number').text(),
                        title = $(step).children('.step_title').hasClass('editable-empty') ? '<em>No Title</em>' : $(step).children('.step_title').text(),
                        link = $($.parseHTML('<tr><td><a href="#" class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-screenshot"></span> &nbsp; ' + number + '</a></td><td>' + title + '</td></tr>'));
                    $('#alert_status_of_execution').append(link.click(function (e) {
                        e.preventDefault();
                        ING.execution.deactivate_all_steps();
                        ING.execution.activate_step($(step));
                        confirm.modal('hide');
                    }));
                });
            });
        }

    };


    ING.execution.populate_wysiwyg_content_block = function ($content, html, was_updated, is_edit_mode) {
        const delay = 250;
        var $new_content = $($.parseHTML(html)).hide();
        var $old_content = $content.contents().filter(':visible').filter(':not(.notify_status)');
        $content.css('min-height', $content.outerHeight());
        if ($old_content.length) {
            $old_content.fadeOut(delay, function () {
                populate();
            });
        } else {
            populate();
        }
        $content.parent('.description_wysiwyg').toggleClass('description_wysiwyg_edit', is_edit_mode);

        function populate() {
            $content.notify_status('hide');
            $content.html($new_content);
            $content.animate({'min-height': 0}, delay);
            $new_content.fadeIn(delay, function () {
                if (was_updated) {
                    $content.up_flash_background({color: 'rgb(57, 255, 20)'});
                }
            });
        }
    };



    ING.execution.init_up_added_listeners(); // these have to execute before document ready
    $(document).ready(ING.execution.init);

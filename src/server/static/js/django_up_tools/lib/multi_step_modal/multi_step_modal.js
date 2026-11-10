(function ($) {

    var html = {
        modal: '<div class="modal fade msm--modal" tabindex="-1" role="dialog" data-backdrop="static" data-keyboard="false">' +
            '<div class="modal-dialog" role="document">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
            '<span aria-hidden="true">&times;</span>' +
            '</button>' +
            '<div class="modal-title"></div>' +
            '</div>' +
            '<div class="modal-body">' +
            '<div class="msm--body">' +
            '<div class="msm--progress-bar"></div>' +
            '<div class="msm--body-content"></div>' +
            '</div>' +
            '</div>' +
            '<div class="modal-footer"></div>' +
            '</div>' +
            '</div>' +
            '</div>',
        bar: '<div class="msm--bar"></div>',
        bar_step: '<div class="msm--bar-step">' +
            '<div class="msm--bar-step-icon"></div>' +
            '<div class="msm--bar-step-title"></div>' +
            '</div>',
        fail: '<div class="alert alert-danger">' +
            '<i class="fas fa-exclamation-triangle"></i> &nbsp;' +
            '<strong>Error</strong> &mdash; Please refresh the page and try again.' +
            '</div>'
    };

    var defaults = {
        plugin: {
            animation_duration: 200,
            hash: get_random_hash(),
            modal_size: 'md',
            progress_bar: true,
            progress_size: 'md',
            show_close: true,
            skip_backward: true,
            skip_forward: false,
            steps: [],
            title: ''
        },
        step: {
            buttons: {
                cancel: {
                    dismiss: true,
                    position: 'left',
                    text: 'Cancel'
                },
                back: {
                    text: 'Back',
                    callback: function () {
                        return go_to_back_step(this);
                    }
                },
                next: {
                    color: 'btn-primary',
                    text: 'Next',
                    callback: function () {
                        return go_to_next_step(this);
                    }
                }
            },
            button_order: [],
            csrf_token: $.cookie('csrftoken'),
            data: {},
            method: 'POST',
            modal_size: '',
            on_after_ajax: null,
            on_before_ajax: null,
            on_show: null,
            progress_bar: null,
            progress_icon: '',
            progress_size: '',
            progress_title: '',
            show_close: null,
            skip_backward: null,
            skip_forward: null,
            skip_step: false,
            title: '',
            url: '#'
        },
        button: {
            callback: null,
            clazz: '',
            color: 'btn-default',
            dismiss: false,
            id: '',
            position: 'right',
            text: '',
            visible: true
        }
    };

    //noinspection JSUnusedGlobalSymbols
    var methods = {
        initialize: function(options) {
            return initialize($(this), options);
        },
        kill: function() {
            return kill($(this));
        },
        reset: function() {
            return reset($(this));
        },
        open: function(index) {
            return go_to_step($(this), (typeof index === 'undefined') ? 0 : index);
        },
        close: function() {
            return hide_modal($(this));
        },
        get_modal: function() {
            return get_modal($(this));
        },
        get_current_step_number: function() {
            return get_current_step_number($(this));
        },
        go_to_step: function(index) {
            return go_to_step($(this), index);
        },
        go_to_next_step: function() {
            return go_to_next_step($(this));
        },
        go_to_back_step: function() {
            return go_to_back_step($(this));
        },
        add_step: function(step, index) {
            return add_step($(this), step, index);
        },
        remove_step: function(index) {
            return remove_step($(this), index);
        },
        replace_step: function(index, new_step) {
            return replace_step($(this), index, new_step);
        },
        get_data: function() {
            return get_data($(this));
        },
        update_data: function(data) {
            return update_data($(this), data);
        },
        get_step: function(index) {
            return get_step($(this), index);
        },
        update_step: function(index, step) {
            return update_step($(this), index, step);
        },
        update_step_data: function(index, data) {
            return update_step_data($(this), index, data);
        }
    };

    // this is generic and should be used for any jquery plugins in the future
    $.fn.multi_step_modal = function(method_or_options) {
        if (methods[method_or_options]) {
            return methods[method_or_options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method_or_options === 'object' || !method_or_options) {
            return methods.initialize.apply(this, arguments);
        } else {
            $.error('Method ' + method_or_options + ' does not exist in jQuery.multi_step_modal');
        }
    };

    /**
     * initialize the plugin on given $element
     *
     * @param $element      $element on page that plugin has been init'd on
     * @param options       user-declared options
     * @returns $input      original $element
     */
    function initialize($element, options) {

        // if $input is not initialized, continue with initialization
        if (!$element.data('initialized')) {

            // mark $input as initialized so that it doesn't initialize twice
            $element.data('initialized', true);

            // extend default options with user-declared options
            options = $.extend({}, defaults.plugin, options);

            // add options to $input so that they can be easily retrieved without passing parameter
            $element.data('options', options);

            // add default options to all steps; retain custom options, if applicable
            $element.data('options').steps = set_defaults_on_steps($element.data('options').steps);

            // save a copy of the options to be used if the plugin is reset
            $element.data('initialization_options', $.extend(true, {}, options));

            // set up the modal to be used by plugin
            setup_modal($element);

        }

        return $element;

    }

    /**
     * kills the entire plugin... like, the whole thing
     *
     * @param $element      $element on page that plugin has been init'd on
     * @returns $input      original $element
     */
    function kill($element) {

        // remove $modal from dom
        get_modal($element).remove();

        // mark $input as not initialized so that it can re-initialize if you want
        $element.data('initialized', false);

        // remove all options
        $element.data('options', {});

        return $element;
    }

    /**
     * resets plugin to original initialized state
     *
     * @param $element      $element on page that plugin has been init'd on
     * @returns $input      original $element
     */
    function reset($element) {

        // grab the options that were originally used at initialization
        var options = $element.data('initialization_options');

        // kill the plugin
        kill($element);

        // re-initialize the plugin
        initialize($element, options);

        return $element;
    }

    /**
     * create $modal, init listeners, set styles, place in dom
     *
     * @param $element      $element on page that plugin has been init'd on
     * @returns $modal      newly created $modal
     */
    function setup_modal($element) {

        // create $modal from html
        var $modal = $($.parseHTML(html.modal));

        // set the id of the new $modal to a random hash
        $modal.attr('id', $element.data('options').hash);

        // give $modal a way to reference back to $element
        $modal.data('element', $element);

        // place $modal on page
        $('body').prepend($modal);

        $modal.on('hidden.bs.modal', function () {
            reset_modal($element);
            $element.trigger('multi_step_modal.modal_closed', [$element, $modal]);
        });

        $modal.on('shown.bs.modal', function () {
            $element.trigger('multi_step_modal.modal_opened', [$element, $modal]);
        });

        // return $modal
        return $modal;
    }

    /**
     * reset the modal back to a default state
     *
     * @param $element      $element on page that plugin has been init'd on
     * @returns $input      original $element
     */
    function reset_modal($element) {
        set_modal_options($element);
        set_modal_body($element);
        set_modal_buttons($element);
        set_progress_bar($element);
        return $element;
    }

    /* modal helper functions --------------------------------------------------------------------------------------- */

    function get_modal($element) {
        return ($element.hasClass('modal')) ? $element : $('#' + $element.data('options').hash)
    }

    function get_modal_footer($element) {
        return get_modal($element).find('div.modal-footer').first();
    }

    /* set things in modal ------------------------------------------------------------------------------------------ */

    /**
     * sets step-specific modal options (title, size, close), and defaults to plugin options
     *
     * @param $element      either the initialized $element or $modal
     * @param index         step index; if absent, resets to default
     * @returns $element    original $element
     */
    function set_modal_options($element, index) {
        var $modal = get_modal($element),
            step = (typeof index === 'undefined') ? {} : get_step($element, index);
        // set modal title
        // var modal_title = (step.title !== '') ? step.title : $element.data('options').title;

        var modal_title = get_title_text($element.data('options'), step);

        $modal.find('div.modal-title').first().html(modal_title);
        // set modal size - first at step level, then at plugin level
        set_modal_width($element, index);
        // set close button visibility - first at step level, then at plugin level
        $modal.find('button.close').toggle((step.show_close !== null) ? step.show_close : $element.data('options').show_close);
        return $element;
    }

    function get_title_text(plugin, step) {
        var modal_title = '';
        if (typeof step.title === 'string' && step.title !== '') {
            modal_title = step.title;
        } else if (typeof step.title === 'function') {
            modal_title = step.title(plugin, step);
        } else if (typeof plugin.title === 'function') {
            modal_title = plugin.title(plugin, step);
        } else {
            modal_title = plugin.title;
        }
        return modal_title;
    }

    /**
     * creates a progress bar and puts it in $modal
     *
     * @param $element      either the initialized $element or $modal
     * @param index         step index; if absent, shows no progress bar
     * @returns $element    original $element
     */
    function set_progress_bar($element, index) {
        var $bar = $();
        if (typeof index !== 'undefined') {
            var current_step = get_step($element, index);
            // check progress_bar visibility - first at step level, then at plugin level
            if ((current_step.progress_bar !== null) ? current_step.progress_bar : $element.data('options').progress_bar) {
                var steps = $element.data('options').steps;
                $bar = $($.parseHTML(html.bar));
                for (var i = 0; i < steps.length; i++) {
                    var $step = $($.parseHTML(html.bar_step))
                        .find('.msm--bar-step-icon').html(steps[i].progress_icon).end()
                        .find('.msm--bar-step-title').html(steps[i].progress_title).end()
                        .data('index', i);
                    // future step
                    if (i > index) {
                        // if skipping forward is allowed (step-level > plugin-level), add class and listener
                        if ((current_step.skip_forward !== null) ? current_step.skip_forward : $element.data('options').skip_forward) {
                            $step.addClass('msm--bar-step-clickable').click(function() {
                                go_to_step($element, $(this).data('index'));
                            });
                        }
                    }
                    // past step
                    else if (i < index) {
                        $step.addClass('msm--bar-step-completed');
                        // if skipping backward is allowed (step-level > plugin-level), add class and listener
                        if ((current_step.skip_backward !== null) ? current_step.skip_backward : $element.data('options').skip_backward) {
                            $step.addClass('msm--bar-step-clickable').click(function() {
                                go_to_step($element, $(this).data('index'));
                            });
                        }
                    }
                    // current step
                    else {
                        $step.addClass('msm--bar-step-active');
                    }
                    $bar.append($step);
                }
                // set modal size - first at step level, then at plugin level
                var bar_size = (current_step.progress_size !== '') ? current_step.progress_size : $element.data('options').progress_size;
                $bar.removeClass('msm--bar-sm msm--bar-md msm--bar-lg');
                $bar.addClass('msm--bar-' + bar_size);
            }
        }
        get_modal($element).find('div.msm--progress-bar').first().html($bar);
        return $element;
    }

    /**
     * sets the content of the body of the modal with `html`
     *
     * @param $element      either the initialized $element or $modal
     * @param html          html to populate body with; if absent, clears body
     * @returns $element    original $element
     */
    function set_modal_body($element, html) {
        html = (typeof html === 'undefined') ? '' : html;
        var $container = get_modal($element).find('div.msm--body-content'),
            duration = $element.data('options').animation_duration,
            $old_html = $container.wrapInner('<div />').children(),
            $new_html = $($.parseHTML(html)).wrapAll('<div />').parent();
        $new_html.css({display: 'none', opacity: 0});
        $container.prepend($new_html);
        $old_html.animate({ opacity: 0 }, { duration: duration, queue: true, complete: function() {
                $old_html.slideUp(duration, function() {
                    $old_html.remove()
                });
                $new_html.slideDown(duration);
                $new_html.animate({ opacity: 1 }, { duration: duration, queue: true });
            }
        });
        return $element;
    }

    /**
     * creates modal buttons and sets options like position, text, callback, etc.
     *
     * @param $element      either the initialized $element or $modal
     * @param index         step index; if absent, resets to default
     * @returns $element    original $element
     */
    function set_modal_buttons($element, index) {

        var step = (typeof index === 'undefined') ? {} : get_step($element, index);
        var $modal = get_modal($element);
        var $footer = get_modal_footer($modal);

        if (typeof step.buttons !== 'undefined') {
            // add default options to buttons
            step.buttons = set_defaults_on_buttons($element, step.buttons);
            // if button_order is given, make sure they are shown in that order
            if (step.button_order.length !== 0) {
                var temp_buttons = {};
                for (var i = 0; i < step.button_order.length; i++) {
                    temp_buttons[step.button_order[i]] = step.buttons[step.button_order[i]];
                }
                step.buttons = temp_buttons;
            }
            // build an array of $buttons
            var $buttons = $.map(step.buttons, function(button) {
                if (button.visible) {
                    return $($.parseHTML('<button type="button" class="btn"></button>'))
                        .addClass(button.clazz + ' ' + button.color + ' ' + button.position)
                        .addClass((button.position === 'left') ? 'pull-left' : '')
                        .attr('data-dismiss', (button.dismiss) ? 'modal' : '')
                        .attr('id', button.id)
                        .text(button.text)
                        .on('click', function() {
                            if (button.callback != null && typeof button.callback === 'function') {
                                button.callback($element, step, index, $modal);
                            }
                        });
                }
            });
            // put $buttons in the $modal_footer
            $footer.html($buttons);
        }
        return $element;
    }

    /**
     * sets width of modal, first at step-level, and then at plugin-level
     *
     * @param $element      either the initialized $element or $modal
     * @param index         step index; if absent, resets to default
     * @returns $element    original $element
     */
    function set_modal_width($element, index) {
        var $modal_dialog = get_modal($element).find('.modal-dialog'),
            step = get_step($element, index),
            width = '600px',
            duration = $element.data('options').animation_duration;
        if (typeof index !== 'undefined') {
            var modal_size = (step.modal_size !== '') ? step.modal_size : $element.data('options').modal_size;
            if (modal_size === 'xs') {
                width = '400px';
            } else if (modal_size === 'lg') {
                width = '100%'
            }
        }
        $modal_dialog.animate({ width: width }, { duration: duration, queue: false });
        return $element;
    }

    /* hide/show modal ---------------------------------------------------------------------------------------------- */

    function show_modal($element, step, index) {
        var $modal = get_modal($element);
        if ($modal.is(':hidden')) {
            $modal.modal('show');
        }
        if (step.on_show != null && typeof step.on_show === 'function') {
            step.on_show($element, step, index, $modal);
        }
    }

    function hide_modal($element) {
        var $modal = get_modal($element);
        if ($modal.is(':visible')) {
            $modal.modal('hide');
        }
        return $element;
    }

    /* set defaults (non-destructively) ----------------------------------------------------------------------------- */

    function set_defaults_on_buttons($element, buttons) {
        buttons = $.extend(true, {}, buttons);
        for (var button in buttons) {
            if (buttons.hasOwnProperty(button)) {
                buttons[button] = $.extend(true, {}, defaults.button, buttons[button]);
                buttons[button]['$element'] = $element;
            }
        }
        return buttons;
    }

    function set_defaults_on_step(step) {
        return set_defaults_on_steps([$.extend(true, {}, step)])[0];
    }

    function set_defaults_on_steps(steps) {
        return $.map($.extend(true, [], steps), function(step) {
            return $.extend(true, {}, defaults.step, step);
        });
    }

    /* navigate steps ------------------------------------------------------------------------------------------------ */

    function get_current_step_number($element) {
        return get_modal_footer($element).data('current-step');
    }

    function set_current_step_number($element, index) {
        get_modal_footer($element).data('current-step', (typeof index !== 'undefined') ? index : 0);
        return $element;
    }

    function get_step($element, index) {
        return $element.data('options').steps[index];
    }

    function add_step($element, step, index) {
        index = (typeof index === 'undefined') ? 0 : index;
        step = set_defaults_on_step(step);
        $element.data('options').steps.splice(index, 0, step);
        return $element;
    }

    function remove_step($element, index) {
        $element.data('options').steps.splice(index, 1);
        return $element;
    }

    function replace_step($element, index, new_step) {
        remove_step($element, index);
        add_step($element, new_step, index);
        return $element;
    }

    function go_to_next_step($element, next_step_index) {
        $element = (typeof $element.$element !== 'undefined') ? $element.$element : $element;
        next_step_index = (typeof next_step_index !== 'undefined') ? next_step_index : get_current_step_number($element) + 1;
        var next_step = get_step($element, next_step_index);
        if (typeof next_step !== 'undefined') {
            if (next_step.skip_step) {
                return go_to_next_step($element, next_step_index + 1)
            }
            return go_to_step($element, next_step_index);
        }
        return $element;
    }

    function go_to_back_step($element, back_step_index) {
        $element = (typeof $element.$element !== 'undefined') ? $element.$element : $element;
        back_step_index = (typeof back_step_index !== 'undefined') ? back_step_index : get_current_step_number($element) - 1;
        var next_step = get_step($element, back_step_index);
        if (typeof next_step !== 'undefined') {
            if (next_step.skip_step) {
                return go_to_back_step($element, back_step_index - 1)
            }
            return go_to_step($element, back_step_index);
        }
        return $element;
    }

    function go_to_step($element, index) {
        var $modal = get_modal($element),
            $modal_content = get_modal($element).find('.modal-content'),
            step = get_step($element, index);
        if (step.skip_step) {
            return go_to_step($element, index + 1);
        }
        else {
            if (typeof step === 'undefined') return $element;
            $modal_content.notify_status('loading', {small: true});
            var ajax_request = $.ajax({
                beforeSend: function(jqXHR, settings) {
                    if (step.on_before_ajax != null && typeof step.on_before_ajax === 'function') {
                        step.on_before_ajax($element, step, index, jqXHR, settings);
                    }
                    jqXHR.setRequestHeader('X-CSRFToken', step.csrf_token);
                },
                url: step.url,
                method: step.method,
                data: step.data
            });
            ajax_request.done(function(html) {
                set_modal_options($element, index);
                set_progress_bar($element, index);
                set_current_step_number($element, index);
                set_modal_buttons($element, index);
                set_modal_body($element, html);

            });
            ajax_request.fail(function() {
                set_modal_body($element, html.fail);
            });
            ajax_request.always(function(data, textStatus, jqXHR) {
                if (step.on_after_ajax != null && typeof step.on_after_ajax === 'function') {
                    step.on_after_ajax($element, step, index, data, textStatus, jqXHR);
                }
                show_modal($element, step, index);
                $element.trigger('multi_step_modal.step_shown', [$element, $modal, step, index]);
                setTimeout(function() {
                    $modal_content.notify_status('hide');
                }, $element.data('options').animation_duration);
            });
            return $element;
        }
    }

    /* manipulate data ---------------------------------------------------------------------------------------------- */

    function get_data($element) {
        return $element.data('options');
    }

    function update_data($element, data) {
        $.extend(true, $element.data('options'), data);
        return $element;
    }

    /* update steps ------------------------------------------------------------------------------------------------- */

    function update_step($element, index, step) {
        if (typeof index !== 'undefined' && typeof step !== 'undefined' && !$.isEmptyObject(step)) {
            $.extend(true, get_step($element, index), step);
        }
        return $element;
    }

    function update_step_data($element, index, data) {
        return update_step($element, index, { data: data });
    }

    /* helpers ------------------------------------------------------------------------------------------------------ */

    function get_random_hash() {
        return Math.random().toString(36).substr(2, 8);
    }

}(jQuery));
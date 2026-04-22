import AutoScrollSingleton from "../autoscroll";

export const DragAndDrop = {
    bind: function(el, binding, vnode) {
        if (!binding.value) return false;
        if (binding.value.disabled === true) return false;

        const autoScroll = new AutoScrollSingleton();
        const dragOver = 'drag-over';
        const noDnd = 'no-dnd-events';
        let addedClass;

        const handleDragStart = function(e) {
            e.stopPropagation();

            // Set drag image so it'll be effectively invisible
            let dragImgEl = new Image();
            dragImgEl.setAttribute('style',
                'position: absolute; display: block; top: 0; left: 0; width: 0; height: 0;'
            );
            e.dataTransfer.setDragImage(dragImgEl, 0, 0);
            e.dataTransfer.effectAllowed = 'link';  // Change pointer icon on drop target (ref. https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/effectAllowed)

            // Decide which type of element is being dragged - entry or element.
            //   Unspecified type is assumed to be element.
            let draggableType = binding.value.draggableType !== undefined && binding.value !== null
                ? binding.value.draggableType : 'element';
            if (draggableType === 'entry') {
                // Value 'entryIndex' is used by entry drop event handler
                e.dataTransfer.setData('entryIndex', binding.value.entryIndex);
            } else {
                // These data will be used by the actual code that handles the drop
                if (binding.value && binding.value.elemId) {
                    e.dataTransfer.setData('elemId', binding.value.elemId);
                }
                if (binding.value && binding.value.elementPath) {
                    e.dataTransfer.setData('elementPath', binding.value.elementPath);
                }
                if (binding.value && binding.value.copy) {
                    e.dataTransfer.setData('copy', binding.value.copy);
                }
            }

            // Need to save on windows because that is the only way
            //   to transfer data between drag-target and drop-target
            window.dragAndDropDraggableType = draggableType;

            autoScroll.setup();
        };
        const handleDrop = function(e) {
            e.preventDefault();
            //e.stopPropagation();

            //e.target.classList.remove(dragOver);  // Can safely assume that addedClass == 'drag-over' at this point
            autoScroll.teardown();
            return false;
        };
        const handleDragEnd = function(e) {
            autoScroll.teardown();
        };
        const handleDragOver = function(e) {
            // Mainly prevents the default event handler from being procesed.
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        const handleDragEnter = function(e) {
            e.preventDefault();
            e.stopPropagation();
            addedClass = dragOver;
            e.target.classList.add(addedClass);
        };
        const handleDragLeave = function(e) {
            e.target.classList.remove(addedClass);
        };

        if (binding.value && binding.value.targetOnly) {        // Note, targetOnly means drop-target-only

            // XXX HandleDragEnter only adds drag-over class to its target.
            //     This is being moved to the target. Will remove this line in
            //     the future.
            //el.addEventListener('dragenter', handleDragEnter);  // fired when a dragged element enters a valid drop target

            el.addEventListener('dragover', handleDragOver);    // fired when element is beging dragged over a valid drop target

            // XXX HandleDragLeave only removes drag-over class to its target.
            //     This is being moved to the target. Will remove this line in
            //     the future.
            //el.addEventListener('dragleave', handleDragLeave);  // fired when and element leaves a valid drop target

            el.addEventListener('drop', handleDrop);            // fired when element dropped on a valid drop target
        }
        else {
            el.setAttribute('draggable', 'true');               // Make element draggable
            el.addEventListener('dragstart', handleDragStart);  // fired when user starts dragging an element
            el.addEventListener('dragend', handleDragEnd);      // fired when drag operation is being ended
        }
    }
};

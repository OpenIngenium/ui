// https://github.com/ePages-de/dnd-page-scroll

let instance = null;


class AutoScrollSingleton {
    constructor(options={}) {
        if (!instance) {
            instance = this;
        }
        this.defaults = {
            node: document.body, // whole page, can restrict it to different DOM elements
            topId: 'dnd-page-scroll-top',
            bottomId: 'dnd-page-scroll-bottom',
            namespace: '',
            delay: 25, // delay for clear/set interval (ms)
            scrollBy: 20,  // jump in pixels
            height: '75px', // size of zones
            listenGlobally: false // When set to false, only listen to drag events within node. Useful when having multiple plugin instances. Defaults to true.
        };

        this._options = {...this.defaults, ...options};
        this._options.topId += options.namespace;
        this._options.bottomId += options.namespace;
        this.scrollTarget = this._options.listenGlobally ? document : this._options.node;
        this.doScroll = null;

        // The two zones where scrolling initiates
        this.topElement = document.getElementById(this._options.topId) || AutoScrollSingleton.appendElementWithId(this._options.topId);
        this.bottomElement = document.getElementById(this._options.bottomId) || AutoScrollSingleton.appendElementWithId(this._options.bottomId);

        // When DnD occurs over a scroll area - scroll the page!
        this.triggerScroll = this._options.node === document.body
            ? amount => window.scrollBy(0, amount)
            : amount => { this._options.node.scrollTop += amount; };

        return instance;
    }

    // add listener for scroll - called in setup func
    addScrollListener(e) {
        if (this.doScroll == null) {
            this.doScroll = setInterval(() => this.triggerScroll(e.target === this.topElement ? -this._options.scrollBy : this._options.scrollBy), this._options.delay);
        }
        // Don't allow dropping on scroll areas
        e.dataTransfer.dropEffect = 'none';
        e.preventDefault();
    }

    // clears setInterval function added in addScrollListener when cursor leaves autoscroll area
    clearScrollInterval() {
        // The clearInterval() method cancels a timed, repeating action
        // which was previously established by a call to setInterval().
        clearInterval(this.doScroll);
        this.doScroll = null;
    }

    hideDragZones() {
        this.clearScrollInterval();
        AutoScrollSingleton.hide(this.topElement, this.bottomElement);
    }

    setup() {
        AutoScrollSingleton.hide(this.topElement, this.bottomElement);
        AutoScrollSingleton.css({
            position: 'fixed',
            left: 0,
            right: 0,
            height: this._options.height,
            zIndex: 999999,
            // backgroundColor: 'red', // debugging purposes - visualize the zones
        }, this.topElement, this.bottomElement);

        this.topElement.style.top = 0;
        this.bottomElement.style.bottom = 0;

        // Add the dragover listener that triggers the autoscroll
        [this.topElement, this.bottomElement].forEach(el => el.addEventListener('dragover', e => this.addScrollListener(e)));

        // Quit scrolling when the the cursor leaves the autoscroll zone
        [this.topElement, this.bottomElement].forEach(el => el.addEventListener('dragleave', () => this.clearScrollInterval()));

        // When a DND drag event starts, show the scroll areas
        this.scrollTarget.addEventListener('dragover', () => AutoScrollSingleton.show(this.topElement, this.bottomElement));

        // When DND ends, hide it.
        this.scrollTarget.addEventListener('dragend', () => this.hideDragZones());

        // When dragging files from Explorer/Finder dragend is not triggered.
        // Work around this by hiding areas when the mouse enters one.
        [this.topElement, this.bottomElement].forEach(el => el.addEventListener('mouseover', this.hideDragZones()));
    }

    teardown() {
        // Remove listeners on dragend or drop event
        [this.topElement, this.bottomElement].forEach(el => el.removeEventListener('dragover', e => this.addScrollListener(e)));
        [this.topElement, this.bottomElement].forEach(el => el.removeEventListener('dragleave', () => this.clearScrollInterval()));
        [this.topElement, this.bottomElement].forEach(el => el.removeEventListener('mouseover', this.hideDragZones()));

        this.scrollTarget.removeEventListener('dragend',() => this.hideDragZones());
        this.scrollTarget.removeEventListener('dragover', () => AutoScrollSingleton.show(this.topElement, this.bottomElement));
    }

    static hide(...elements) {
        elements.forEach(element => { element.style.display = 'none'; });
    }
    static show(...elements) {
        elements.forEach(element => { element.style.display = 'block'; });
    }
    static css(styles, ...elements) {
        const styleAttributes = Object.keys(styles);
        elements.forEach(element => {
            styleAttributes.forEach(attr => { element.style[attr] = styles[attr]; });
        });
    }
    static appendElementWithId(id, tagName = 'div') {
        const element = document.createElement(tagName);
        element.setAttribute('id', id);
        document.body.appendChild(element);

        return element;
    }
}


export default AutoScrollSingleton;

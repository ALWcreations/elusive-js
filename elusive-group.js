class ElusiveGroup extends HTMLElement {
    connectedCallback() {
        this.groupId = this.getAttribute("id") || null;
    }

    /**
     * Scoped query within the group
     */
    $(selector) {
        return this.querySelector(selector);
    }

    /**
     * Emit group-scoped events
     */
    emit(name, detail = {}) {
        this.dispatchEvent(
            new CustomEvent(name, {
                detail,
                bubbles: true
            })
        );
    }
}

customElements.define("elusive-group", ElusiveGroup);

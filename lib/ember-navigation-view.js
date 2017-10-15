'use babel';

import { SelectListView } from 'atom-space-pen-views';

export default class EmberNavigationView extends SelectListView {

  constructor() {
    super();
    this.setItems();
    this.modalPanel = atom.workspace.addModalPanel({
      item: this,
      visible: false
    });
  }

  viewForItem(item) {
    const li = document.createElement('li');
    console.log(this.formatLabelCallback);
    li.innerHTML = this.formatLabelCallback(item);
    return li;
  }
  // Tear down any state and detach
  destroy() {
    this.modalPanel.destroy();
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  confirmed(item) {
    atom.workspace.open(item.path);
  }

  cancelled() {
    this.modalPanel.hide();
  }

  toggle(items, formatLabelCallback) {
    this.formatLabelCallback = formatLabelCallback;
    this.setItems(items);
    if (this.modalPanel.isVisible()) {
      this.modalPanel.hide();
    } else {
      this.modalPanel.show();
      this.focusFilterEditor();
    }
  }
}

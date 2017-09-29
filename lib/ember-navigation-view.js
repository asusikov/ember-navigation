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
    let actionName, typeName;
    switch (item.type) {
      case 'componentTemplate':
      case 'podTemplate':
      case 'template':
        typeName = 'Template';
        break;
      case 'component':
      case 'podComponent':
        typeName = 'Component';
        break;
      case 'componentStyles':
      case 'podStyles':
        typeName = 'Styles';
        break;
      case 'route':
        typeName = 'Route';
        break;
      case 'controller':
        typeName = 'Controller';
        break;
    }
    actionName = 'Go to the';
    li.innerHTML = `<span>${actionName}</span> <strong>${typeName}</strong>`;
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

  toggle(items) {
    this.setItems(items);
    if (this.modalPanel.isVisible()) {
      this.modalPanel.hide();
    } else {
      this.modalPanel.show();
      this.focusFilterEditor();
    }
  }
}

'use babel';

import EmberNavigationView from './ember-navigation-view';
import { CompositeDisposable } from 'atom';

export default {

  emberNavigationView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    // this.emberNavigationView = new EmberNavigationView(state.emberNavigationViewState);
    // this.modalPanel = atom.workspace.addModalPanel({
    //   item: this.emberNavigationView.getElement(),
    //   visible: false
    // });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'ember-navigation:open-component': () => this.openComponent()
    }));

  },

  deactivate() {
    // this.modalPanel.destroy();
    this.subscriptions.dispose();
    // this.emberNavigationView.destroy();
  },

  // serialize() {
  //   return {
  //     emberNavigationViewState: this.emberNavigationView.serialize()
  //   };
  // },

  openComponent() {
    const editor = atom.workspace.getActiveTextEditor();
    const cursor = editor.getCursorBufferPosition();
    let line = editor.getBuffer().getLines()[cursor.row];
    const startColumn = line.substring(0, cursor.column).lastIndexOf('{{');
    line = line.substring(startColumn + 2)
    if (line.indexOf('#') == 0) {
      line = line.substring(1);
    }

    const componentName = line.split(/[^A-Za-z0-9\/\-_]/)[0];
    const templateName = "app/components/" + componentName + "/template.hbs";
    atom.workspace.open(templateName);
  }
};

'use babel';

import EmberNavigationView from './ember-navigation-view';
import { CompositeDisposable, File, Directory } from 'atom';
import path from 'path';

export default {

  emberNavigationView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.emberNavigationView = new EmberNavigationView(state.emberNavigationViewState);
    // this.modalPanel = atom.workspace.addModalPanel({
    //   item: this.emberNavigationView.getElement(),
    //   visible: false
    // });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'ember-navigation:open-component': () => this.openComponent(),
      'ember-navigation:switch-file': () => this.switchFile(),
      'ember-navigation:go-to-file': () => this.goToFile()
    }));

  },

  deactivate() {
    this.subscriptions.dispose();
    this.emberNavigationView.destroy();
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
  },

  switchFile() {
    const filesInfo = this.getListOfFilesInfo();
    let currentIndex;
    for (let [index, item] of filesInfo.entries()) {
      if (item.isCurrent) {
        currentIndex = index;
        break;
      }
    }
    nextFileInfo = (currentIndex === filesInfo.length - 1) ? filesInfo[0] : filesInfo[currentIndex + 1];
    atom.workspace.open(nextFileInfo.path);
  },

  getListOfFilesInfo() {
    let resultList = [];
    const editor = atom.workspace.getActiveTextEditor();
    const fileInfo = path.parse(editor.getPath());

    const projectPath = atom.project.getDirectories()[0].getPath();

    const componentsDir = new Directory(`${projectPath}/app/components`);
    const routesDir = new Directory(`${projectPath}/app/routes`);
    const controllersDir = new Directory(`${projectPath}/app/controllers`);
    const templatesDir = new Directory(`${projectPath}/app/templates`);

    if (componentsDir.contains(fileInfo.dir)) {
      const templateInfo = {
        path: path.join(fileInfo.dir, 'template.hbs'),
        isCurrent: (fileInfo.name === 'template'),
        type: 'podTemplate'
      };
      const componentInfo = {
        path: path.join(fileInfo.dir, 'component.js'),
        isCurrent: (fileInfo.name === 'component'),
        type: 'podComponent'
      };
      resultList = [templateInfo, componentInfo];
    }

    if (routesDir.contains(fileInfo.dir) ||
      controllersDir.contains(fileInfo.dir) ||
      templatesDir.contains(fileInfo.dir)) {
      pathToDirectory = path.relative(routesDir.getPath(), fileInfo.dir);
      resultList =[path.join(controllersDir.getPath(), pathToDirectory, `${fileInfo.name}.js`), ];
    }
    // if (controllersDir.contains(fileInfo.dir)) {
    //   pathToDirectory = path.relative(controllersDir.getPath(), fileInfo.dir);
    //   fileToOpenPath = path.join(templatesDir.getPath(), pathToDirectory, `${fileInfo.name}.hbs`);
    // }
    // if (templatesDir.contains(fileInfo.dir)) {
    //   pathToDirectory = path.relative(templatesDir.getPath(), fileInfo.dir);
    //   fileToOpenPath = path.join(routesDir.getPath(), pathToDirectory, `${fileInfo.name}.js`);
    // }

    if (componentsDir.getPath() === fileInfo.dir ||
      path.join(templatesDir.getPath(), 'components') === fileInfo.dir) {
      resultList = [{
        path: path.join(templatesDir.getPath(), 'components', `${fileInfo.name}.hbs`),
        type: 'componentTemplate'
      }, {
        path: path.join(componentsDir.getPath(), `${fileInfo.name}.js`),
        type: 'component'
      }];
    }
    return resultList;
  },

  goToFile() {
    this.emberNavigationView.toggle(this.getListOfFilesInfo());
  }
};

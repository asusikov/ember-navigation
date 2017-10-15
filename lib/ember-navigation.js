'use babel';

import EmberNavigationView from './ember-navigation-view';
import { CompositeDisposable, Directory } from 'atom';
import { getEmberFilesInfo, getEmberFileType, EmberFileType } from './ember-file-info';
import fs from 'fs';
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
      'ember-navigation:go-to-file': () => this.goToFile(),
      'ember-navigation:find-files-using-component': () => this.findFilesUsingComponent()
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

// 3. Open list with files
  openComponent() {
    const editor = atom.workspace.getActiveTextEditor();
    const cursor = editor.getCursorBufferPosition();
    let line = editor.getBuffer().getLines()[cursor.row];
    let matches = /{{[#, ]?([a-z-\/]+)/.exec(line);
    const componentName = matches ? matches[1] : '';
    const projectPath = atom.project.getDirectories()[0].getPath();
    // Try to find simple component
    let templateName = `${projectPath}/app/templates/components/${componentName}.hbs`;
    if (!fs.existsSync(templateName)) {
      templateName = `app/components/${componentName}/template.hbs`;
    }

    atom.workspace.open(templateName);
  },

  switchFile() {
    const filesInfo = getEmberFilesInfo();
    if (filesInfo.length > 0) {
      let currentIndex;
      for (let [index, item] of filesInfo.entries()) {
        if (item.isCurrent) {
          currentIndex = index;
          break;
        }
      }
      const nextFileInfo = (currentIndex === filesInfo.length - 1) ? filesInfo[0] : filesInfo[currentIndex + 1];
      atom.workspace.open(nextFileInfo.path);
    }
  },

  goToFile() {
    this.emberNavigationView.toggle(getEmberFilesInfo(), (item) => {
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
      return `<span>${actionName}</span> <strong>${typeName}</strong>`;
    });
  },

  findFilesUsingComponent() {
    // 1. Get name of component
    const editor = atom.workspace.getActiveTextEditor();
    const fileInfo = path.parse(editor.getPath());
    const emberFileType = getEmberFileType(fileInfo);
    let componentName;
    const projectPath = atom.project.getDirectories()[0].getPath();
    const componentsDir = new Directory(`${projectPath}/app/components`);
    switch (emberFileType) {
      case EmberFileType.podTemplate:
      case EmberFileType.podComponent:
        componentName = componentsDir.relativize(fileInfo.dir);
        break;
      case EmberFileType.component:
      case EmberFileType.componentTemplate:
        componentName = path.join(componentsDir.relativize(fileInfo.dir), fileInfo.name);
        break;
    }
    if (!componentName) {
      return;
    }
    // 2. Find files
    const regex = new RegExp(`{{[#, ]?${componentName}( |$)`);
    const foundFiles = [];
    const scanPromise = atom.workspace.scan(regex,
      {
        paths: ['*.hbs']
      },
      (result, error) => {
        if (result) {
          foundFiles.push(result.filePath);
        }
      });
    // 3. Open list with files
    scanPromise.then(() => {
      const items = foundFiles.map((item) => {
        const info = path.parse(item);
        return {
          path: item,
          fileInfo: info,
          type: getEmberFileType(info)
        };
      });
      const componentTemplatesDir = new Directory(`${projectPath}/app/templates/components`);
      const templatesDir = new Directory(`${projectPath}/app/templates`);
      this.emberNavigationView.toggle(items, (item) => {
        let fileName;
        let typeName;
        switch (item.type) {
          case EmberFileType.podTemplate:
            fileName = componentsDir.relativize(item.fileInfo.dir);
            typeName = 'component';
            break;
          case EmberFileType.componentTemplate:
            fileName = path.join(componentTemplatesDir.relativize(item.fileInfo.dir), item.fileInfo.name);
            typeName = 'component';
            break;
          case EmberFileType.template:
            fileName = path.join(templatesDir.relativize(item.fileInfo.dir), item.fileInfo.name);
            typeName = 'template';
            break;
        }
        return `<span>Using in </span> <strong>${fileName}</strong> ${typeName}`;
      });
    });
  }
};

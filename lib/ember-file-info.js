'use babel';

import { Directory } from 'atom';
import path from 'path';

export function getEmberFilesInfo() {
  let resultList = [];
  const editor = atom.workspace.getActiveTextEditor();
  const fileInfo = path.parse(editor.getPath());

  const projectPath = atom.project.getDirectories()[0].getPath();

  const componentsDir = new Directory(`${projectPath}/app/components`);
  const routesDir = new Directory(`${projectPath}/app/routes`);
  const controllersDir = new Directory(`${projectPath}/app/controllers`);
  const templatesDir = new Directory(`${projectPath}/app/templates`);

  // If file is pod component
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

  // If file is route or controller or template
  if (routesDir.contains(fileInfo.dir) ||
    controllersDir.contains(fileInfo.dir) ||
    templatesDir.contains(fileInfo.dir)) {

    let pathToDirectory;
    if (routesDir.contains(fileInfo.dir)) {
      pathToDirectory = path.relative(routesDir.getPath(), fileInfo.dir);
    }
    if (controllersDir.contains(fileInfo.dir)) {
      pathToDirectory = path.relative(controllersDir.getPath(), fileInfo.dir);
    }
    if (templatesDir.contains(fileInfo.dir)) {
      pathToDirectory = path.relative(templatesDir.getPath(), fileInfo.dir);
    }

    const routeInfo = {
      path: path.join(routesDir.getPath(), pathToDirectory, `${fileInfo.name}.js`),
      isCurrent: routesDir.contains(fileInfo.dir),
      type: 'route'
    };
    const controllerInfo = {
      path: path.join(controllersDir.getPath(), pathToDirectory, `${fileInfo.name}.js`),
      isCurrent: controllersDir.contains(fileInfo.dir),
      type: 'controller'
    };
    const templateInfo = {
      path: path.join(templatesDir.getPath(), pathToDirectory, `${fileInfo.name}.hbs`),
      isCurrent: templatesDir.contains(fileInfo.dir),
      type: 'template'
    };
    resultList = [routeInfo, controllerInfo, templateInfo];
  }

  // If file is component
  if (componentsDir.getPath() === fileInfo.dir ||
    path.join(templatesDir.getPath(), 'components') === fileInfo.dir) {
    const templateInfo = {
      path: path.join(templatesDir.getPath(), 'components', `${fileInfo.name}.hbs`),
      isCurrent: (path.join(templatesDir.getPath(), 'components') === fileInfo.dir),
      type: 'componentTemplate'
    };
    const componentInfo = {
      path: path.join(componentsDir.getPath(), `${fileInfo.name}.js`),
      isCurrent: (componentsDir.getPath() === fileInfo.dir),
      type: 'component'
    };
    resultList = [templateInfo, componentInfo];
  }

  return resultList;
}

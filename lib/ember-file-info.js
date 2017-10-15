'use babel';

import { Directory } from 'atom';
import path from 'path';

export const EmberFileType = {
  podTemplate: 'podTemplate',
  podComponent: 'podComponent',
  podStyles: 'podStyles',
  component: 'component',
  componentTemplate: 'componentTemplate',
  componentStyles: 'componentStyles',
  route: 'route',
  controller: 'controller',
  template: 'template',
  undenfined: 'undenfined'
};

export function getEmberFileType(fileInfo) {
  const projectPath = atom.project.getDirectories()[0].getPath();

  const componentsDir = new Directory(`${projectPath}/app/components`);
  if (componentsDir.contains(fileInfo.dir) || componentsDir.getPath() === fileInfo.dir) {
    if (fileInfo.name === 'template') {
      return EmberFileType.podTemplate;
    } else if (fileInfo.name === 'component') {
      return EmberFileType.podComponent;
    } else if (fileInfo.name === 'styles') {
      return EmberFileType.podStyles;
    } else {
      return EmberFileType.component;
    }
  }

  const routesDir = new Directory(`${projectPath}/app/routes`);
  if (routesDir.contains(fileInfo.dir) || routesDir.getPath() === fileInfo.dir) {
    return EmberFileType.route;
  }

  const controllersDir = new Directory(`${projectPath}/app/controllers`);
  if (controllersDir.contains(fileInfo.dir) || controllersDir.getPath() === fileInfo.dir) {
    return EmberFileType.controller;
  }

  const templatesDir = new Directory(`${projectPath}/app/templates`);
  if (templatesDir.contains(fileInfo.dir) || templatesDir.getPath() === fileInfo.dir) {
    const componentTemplatesDir = new Directory(path.join(templatesDir.getPath(), 'components'));
    if (componentTemplatesDir.contains(fileInfo.dir) || componentTemplatesDir.getPath() === fileInfo.dir) {
      return EmberFileType.componentTemplate;
    } else {
      return EmberFileType.template;
    }
  }

  return EmberFileType.undenfined;
}

function getPodComponentFilesInfo(fileInfo, emberFileType) {
  const podTemplateInfo = {
    path: path.join(fileInfo.dir, 'template.hbs'),
    isCurrent: emberFileType === EmberFileType.podTemplate,
    type: 'podTemplate'
  };
  const podComponentInfo = {
    path: path.join(fileInfo.dir, 'component.js'),
    isCurrent: emberFileType === EmberFileType.podComponent,
    type: 'podComponent'
  };
  const podStylesInfo = {
    path: path.join(fileInfo.dir, 'styles.scss'),
    isCurrent: emberFileType === EmberFileType.podStyles,
    type: 'podStyles'
  };
  return [podTemplateInfo, podComponentInfo, podStylesInfo];
}

function getComponentFilesInfo(fileInfo, emberFileType) {
  const projectPath = atom.project.getDirectories()[0].getPath();
  const componentsDir = new Directory(`${projectPath}/app/components`);
  const componentTemplatesDir = new Directory(`${projectPath}/app/templates/components`);
  const componentStylesDir = new Directory(`${projectPath}/app/styles/component-styles`);

  let pathToDirectory = '';
  switch (emberFileType) {
    case EmberFileType.component:
      pathToDirectory = componentsDir.relativize(fileInfo.dir);
      break;
    case EmberFileType.componentTemplate:
      pathToDirectory = componentTemplatesDir.relativize(fileInfo.dir);
      break;
    case EmberFileType.componentStyles:
      pathToDirectory = componentStylesDir.relativize(fileInfo.dir);
      break;
  }
  const templateInfo = {
    path: path.join(componentTemplatesDir.getPath(), pathToDirectory, `${fileInfo.name}.hbs`),
    isCurrent: emberFileType === EmberFileType.componentTemplate,
    type: 'componentTemplate'
  };
  const componentInfo = {
    path: path.join(componentsDir.getPath(), pathToDirectory, `${fileInfo.name}.js`),
    isCurrent: emberFileType === EmberFileType.component,
    type: 'component'
  };
  const stylesInfo = {
    path: path.join(componentStylesDir.getPath(), pathToDirectory, `${fileInfo.name}.scss`),
    isCurrent: emberFileType === EmberFileType.componentStyles,
    type: 'componentStyles'
  };
  return [templateInfo, componentInfo, stylesInfo];
}

function getRouteControllerTemplateInfo(fileInfo, emberFileType) {
  const projectPath = atom.project.getDirectories()[0].getPath();
  const routesDir = new Directory(`${projectPath}/app/routes`);
  const controllersDir = new Directory(`${projectPath}/app/controllers`);
  const templatesDir = new Directory(`${projectPath}/app/templates`);

  let pathToDirectory = '';
  switch (emberFileType) {
    case EmberFileType.route:
      pathToDirectory = routesDir.relativize(fileInfo.dir);
      break;
    case EmberFileType.controller:
      pathToDirectory = controllersDir.relativize(fileInfo.dir);
      break;
    case EmberFileType.template:
      pathToDirectory = templatesDir.relativize(fileInfo.dir);
      break;
  }

  const routeInfo = {
    path: path.join(routesDir.getPath(), pathToDirectory, `${fileInfo.name}.js`),
    isCurrent: emberFileType === EmberFileType.route,
    type: 'route'
  };
  const controllerInfo = {
    path: path.join(controllersDir.getPath(), pathToDirectory, `${fileInfo.name}.js`),
    isCurrent: emberFileType === EmberFileType.controller,
    type: 'controller'
  };
  const templateInfo = {
    path: path.join(templatesDir.getPath(), pathToDirectory, `${fileInfo.name}.hbs`),
    isCurrent: emberFileType === EmberFileType.template,
    type: 'template'
  };
  return [routeInfo, controllerInfo, templateInfo];
}

export function getEmberFilesInfo() {
  const editor = atom.workspace.getActiveTextEditor();
  const fileInfo = path.parse(editor.getPath());
  const emberFileType = getEmberFileType(fileInfo);
  switch (emberFileType) {
    case EmberFileType.podTemplate:
    case EmberFileType.podComponent:
    case EmberFileType.podStyles:
      return getPodComponentFilesInfo(fileInfo, emberFileType);
    case EmberFileType.componentTemplate:
    case EmberFileType.componentStyles:
    case EmberFileType.component:
      return getComponentFilesInfo(fileInfo, emberFileType);
    case EmberFileType.route:
    case EmberFileType.controller:
    case EmberFileType.template:
      return getRouteControllerTemplateInfo(fileInfo, emberFileType);
    default:
      return [];
  }
}

import { normalizeName } from '@jnxplus/common';
import {
  addProjectToGradleSetting,
  getProjectPathFromProjectRoot,
  getRootProjectName,
} from '@jnxplus/gradle';
import {
  ProjectConfiguration,
  Tree,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  workspaceRoot,
} from '@nx/devkit';
import * as fs from 'fs';
import { fileExists } from 'nx/src/utils/fileutils';
import * as path from 'path';
import { NxGradleKotlinMultiplatformGeneratorSchema } from './schema';

interface NormalizedSchema extends NxGradleKotlinMultiplatformGeneratorSchema {
  androidAppName: string;
  iosAppName: string;
  desktopAppName: string;
  sharedLibName: string;
  androidAppRoot: string;
  iosAppRoot: string;
  desktopAppRoot: string;
  sharedLibRoot: string;
  androidAppDirectory: string;
  iosAppDirectory: string;
  desktopAppDirectory: string;
  sharedLibDirectory: string;
  sharedLibProjectPath: string;
  rootProjectName: string;
  parsedTags: string[];
  packageName: string;
  packageDirectory: string;
  relativePathToSharedLib: string;
  relativePathToPodfile: string;
  appName: string;
}

function normalizeOptions(
  tree: Tree,
  options: NxGradleKotlinMultiplatformGeneratorSchema
): NormalizedSchema {
  const prefix = names(normalizeName(options.name)).fileName;

  let androidAppName: string;
  let iosAppName: string;
  let desktopAppName: string;
  let sharedLibName: string;

  if (options.simpleName || !options.directory) {
    androidAppName = `${prefix}-android`;
    iosAppName = `${prefix}-ios`;
    desktopAppName = `${prefix}-desktop`;
    sharedLibName = `${prefix}-shared`;
  } else {
    androidAppName = `${normalizeName(
      names(options.directory).fileName
    )}-${prefix}-android`;
    iosAppName = `${normalizeName(
      names(options.directory).fileName
    )}-${prefix}-ios`;
    desktopAppName = `${normalizeName(
      names(options.directory).fileName
    )}-${prefix}-desktop`;
    sharedLibName = `${normalizeName(
      names(options.directory).fileName
    )}-${prefix}-shared`;
  }

  const appsDir = getWorkspaceLayout(tree).appsDir;
  const libsDir = getWorkspaceLayout(tree).libsDir;

  const androidAppDirectory = options.directory
    ? `${names(options.directory).fileName}/${androidAppName}`
    : `${androidAppName}`;
  const androidAppRoot = `${appsDir}/${androidAppDirectory}`;

  const iosAppDirectory = options.directory
    ? `${names(options.directory).fileName}/${iosAppName}`
    : `${iosAppName}`;

  const iosAppRoot = `${appsDir}/${iosAppDirectory}`;

  const desktopAppDirectory = options.directory
    ? `${names(options.directory).fileName}/${desktopAppName}`
    : `${desktopAppName}`;
  const desktopAppRoot = `${appsDir}/${desktopAppDirectory}`;

  const sharedLibDirectory = options.directory
    ? `${names(options.directory).fileName}/${sharedLibName}`
    : `${sharedLibName}`;
  const sharedLibRoot = `${libsDir}/${sharedLibDirectory}`;

  const sharedLibProjectPath = `:${getProjectPathFromProjectRoot(
    sharedLibRoot
  )}`;

  const settingsGradleKtsPath = path.join(workspaceRoot, 'settings.gradle.kts');
  const isSettingsGradleKtsExists = fileExists(settingsGradleKtsPath);

  let rootProjectName = '';
  if (isSettingsGradleKtsExists) {
    const settingsGradleKtsContent = fs.readFileSync(
      settingsGradleKtsPath,
      'utf-8'
    );
    rootProjectName = getRootProjectName(settingsGradleKtsContent);
  }

  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  let packageName: string;
  if (options.simplePackageName || !options.directory) {
    packageName = `${options.groupId}.${names(
      prefix
    ).className.toLocaleLowerCase()}`.replace(new RegExp(/-/, 'g'), '');
  } else {
    packageName = `${options.groupId}.${`${names(
      options.directory
    ).fileName.replace(new RegExp(/\//, 'g'), '.')}.${names(
      prefix
    ).className.toLocaleLowerCase()}`}`.replace(new RegExp(/-/, 'g'), '');
  }

  const packageDirectory = packageName.replace(new RegExp(/\./, 'g'), '/');

  const relativePathToSharedLib = path
    .relative(
      path.join(workspaceRoot, iosAppRoot),
      path.join(workspaceRoot, sharedLibRoot)
    )
    .replace(new RegExp(/\\/, 'g'), '/');

  const relativePathToPodfile = path
    .relative(
      path.join(workspaceRoot, sharedLibRoot),
      path.join(workspaceRoot, iosAppRoot)
    )
    .replace(new RegExp(/\\/, 'g'), '/');

  const appName = names(prefix).className;

  return {
    ...options,
    androidAppName,
    iosAppName,
    desktopAppName,
    sharedLibName,
    androidAppRoot,
    iosAppRoot,
    desktopAppRoot,
    sharedLibRoot,
    androidAppDirectory,
    iosAppDirectory,
    desktopAppDirectory,
    sharedLibDirectory,
    sharedLibProjectPath,
    rootProjectName,
    parsedTags,
    packageName,
    packageDirectory,
    relativePathToSharedLib,
    relativePathToPodfile,
    appName,
  };
}

function addAndroidFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    offsetFromRoot: offsetFromRoot(tree.root),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files', 'android-app'),
    options.androidAppRoot,
    templateOptions
  );
}

function addIosFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    offsetFromRoot: offsetFromRoot(tree.root),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files', 'ios-app'),
    options.iosAppRoot,
    templateOptions
  );
}

function addDesktopFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    offsetFromRoot: offsetFromRoot(tree.root),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files', 'desktop-app'),
    options.desktopAppRoot,
    templateOptions
  );
}

function addSharedFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    offsetFromRoot: offsetFromRoot(tree.root),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files', 'shared-lib'),
    options.sharedLibRoot,
    templateOptions
  );
}

function generateAndroidApp(normalizedOptions: NormalizedSchema, tree: Tree) {
  const projectConfiguration: ProjectConfiguration = {
    root: normalizedOptions.androidAppRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.androidAppRoot}/src`,
    targets: {
      build: {
        executor: `@jnxplus/nx-gradle:run-task`,
        outputs: [`${normalizedOptions.androidAppRoot}/build`],
        options: {
          task: 'build',
        },
      },
      serve: {},
      lint: {
        executor: `@jnxplus/nx-gradle:lint`,
        options: {
          linter: 'ktlint',
        },
      },
      test: {
        executor: `@jnxplus/nx-gradle:run-task`,
        options: {
          task: 'test',
        },
      },
      ktformat: {
        executor: `@jnxplus/nx-gradle:ktformat`,
      },
    },
    tags: normalizedOptions.parsedTags,
  };

  addProjectConfiguration(
    tree,
    normalizedOptions.androidAppName,
    projectConfiguration
  );

  addAndroidFiles(tree, normalizedOptions);
  addProjectToGradleSetting(tree, {
    projectRoot: normalizedOptions.androidAppRoot,
  });
}

function generateIosApp(normalizedOptions: NormalizedSchema, tree: Tree) {
  const projectConfiguration: ProjectConfiguration = {
    root: normalizedOptions.iosAppRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.iosAppRoot}/src`,
    targets: {},
    tags: normalizedOptions.parsedTags,
    implicitDependencies: [
      normalizedOptions.sharedLibName,
      //TODO normalizedOptions.rootProjectName,
    ],
  };

  addProjectConfiguration(
    tree,
    normalizedOptions.iosAppName,
    projectConfiguration
  );

  addIosFiles(tree, normalizedOptions);
}

function generateDesktopApp(normalizedOptions: NormalizedSchema, tree: Tree) {
  const projectConfiguration: ProjectConfiguration = {
    root: normalizedOptions.desktopAppRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.desktopAppRoot}/src`,
    targets: {
      build: {
        executor: `@jnxplus/nx-gradle:run-task`,
        outputs: [`${normalizedOptions.desktopAppRoot}/build`],
        options: {
          task: 'build',
        },
      },
      serve: {
        executor: `@jnxplus/nx-gradle:run-task`,
        options: {
          task: 'run',
          keepItRunning: true,
        },
      },
      lint: {
        executor: `@jnxplus/nx-gradle:lint`,
        options: {
          linter: 'ktlint',
        },
      },
      test: {
        executor: `@jnxplus/nx-gradle:run-task`,
        options: {
          task: 'test',
        },
      },
      ktformat: {
        executor: `@jnxplus/nx-gradle:ktformat`,
      },
    },
    tags: normalizedOptions.parsedTags,
  };

  addProjectConfiguration(
    tree,
    normalizedOptions.desktopAppName,
    projectConfiguration
  );

  addDesktopFiles(tree, normalizedOptions);
  addProjectToGradleSetting(tree, {
    projectRoot: normalizedOptions.desktopAppRoot,
  });
}

function generateSharedLib(normalizedOptions: NormalizedSchema, tree: Tree) {
  const projectConfiguration: ProjectConfiguration = {
    root: normalizedOptions.sharedLibRoot,
    projectType: 'library',
    sourceRoot: `${normalizedOptions.sharedLibRoot}/src`,
    targets: {
      build: {
        executor: `@jnxplus/nx-gradle:run-task`,
        outputs: [`${normalizedOptions.sharedLibRoot}/build`],
        options: {
          task: 'build',
        },
      },
      lint: {
        executor: `@jnxplus/nx-gradle:lint`,
        options: {
          linter: 'ktlint',
        },
      },
      test: {
        executor: `@jnxplus/nx-gradle:run-task`,
        options: {
          task: 'test',
        },
      },
      ktformat: {
        executor: `@jnxplus/nx-gradle:ktformat`,
      },
    },
    tags: normalizedOptions.parsedTags,
  };

  addProjectConfiguration(
    tree,
    normalizedOptions.sharedLibName,
    projectConfiguration
  );

  addSharedFiles(tree, normalizedOptions);
  addProjectToGradleSetting(tree, {
    projectRoot: normalizedOptions.sharedLibRoot,
  });
}

export default async function (
  tree: Tree,
  options: NxGradleKotlinMultiplatformGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);
  generateSharedLib(normalizedOptions, tree);
  generateDesktopApp(normalizedOptions, tree);
  generateIosApp(normalizedOptions, tree);
  generateAndroidApp(normalizedOptions, tree);
  await formatFiles(tree);
}

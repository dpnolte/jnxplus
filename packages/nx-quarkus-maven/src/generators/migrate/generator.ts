import { formatFiles, generateFiles, offsetFromRoot, Tree } from '@nx/devkit';
import * as path from 'path';
import { NxQuarkusMavenMigrateGeneratorSchema } from './schema';

interface NormalizedSchema extends NxQuarkusMavenMigrateGeneratorSchema {
  dot: string;
}

function normalizeOptions(
  tree: Tree,
  options: NxQuarkusMavenMigrateGeneratorSchema
): NormalizedSchema {
  const dot = '.';

  return {
    ...options,
    dot,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    offsetFromRoot: offsetFromRoot(tree.root),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, '..', 'init', 'files', 'maven', 'wrapper'),
    '',
    templateOptions
  );
}

export default async function (
  tree: Tree,
  options: NxQuarkusMavenMigrateGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);
  addFiles(tree, normalizedOptions);
  tree.changePermissions('mvnw', '755');
  tree.changePermissions('mvnw.cmd', '755');
  await formatFiles(tree);
}

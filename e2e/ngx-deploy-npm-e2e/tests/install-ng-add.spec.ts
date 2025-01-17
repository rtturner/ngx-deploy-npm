import { ProjectConfiguration, TargetConfiguration } from '@nrwl/devkit';
import { readJson } from '@nrwl/nx-plugin/testing';

import { DeployExecutorOptions } from '../../../packages/ngx-deploy-npm/src/executors/deploy/schema';
import { npmAccess } from '../../../packages/ngx-deploy-npm/src/core';
import {
  generateLib,
  initNgxDeployNPMProject,
  installDependencies,
  installNgxDeployNPMProject,
} from '../utils';

describe('install/ng-add', () => {
  const publicLib = 'node-lib1';
  let projectWorkSpacepublicLib: ProjectConfiguration;

  const publicLib2 = 'node-lib2';
  let projectWorkSpacePublicLib2: ProjectConfiguration;

  const restrictedLib = 'node-resctricted';
  let projectWorkSpaceRestrictedLib: ProjectConfiguration;

  const libNOTset = 'node-lib-not-set';
  let projectWorkSpaceLibNOTSet: ProjectConfiguration;

  initNgxDeployNPMProject();
  installDependencies('@nrwl/node');

  // Init libs and projects
  generateLib('@nrwl/node', publicLib);
  generateLib('@nrwl/node', publicLib2);
  generateLib('@nrwl/node', restrictedLib);
  generateLib('@nrwl/node', libNOTset);

  installNgxDeployNPMProject(`--projects ${publicLib},${publicLib2}`);

  installNgxDeployNPMProject(
    `--projects ${restrictedLib} --access ${npmAccess.restricted}`
  );

  beforeEach(() => {
    projectWorkSpacepublicLib = readJson(`libs/${publicLib}/project.json`);
    projectWorkSpacePublicLib2 = readJson(`libs/${publicLib2}/project.json`);
    projectWorkSpaceRestrictedLib = readJson(
      `libs/${restrictedLib}/project.json`
    );
    projectWorkSpaceLibNOTSet = readJson(`libs/${libNOTset}/project.json`);
  });

  it('should modify the workspace for publishable libs', () => {
    const expectedPublicTarget: TargetConfiguration = {
      executor: 'ngx-deploy-npm:deploy',
      options: {
        access: npmAccess.public,
      } as DeployExecutorOptions,
    };

    const expectedRestrictedTarget: TargetConfiguration = {
      executor: 'ngx-deploy-npm:deploy',
      options: {
        access: npmAccess.restricted,
      } as DeployExecutorOptions,
    };

    expect(projectWorkSpacepublicLib.targets?.deploy).toEqual(
      expectedPublicTarget
    );
    expect(projectWorkSpacePublicLib2.targets?.deploy).toEqual(
      expectedPublicTarget
    );
    expect(projectWorkSpaceRestrictedLib.targets?.deploy).toEqual(
      expectedRestrictedTarget
    );
    expect(projectWorkSpaceLibNOTSet.targets?.deploy).toEqual(undefined);
  });
});

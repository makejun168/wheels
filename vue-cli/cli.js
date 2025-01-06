#!/usr/bin/env node
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const validateNpmPackageName = require('validate-npm-package-name');

async function generateFromTemplate(sourcePath, destinationPath, variables) {
  const spinner = ora('Generating project from template...').start();

  try {
    // Ensure the template directory exists
    await fs.ensureDir(sourcePath);

    // Copy the template directory to the destination
    await fs.copy(sourcePath, destinationPath);

    // If you have any placeholders in your template files, you can replace them here
    // For example, let's say you have a placeholder in your index.html: {{projectName}}
    // You would read the file, replace the placeholder, and write it back
    const indexPath = path.join(destinationPath, 'index.html');
    let indexContent = await fs.readFile(indexPath, 'utf8');
    indexContent = indexContent.replace(/{{projectName}}/g, variables.projectName);
    await fs.writeFile(indexPath, indexContent);

    spinner.succeed('Project generated successfully!');
  } catch (error) {
    spinner.fail('Failed to generate project from template');
    console.error(error);
  }
}

async function init() {
  console.log(chalk.green('Welcome to My Vue CLI'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is the name of your project?',
      validate: input => {
        const validationResult = validateNpmPackageName(input);
        if (validationResult.validForNewPackages) {
          return true;
        } else {
          return 'Invalid project name. Please choose another one.';
        }
      }
    },
    {
      type: 'list',
      name: 'vueVersion',
      message: 'Choose Vue.js version',
      choices: ['2.x', '3.x'],
    },
    {
      type: 'confirm',
      name: 'useBabel',
      message: 'Use Babel for JavaScript compilation?',
    },
    {
      type: 'confirm',
      name: 'useEslint',
      message: 'Set up ESLint for code linting?',
    },
    {
      type: 'list',
      name: 'vueRouterVersion',
      message: 'Choose Vue Router version',
      choices: ['2.x', '3.x', 'No Vue Router'],
    },
    {
      type: 'confirm',
      name: 'useVuex',
      message: 'Set up Vuex for state management?',
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager would you like to use?',
      choices: ['npm', 'yarn'], 
    },
  ]);

  const spinner = ora('Creating project...').start();

  try {
    // 创建 package 对象
    const package = {
      name: answers.projectName,
      version: '1.0.0',
      description: `${answers.projectName} - a Vue.js project`,
      main: 'index.js',
      scripts: {
        serve: 'vue-cli-service serve',
        build: 'vue-cli-service build',
      },
      dependencies: {},
      devDependencies: {},
      keywords: [],
      author: '',
      license: 'ISC',
    };

    // 根据用户的选择动态添加依赖项
    package.dependencies.vue = answers.vueVersion === '3.x' ? '^3.0.0' : '^2.0.0';

    if (answers.useBabel) {
      package.devDependencies['@babel/core'] = '^7.0.0'; // 示例版本号
      package.devDependencies['@babel/preset-env'] = '^7.0.0'; // 示例版本号
    }

    if (answers.useEslint) {
      package.devDependencies.eslint = '^7.0.0'; // 示例版本号
    }

    if (answers.vueRouterVersion !== 'No Vue Router') {
      package.dependencies['vue-router'] = answers.vueRouterVersion === '3.x' ? '^3.0.0' : '^2.0.0';
    }

    if (answers.useVuex) {
      package.dependencies.vuex = answers.vueVersion === '3.x' ? '^4.0.0' : '^3.0.0';
    }

    // 定义项目路径并确保目录存在
    const projectPath = path.join(process.cwd(), answers.projectName);
    await fs.ensureDir(projectPath);

    // 写入 index.html 文件
    await fs.writeFile(path.join(projectPath, 'index.html'), '<h1>Hello Vue!</h1>');

    // 根据 package 对象生成 package.json 文件
    await fs.writeJson(path.join(projectPath, 'package.json'), package, { spaces: 2 });
    
    // 判断选择的包管理器并执行相应命令安装依赖
    const installCmd = answers.packageManager === 'npm' ? 'npm install' : 'yarn install';
    const installProcess = spawn(installCmd, { stdio: 'inherit', shell: true, cwd: projectPath });

    installProcess.on('close', (code) => {
    if (code === 0) {
        spinner.succeed('Dependencies installed successfully!');
        console.log(`\nNavigate to your project by running: ${chalk.cyan(`cd ${answers.projectName}`)}`);
    console.log(`Run your project with: ${chalk.cyan(`${answers.packageManager} run serve`)}\n`);
      } else {
        spinner.fail('Failed to install dependencies');
        console.error(chalk.red(`Installation process exited with code ${code}`));
      }
});
    spinner.succeed('Project created successfully!');
    console.log(`\nNavigate to your project by running: ${chalk.cyan(`cd ${answers.projectName}`)}`);
    console.log(`Run your project with: ${chalk.cyan('npm run serve')}\n`);
  } catch (error) {
    spinner.fail('Failed to create project');
    console.error(chalk.red(error));
  }
}

init();


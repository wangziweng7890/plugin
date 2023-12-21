# 简介
本项目主要参考sftp插件，主要架构均来自sftp插件，在此感谢sftp插件的作者

# 前置工作
全局安装`npm i -g @vscode/vsce`

# 如何调试
1. `code ./packages/plugins/vscode-plugin-doc2http`
2. `npm install` in the terminal, then `F5` to run the code

pnpm 与 npm 有些差异导致 运行 npm run package 时会报错，原因暂未去探寻，等把功能完善后再去看看

# 如何打包发布

1. vsce package
2. vsce publish 
3. 输入验证token:

# tips
vscode 只能以个人身份发布到扩展市场，所以需要个人身份的token
https://code.visualstudio.com/api/working-with-extensions/publishing-extension

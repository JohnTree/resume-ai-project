#!/bin/bash

echo "修复ResumeAI子模块问题..."
# 移除ResumeAI的子模块状态
git rm --cached ResumeAI
rm -rf ResumeAI/.git

echo "重新添加所有文件..."
git add .

echo "提交更改..."
git commit -m "Fix: Remove ResumeAI submodule and include all files"

echo "请先在GitHub上创建仓库：https://github.com/new"
echo "仓库名：resume-ai-project"
echo "然后运行：git push -u origin main"

echo "或者如果你已经创建了仓库，请输入仓库URL："
read -p "GitHub仓库URL: " repo_url

if [ ! -z "$repo_url" ]; then
    git remote add origin $repo_url
    git push -u origin main
    echo "代码已推送到GitHub！"
else
    echo "请手动运行：git push -u origin main"
fi
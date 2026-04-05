# 筑迹大观 - 部署指南

## 快速部署到 Vercel

### 方法一：使用 Vercel CLI（推荐）

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   cd zhuji-daguan
   vercel --prod
   ```

4. **获得网址**
   - 部署完成后会显示类似 `https://zhuji-daguan-xxx.vercel.app` 的网址
   - 直接分享给他人即可访问

### 方法二：使用 GitHub + Vercel

1. **创建 GitHub 仓库**
   - 访问 https://github.com/new
   - 创建新仓库（如 `zhuji-daguan`）

2. **推送代码**
   ```bash
   cd zhuji-daguan
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/zhuji-daguan.git
   git push -u origin main
   ```

3. **连接 Vercel**
   - 访问 https://vercel.com/new
   - 导入 GitHub 仓库
   - 自动部署，获得网址

## 部署到 Netlify

1. 访问 https://app.netlify.com/drop
2. 将 `dist` 文件夹拖拽到页面
3. 自动获得网址

## 部署到 GitHub Pages

1. 推送代码到 GitHub（同上）
2. 进入仓库 Settings > Pages
3. Source 选择 "Deploy from a branch"
4. Branch 选择 "main"，文件夹选择 "/ (root)"
5. 保存后获得 `https://用户名.github.io/仓库名` 网址

## 更新部署

修改代码后重新部署：

```bash
# 构建项目
npm run build

# 如果使用 Vercel CLI
vercel --prod

# 如果使用 Git
git add .
git commit -m "更新内容"
git push
```

## 注意事项

- Vercel 和 Netlify 在国内访问可能需要科学上网
- 如需国内快速访问，建议使用腾讯云/阿里云静态网站托管
- 本项目是纯前端应用，无需后端服务器

# 说明

## upload-release-repo

### 动机

将私有仓库的构建产物同步到公开仓库

### 用法

```sh
name: Build/release Electron app

on:
  push:
    tags:
      - v*.*.*

jobs:
  release:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [ windows-latest]

    steps:
      - name: Check out Git repository
        uses: actions/checkout@v3

      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm i -g pnpm && pnpm install

      - name: build-mac
        if: matrix.os == 'macos-latest'
        run: pnpm build

      - name: build-win
        if: matrix.os == 'windows-latest'
        run: pnpm build

      - name: release
        uses: softprops/action-gh-release@v1
        with:
          draft: true
          files: |
            electron-live/release/*.exe
            electron-live/release/*.zip
            electron-live/release/*.dmg
            electron-live/release/*.AppImage
            electron-live/release/*.snap
            electron-live/release/*.deb
            electron-live/release/*.rpm
            electron-live/release/*.tar.gz
            electron-live/release/*.yml
            electron-live/release/*.blockmap
        env:
          GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}

      - name: Get the tag name
        id: get_tag
        shell: bash
        run: echo "tag=$(git describe --tags --abbrev=0)" >> $GITHUB_ENV

      - name: Print tag
        run: echo "The current tag is ${{ env.tag }}"


      - name: Upload files to another repository release
        uses: artiely/actions/upload-release-repo
        with:
          token: ${{ secrets.ACCESS_TOKEN }}
          owner: "tanjie-ola"  # 修改为公开仓库的用户名
          repo: "monorepo-live-release"  # 修改为公开仓库的仓库名
          tag: ${{ env.tag }}
          files: |
            electron-live/release/*.exe
            electron-live/release/*.zip
            electron-live/release/*.dmg
            electron-live/release/*.AppImage
            electron-live/release/*.snap
            electron-live/release/*.deb
            electron-live/release/*.rpm
            electron-live/release/*.tar.gz
            electron-live/release/*.yml
            electron-live/release/*.blockmap
```
